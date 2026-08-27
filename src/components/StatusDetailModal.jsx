import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  Edit3, 
  Check, 
  Sparkles, 
  Send,
  MessageCircleHeart
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { getCheersForStatus } from '../data/statusPresets';

const STATUS_REACTION_EMOJIS = ['❤️', '💪', '☕', '🥰', '🫶', '✨'];

export default function StatusDetailModal({
  isOpen,
  onClose,
  targetStatus,
  currentUser,
  pairInfo,
  onReactToStatus,
  onSendCheer,
  onMarkStatusAsViewed,
  onOpenStatusPicker
}) {
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [sentCheer, setSentCheer] = useState(null);
  const [customCheerText, setCustomCheerText] = useState('');

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

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSentCheer(null);
      setCustomCheerText('');
    }
  }, [isOpen]);

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

  // Get matching contextual cheers for the active status
  const contextualCheers = getCheersForStatus(targetStatus?.statusId, targetStatus?.statusText);

  // Total reactions calculation
  const totalPartnerReactions = Object.values(targetStatus.reactions || {}).reduce(
    (sum, r) => sum + (Number(r?.count) || 0),
    0
  );

  // All cheers / replies on this note
  const allCheers = Array.isArray(targetStatus.cheers) && targetStatus.cheers.length > 0
    ? targetStatus.cheers
    : (targetStatus.lastCheer ? [targetStatus.lastCheer] : []);

  // Handle reaction tap
  const handleReactionTap = (emoji) => {
    // Note creator should not be able to react to their own note
    if (isMine || !targetUserId || !onReactToStatus) return;

    const emojiData = targetStatus.reactions?.[emoji];
    const userCounts = emojiData?.userCounts || {};
    let myCount = Number(userCounts[currentUserId]);
    if (myCount === undefined || isNaN(myCount)) {
      myCount = emojiData?.users?.includes(currentUserId) && emojiData?.count ? emojiData.count : 0;
    }

    if (myCount >= 10) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 40]); } catch {}
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
    if (isMine || !targetUserId) return;
    if (onSendCheer) {
      onSendCheer(targetUserId, cheerText);
    } else {
      handleReactionTap('💬');
    }
    setSentCheer(cheerText);
    setTimeout(() => setSentCheer(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
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
        className="relative w-full max-w-sm bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2D7C7] bg-[#F4EFE6]/70 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E8B75]">
            {isMine ? 'Your Note' : `${targetName}'s Note`}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-4 sm:p-5 space-y-3.5">
          
          {/* Main Hero: Thought/Note Bubble & Identity */}
          <div className="space-y-3 pt-1">
            
            {/* Note Speech Bubble */}
            <div className="relative bg-white border border-[#D2C3B0] rounded-3xl p-4 shadow-sm text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A83232] bg-[#FAF5EC] px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-2xs">
                <span className="text-sm">{targetStatus.emoji || '💭'}</span>
                <span>{targetStatus.statusText}</span>
              </div>
              
              {targetStatus.customNote && (
                <p className="font-serif-vintage text-[15px] sm:text-base text-[#36271C] leading-snug italic pt-1 px-2">
                  "{targetStatus.customNote}"
                </p>
              )}

              {/* Triangle Tail pointing to avatar below */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#D2C3B0] rotate-45" />
            </div>

            {/* Author Identity & Metadata */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <img
                src={targetStatus.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={targetName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
              />
              <div className="text-left">
                <h4 className="font-serif-vintage font-bold text-base text-[#36271C] capitalize leading-tight">
                  {targetName}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#9E8B75] mt-0.5">
                  <Clock className="w-3 h-3 text-[#A83232]" />
                  <span>{getTimeAgo(targetStatus.updatedAtIso)}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" />
                    <span>
                      {isSeenByOther
                        ? isMine ? `Seen by ${partnerName} 💕` : `Seen by you 👀`
                        : isMine ? `Unseen` : `Seen`}
                    </span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              REPLIES & CHEERS STREAM (Visible to both author & partner)
             ───────────────────────────────────────────────────────────── */}
          <div className="pt-2.5 border-t border-[#E2D7C7] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#7A6855]">
              <span className="flex items-center gap-1.5">
                <MessageCircleHeart className="w-3.5 h-3.5 text-[#A83232]" />
                <span>Sweet Replies & Cheers</span>
              </span>
              {allCheers.length > 0 && (
                <span className="text-[10px] bg-[#FAF5EC] text-[#A83232] border border-[#D4AF37]/50 px-2 py-0.2 rounded-full font-bold shadow-2xs">
                  {allCheers.length} {allCheers.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>

            {allCheers.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-0.5">
                {allCheers.map((cheer, idx) => {
                  const isFromMe = cheer.fromId === currentUserId;
                  const senderName = isFromMe ? 'You' : (getNickname(cheer.fromName) || partnerName);
                  return (
                    <div 
                      key={cheer.atIso || idx}
                      className={`p-2.5 rounded-2xl text-xs transition-all ${
                        isFromMe 
                          ? 'bg-[#FFF9EE] border border-[#D4AF37]/50 shadow-2xs ml-3' 
                          : 'bg-white border border-[#E2D7C7] shadow-2xs mr-3'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isFromMe ? 'text-[#A83232]' : 'text-[#7A6855]'
                        }`}>
                          <span>💬</span>
                          <span>{senderName}</span>
                        </span>
                        {cheer.atIso && (
                          <span className="text-[9px] text-[#9E8B75]">
                            {getTimeAgo(cheer.atIso)}
                          </span>
                        )}
                      </div>
                      <p className="text-[#36271C] font-medium leading-relaxed break-words text-xs">
                        "{cheer.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#FAF5EC]/70 border border-dashed border-[#D2C3B0] rounded-2xl p-2.5 text-center space-y-0.5">
                <p className="text-[11px] font-semibold text-[#7A6855]">
                  No replies to this note yet
                </p>
                <p className="text-[10px] text-[#9E8B75]">
                  {!isMine 
                    ? `Send ${targetName} a sweet reply or cheer below 💕` 
                    : `Waiting for a sweet reply from ${partnerName} 💕`}
                </p>
              </div>
            )}
          </div>

          {/* Quick Reaction Bar & Custom Reply (For Partner's Note) */}
          {!isMine ? (
            <div className="pt-2 border-t border-[#E2D7C7] space-y-2.5">
              
              {/* Quick Cheer Suggestion Pills */}
              {contextualCheers && contextualCheers.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9E8B75]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span>Quick Cheers</span>
                    </span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {contextualCheers.slice(0, 6).map((presetCheer, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendCheer(presetCheer)}
                        className="shrink-0 bg-white hover:bg-[#FAF5EC] active:scale-95 border border-[#E2D7C7] hover:border-[#D4AF37] text-[#36271C] text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                        title={`Send "${presetCheer}"`}
                      >
                        {presetCheer}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reactions Header & Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6855]">
                  <span>Tap to React 💕</span>
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
                              ? 'bg-[#FAF5EC] border-2 border-[#D4AF37] shadow-xs hover:scale-110 active:scale-125'
                              : 'bg-white border border-[#E2D7C7] hover:border-[#D4AF37] active:scale-125 hover:bg-[#FAF5EC]'
                        }`}
                        title={`Send ${emoji} (${myCount}/10)`}
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform select-none">
                          {emoji}
                        </span>

                        {totalCount > 0 && (
                          <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 min-w-[15px] text-[9px] font-mono font-bold rounded-full shadow-xs border text-center ${
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

              {/* Custom Sweet Reply Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customCheerText.trim()) return;
                  handleSendCheer(customCheerText.trim());
                  setCustomCheerText('');
                }}
                className="flex items-center gap-1.5 bg-white border border-[#D2C3B0] focus-within:border-[#A83232] focus-within:ring-1 focus-within:ring-[#A83232] rounded-2xl p-1 shadow-2xs transition-all"
              >
                <input
                  type="text"
                  value={customCheerText}
                  onChange={(e) => setCustomCheerText(e.target.value)}
                  maxLength={100}
                  placeholder={`Write a sweet reply to ${partnerName}...`}
                  className="flex-1 min-w-0 bg-transparent px-3 py-1.5 text-xs text-[#36271C] placeholder-[#9E8B75] focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!customCheerText.trim()}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    customCheerText.trim()
                      ? 'bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] shadow-xs active:scale-95'
                      : 'bg-[#EFE9DE] text-[#9E8B75] opacity-60 cursor-not-allowed'
                  }`}
                  title="Send reply"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {/* Sent Reply Toast / Confirmation */}
              {sentCheer && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Sent reply: "{sentCheer}"</span>
                </div>
              )}

            </div>
          ) : (
            <div className="pt-2 border-t border-[#E2D7C7] space-y-2.5">
              {/* Partner Reactions Summary for Author */}
              {totalPartnerReactions > 0 && (
                <div className="p-2.5 rounded-2xl bg-[#FAF5EC] border border-[#D4AF37]/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E8B75] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>Reactions from {partnerName}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Object.entries(targetStatus.reactions || {}).map(([emoji, data]) => {
                      const count = Number(data?.count) || 0;
                      if (count <= 0) return null;
                      return (
                        <span 
                          key={emoji}
                          className="inline-flex items-center gap-1 bg-white border border-[#E2D7C7] px-2 py-0.5 rounded-full text-xs font-bold text-[#36271C] shadow-2xs"
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] text-[#A83232] font-mono font-bold">x{count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

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
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
