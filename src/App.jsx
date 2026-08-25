import React, { useState, useEffect, useCallback } from 'react';
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
import { Lock, Sparkles, Key } from 'lucide-react';

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
  markStatusAsViewed
} from './services/firebase';

import { getCountdownToTarget } from './utils/pht';

export default function App() {
  const [user, setUser] = useState(null);
  const [pairInfo, setPairInfo] = useState({
    code: '#JayFinallyGotAKiss',
    targetUnlockDate: '2032-08-06T00:00:00+08:00',
    user2: { name: 'Partner' }
  });
  const [letters, setLetters] = useState([]);
  const [stories, setStories] = useState([]);

  // App Startup Gatekeeper Lock State
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);

  // Active View Tab: 'vault' | 'timeline'
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

  const [selectedLetter, setSelectedLetter] = useState(null);

  // Subscribe to Auth State & auto-manage Auth Modal
  useEffect(() => {
    const unsubscribe = subscribeToAuth((usr) => {
      setUser(usr);
      if (!usr) {
        setIsAuthOpen(true);
      } else {
        setIsAuthOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleReactToStory = useCallback(async (storyId, emoji) => {
    if (!storyId) return;
    const userId = user?.uid || 'demo-user-1';
    const userName = user?.displayName || 'Partner';
    const timestamp = new Date().toISOString();

    const updateStoryReactions = (storyList) => storyList.map(s => {
      if (s.id === storyId) {
        const reactions = { ...(s.reactions || {}) };
        const emojiData = reactions[emoji] || { count: 0, userCounts: {}, users: [] };
        const userCounts = { ...(emojiData.userCounts || {}) };
        if (userCounts[userId] === undefined && emojiData.users?.includes(userId) && emojiData.count) {
          userCounts[userId] = emojiData.count;
        }
        const currentCount = Number(userCounts[userId]) || 0;

        if (currentCount >= 10) return s; // Cap at 10

        userCounts[userId] = currentCount + 1;
        const totalCount = Object.values(userCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
        const users = Array.isArray(emojiData.users) ? [...emojiData.users] : [];
        if (!users.includes(userId)) users.push(userId);

        reactions[emoji] = {
          count: totalCount,
          userCounts,
          users,
          lastReactedBy: userName,
          lastReactedAt: timestamp
        };

        return { ...s, reactions };
      }
      return s;
    });

    setStories(prev => updateStoryReactions(prev));
    setViewerStories(prev => updateStoryReactions(prev));

    await reactToStory(pairInfo?.code || '#JayFinallyGotAKiss', storyId, user, emoji);
  }, [pairInfo?.code, user]);

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
  }, [pairInfo?.code, user]);

  const handleReactToStatus = useCallback(async (targetUserId, emoji) => {
    if (!targetUserId || !user) return;
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const currentUserId = user.uid || 'demo-user-1';
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
        cheers: [cheerObj, ...currentCheers.slice(0, 19)]
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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Very Top Background Music Player — Only active AFTER successful login & app unlock */}
      {user && isAppUnlocked && !isAuthOpen && (
        <MusicPlayer />
      )}

      {/* Top Navbar with integrated Our Stories */}
      <Navbar
        user={user}
        pairInfo={pairInfo}
        isLettersUnlocked={isLettersUnlocked}
        stories={stories}
        hasSeenStoriesIntro={hasSeenStoriesIntro}
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
      />

      {/* Couple Live Status Ribbon ("What We're Currently Doing") */}
      {user && isAppUnlocked && !isAuthOpen && (
        <CoupleStatusBanner
          user={user}
          pairInfo={pairInfo}
          statuses={statuses}
          onOpenStatusPicker={() => setIsStatusPickerOpen(true)}
          onOpenStatusDetail={(statusDoc) => {
            setSelectedStatusForDetail(statusDoc);
            setIsStatusDetailOpen(true);
          }}
        />
      )}

      {/* View Switcher Bar (Vault vs Timeline) */}
      <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-3 py-2 flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'vault'
              ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm'
              : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Time Capsule Vault</span>
        </button>

        <button
          onClick={handleTimelineButtonClick}
          disabled={!countdown.isUnlocked}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm'
              : !countdown.isUnlocked 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
          }`}
        >
          {!countdown.isUnlocked ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Locked Until The Right Time</span>
            </>
          ) : isLettersUnlocked ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Unlocked Timeline</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5" />
              <span>Reveal All The Letters</span>
            </>
          )}
        </button>
      </div>


      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'vault' ? (
          <VaultView
            letters={letters}
            currentUser={user}
            pairInfo={pairInfo}
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
          />
        ) : (
          <TimelineView
            letters={letters}
            currentUser={user}
            onViewLetter={(letter) => {
              setSelectedLetter(letter);
              setIsDetailOpen(true);
            }}
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
        targetStatus={selectedStatusForDetail}
        currentUser={user}
        pairInfo={pairInfo}
        onReactToStatus={handleReactToStatus}
        onSendCheer={handleSendCheerToStatus}
        onMarkStatusAsViewed={handleMarkStatusAsViewed}
        onOpenStatusPicker={() => {
          setIsStatusDetailOpen(false);
          setIsStatusPickerOpen(true);
        }}
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

      {/* Floating Jay Companion */}
      {isAppUnlocked && !isAuthOpen && (
        <FloatingCompanion currentUser={user} pairInfo={pairInfo} />
      )}

    </div>
  );
}
