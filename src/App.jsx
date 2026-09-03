import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import VaultView from './components/VaultView';
import TimelineView from './components/TimelineView';
import AuthModal from './components/AuthModal';
import PairingModal from './components/PairingModal';
import LetterEditorModal from './components/LetterEditorModal';
import LetterDetailModal from './components/LetterDetailModal';
import UnlockTimelineModal from './components/UnlockTimelineModal';
import AppLockModal from './components/AppLockModal';
import InfoModal from './components/InfoModal';
import FloatingCompanion from './components/FloatingCompanion';
import StoryCreatorModal from './components/StoryCreatorModal';
import StoryViewerModal from './components/StoryViewerModal';
import StoryArchiveModal from './components/StoryArchiveModal';
import StoryIntroModal from './components/StoryIntroModal';
import StatusPickerModal from './components/StatusPickerModal';
import StatusDetailModal from './components/StatusDetailModal';
import CoupleStatusBanner from './components/CoupleStatusBanner';
import BucketListModal from './components/BucketListModal';
import DailyPrayerModal from './components/DailyPrayerModal';
import CallPromptModal from './components/CallPromptModal';
import CallModal from './components/CallModal';
import MessengerModal from './components/MessengerModal';
import { Lock, Sparkles, Key } from 'lucide-react';

import { 
  listenForIncomingCalls, 
  startOutgoingCall, 
  acceptIncomingCall, 
  terminateCall, 
  sendCallReaction, 
  getLocalUserMedia, 
  switchCameraTrack, 
  stopMediaStream,
  ringtonePlayer
} from './services/webrtc';

import { 
  signInWithGoogle, 
  signOutUser, 
  subscribeToAuth, 
  getPairInfo, 
  savePairInfo, 
  saveLetterToCloud, 
  deleteLetterFromCloud, 
  subscribeToLetters,
  subscribeToPairInfo,
  saveStoryToCloud,
  subscribeToStories,
  reactToStory,
  markStoryAsViewed,
  deleteStoryFromCloud,
  updateUserStatus,
  subscribeToStatuses,
  reactToStatus,
  sendCheerToStatus,
  markStatusAsViewed,
  saveBucketItem,
  markBucketItemCompleted,
  deleteBucketItem,
  subscribeToBucketList,
  savePrayerRequest,
  markPrayerAsPrayed,
  deletePrayerRequest,
  subscribeToPrayerRequests,
  updatePresenceHeartbeat,
  setPresenceOffline,
  subscribeToPresence,
  sendChatMessage,
  subscribeToChatMessages,
  markChatMessagesAsSeen,
  reactToChatMessage,
  deleteChatMessage,
  updateChatMessage
} from './services/firebase';

import { getCountdownToTarget } from './utils/pht';
import { getNickname } from './utils/nicknames';
import { isMessageReadByMe, getLastReadChatTimestamp, setLastReadChatTimestamp } from './utils/chatUtils';

export default function App() {
  const [user, setUser] = useState(null);
  const [pairInfo, setPairInfo] = useState({
    code: '#JayFinallyGotAKiss',
    targetUnlockDate: '2032-08-06T00:00:00+08:00',
    user2: { name: 'Partner' }
  });
  const [letters, setLetters] = useState([]);
  const [stories, setStories] = useState([]);
  const [bucketItems, setBucketItems] = useState([]);
  const [presences, setPresences] = useState({});

  // App Startup Gatekeeper Lock State
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);

  // Active View Tab: 'vault' | 'timeline' | 'bucketlist'
  const [activeTab, setActiveTab] = useState('vault');

  // Modal States - Prioritize Google Auth Modal on app open if not signed in
  const [isAuthOpen, setIsAuthOpen] = useState(!user);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUnlockTimelineOpen, setIsUnlockTimelineOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Our Stories Modals
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryArchiveOpen, setIsStoryArchiveOpen] = useState(false);
  const [isStoryIntroOpen, setIsStoryIntroOpen] = useState(false);
  const [storyIntroPendingAction, setStoryIntroPendingAction] = useState(null);
  const [hasSeenStoriesIntro, setHasSeenStoriesIntro] = useState(() => {
    try {
      return localStorage.getItem('lfl_seen_stories_intro_v2') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [viewerStories, setViewerStories] = useState([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Live Status Notes ("What We're Currently Doing")
  const [statuses, setStatuses] = useState({});
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [isStatusDetailOpen, setIsStatusDetailOpen] = useState(false);
  const [selectedStatusForDetail, setSelectedStatusForDetail] = useState(null);

  // Fantasy / Bucket List Modal
  const [isBucketListOpen, setIsBucketListOpen] = useState(false);

  // Daily Prayers Modal ("Our Daily Prayers")
  const [prayers, setPrayers] = useState([]);
  const [isPrayersOpen, setIsPrayersOpen] = useState(false);

  // Couple Messenger / Chat Sanctuary Modal
  const [messages, setMessages] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [lastReadChatTimestamp, setLastReadChatTimestampState] = useState(0);

  const [selectedLetter, setSelectedLetter] = useState(null);

  // Video / Audio Calling State
  const [isCallPromptOpen, setIsCallPromptOpen] = useState(false);
  const [activeCallData, setActiveCallData] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [callFacingMode, setCallFacingMode] = useState('user');
  const activeCallCleanupRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Subscribe to Auth State & auto-manage Auth Modal
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const unsubscribe = subscribeToAuth((usr) => {
      setUser(usr);
      if (!usr) {
        setIsAuthOpen(true);
      } else {
        setIsAuthOpen(false);
        // Force scroll to top on login
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 50);
      }
    });
    return () => unsubscribe();
  }, []);

  // Force scroll to top when app unlocks
  useEffect(() => {
    if (isAppUnlocked) {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAppUnlocked]);

  // Fetch / Subscribe to Realtime Pair Info
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToPairInfo(pairCode, (info) => {
      if (info) setPairInfo(info);
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Letters
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user?.uid || 'demo-user-1';

    const unsubscribe = subscribeToLetters(pairCode, currentUserId, (fetchedLetters) => {
      setLetters(fetchedLetters);
    });
    return () => unsubscribe();
  }, [pairInfo?.code, user?.uid]);

  // Subscribe to Realtime Stories ("Our Stories")
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToStories(pairCode, (fetchedStories) => {
      setStories(fetchedStories);
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Couple Live Status Notes ("What We're Currently Doing")
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToStatuses(pairCode, (fetchedStatuses) => {
      setStatuses(fetchedStatuses || {});
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Couple Bucket List ("Our Shared Adventures")
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToBucketList(pairCode, (fetchedItems) => {
      setBucketItems(fetchedItems || []);
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Couple Prayer Requests ("Prayer Requests")
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToPrayerRequests(pairCode, (fetchedPrayers) => {
      setPrayers(fetchedPrayers || []);
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Presence Map ("Who is Online")
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToPresence(pairCode, (presencesMap) => {
      setPresences(presencesMap || {});
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Subscribe to Realtime Couple Messenger / Chat Sanctuary
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToChatMessages(pairCode, (fetchedMessages) => {
      setMessages(fetchedMessages || []);
    });
    return () => unsubscribe();
  }, [pairInfo?.code]);

  // Synchronize lastReadChatTimestamp whenever user or pair changes
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const curUserId = user?.uid || 'demo-user-1';
    setLastReadChatTimestampState(getLastReadChatTimestamp(pairCode, curUserId));
  }, [user, pairInfo?.code]);

  // When messenger is open, automatically mark incoming/current messages as read
  useEffect(() => {
    if (isMessengerOpen && user) {
      const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
      const curUserId = user.uid || 'demo-user-1';
      const now = Date.now();
      setLastReadChatTimestamp(pairCode, curUserId, now);
      setLastReadChatTimestampState(now);

      const hasUnseen = messages.some(m => !isMessageReadByMe(m, user, pairInfo, 0));
      if (hasUnseen) {
        markChatMessagesAsSeen(pairCode, user);
      }
    }
  }, [isMessengerOpen, messages, user, pairInfo]);

  // Send Active Presence Heartbeat while user is active on the app
  useEffect(() => {
    if (!user || !isAppUnlocked) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';

    // 1. Immediate Heartbeat on App Open/Unlock
    updatePresenceHeartbeat(pairCode, user, true);

    // 2. Periodic Heartbeat every 25 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresenceHeartbeat(pairCode, user, true);
      }
    }, 25000);

    // 3. Tab Visibility Switch Handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresenceHeartbeat(pairCode, user, true);
      } else {
        updatePresenceHeartbeat(pairCode, user, false);
      }
    };

    // 4. Window Close / Refresh Handler
    const handleBeforeUnload = () => {
      setPresenceOffline(pairCode, user);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setPresenceOffline(pairCode, user);
    };
  }, [user, isAppUnlocked, pairInfo?.code]);

  // Helper to cleanup active call streams and reset state
  const handleCleanUpCall = useCallback(() => {
    ringtonePlayer.stop();
    if (activeCallCleanupRef.current) {
      try {
        activeCallCleanupRef.current();
      } catch (e) {}
      activeCallCleanupRef.current = null;
    }
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch (e) {}
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;
    }
    setLocalMediaStream(null);
    setRemoteMediaStream(null);
    setIsCallModalOpen(false);
    setIsCallMinimized(false);
    setActiveCallData(null);
    setCallFacingMode('user');
  }, []);

  const activeCallCleanupCallbackRef = useRef(handleCleanUpCall);
  activeCallCleanupCallbackRef.current = handleCleanUpCall;

  // Subscribe to Realtime Incoming & Active Calls
  useEffect(() => {
    if (!user || !isAppUnlocked) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';

    const unsubscribe = listenForIncomingCalls(pairCode, currentUserId, (callData) => {
      if (!callData) {
        ringtonePlayer.stop();
        return;
      }

      setActiveCallData(callData);

      // Case A: Incoming Call Ringing
      if (callData.status === 'ringing' && callData.receiver?.uid === currentUserId) {
        setIsCallModalOpen(true);
        setIsCallMinimized(false);
        ringtonePlayer.playIncomingChime();
      }

      // Case B: Outgoing Call Connected
      if (callData.status === 'connected') {
        ringtonePlayer.stop();
        setIsCallModalOpen(true);
      }

      // Case C: Call Rejected or Ended
      if (callData.status === 'ended' || callData.status === 'rejected' || callData.status === 'busy') {
        ringtonePlayer.stop();
        setTimeout(() => {
          if (activeCallCleanupCallbackRef.current) {
            activeCallCleanupCallbackRef.current();
          }
        }, 1200);
      }
    });

    return () => {
      ringtonePlayer.stop();
      unsubscribe();
    };
  }, [user?.uid, isAppUnlocked, pairInfo?.code]);

  const handleStartCall = useCallback(async (callType = 'video') => {
    if (!user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';
    const partnerStatus = Object.values(statuses || {}).find(s => s.userId !== currentUserId);
    const partnerUser = {
      uid: partnerStatus?.userId || 'partner-id',
      name: getNickname(pairInfo?.user2?.name) || 'Partner',
      photo: partnerStatus?.userPhoto || pairInfo?.user2?.photo || ''
    };

    setIsCallPromptOpen(false);
    setIsCallModalOpen(true);
    setIsCallMinimized(false);
    ringtonePlayer.playOutgoingRingback();

    try {
      const stream = await getLocalUserMedia(callType, 'user');
      localStreamRef.current = stream;
      setLocalMediaStream(stream);

      const { peerConnection, cleanup } = await startOutgoingCall({
        pairCode,
        callerUser: user,
        receiverUser: partnerUser,
        callType,
        localStream: stream,
        onRemoteStream: (rStream) => {
          setRemoteMediaStream(rStream);
        },
        onCallStateChange: (updatedCall) => {
          setActiveCallData(updatedCall);
          if (updatedCall?.status === 'connected') {
            ringtonePlayer.stop();
          } else if (updatedCall?.status === 'ended' || updatedCall?.status === 'rejected') {
            ringtonePlayer.stop();
            setTimeout(() => handleCleanUpCall(), 1200);
          }
        }
      });

      peerConnectionRef.current = peerConnection;
      activeCallCleanupRef.current = cleanup;
    } catch (err) {
      console.error('Error starting outgoing call:', err);
      ringtonePlayer.stop();
      handleCleanUpCall();
    }
  }, [user, pairInfo, statuses, handleCleanUpCall]);

  const handleAcceptCall = useCallback(async () => {
    if (!user || !activeCallData) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    ringtonePlayer.stop();

    try {
      const stream = await getLocalUserMedia(activeCallData.callType || 'video', 'user');
      localStreamRef.current = stream;
      setLocalMediaStream(stream);

      const { peerConnection, cleanup } = await acceptIncomingCall({
        pairCode,
        callData: activeCallData,
        localStream: stream,
        onRemoteStream: (rStream) => {
          setRemoteMediaStream(rStream);
        },
        onCallStateChange: (updatedCall) => {
          setActiveCallData(updatedCall);
          if (updatedCall?.status === 'ended' || updatedCall?.status === 'rejected') {
            ringtonePlayer.stop();
            setTimeout(() => handleCleanUpCall(), 1200);
          }
        }
      });

      peerConnectionRef.current = peerConnection;
      activeCallCleanupRef.current = cleanup;
    } catch (err) {
      console.error('Error accepting call:', err);
      handleCleanUpCall();
    }
  }, [user, activeCallData, pairInfo?.code, handleCleanUpCall]);

  const handleDeclineCall = useCallback(async () => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await terminateCall(pairCode, 'rejected');
    handleCleanUpCall();
  }, [pairInfo?.code, handleCleanUpCall]);

  const handleEndCall = useCallback(async () => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await terminateCall(pairCode, 'ended');
    handleCleanUpCall();
  }, [pairInfo?.code, handleCleanUpCall]);

  const handleSendCallReaction = useCallback((emoji) => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user?.uid || 'demo-user-1';
    sendCallReaction(pairCode, emoji, currentUserId);
  }, [pairInfo?.code, user?.uid]);

  const handleSwitchCamera = useCallback(async (currentMode) => {
    if (localStreamRef.current) {
      const newMode = await switchCameraTrack(
        localStreamRef.current,
        currentMode,
        peerConnectionRef.current
      );
      setCallFacingMode(newMode);
      return newMode;
    }
    return currentMode;
  }, []);

  const countdown = getCountdownToTarget(pairInfo?.targetUnlockDate);

  const hasMatchingUnlockCodes = () => {
    const unlockCodes = pairInfo?.unlockCodes || {};
    const values = Object.values(unlockCodes);
    return (
      values.length >= 2 && 
      values.every(v => v && v.trim().toLowerCase() === values[0].trim().toLowerCase())
    );
  };

  const isLettersUnlocked = countdown.isUnlocked && hasMatchingUnlockCodes();

  // Letter Handlers
  const handleSaveLetter = async (letterData) => {
    const saved = await saveLetterToCloud(letterData);
    setLetters(prev => {
      const idx = prev.findIndex(l => l.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteLetter = async (letterId) => {
    await deleteLetterFromCloud(letterId);
    setLetters(prev => prev.filter(l => l.id !== letterId));
  };

  const handleSavePairInfo = async (pairData) => {
    const updated = await savePairInfo(pairData);
    setPairInfo(updated);
  };

  // Story Handlers (Memoized to prevent unnecessary re-renders)
  const handleSaveStory = useCallback(async (storyData) => {
    const saved = await saveStoryToCloud(storyData);
    setStories(prev => {
      const idx = prev.findIndex(s => s.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  }, []);

  const handleDeleteStory = useCallback(async (storyId) => {
    await deleteStoryFromCloud(pairInfo?.code || '#JayFinallyGotAKiss', storyId);
    setStories(prev => prev.filter(s => s.id !== storyId));
    setViewerStories(prev => prev.filter(s => s.id !== storyId));
  }, [pairInfo?.code]);

  const handleReactToStory = useCallback((storyId, emoji) => {
    if (!storyId || !user) return;
    const userId = user?.uid || 'demo-user-1';

    const targetStory = stories.find(s => s.id === storyId);
    if (targetStory && targetStory.authorId === userId) {
      return; // Author cannot react to own story
    }

    // Persist reaction smoothly in background without interrupting viewer playback
    reactToStory(pairInfo?.code || '#JayFinallyGotAKiss', storyId, user, emoji).catch(err => {
      console.warn('Silent reactToStory error:', err);
    });
  }, [pairInfo?.code, user, stories]);

  const handleMarkStoryAsViewed = useCallback(async (storyId) => {
    if (!storyId || !user) return;
    const userId = user.uid || 'demo-user-1';
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const viewers = Array.isArray(s.viewedBy) ? s.viewedBy : [];
        if (!viewers.includes(userId)) {
          return { ...s, viewedBy: [...viewers, userId] };
        }
      }
      return s;
    }));
    await markStoryAsViewed(pairInfo?.code || '#JayFinallyGotAKiss', storyId, user);
  }, [pairInfo?.code, user]);

  const handleOpenStoryAsLetter = useCallback((story) => {
    if (!story) return;
    setIsStoryViewerOpen(false);
    
    // Create pre-filled letter draft with the story snapshot photo attached
    const storyLetter = {
      pairId: pairInfo?.code || '#JayFinallyGotAKiss',
      authorId: user?.uid || 'demo-user-1',
      authorName: user?.displayName || 'Jay',
      authorPhoto: user?.photoURL || '',
      title: `Story Moment (${story.createdAtPHT ? story.createdAtPHT.split(', ')[0] : '2026'})`,
      content: '',
      isVeryImportant: false,
      importantTagReason: '',
      mood: 'Warm & Hopeful',
      images: story.mediaUrl ? [{
        storageUrl: story.mediaUrl,
        name: `story_moment_${Date.now()}.jpg`,
        sizeKb: 0
      }] : [],
      isDraft: false
    };

    setSelectedLetter(storyLetter);
    setIsEditorOpen(true);
  }, [pairInfo?.code, user]);

  const handleWithIntroCheck = useCallback((actionFn) => {
    if (!hasSeenStoriesIntro) {
      setStoryIntroPendingAction(() => actionFn);
      setIsStoryIntroOpen(true);
    } else if (actionFn) {
      actionFn();
    }
  }, [hasSeenStoriesIntro]);

  const handleOpenStoryViewerWithStories = useCallback((storiesToView, startIndex = 0) => {
    handleWithIntroCheck(() => {
      setViewerStories(storiesToView);
      setViewerInitialIndex(startIndex);
      setIsStoryViewerOpen(true);
    });
  }, [handleWithIntroCheck]);

  const handleCloseStoryViewer = useCallback(() => {
    setIsStoryViewerOpen(false);
  }, []);

  // Couple Live Status Note Handlers
  const handleSaveUserStatus = useCallback(async (statusData) => {
    if (!user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const userId = user.uid || 'demo-user-1';
    const saved = await updateUserStatus(pairCode, user, statusData);
    setStatuses(prev => ({
      ...prev,
      [userId]: saved
    }));
    if (selectedStatusForDetail?.userId === userId) {
      setSelectedStatusForDetail(saved);
    }
  }, [pairInfo?.code, user, selectedStatusForDetail?.userId]);

  const handleReactToStatus = useCallback(async (targetUserId, emoji) => {
    if (!targetUserId || !user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';
    // User cannot react to their own status note
    if (targetUserId === currentUserId) return;

    const currentUserName = user.displayName || 'Partner';
    const timestamp = new Date().toISOString();

    // Optimistic local state update
    setStatuses(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const reactions = { ...(target.reactions || {}) };
      const emojiData = reactions[emoji] || { count: 0, userCounts: {}, users: [] };
      const userCounts = { ...(emojiData.userCounts || {}) };
      const myCount = Number(userCounts[currentUserId]) || 0;
      if (myCount >= 10) return prev;

      userCounts[currentUserId] = myCount + 1;
      const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
      const users = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
      if (!users.includes(currentUserId)) users.push(currentUserId);

      reactions[emoji] = {
        count: totalCount,
        userCounts,
        users,
        lastReactedBy: currentUserName,
        lastReactedAt: timestamp
      };

      const updatedDoc = {
        ...target,
        reactions
      };

      if (selectedStatusForDetail?.userId === targetUserId) {
        setSelectedStatusForDetail(updatedDoc);
      }

      return {
        ...prev,
        [targetUserId]: updatedDoc
      };
    });

    await reactToStatus(pairCode, targetUserId, user, emoji);
  }, [pairInfo?.code, user, selectedStatusForDetail?.userId]);

  const handleSendCheerToStatus = useCallback(async (targetUserId, cheerText) => {
    if (!targetUserId || !user || !cheerText) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';
    const currentUserName = user.displayName || 'Partner';
    const timestamp = new Date().toISOString();

    const cheerObj = {
      text: cheerText,
      fromName: currentUserName,
      fromId: currentUserId,
      atIso: timestamp
    };

    setStatuses(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const currentCheers = Array.isArray(target.cheers) ? target.cheers : [];
      const updatedDoc = {
        ...target,
        lastCheer: cheerObj,
        cheers: [cheerObj, ...currentCheers.slice(0, 19)],
        viewedBy: [currentUserId]
      };

      if (selectedStatusForDetail?.userId === targetUserId) {
        setSelectedStatusForDetail(updatedDoc);
      }

      return {
        ...prev,
        [targetUserId]: updatedDoc
      };
    });

    await sendCheerToStatus(pairCode, targetUserId, user, cheerText);
  }, [pairInfo?.code, user, selectedStatusForDetail?.userId]);

  const handleMarkStatusAsViewed = useCallback(async (targetUserId) => {
    if (!targetUserId || !user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';

    setStatuses(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const viewedBy = Array.isArray(target.viewedBy) ? target.viewedBy : [];
      if (viewedBy.includes(currentUserId)) return prev;

      const updatedDoc = {
        ...target,
        viewedBy: [...viewedBy, currentUserId]
      };

      if (selectedStatusForDetail?.userId === targetUserId) {
        setSelectedStatusForDetail(updatedDoc);
      }

      return {
        ...prev,
        [targetUserId]: updatedDoc
      };
    });

    await markStatusAsViewed(pairCode, targetUserId, user);
  }, [pairInfo?.code, user, selectedStatusForDetail?.userId]);

  // Sync viewerStories with latest live story metadata (reactions, views) without resetting viewer slide
  useEffect(() => {
    if (isStoryViewerOpen && viewerStories.length > 0) {
      setViewerStories(prev => {
        const idMap = new Map(stories.map(s => [s.id, s]));
        let hasChanges = false;
        const updated = prev.map(story => {
          const fresh = idMap.get(story.id);
          if (fresh && fresh !== story) {
            hasChanges = true;
            return fresh;
          }
          return story;
        });
        return hasChanges ? updated : prev;
      });
    }
  }, [stories, isStoryViewerOpen, viewerStories.length]);

  // Bucket List Handlers
  const handleSaveBucketItem = useCallback(async (itemData) => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUser = user || { uid: 'demo-user-1', displayName: 'Jay' };
    const saved = await saveBucketItem(pairCode, itemData, currentUser);
    if (saved) {
      setBucketItems(prev => {
        const idx = prev.findIndex(i => i.id === saved.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
    }
  }, [pairInfo?.code, user]);

  const handleCompleteBucketItem = useCallback(async (itemId, completionData) => {
    if (!user || !itemId) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await markBucketItemCompleted(pairCode, itemId, completionData, user);
    setBucketItems(prev => prev.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          isCompleted: true,
          completionNote: completionData.completionNote,
          completionPhoto: completionData.completionPhotoDataUrl || i.completionPhoto
        };
      }
      return i;
    }));
  }, [pairInfo?.code, user]);

  const handleDeleteBucketItem = useCallback(async (itemId) => {
    if (!itemId) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await deleteBucketItem(pairCode, itemId);
    setBucketItems(prev => prev.filter(i => i.id !== itemId));
  }, [pairInfo?.code]);

  // Prayer Requests Handlers
  const handleSavePrayerRequest = useCallback(async (prayerData) => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUser = user || { uid: 'demo-user-1', displayName: 'Jay' };
    const saved = await savePrayerRequest(pairCode, prayerData, currentUser);
    if (saved) {
      setPrayers(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
    }
  }, [pairInfo?.code, user]);

  const handleMarkPrayerAsPrayed = useCallback(async (requestId) => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUser = user || { uid: 'demo-user-1', displayName: 'Jay' };
    const updateData = await markPrayerAsPrayed(pairCode, requestId, currentUser);
    setPrayers(prev => prev.map(p => {
      if (p.id === requestId) {
        return {
          ...p,
          ...updateData
        };
      }
      return p;
    }));
  }, [pairInfo?.code, user]);

  const handleDeletePrayerRequest = useCallback(async (requestId) => {
    if (!requestId) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await deletePrayerRequest(pairCode, requestId);
    setPrayers(prev => prev.filter(p => p.id !== requestId));
  }, [pairInfo?.code]);

  // Couple Messenger / Chat Handlers
  const handleOpenMessenger = useCallback(() => {
    setIsMessengerOpen(true);
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const curUserId = user?.uid || 'demo-user-1';
    const now = Date.now();
    setLastReadChatTimestamp(pairCode, curUserId, now);
    setLastReadChatTimestampState(now);
    if (user) {
      markChatMessagesAsSeen(pairCode, user);
    }
  }, [pairInfo?.code, user]);

  const handleCloseMessenger = useCallback(() => {
    setIsMessengerOpen(false);
  }, []);

  const handleSendMessage = useCallback(async (messageData) => {
    if (!user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await sendChatMessage(pairCode, user, messageData);
  }, [pairInfo?.code, user]);

  const handleReactToChatMessage = useCallback(async (messageId, emoji) => {
    if (!user || !messageId || !emoji) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await reactToChatMessage(pairCode, messageId, user, emoji);
  }, [pairInfo?.code, user]);

  const handleDeleteChatMessage = useCallback(async (messageId) => {
    if (!messageId) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await deleteChatMessage(pairCode, messageId);
  }, [pairInfo?.code]);

  const handleUpdateChatMessage = useCallback(async (messageId, updatedText) => {
    if (!messageId || !updatedText.trim()) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    await updateChatMessage(pairCode, messageId, updatedText);
  }, [pairInfo?.code]);

  const handleTimelineButtonClick = () => {
    if (!countdown.isUnlocked) {
      return; // Disabled before 2032
    }
    
    if (isLettersUnlocked) {
      setActiveTab('timeline');
    } else {
      setIsUnlockTimelineOpen(true);
    }
  };

  const currentUserId = user?.uid || 'demo-user-1';
  const partnerPresence = Object.values(presences || {}).find(p => p.userId !== currentUserId);

  // Compute unread message count (excludes own messages and already-read messages)
  const unreadMessageCount = (user && !isMessengerOpen) ? messages.filter(m => 
    !isMessageReadByMe(m, user, pairInfo, lastReadChatTimestamp)
  ).length : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Very Top Background Music Player — Only active AFTER successful login & app unlock */}
      {user && isAppUnlocked && !isAuthOpen && (
        <MusicPlayer isCallActive={isCallModalOpen} />
      )}

      {/* Top Navbar with integrated Our Stories & Call Partner & Chat Sanctuary */}
      <Navbar
        user={user}
        pairInfo={pairInfo}
        isLettersUnlocked={isLettersUnlocked}
        stories={stories}
        statuses={statuses}
        partnerPresence={partnerPresence}
        hasSeenStoriesIntro={hasSeenStoriesIntro}
        unreadMessageCount={unreadMessageCount}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onSignOut={() => signOutUser()}
        onOpenStoryViewer={handleOpenStoryViewerWithStories}
        onOpenStoryCreator={() => {
          handleWithIntroCheck(() => {
            setIsStoryCreatorOpen(true);
          });
        }}
        onOpenStoryArchive={() => setIsStoryArchiveOpen(true)}
        onOpenStoryIntro={() => setIsStoryIntroOpen(true)}
        onOpenBucketList={() => setIsBucketListOpen(true)}
        onOpenCallPrompt={() => setIsCallPromptOpen(true)}
        onOpenMessenger={handleOpenMessenger}
      />

      {/* Couple Live Status Ribbon ("What We're Currently Doing") */}
      {user && isAppUnlocked && !isAuthOpen && (
        <CoupleStatusBanner
          user={user}
          pairInfo={pairInfo}
          statuses={statuses}
          partnerPresence={partnerPresence}
          onOpenStatusPicker={() => setIsStatusPickerOpen(true)}
          onOpenStatusDetail={(statusDoc) => {
            setSelectedStatusForDetail(statusDoc);
            setIsStatusDetailOpen(true);
          }}
          onOpenCallPrompt={() => setIsCallPromptOpen(true)}
        />
      )}

      {/* Main Content View (Time Capsule Vault by default, or Unlocked Timeline in 2032) */}
      <main className="flex-1">
        {activeTab === 'timeline' ? (
          <TimelineView
            letters={letters}
            currentUser={user}
            onViewLetter={(letter) => {
              setSelectedLetter(letter);
              setIsDetailOpen(true);
            }}
          />
        ) : (
          <VaultView
            letters={letters}
            currentUser={user}
            pairInfo={pairInfo}
            isLettersUnlocked={isLettersUnlocked}
            bucketItems={bucketItems}
            onWriteNew={() => {
              setSelectedLetter(null);
              setIsEditorOpen(true);
            }}
            onEditLetter={(letter) => {
              setSelectedLetter(letter);
              setIsEditorOpen(true);
            }}
            onViewLetter={(letter) => {
              setSelectedLetter(letter);
              setIsDetailOpen(true);
            }}
            onOpenPairing={() => setIsPairingOpen(true)}
            onOpenInfo={() => setIsInfoOpen(true)}
            onOpenTimeline={handleTimelineButtonClick}
            onOpenBucketList={() => setIsBucketListOpen(true)}
            onOpenPrayers={() => setIsPrayersOpen(true)}
            prayers={prayers}
          />
        )}
      </main>

      {/* Vintage Footer */}
      <footer className="border-t border-[#E2D7C7] bg-[#F6F2EB] py-6 text-center text-xs text-[#9E8B75] space-y-1">
        <p className="font-serif-vintage font-bold text-sm text-[#36271C]">
          LettersForLater — Time Capsule for Two
        </p>
        <p className="font-handwriting text-base text-[#4A3B2C]">
          "Writing today. Unlocking together in 2032."
        </p>
        <p className="text-[10px] text-[#9E8B75] pt-2">
          Immutable PHT Timestamps • Built for 100% Free Cloud Storage Usage
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSignInGoogle={() => signInWithGoogle()}
        canClose={!!user}
      />

      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        pairInfo={pairInfo}
        onSavePair={handleSavePairInfo}
      />

      <LetterEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedLetter(null);
        }}
        existingLetter={selectedLetter}
        currentUser={user}
        pairInfo={pairInfo}
        onSave={handleSaveLetter}
      />

      <LetterDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLetter(null);
        }}
        letter={selectedLetter}
        currentUserId={user?.uid || 'demo-user-1'}
        onEdit={(letter) => {
          setIsDetailOpen(false);
          setSelectedLetter(letter);
          setIsEditorOpen(true);
        }}
        onDelete={handleDeleteLetter}
      />

      <UnlockTimelineModal
        isOpen={isUnlockTimelineOpen}
        onClose={() => setIsUnlockTimelineOpen(false)}
        pairInfo={pairInfo}
        currentUser={user}
        onSaveUnlockCode={(code) => {
          const currentUserId = user?.uid || 'demo-user-1';
          const newUnlockCodes = { ...(pairInfo.unlockCodes || {}) };
          
          if (code === null) {
            delete newUnlockCodes[currentUserId];
          } else {
            newUnlockCodes[currentUserId] = code;
          }
          
          handleSavePairInfo({
            ...pairInfo,
            unlockCodes: newUnlockCodes
          });
          
          // Check if this newly entered code completes the match
          const updatedValues = Object.values(newUnlockCodes);
          if (updatedValues.length >= 2 && updatedValues.every(v => v === updatedValues[0])) {
            setIsUnlockTimelineOpen(false);
            setActiveTab('timeline');
          }
        }}
      />

      {/* Story Creator Modal */}
      <StoryCreatorModal
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        currentUser={user}
        pairInfo={pairInfo}
        onSaveStory={handleSaveStory}
      />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        onClose={handleCloseStoryViewer}
        stories={viewerStories}
        initialStoryIndex={viewerInitialIndex}
        currentUser={user}
        pairInfo={pairInfo}
        onReact={handleReactToStory}
        onDeleteStory={handleDeleteStory}
        onOpenAsLetter={handleOpenStoryAsLetter}
        onMarkAsViewed={handleMarkStoryAsViewed}
        onOpenStoryCreator={() => {
          setIsStoryViewerOpen(false);
          handleWithIntroCheck(() => {
            setIsStoryCreatorOpen(true);
          });
        }}
      />

      {/* Story Archive / Memory Log Modal */}
      <StoryArchiveModal
        isOpen={isStoryArchiveOpen}
        onClose={() => setIsStoryArchiveOpen(false)}
        stories={stories}
        currentUser={user}
        pairInfo={pairInfo}
        onSelectStory={(story, archiveStories, index) => {
          const list = archiveStories && archiveStories.length > 0 ? archiveStories : [story];
          const startIndex = typeof index === 'number' && index >= 0 ? index : list.findIndex(s => s.id === story.id);
          handleOpenStoryViewerWithStories(list, Math.max(0, startIndex));
        }}
        onOpenCreateStory={() => {
          setIsStoryArchiveOpen(false);
          setIsStoryCreatorOpen(true);
        }}
      />

      {/* Story Intro / Feature Guide Modal */}
      <StoryIntroModal
        isOpen={isStoryIntroOpen}
        onClose={() => {
          setIsStoryIntroOpen(false);
          setStoryIntroPendingAction(null);
        }}
        onProceed={() => {
          setHasSeenStoriesIntro(true);
          if (storyIntroPendingAction) {
            storyIntroPendingAction();
            setStoryIntroPendingAction(null);
          }
        }}
      />

      {/* Couple Live Status Picker Modal ("What are you doing right now?") */}
      <StatusPickerModal
        isOpen={isStatusPickerOpen}
        onClose={() => setIsStatusPickerOpen(false)}
        currentStatus={statuses[user?.uid || 'demo-user-1']}
        currentUser={user}
        onSaveStatus={handleSaveUserStatus}
      />

      {/* Couple Live Status Detail / Reaction Modal */}
      <StatusDetailModal
        isOpen={isStatusDetailOpen}
        onClose={() => {
          setIsStatusDetailOpen(false);
          setSelectedStatusForDetail(null);
        }}
        targetStatus={selectedStatusForDetail?.userId ? (statuses[selectedStatusForDetail.userId] || selectedStatusForDetail) : selectedStatusForDetail}
        currentUser={user}
        pairInfo={pairInfo}
        onReactToStatus={handleReactToStatus}
        onSendCheer={handleSendCheerToStatus}
        onMarkStatusAsViewed={handleMarkStatusAsViewed}
        onOpenStatusPicker={() => {
          setIsStatusDetailOpen(false);
          setIsStatusPickerOpen(true);
        }}
        onOpenCallPrompt={() => setIsCallPromptOpen(true)}
      />

      {/* Our Fantasy / Bucket List Note Modal */}
      <BucketListModal
        isOpen={isBucketListOpen}
        onClose={() => setIsBucketListOpen(false)}
        bucketItems={bucketItems}
        currentUser={user}
        pairInfo={pairInfo}
        onSaveItem={handleSaveBucketItem}
        onDeleteItem={handleDeleteBucketItem}
      />

      {/* Prayer Requests Modal */}
      <DailyPrayerModal
        isOpen={isPrayersOpen}
        onClose={() => setIsPrayersOpen(false)}
        prayers={prayers}
        currentUser={user}
        pairInfo={pairInfo}
        onSavePrayer={handleSavePrayerRequest}
        onMarkPrayed={handleMarkPrayerAsPrayed}
        onDeletePrayer={handleDeletePrayerRequest}
      />

      {/* App Startup Gatekeeper Lock Modal */}
      <AppLockModal
        isOpen={!isAppUnlocked}
        onUnlockSuccess={() => setIsAppUnlocked(true)}
      />

      {/* How It Works Info Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Call Prompt Selection Dialog (Video vs Voice Call) */}
      <CallPromptModal
        isOpen={isCallPromptOpen}
        onClose={() => setIsCallPromptOpen(false)}
        partner={{
          name: getNickname(pairInfo?.user2?.name) || 'Partner',
          photo: Object.values(statuses || {}).find(s => s.userId !== (user?.uid || 'demo-user-1'))?.userPhoto || pairInfo?.user2?.photo || ''
        }}
        partnerPresence={partnerPresence}
        onStartCall={handleStartCall}
      />

      {/* Active WebRTC Video & Audio Call Modal / Floating PIP */}
      <CallModal
        isOpen={isCallModalOpen}
        callData={activeCallData}
        currentUserId={user?.uid || 'demo-user-1'}
        localStream={localMediaStream}
        remoteStream={remoteMediaStream}
        isMinimized={isCallMinimized}
        onToggleMinimize={() => setIsCallMinimized(!isCallMinimized)}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onEndCall={handleEndCall}
        onSendReaction={handleSendCallReaction}
        onSwitchCamera={handleSwitchCamera}
        facingMode={callFacingMode}
      />

      {/* Couple Messenger & Chat Sanctuary Modal */}
      <MessengerModal
        isOpen={isMessengerOpen}
        onClose={handleCloseMessenger}
        currentUser={user}
        pairInfo={pairInfo}
        partnerPresence={partnerPresence}
        messages={messages}
        onSendMessage={handleSendMessage}
        onReactToMessage={handleReactToChatMessage}
        onDeleteMessage={handleDeleteChatMessage}
        onUpdateMessage={handleUpdateChatMessage}
        onSaveToVault={handleSaveBucketItem}
        onOpenCallPrompt={() => setIsCallPromptOpen(true)}
      />

      {/* Floating Jay Companion */}
      {isAppUnlocked && !isAuthOpen && (
        <FloatingCompanion currentUser={user} pairInfo={pairInfo} />
      )}

    </div>
  );
}
