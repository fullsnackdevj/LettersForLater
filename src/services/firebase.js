import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  increment,
  runTransaction
} from 'firebase/firestore';
import { getStorage, ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCurrentPHT } from '../utils/pht';

// Firebase configuration (Loaded from import.meta.env or fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export let app, auth, db, storage, googleProvider;

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
}

// Local Storage Keys for offline / demo mode
const LOCAL_USER_KEY = 'lettersforlater_user';
const LOCAL_PAIR_KEY = 'lettersforlater_pair';
const LOCAL_LETTERS_KEY = 'lettersforlater_letters';
const LOCAL_STORIES_KEY = 'lettersforlater_stories';

// In-Memory Storage Cache backed by localStorage
let inMemoryLettersStore = null;
let inMemoryStoriesStore = null;

function getLocalStories() {
  if (inMemoryStoriesStore !== null) {
    return inMemoryStoriesStore;
  }
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORIES_KEY) : null;
    if (data) {
      inMemoryStoriesStore = JSON.parse(data);
      return inMemoryStoriesStore;
    }
  } catch (e) {
    console.warn('Error reading stories from localStorage:', e);
  }
  inMemoryStoriesStore = [];
  return inMemoryStoriesStore;
}

function saveLocalStories(stories) {
  inMemoryStoriesStore = [...stories];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify(stories));
    }
  } catch (e) {
    console.warn('LocalStorage quota or write error for stories:', e);
  }
}

function getLocalLetters() {
  if (inMemoryLettersStore !== null) {
    return inMemoryLettersStore;
  }
  try {
    const data = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_LETTERS_KEY) : null;
    if (data) {
      inMemoryLettersStore = JSON.parse(data);
      return inMemoryLettersStore;
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  inMemoryLettersStore = [];
  return inMemoryLettersStore;
}

function saveLocalLetters(letters) {
  inMemoryLettersStore = [...letters];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(letters));
    }
  } catch (e) {
    console.warn('LocalStorage quota or write error (retained in memory):', e);
  }
}

/**
 * Upload images to Firebase Storage and return download URLs
 * This prevents exceeding Firestore's 1MB document size limit
 */
async function uploadImagesToStorage(images, pairId, letterId) {
  if (!isFirebaseConfigured || !storage || !images?.length) return [];

  const uploadedImages = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // If image already has a storageUrl (previously uploaded), keep it
    if (img.storageUrl) {
      uploadedImages.push(img);
      continue;
    }

    // Upload base64 data URL to Firebase Storage
    if (img.dataUrl) {
      try {
        const fileName = `${letterId}_${i}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `letters/${pairId}/${fileName}`);
        
        await uploadString(storageRef, img.dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);

        uploadedImages.push({
          storageUrl: downloadUrl,
          name: img.name || `photo_${i + 1}.jpg`,
          sizeKb: img.sizeKb || 0,
          width: img.width || 0,
          height: img.height || 0
        });
      } catch (err) {
        console.error(`Error uploading image ${i}:`, err);
        // Keep as dataUrl fallback if upload fails (local mode)
        uploadedImages.push(img);
      }
    }
  }

  return uploadedImages;
}

/**
 * Authentication Service
 */
export async function signInWithGoogle() {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      };
    } catch (err) {
      console.error('Firebase Google Sign-In error:', err);
      throw err; // Don't silently fall to demo - let caller handle
    }
  }

  // Demo Fallback User (only when Firebase is not configured)
  const demoUser = {
    uid: 'demo-user-1',
    displayName: 'Jay (Demo User)',
    email: 'jay.demo@lettersforlater.app',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}

export async function signOutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(LOCAL_USER_KEY);
}

export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        callback(null);
      }
    });
  }

  // Fallback local subscription
  const local = localStorage.getItem(LOCAL_USER_KEY);
  callback(local ? JSON.parse(local) : null);
  return () => {};
}

/**
 * Pair Code & Shared Vault Service
 */
export async function getPairInfo(pairCode) {
  if (isFirebaseConfigured && db) {
    const pairRef = doc(db, 'pairs', pairCode.toUpperCase());
    const snap = await getDoc(pairRef);
    if (snap.exists()) {
      return snap.data();
    }
  }

  // Local fallback
  const localPair = localStorage.getItem(LOCAL_PAIR_KEY);
  if (localPair) {
    const parsed = JSON.parse(localPair);
    if (parsed.code === pairCode.toUpperCase()) return parsed;
  }
  
  return null;
}

export async function savePairInfo(pairData) {
  const cleanCode = pairData.code.toUpperCase();
  const formatted = { ...pairData, code: cleanCode };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'pairs', cleanCode), formatted, { merge: true });
  }

  localStorage.setItem(LOCAL_PAIR_KEY, JSON.stringify(formatted));
  return formatted;
}

export function subscribeToPairInfo(pairCode, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const pairRef = doc(db, 'pairs', cleanCode);
    return onSnapshot(pairRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
  }

  // Fallback local polling subscription
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const localPair = localStorage.getItem(LOCAL_PAIR_KEY);
    if (localPair && localPair !== lastJson) {
      lastJson = localPair;
      try {
        const parsed = JSON.parse(localPair);
        if (parsed.code === cleanCode) callback(parsed);
      } catch (e) {}
    }
  }, 1000);

  getPairInfo(cleanCode).then(info => {
    if (info) {
      lastJson = JSON.stringify(info);
      callback(info);
    }
  });

  return () => clearInterval(pollInterval);
}

/**
 * Letter Storage Service
 */
export async function saveLetterToCloud(letter) {
  const pht = getCurrentPHT();
  
  // If letter already exists (editing draft or letter text)
  const isNew = !letter.id;
  const tempId = `letter-${Date.now()}`;

  // Upload images to Storage first (replaces base64 dataUrls with download URLs)
  const pairId = letter.pairId || 'default';
  const letterId = letter.id || tempId;
  const processedImages = await uploadImagesToStorage(letter.images, pairId, letterId);

  // Strictly preserve original creation timestamp when updating/sealing a draft
  let preservedCreatedAtPHT = letter.createdAtPHT;
  let preservedCreatedAtIso = letter.createdAtIso;

  if (!isNew && (!preservedCreatedAtPHT || !preservedCreatedAtIso)) {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'letters', letter.id));
        if (snap.exists()) {
          const data = snap.data();
          preservedCreatedAtPHT = preservedCreatedAtPHT || data.createdAtPHT;
          preservedCreatedAtIso = preservedCreatedAtIso || data.createdAtIso;
        }
      } catch (err) {
        console.warn('Could not fetch existing letter timestamp:', err);
      }
    } else {
      const local = getLocalLetters().find(l => l.id === letter.id);
      if (local) {
        preservedCreatedAtPHT = preservedCreatedAtPHT || local.createdAtPHT;
        preservedCreatedAtIso = preservedCreatedAtIso || local.createdAtIso;
      }
    }
  }

  // Upload audioNote if present
  let processedAudioNote = null;
  if (letter.audioNote) {
    if (letter.audioNote.storageUrl) {
      processedAudioNote = {
        storageUrl: letter.audioNote.storageUrl,
        durationSec: letter.audioNote.durationSec || 0,
        sizeKb: letter.audioNote.sizeKb || 0
      };
    } else if (letter.audioNote.audioBlob) {
      try {
        const audioUrl = await uploadAudioToStorage(letter.audioNote.audioBlob, pairId, letterId);
        processedAudioNote = {
          storageUrl: audioUrl,
          durationSec: letter.audioNote.durationSec || 0,
          sizeKb: letter.audioNote.sizeKb || 0
        };
      } catch (err) {
        console.error('Error uploading audio note:', err);
        processedAudioNote = {
          storageUrl: letter.audioNote.dataUrl || '',
          durationSec: letter.audioNote.durationSec || 0,
          sizeKb: letter.audioNote.sizeKb || 0
        };
      }
    } else if (letter.audioNote.dataUrl) {
      processedAudioNote = {
        storageUrl: letter.audioNote.dataUrl,
        durationSec: letter.audioNote.durationSec || 0,
        sizeKb: letter.audioNote.sizeKb || 0
      };
    }
  }

  const letterDoc = {
    pairId: letter.pairId || '#JayFinallyGotAKiss',
    authorId: letter.authorId,
    authorName: letter.authorName,
    authorPhoto: letter.authorPhoto || '',
    title: letter.title || 'Untitled Letter',
    content: letter.content || '',
    isVeryImportant: Boolean(letter.isVeryImportant),
    importantTagReason: letter.importantTagReason || '',
    mood: letter.mood || 'Warm & Hopeful',
    images: processedImages.map(img => ({
      storageUrl: img.storageUrl || '',
      name: img.name || '',
      sizeKb: img.sizeKb || 0,
      width: img.width || 0,
      height: img.height || 0
    })),
    audioNote: processedAudioNote,
    isDraft: Boolean(letter.isDraft),
    // IMMUTABLE PHT Creation Timestamp (Strictly preserved from original draft moment)
    createdAtPHT: preservedCreatedAtPHT || pht.fullString,
    createdAtIso: preservedCreatedAtIso || pht.isoString,
    lastSavedAtPHT: pht.fullString
  };

  if (isFirebaseConfigured && db) {
    if (isNew) {
      const docRef = await addDoc(collection(db, 'letters'), {
        ...letterDoc,
        serverTime: serverTimestamp()
      });
      return { id: docRef.id, ...letterDoc };
    } else {
      await updateDoc(doc(db, 'letters', letter.id), letterDoc);
      return { id: letter.id, ...letterDoc };
    }
  }

  // Local Storage fallback
  const localLetters = getLocalLetters();
  const newId = letter.id || tempId;
  const updatedLetter = { id: newId, ...letterDoc };

  const existingIdx = localLetters.findIndex(l => l.id === newId);
  if (existingIdx >= 0) {
    localLetters[existingIdx] = updatedLetter;
  } else {
    localLetters.unshift(updatedLetter);
  }

  saveLocalLetters(localLetters);
  return updatedLetter;
}

export async function deleteLetterFromCloud(letterId) {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'letters', letterId));
  }
  const localLetters = getLocalLetters().filter(l => l.id !== letterId);
  saveLocalLetters(localLetters);
}

export async function deleteAllLetters() {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'letters'));
    const snapshot = await getDocs(q);
    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, 'letters', docSnap.id)));
    });
    await Promise.all(deletePromises);
  }
  saveLocalLetters([]);
}

export function subscribeToLetters(pairId, currentUserId, callback) {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'letters'), where('pairId', '==', pairId));
    return onSnapshot(q, (snapshot) => {
      const letters = [];
      snapshot.forEach(doc => {
        letters.push({ id: doc.id, ...doc.data() });
      });
      callback(letters);
    });
  }

  // Fallback local subscription
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(LOCAL_LETTERS_KEY) || '[]';
    if (raw !== lastJson) {
      lastJson = raw;
      callback(getLocalLetters());
    }
  }, 1000);

  const initial = getLocalLetters();
  lastJson = localStorage.getItem(LOCAL_LETTERS_KEY) || JSON.stringify(initial);
  callback(initial);
  return () => clearInterval(pollInterval);
}

/**
 * Daily "I Miss You" Counter Services
 */
export async function recordMissYou(pairCode, user, dateKey) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'You';
  const timestamp = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const missRef = doc(db, 'pairs', cleanCode, 'dailyMisses', dateKey);
    const snap = await getDoc(missRef);
    if (!snap.exists()) {
      await setDoc(missRef, {
        dateKey,
        total: 1,
        [`count_${userId}`]: 1,
        lastTappedBy: userId,
        lastTappedByName: userName,
        lastTappedAt: timestamp,
        [`lastTapAt_${userId}`]: timestamp
      });
    } else {
      await updateDoc(missRef, {
        total: increment(1),
        [`count_${userId}`]: increment(1),
        lastTappedBy: userId,
        lastTappedByName: userName,
        lastTappedAt: timestamp,
        [`lastTapAt_${userId}`]: timestamp
      });
    }
    return;
  }

  // Local Storage Fallback
  const key = `misses_${cleanCode}_${dateKey}`;
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { dateKey, total: 0 };
  data.total = (data.total || 0) + 1;
  data[`count_${userId}`] = (data[`count_${userId}`] || 0) + 1;
  data.lastTappedBy = userId;
  data.lastTappedByName = userName;
  data.lastTappedAt = timestamp;
  data[`lastTapAt_${userId}`] = timestamp;
  localStorage.setItem(key, JSON.stringify(data));
}

export function subscribeToDailyMisses(pairCode, dateKey, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const missRef = doc(db, 'pairs', cleanCode, 'dailyMisses', dateKey);
    return onSnapshot(missRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback({ dateKey, total: 0 });
      }
    });
  }

  // Local storage polling fallback
  const key = `misses_${cleanCode}_${dateKey}`;
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(key);
    if (raw && raw !== lastJson) {
      lastJson = raw;
      try {
        callback(JSON.parse(raw));
      } catch (e) {}
    }
  }, 1000);

  const raw = localStorage.getItem(key);
  if (raw) {
    lastJson = raw;
    try {
      callback(JSON.parse(raw));
    } catch (e) {
      callback({ dateKey, total: 0 });
    }
  } else {
    callback({ dateKey, total: 0 });
  }

  return () => clearInterval(pollInterval);
}

/**
 * Our Stories (24-Hour Daily Moments & Archive) Services
 */
export async function saveStoryToCloud(story) {
  const pht = getCurrentPHT();
  const cleanPairCode = (story.pairId || '#JayFinallyGotAKiss').toUpperCase();
  const tempId = `story-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const storyId = story.id || tempId;

  // Expiration: 24 hours from creation
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  let mediaUrl = story.mediaUrl || '';
  if (story.dataUrl) {
    if (isFirebaseConfigured && storage) {
      try {
        const fileName = `story_${storyId}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `letters/${cleanPairCode}/stories/${fileName}`);
        await uploadString(storageRef, story.dataUrl, 'data_url');
        mediaUrl = await getDownloadURL(storageRef);
      } catch (err) {
        console.error('Error uploading story image to Storage:', err);
        mediaUrl = story.dataUrl; // fallback
      }
    } else {
      mediaUrl = story.dataUrl;
    }
  }

  const storyDoc = {
    pairId: cleanPairCode,
    authorId: story.authorId || 'demo-user-1',
    authorName: story.authorName || 'Jay',
    authorPhoto: story.authorPhoto || '',
    type: story.type || (mediaUrl ? 'photo' : 'text'),
    mediaUrl: mediaUrl,
    backgroundStyle: story.backgroundStyle || 'parchment',
    fontStyle: story.fontStyle || 'handwriting',
    caption: story.caption || '',
    moodTag: story.moodTag || '',
    createdAtPHT: story.createdAtPHT || pht.fullString,
    createdAtIso: story.createdAtIso || pht.isoString,
    expiresAtIso: story.expiresAtIso || expiresAt,
    reactions: story.reactions || {},
    viewedBy: Array.isArray(story.viewedBy) && story.viewedBy.length > 0 
      ? story.viewedBy 
      : [],
    isArchivedToVault: Boolean(story.isArchivedToVault)
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanPairCode, 'stories', storyId);
    await setDoc(docRef, {
      ...storyDoc,
      serverTime: serverTimestamp()
    }, { merge: true });
    return { id: storyId, ...storyDoc };
  }

  // Local storage fallback
  const localStories = getLocalStories();
  const newStory = { id: storyId, ...storyDoc };
  const idx = localStories.findIndex(s => s.id === storyId);
  if (idx >= 0) {
    localStories[idx] = newStory;
  } else {
    localStories.unshift(newStory);
  }
  saveLocalStories(localStories);
  return newStory;
}

export function subscribeToStories(pairCode, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const storiesCol = collection(db, 'pairs', cleanCode, 'stories');
    return onSnapshot(storiesCol, (snapshot) => {
      const stories = [];
      snapshot.forEach((docSnap) => {
        stories.push({ id: docSnap.id, ...docSnap.data() });
      });
      stories.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(stories);
    });
  }

  // Fallback local polling subscription
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(LOCAL_STORIES_KEY) || '[]';
    if (raw !== lastJson) {
      lastJson = raw;
      const list = getLocalStories().filter(s => (s.pairId || cleanCode).toUpperCase() === cleanCode);
      list.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(list);
    }
  }, 1000);

  const initialList = getLocalStories().filter(s => (s.pairId || cleanCode).toUpperCase() === cleanCode);
  initialList.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
  lastJson = localStorage.getItem(LOCAL_STORIES_KEY) || JSON.stringify(initialList);
  callback(initialList);

  return () => clearInterval(pollInterval);
}

export async function reactToStory(pairCode, storyId, user, emoji) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Partner';
  const timestamp = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const storyRef = doc(db, 'pairs', cleanCode, 'stories', storyId);
    
    try {
      const updatedReactions = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(storyRef);
        if (!snap.exists()) return null;
        
        const data = snap.data();
        // Guard: Author should not react to their own story
        if (data.authorId === userId) {
          return data.reactions || {};
        }

        const currentReactions = data.reactions || {};
        const emojiData = currentReactions[emoji] || { count: 0, userCounts: {}, users: [] };
        
        const userCounts = { ...(emojiData.userCounts || {}) };
        // Fallback: if userCounts wasn't initialized but user is in users list, initialize with count
        if (userCounts[userId] === undefined && emojiData.users?.includes(userId) && emojiData.count) {
          userCounts[userId] = emojiData.count;
        }
        const currentCountForUser = Number(userCounts[userId]) || 0;
        
        if (currentCountForUser >= 10) {
          return currentReactions; // Max 10 reached for this user
        }
        
        userCounts[userId] = currentCountForUser + 1;
        const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
        
        const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
        if (!newUsers.includes(userId)) {
          newUsers.push(userId);
        }
        
        const newReactions = {
          ...currentReactions,
          [emoji]: {
            count: totalCount,
            userCounts,
            users: newUsers,
            lastReactedBy: userName,
            lastReactedAt: timestamp
          }
        };

        transaction.update(storyRef, { reactions: newReactions });
        return newReactions;
      });
      
      return updatedReactions;
    } catch (err) {
      console.error('Transaction failed for reactToStory:', err);
      return null;
    }
  }

  // Local storage fallback
  const localStories = getLocalStories();
  const story = localStories.find(s => s.id === storyId);
  if (story) {
    // Guard: Author should not react to their own story
    if (story.authorId === userId) {
      return story.reactions || {};
    }

    story.reactions = story.reactions || {};
    const emojiData = story.reactions[emoji] || { count: 0, userCounts: {}, users: [] };
    const userCounts = { ...(emojiData.userCounts || {}) };
    if (userCounts[userId] === undefined && emojiData.users?.includes(userId) && emojiData.count) {
      userCounts[userId] = emojiData.count;
    }
    const currentCountForUser = Number(userCounts[userId]) || 0;
    
    if (currentCountForUser >= 10) {
      return story.reactions;
    }
    
    userCounts[userId] = currentCountForUser + 1;
    const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
    
    const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
    if (!newUsers.includes(userId)) newUsers.push(userId);
    
    story.reactions[emoji] = {
      count: totalCount,
      userCounts,
      users: newUsers,
      lastReactedBy: userName,
      lastReactedAt: timestamp
    };
    saveLocalStories(localStories);
    return story.reactions;
  }
  return null;
}

export async function markStoryAsViewed(pairCode, storyId, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Partner';
  const timestamp = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const storyRef = doc(db, 'pairs', cleanCode, 'stories', storyId);
    const snap = await getDoc(storyRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentViewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
      if (!currentViewedBy.includes(userId)) {
        const updatedViewedBy = [...currentViewedBy, userId];
        await updateDoc(storyRef, {
          viewedBy: updatedViewedBy,
          [`seenAt_${userId}`]: timestamp,
          lastSeenByName: userName
        });
      }
    }
    return;
  }

  // Local storage fallback
  const localStories = getLocalStories();
  const story = localStories.find(s => s.id === storyId);
  if (story) {
    story.viewedBy = Array.isArray(story.viewedBy) ? story.viewedBy : [];
    if (!story.viewedBy.includes(userId)) {
      story.viewedBy.push(userId);
      story[`seenAt_${userId}`] = timestamp;
      story.lastSeenByName = userName;
      saveLocalStories(localStories);
    }
  }
}

export async function deleteStoryFromCloud(pairCode, storyId) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'pairs', cleanCode, 'stories', storyId));
  }
  const localStories = getLocalStories().filter(s => s.id !== storyId);
  saveLocalStories(localStories);
}

/**
 * Couple Live Status & Notes Services ("What We're Currently Doing")
 */
const LOCAL_STATUSES_KEY = 'lettersforlater_couple_statuses_v1';

function getLocalStatuses() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STATUSES_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalStatuses(data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STATUSES_KEY, JSON.stringify(data));
    }
  } catch {}
}

export async function updateUserStatus(pairCode, user, statusData) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Jay';
  const userPhoto = user?.photoURL || '';
  const pht = getCurrentPHT();

  // A newly created/updated status note starts with 0 old cheers, 0 old reactions, and only viewed by the author
  const statusDoc = {
    userId,
    userName,
    userPhoto,
    statusId: statusData.statusId || 'working_now',
    statusText: statusData.statusText || 'Working now',
    emoji: statusData.emoji || '💻',
    category: statusData.category || 'work_school',
    customNote: statusData.customNote || '',
    updatedAtPHT: pht.fullString,
    updatedAtIso: pht.isoString,
    reactions: {},
    lastCheer: null,
    cheers: [],
    viewedBy: [userId]
  };

  if (isFirebaseConfigured && db) {
    const statusRef = doc(db, 'pairs', cleanCode, 'statuses', userId);
    // Overwrite without merge so old lastCheer/cheers/reactions/seenAt are cleanly cleared
    await setDoc(statusRef, {
      ...statusDoc,
      serverTime: serverTimestamp()
    });
    return statusDoc;
  }

  // Local storage fallback
  const local = getLocalStatuses();
  const pairStatuses = local[cleanCode] || {};
  pairStatuses[userId] = statusDoc;
  local[cleanCode] = pairStatuses;
  saveLocalStatuses(local);
  return statusDoc;
}

export function subscribeToStatuses(pairCode, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const statusesCol = collection(db, 'pairs', cleanCode, 'statuses');
    return onSnapshot(statusesCol, (snapshot) => {
      const statusesMap = {};
      snapshot.forEach((docSnap) => {
        statusesMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      callback(statusesMap);
    });
  }

  // Fallback local polling subscription
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(LOCAL_STATUSES_KEY) || '{}';
    if (raw !== lastJson) {
      lastJson = raw;
      const local = getLocalStatuses();
      callback(local[cleanCode] || {});
    }
  }, 1000);

  const initial = getLocalStatuses()[cleanCode] || {};
  lastJson = localStorage.getItem(LOCAL_STATUSES_KEY) || JSON.stringify(initial);
  callback(initial);

  return () => clearInterval(pollInterval);
}

export async function reactToStatus(pairCode, targetUserId, user, emoji) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Partner';
  const timestamp = new Date().toISOString();

  // Guard: User cannot react to their own status note
  if (targetUserId === userId) {
    return {};
  }

  if (isFirebaseConfigured && db) {
    const statusRef = doc(db, 'pairs', cleanCode, 'statuses', targetUserId);
    const snap = await getDoc(statusRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentReactions = data.reactions || {};
      const emojiData = currentReactions[emoji] || { count: 0, userCounts: {}, users: [] };
      const userCounts = { ...(emojiData.userCounts || {}) };
      const myCount = Number(userCounts[userId]) || 0;

      if (myCount >= 10) return currentReactions;

      userCounts[userId] = myCount + 1;
      const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
      const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
      if (!newUsers.includes(userId)) newUsers.push(userId);

      const updatedReactions = {
        ...currentReactions,
        [emoji]: {
          count: totalCount,
          userCounts,
          users: newUsers,
          lastReactedBy: userName,
          lastReactedAt: timestamp
        }
      };

      await updateDoc(statusRef, { reactions: updatedReactions });
      return updatedReactions;
    }
  }

  // Local storage fallback
  const local = getLocalStatuses();
  const pairStatuses = local[cleanCode] || {};
  const status = pairStatuses[targetUserId];
  if (status) {
    status.reactions = status.reactions || {};
    const emojiData = status.reactions[emoji] || { count: 0, userCounts: {}, users: [] };
    const userCounts = { ...(emojiData.userCounts || {}) };
    const myCount = Number(userCounts[userId]) || 0;

    if (myCount >= 10) return status.reactions;

    userCounts[userId] = myCount + 1;
    const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
    const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
    if (!newUsers.includes(userId)) newUsers.push(userId);

    status.reactions[emoji] = {
      count: totalCount,
      userCounts,
      users: newUsers,
      lastReactedBy: userName,
      lastReactedAt: timestamp
    };
    saveLocalStatuses(local);
    return status.reactions;
  }
  return null;
}

export async function sendCheerToStatus(pairCode, targetUserId, user, cheerText) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Partner';
  const timestamp = new Date().toISOString();

  // Guard: User cannot cheer their own status note
  if (targetUserId === userId) {
    return null;
  }

  const cheerObj = {
    text: cheerText,
    fromName: userName,
    fromId: userId,
    atIso: timestamp
  };

  if (isFirebaseConfigured && db) {
    const statusRef = doc(db, 'pairs', cleanCode, 'statuses', targetUserId);
    const snap = await getDoc(statusRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentCheers = Array.isArray(data.cheers) ? data.cheers : [];
      const updatedCheers = [cheerObj, ...currentCheers.slice(0, 19)];

      // Increment '💬' reaction count
      const currentReactions = data.reactions || {};
      const emojiData = currentReactions['💬'] || { count: 0, userCounts: {}, users: [] };
      const userCounts = { ...(emojiData.userCounts || {}) };
      const myCount = Number(userCounts[userId]) || 0;
      userCounts[userId] = Math.min(10, myCount + 1);
      const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
      const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
      if (!newUsers.includes(userId)) newUsers.push(userId);

      const updatedReactions = {
        ...currentReactions,
        ['💬']: {
          count: totalCount,
          userCounts,
          users: newUsers,
          lastReactedBy: userName,
          lastReactedAt: timestamp
        }
      };

      await updateDoc(statusRef, {
        lastCheer: cheerObj,
        cheers: updatedCheers,
        reactions: updatedReactions
      });
      return { lastCheer: cheerObj, cheers: updatedCheers, reactions: updatedReactions };
    }
  }

  // Local storage fallback
  const local = getLocalStatuses();
  const pairStatuses = local[cleanCode] || {};
  const status = pairStatuses[targetUserId];
  if (status) {
    const currentCheers = Array.isArray(status.cheers) ? status.cheers : [];
    const updatedCheers = [cheerObj, ...currentCheers.slice(0, 19)];
    status.lastCheer = cheerObj;
    status.cheers = updatedCheers;

    status.reactions = status.reactions || {};
    const emojiData = status.reactions['💬'] || { count: 0, userCounts: {}, users: [] };
    const userCounts = { ...(emojiData.userCounts || {}) };
    const myCount = Number(userCounts[userId]) || 0;
    userCounts[userId] = Math.min(10, myCount + 1);
    const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
    const newUsers = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
    if (!newUsers.includes(userId)) newUsers.push(userId);

    status.reactions['💬'] = {
      count: totalCount,
      userCounts,
      users: newUsers,
      lastReactedBy: userName,
      lastReactedAt: timestamp
    };
    saveLocalStatuses(local);
    return { lastCheer: cheerObj, cheers: updatedCheers, reactions: status.reactions };
  }
  return null;
}

export async function markStatusAsViewed(pairCode, targetUserId, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const userId = user?.uid || 'demo-user-1';
  const userName = user?.displayName || 'Partner';
  const timestamp = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const statusRef = doc(db, 'pairs', cleanCode, 'statuses', targetUserId);
    const snap = await getDoc(statusRef);
    if (snap.exists()) {
      const data = snap.data();
      const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
      if (!viewedBy.includes(userId)) {
        await updateDoc(statusRef, {
          viewedBy: [...viewedBy, userId],
          [`seenAt_${userId}`]: timestamp,
          lastSeenByName: userName
        });
      }
    }
    return;
  }

  // Local storage fallback
  const local = getLocalStatuses();
  const pairStatuses = local[cleanCode] || {};
  const status = pairStatuses[targetUserId];
  if (status) {
    status.viewedBy = Array.isArray(status.viewedBy) ? status.viewedBy : [];
    if (!status.viewedBy.includes(userId)) {
      status.viewedBy.push(userId);
      status[`seenAt_${userId}`] = timestamp;
      status.lastSeenByName = userName;
      saveLocalStatuses(local);
    }
  }
}
/**
 * Audio Upload Helper (Voice Notes)
 */
export async function uploadAudioToStorage(audioBlob, pairId, noteId) {
  const cleanCode = (pairId || '#JayFinallyGotAKiss').toUpperCase();
  if (!isFirebaseConfigured || !storage || !audioBlob) {
    // Local fallback: convert blob to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });
  }

  const ext = audioBlob.type?.includes('mp4') ? 'mp4' : 'webm';
  const fileName = `voice_${noteId}_${Date.now()}.${ext}`;
  const storageRef = ref(storage, `letters/${cleanCode}/audio/${fileName}`);
  await uploadBytes(storageRef, audioBlob, { contentType: audioBlob.type });
  return await getDownloadURL(storageRef);
}

/**
 * Couple Bucket List Services
 */
const LOCAL_BUCKET_KEY = 'lfl_bucket_list';

function getLocalBucketList() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BUCKET_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalBucketList(list) {
  localStorage.setItem(LOCAL_BUCKET_KEY, JSON.stringify(list));
}

export async function saveBucketItem(pairCode, item, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const pht = getCurrentPHT();
  const isNew = !item.id;
  const itemId = item.id || `bucket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Upload completion photo if present as dataUrl
  let completionPhotoUrl = item.completionPhoto || '';
  if (item.completionPhotoDataUrl && isFirebaseConfigured && storage) {
    try {
      const fileName = `bucket_${itemId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `letters/${cleanCode}/bucket/${fileName}`);
      await uploadString(storageRef, item.completionPhotoDataUrl, 'data_url');
      completionPhotoUrl = await getDownloadURL(storageRef);
    } catch (err) {
      console.error('Error uploading bucket photo:', err);
      completionPhotoUrl = item.completionPhotoDataUrl;
    }
  } else if (item.completionPhotoDataUrl) {
    completionPhotoUrl = item.completionPhotoDataUrl;
  }

  const itemDoc = {
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'general',
    targetSeason: item.targetSeason || '',
    createdBy: item.createdBy || user?.uid || 'demo-user-1',
    createdByName: item.createdByName || user?.displayName || 'Jay',
    createdAtPHT: item.createdAtPHT || pht.fullString,
    createdAtIso: item.createdAtIso || pht.isoString,
    isCompleted: Boolean(item.isCompleted),
    isArchived: Boolean(item.isArchived),
    completedAtPHT: item.completedAtPHT || '',
    completedAtIso: item.completedAtIso || '',
    completedBy: item.completedBy || '',
    completedByName: item.completedByName || '',
    completionNote: item.completionNote || '',
    completionPhoto: completionPhotoUrl,
    pairId: cleanCode
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanCode, 'bucketList', itemId);
    await setDoc(docRef, { ...itemDoc, serverTime: serverTimestamp() }, { merge: true });
    return { id: itemId, ...itemDoc };
  }

  // Local fallback
  const localList = getLocalBucketList();
  const newItem = { id: itemId, ...itemDoc };
  const idx = localList.findIndex(i => i.id === itemId);
  if (idx >= 0) {
    localList[idx] = newItem;
  } else {
    localList.unshift(newItem);
  }
  saveLocalBucketList(localList);
  return newItem;
}

export async function markBucketItemCompleted(pairCode, itemId, completionData, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const pht = getCurrentPHT();

  // Upload completion photo if present
  let completionPhotoUrl = '';
  if (completionData.completionPhotoDataUrl) {
    if (isFirebaseConfigured && storage) {
      try {
        const fileName = `bucket_${itemId}_done_${Date.now()}.jpg`;
        const storageRef = ref(storage, `letters/${cleanCode}/bucket/${fileName}`);
        await uploadString(storageRef, completionData.completionPhotoDataUrl, 'data_url');
        completionPhotoUrl = await getDownloadURL(storageRef);
      } catch (err) {
        console.error('Error uploading bucket completion photo:', err);
        completionPhotoUrl = completionData.completionPhotoDataUrl;
      }
    } else {
      completionPhotoUrl = completionData.completionPhotoDataUrl;
    }
  }

  const updates = {
    isCompleted: true,
    completedAtPHT: pht.fullString,
    completedAtIso: pht.isoString,
    completedBy: user?.uid || 'demo-user-1',
    completedByName: user?.displayName || 'Jay',
    completionNote: completionData.completionNote || '',
    completionPhoto: completionPhotoUrl
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanCode, 'bucketList', itemId);
    await updateDoc(docRef, updates);
    return updates;
  }

  // Local fallback
  const localList = getLocalBucketList();
  const idx = localList.findIndex(i => i.id === itemId);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...updates };
    saveLocalBucketList(localList);
  }
  return updates;
}

export async function deleteBucketItem(pairCode, itemId) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();

  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'pairs', cleanCode, 'bucketList', itemId));
  }

  const localList = getLocalBucketList().filter(i => i.id !== itemId);
  saveLocalBucketList(localList);
}

export function subscribeToBucketList(pairCode, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const col = collection(db, 'pairs', cleanCode, 'bucketList');
    return onSnapshot(col, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(items);
    });
  }

  // Local fallback polling
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(LOCAL_BUCKET_KEY) || '[]';
    if (raw !== lastJson) {
      lastJson = raw;
      const list = getLocalBucketList().filter(i => (i.pairId || cleanCode).toUpperCase() === cleanCode);
      list.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(list);
    }
  }, 1000);

  const initial = getLocalBucketList().filter(i => (i.pairId || cleanCode).toUpperCase() === cleanCode);
  initial.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
  lastJson = localStorage.getItem(LOCAL_BUCKET_KEY) || JSON.stringify(initial);
  callback(initial);

  return () => clearInterval(pollInterval);
}

/**
 * =========================================================================
 * Prayer Requests Services (Simple Add, Pray Reaction & 24hr Auto-Archive)
 * =========================================================================
 */
const LOCAL_PRAYER_REQUESTS_KEY = 'lfl_local_prayer_requests_v2';

export function getLocalPrayerRequests() {
  try {
    const raw = localStorage.getItem(LOCAL_PRAYER_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalPrayerRequests(list) {
  try {
    localStorage.setItem(LOCAL_PRAYER_REQUESTS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export async function savePrayerRequest(pairCode, requestData, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const pht = getCurrentPHT();
  const authorId = user?.uid || 'demo-user-1';
  const authorName = user?.displayName || 'Jay';
  const requestId = requestData.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const requestDoc = {
    pairId: cleanCode,
    text: requestData.text || '',
    createdBy: requestData.createdBy || authorId,
    createdByName: requestData.createdByName || authorName,
    createdAtPHT: requestData.createdAtPHT || pht.fullString,
    createdAtIso: requestData.createdAtIso || pht.isoString,
    prayedBy: requestData.prayedBy || null,
    prayedByName: requestData.prayedByName || null,
    prayedAtPHT: requestData.prayedAtPHT || null,
    prayedAtIso: requestData.prayedAtIso || null,
    isArchived: Boolean(requestData.isArchived)
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanCode, 'prayerRequests', requestId);
    await setDoc(docRef, { ...requestDoc, serverTime: serverTimestamp() }, { merge: true });
    return { id: requestId, ...requestDoc };
  }

  // Local fallback
  const list = getLocalPrayerRequests();
  const newReq = { id: requestId, ...requestDoc };
  const idx = list.findIndex(r => r.id === requestId);
  if (idx >= 0) {
    list[idx] = newReq;
  } else {
    list.unshift(newReq);
  }
  saveLocalPrayerRequests(list);
  return newReq;
}

export async function markPrayerAsPrayed(pairCode, requestId, user) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const pht = getCurrentPHT();
  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = user?.displayName || 'Jay';

  const updateData = {
    prayedBy: currentUserId,
    prayedByName: currentUserName,
    prayedAtPHT: pht.fullString,
    prayedAtIso: pht.isoString
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanCode, 'prayerRequests', requestId);
    await updateDoc(docRef, updateData);
    return updateData;
  }

  // Local fallback
  const list = getLocalPrayerRequests();
  const idx = list.findIndex(r => r.id === requestId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updateData };
    saveLocalPrayerRequests(list);
  }
  return updateData;
}

export async function deletePrayerRequest(pairCode, requestId) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'pairs', cleanCode, 'prayerRequests', requestId);
    await deleteDoc(docRef);
    return true;
  }

  const list = getLocalPrayerRequests();
  const filtered = list.filter(r => r.id !== requestId);
  saveLocalPrayerRequests(filtered);
  return true;
}

export function subscribeToPrayerRequests(pairCode, callback) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    const col = collection(db, 'pairs', cleanCode, 'prayerRequests');
    return onSnapshot(col, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(items);
    });
  }

  // Local fallback polling
  let lastJson = '';
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(LOCAL_PRAYER_REQUESTS_KEY) || '[]';
    if (raw !== lastJson) {
      lastJson = raw;
      const list = getLocalPrayerRequests().filter(p => (p.pairId || cleanCode).toUpperCase() === cleanCode);
      list.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
      callback(list);
    }
  }, 1000);

  const initial = getLocalPrayerRequests().filter(p => (p.pairId || cleanCode).toUpperCase() === cleanCode);
  initial.sort((a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime());
  lastJson = localStorage.getItem(LOCAL_PRAYER_REQUESTS_KEY) || JSON.stringify(initial);
  callback(initial);

  return () => clearInterval(pollInterval);
}



