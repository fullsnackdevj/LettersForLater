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
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
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

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app, auth, db, storage, googleProvider;

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

// In-Memory Storage Cache backed by localStorage
let inMemoryLettersStore = null;

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
  const pollInterval = setInterval(() => {
    const localPair = localStorage.getItem(LOCAL_PAIR_KEY);
    if (localPair) {
      const parsed = JSON.parse(localPair);
      if (parsed.code === cleanCode) callback(parsed);
    }
  }, 1000);

  getPairInfo(cleanCode).then(info => {
    if (info) callback(info);
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
  const pollInterval = setInterval(() => {
    callback(getLocalLetters());
  }, 1000);

  callback(getLocalLetters());
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
  const pollInterval = setInterval(() => {
    const raw = localStorage.getItem(key);
    if (raw) callback(JSON.parse(raw));
  }, 1000);

  const raw = localStorage.getItem(key);
  if (raw) callback(JSON.parse(raw));
  else callback({ dateKey, total: 0 });

  return () => clearInterval(pollInterval);
}


