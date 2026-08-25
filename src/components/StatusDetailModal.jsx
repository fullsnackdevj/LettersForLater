import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  Edit3,
  Check
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { QUICK_CHEERS } from '../data/statusPresets';

const STATUS_REACTION_EMOJIS = ['❤️', '💪', '☕', '🥰', '🫶', '✨'];

export default function StatusDetailModal({
  isOpen,
  onClose,
  targetStatus,
  currentUser,
  pairInfo,
  onReactToStatus,
  onMarkStatusAsViewed,
  onOpenStatusPicker
}) {
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [sentCheer, setSentCheer] = useState(null);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const targetUserId = targetStatus?.userId;
  const isMine = targetUserId === currentUserId;

  // Mark status as viewed automatically when modal opens
  useEffect(() => {
    if (isOpen && targetStatus && targetUserId && onMarkStatusAsViewed) {
      const viewedList = Array.isArray(targetStatus.viewedBy) ? targetStatus.viewedBy : [];
      if (!viewedList.includes(currentUserId)) {
        onMarkStatusAsViewed(targetUserId);
      }
    }
  }, [isOpen, targetStatus, targetUserId, currentUserId, onMarkStatusAsViewed]);

  if (!isOpen || !targetStatus) return null;

  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;
  const targetName = isMine ? currentUserName : (getNickname(targetStatus.userName) || partnerName);

  // Relative Time helper
  const getTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Seen status calculation
  const viewedList = Array.isArray(targetStatus.viewedBy) ? targetStatus.viewedBy : [];
  const isSeenByOther = viewedList.some(id => id !== targetUserId);

  // Handle reaction tap
  const handleReactionTap = (emoji) => {
    if (!targetUserId || !onReactToStatus) return;

    const emojiData = targetStatus.reactions?.[emoji];
    const userCounts = emojiData?.userCounts || {};
    let myCount = Number(userCounts[currentUserId]);
    if (myCount === undefined || isNaN(myCount)) {
      myCount = emojiData?.users?.includes(currentUserId) && emojiData?.count ? emojiData.count : 0;
    }

    if (myCount >= 10) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 40]); } catch (e) {}
    }

    // Spawn floating particle burst
    const newParticles = Array.from({ length: 6 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      emoji,
      left: 20 + Math.random() * 60,
      scale: 0.85 + Math.random() * 0.45,
      rotation: Math.random() * 40 - 20,
      delay: idx * 0.04
    }));

    setFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    onReactToStatus(targetUserId, emoji);
  };

  const handleSendCheer = (cheerText) => {
    // Send cheer reaction
    handleReactionTap('💬');
    setSentCheer(cheerText);
    setTimeout(() => setSentCheer(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      
      {/* Floating Reaction Burst Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingParticles.map(p => (
          <span
            key={p.id}
            className="absolute bottom-24 text-3xl animate-floatUp opacity-0"
            style={{
              left: `${p.left}%`,
              transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              animationDelay: `${p.delay}s`
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div 
        className="relative w-full max-w-sm bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2D7C7] bg-[#FAF5EC]">
          <div className="flex items-center gap-2">
            <span className="text-sm">💬</span>
            <h3 className="font-serif-vintage font-bold text-sm text-[#36271C]">
              {isMine ? 'Your Current Status Note' : `${targetName}'s Status Note`}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Status Display Card */}
        <div className="p-6 text-center space-y-4 bg-gradient-to-b from-[#FAF5EC] to-[#FDFBF7]">
          
          {/* Avatar with Status Bubble */}
          <div className="relative inline-block mx-auto">
            <img
              src={targetStatus.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={targetName}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-md mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 text-2xl bg-white rounded-full p-0.5 shadow-md border border-[#E2D7C7]">
              {targetStatus.emoji || '💬'}
            </div>
          </div>

          {/* Status Text & Note */}
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-serif-vintage text-[#36271C]">
              {targetStatus.statusText}
            </h2>

            {targetStatus.customNote && (
              <p className="text-xs font-handwriting text-base text-[#A83232] bg-[#FAF5EC] border border-[#D2C3B0]/60 py-1 px-3 rounded-full inline-block shadow-xs">
                "{targetStatus.customNote}"
              </p>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9E8B75] pt-1">
              <Clock className="w-3 h-3 text-[#A83232]" />
              <span>{getTimeAgo(targetStatus.updatedAtIso)}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">{targetStatus.updatedAtPHT ? targetStatus.updatedAtPHT.split(', ')[1] || 'PHT' : 'Today'}</span>
            </div>
          </div>

          {/* Seen Status Receipt */}
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border shadow-xs ${
              isSeenByOther
                ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-800'
                : 'bg-[#EFE9DE] border-[#D2C3B0] text-[#7A6855]'
            }`}>
              <Eye className="w-3 h-3 text-[#D4AF37]" />
              <span>
                {isSeenByOther
                  ? isMine ? `Seen by ${partnerName} 💕` : `Seen by you 👀`
                  : isMine ? `Not seen by ${partnerName} yet` : `Seen by you just now`}
              </span>
            </span>
          </div>

        </div>

        {/* Quick Reaction Bar (Both can react, max 10 taps) */}
        <div className="px-5 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC]/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#7A6855]">
            <span>Quick Reactions</span>
            <span className="text-[10px] text-[#9E8B75] font-normal">Tap up to 10x</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 items-center justify-items-center">
            {STATUS_REACTION_EMOJIS.map((emoji) => {
              const emojiData = targetStatus.reactions?.[emoji];
              const totalCount = emojiData?.count || 0;
              const userCounts = emojiData?.userCounts || {};
              let myCount = Number(userCounts[currentUserId]);
              if (myCount === undefined || isNaN(myCount)) {
                myCount = emojiData?.users?.includes(currentUserId) && emojiData?.count ? emojiData.count : 0;
              }
              const isMaxed = myCount >= 10;
              const hasReacted = myCount > 0;

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReactionTap(emoji)}
                  disabled={isMaxed}
                  className={`relative group w-full aspect-square rounded-xl flex items-center justify-center transition-all touch-manipulation cursor-pointer ${
                    isMaxed
                      ? 'bg-gray-100 border border-gray-300 opacity-60 cursor-not-allowed'
                      : hasReacted
                        ? 'bg-[#FAF5EC] border border-[#D4AF37] shadow-xs hover:scale-110 active:scale-125'
                        : 'bg-white border border-[#E2D7C7] hover:border-[#D4AF37] active:scale-125 hover:bg-[#FAF5EC]'
                  }`}
                  title={`Send ${emoji} (${myCount}/10)`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform select-none">
                    {emoji}
                  </span>

                  {totalCount > 0 && (
                    <span className={`absolute -top-1.5 -right-1 px-1 py-0.2 min-w-[14px] text-[9px] font-mono font-bold rounded-full shadow-xs border text-center ${
                      isMaxed
                        ? 'bg-[#A83232] text-[#F8E3B6] border-[#D4AF37]'
                        : hasReacted
                          ? 'bg-[#D4AF37] text-[#36271C] border-white'
                          : 'bg-[#36271C] text-white border-white'
                    }`}>
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Cheering Replies (For Partner) or Edit Button (For Own Status) */}
        <div className="p-4 border-t border-[#E2D7C7] bg-[#FAF5EC] space-y-2">
          {!isMine ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-[#7A6855] text-left">
                Send a sweet cheer:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHEERS.map((cheer) => (
                  <button
                    key={cheer}
                    type="button"
                    onClick={() => handleSendCheer(cheer)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-[#D2C3B0] hover:border-[#A83232] hover:bg-[#FAF5EC] text-[#5C4A3A] transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    {cheer}
                  </button>
                ))}
              </div>
              {sentCheer && (
                <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 animate-fadeIn pt-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Cheer sent: "{sentCheer}"</span>
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStatusPicker();
              }}
              className="w-full py-2.5 rounded-2xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-1.5 border border-[#D4AF37]/50 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change My Status</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
