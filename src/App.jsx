import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VaultView from './components/VaultView';
import TimelineView from './components/TimelineView';
import AuthModal from './components/AuthModal';
import PairingModal from './components/PairingModal';
import LetterEditorModal from './components/LetterEditorModal';
import LetterDetailModal from './components/LetterDetailModal';
import UnlockTimelineModal from './components/UnlockTimelineModal';
import AppLockModal from './components/AppLockModal';
import IntruderLogsModal from './components/IntruderLogsModal';
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
  subscribeToIntruderLogs,
  deleteIntruderLog
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
  const [intruderLogs, setIntruderLogs] = useState([]);

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
  const [isIntruderLogsOpen, setIsIntruderLogsOpen] = useState(false);

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

  // Subscribe to Realtime Intruder Logs
  useEffect(() => {
    const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';
    const unsubscribe = subscribeToIntruderLogs(pairCode, (fetchedLogs) => {
      setIntruderLogs(fetchedLogs);
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

  // Handlers
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
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        pairInfo={pairInfo}
        isLettersUnlocked={isLettersUnlocked}
        intruderCount={intruderLogs.length}
        onOpenIntruderLogs={() => setIsIntruderLogsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onSignOut={() => signOutUser()}
      />

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

      {/* App Startup Gatekeeper Lock Modal */}
      <AppLockModal
        isOpen={!isAppUnlocked}
        pairCode={pairInfo?.code}
        onUnlockSuccess={() => setIsAppUnlocked(true)}
      />

      {/* Intruder Logs Security Modal */}
      <IntruderLogsModal
        isOpen={isIntruderLogsOpen}
        onClose={() => setIsIntruderLogsOpen(false)}
        intruderLogs={intruderLogs}
        onDeleteLog={async (logId) => {
          await deleteIntruderLog(logId);
          setIntruderLogs(prev => prev.filter(l => l.id !== logId));
        }}
      />

    </div>
  );
}

