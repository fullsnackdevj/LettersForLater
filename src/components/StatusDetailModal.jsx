import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Video, 
  Smile, 
  Check,
  Edit3,
  MessageCircle
} from 'lucide-react';
import { getNickname, DEFAULT_PARTNER_PHOTO, DEFAULT_USER_PHOTO } from '../utils/nicknames';

const STATUS_REACTION_EMOJIS = ['❤️', '😂', '😢', '🙏', '😊'];

export default function StatusDetailModal({
  isOpen,
  onClose,
  targetStatus,
  currentUser,
  pairInfo,
  onReactToStatus,
  onSendCheer,
  onSendChatMessage,
  onOpenChat,
  onMarkStatusAsViewed,
  onOpenStatusPicker,
  onOpenCallPrompt,
  onOpenStatusHistory
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sentFeedback, setSentFeedback] = useState(null);
  const repliesEndRef = useRef(null);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const targetUserId = targetStatus?.userId || (currentUser?.displayName === targetStatus?.userName ? currentUserId : null);
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
      setShowReactions(false);
      setReplyText('');
      setSentFeedback(null);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of replies when replies list changes
  useEffect(() => {
    if (isOpen && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, targetStatus?.cheers?.length, targetStatus?.lastCheer]);

  if (!isOpen || !targetStatus) return null;

  const currentUserName = getNickname(currentUser?.displayName) || 'Jay';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Kisstine';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;
  const targetName = isMine ? currentUserName : (getNickname(targetStatus.userName) || partnerName);

  const partnerPhoto = pairInfo?.user2?.photo || DEFAULT_PARTNER_PHOTO;
  const myPhoto = currentUser?.photoURL || DEFAULT_USER_PHOTO;
  const authorPhoto = targetStatus.userPhoto || (isMine ? myPhoto : partnerPhoto);

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

  // Extract thread replies (chronological order: oldest first, newest leading to reply composer)
  const rawCheers = Array.isArray(targetStatus.cheers) ? [...targetStatus.cheers] : [];
  if (targetStatus.lastCheer && !rawCheers.some(c => c.text === targetStatus.lastCheer.text && (c.atIso === targetStatus.lastCheer.atIso || c.fromId === targetStatus.lastCheer.fromId))) {
    rawCheers.unshift(targetStatus.lastCheer);
  }

  const threadReplies = [...rawCheers].sort((a, b) => {
    const tA = a.atIso ? new Date(a.atIso).getTime() : 0;
    const tB = b.atIso ? new Date(b.atIso).getTime() : 0;
    return tA - tB;
  });

  // Handle reaction tap
  const handleReactionTap = (emoji) => {
    if (!targetUserId) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 40]); } catch {}
    }

    // Spawn floating particle burst
    const newParticles = Array.from({ length: 6 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      emoji,
      left: 30 + Math.random() * 40,
      scale: 0.9 + Math.random() * 0.4,
      rotation: Math.random() * 30 - 15,
      delay: idx * 0.05
    }));

    setFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    if (!isMine && onReactToStatus) {
      onReactToStatus(targetUserId, emoji);
    } else {
      setReplyText(prev => (prev ? `${prev} ${emoji}` : emoji));
    }
    setShowReactions(false);
  };

  // Handle sending a reply (Dispatches to cheer thread and chat widget)
  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!targetUserId || !replyText.trim()) return;
    const text = replyText.trim();

    if (onSendCheer) {
      onSendCheer(targetUserId, text);
    }

    if (onSendChatMessage) {
      const noteSnippet = targetStatus.customNote 
        ? `"${targetStatus.customNote}"` 
        : `${targetStatus.statusText}`;

      try {
        await onSendChatMessage({
          text,
          replyTo: {
            id: `note_${targetUserId}`,
            senderName: isMine ? partnerName : targetName,
            text: noteSnippet,
            isNoteReply: true
          }
        });
      } catch (err) {
        console.error('Failed to forward note reply to chat widget:', err);
      }
    }

    setSentFeedback(text);
    setReplyText('');
    setTimeout(() => setSentFeedback(null), 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Floating Reaction Burst Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingParticles.map(p => (
          <span
            key={p.id}
            className="absolute bottom-32 text-3xl animate-floatUp opacity-0"
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

      {/* Main Modal Card (Clean Instagram/Messenger Note Style) */}
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-stone-100 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── TOP HEADER ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shadow-2xs ${
              !isMine 
                ? 'bg-[#FCE4EC] border-[#F8B4C8] text-[#C23867]' 
                : 'bg-[#EAF3EC] border-[#D5E7DA] text-[#2D6A4F]'
            }`}>
              {!isMine ? (
                <img 
                  src="/partner-note-icon-pink.png" 
                  alt="Partner's Note" 
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain select-none pointer-events-none" 
                />
              ) : (
                <img 
                  src="/my-note-icon-green.png" 
                  alt="My Note" 
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain select-none pointer-events-none" 
                />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                {targetName}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Note
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isMine && onOpenStatusPicker && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStatusPicker();
                }}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#EAF3EC] hover:bg-[#D5E7DA] text-[#2D6A4F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-[#D5E7DA] shadow-2xs active:scale-95"
                title="Update Note"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Note</span>
              </button>
            )}

            {!isMine && onOpenCallPrompt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCallPrompt();
                }}
                className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title={`Call ${targetName}`}
              >
                <Video className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── NOTE & THREAD BODY ────────────────────────────────────────── */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 overflow-y-auto max-h-[58vh] custom-scrollbar flex flex-col gap-3">
          
          {/* Note Bubble Card */}
          <div className="flex items-start gap-3 sm:gap-3.5">
            {/* Author Avatar */}
            <div className="relative shrink-0">
              <img
                src={authorPhoto}
                alt={targetName}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-stone-200 shadow-2xs"
              />
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <div className="relative mb-2">
                <div className={`rounded-2xl rounded-tl-sm px-4 py-3 border shadow-2xs ${
                  !isMine 
                    ? 'bg-[#FFF0F4] text-[#701A35] border-[#F8B4C8]' 
                    : 'bg-[#EAF3EC] text-[#1E3A2B] border-[#D5E7DA]'
                }`}>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
                    {targetStatus.customNote || targetStatus.statusText || 'No note added'}
                  </p>
                </div>

                {/* Reaction Cluster: Popup emojis on the LEFT of the icon */}
                {!isMine && (
                  <div className="absolute -bottom-3.5 right-0 flex items-center gap-1.5 z-20">
                    {showReactions && (
                      <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-white border border-stone-200/90 rounded-full px-2.5 sm:px-3 py-1 shadow-lg animate-fadeIn origin-right">
                        {STATUS_REACTION_EMOJIS.map((emoji) => {
                          const emojiData = targetStatus.reactions?.[emoji];
                          const count = emojiData?.count || 0;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReactionTap(emoji)}
                              className="relative text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer select-none leading-none"
                              title={`React ${emoji}`}
                            >
                              {emoji}
                              {count > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-[#2D6A4F] text-white rounded-full px-1 min-w-[12px] text-center border border-white">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReactions(prev => !prev);
                      }}
                      className={`w-7 h-7 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shrink-0 ${
                        showReactions 
                          ? 'ring-2 ring-[#2D6A4F]/50 text-[#2D6A4F]' 
                          : 'text-stone-500 hover:text-[#2D6A4F]'
                      }`}
                      title="React with emojis"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata: Relative Time, Seen, & Edit Note shortcut */}
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-2 ml-1 flex-wrap">
                <span>{getTimeAgo(targetStatus.updatedAtIso)}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">
                  {isSeenByOther
                    ? (isMine ? `Seen by ${partnerName}` : `Seen by you`)
                    : (isMine ? `Delivered` : `New`)}
                </span>
                {isMine && onOpenStatusPicker && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStatusPicker();
                      }}
                      className="text-[#2D6A4F] hover:text-[#1E4D38] font-bold hover:underline cursor-pointer"
                    >
                      Edit Note
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* ── THREAD REPLIES SECTION ────────────────────────────────── */}
          {threadReplies.length > 0 && (
            <div className="pt-2.5 border-t border-stone-100 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-[#A83232]" />
                  <span>Thread ({threadReplies.length})</span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  Live conversation
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {threadReplies.map((cheer, idx) => {
                  const isCheerMine = cheer.fromId === currentUserId;
                  const replierName = isCheerMine ? 'You' : (getNickname(cheer.fromName) || partnerName);
                  const replierPhoto = isCheerMine ? myPhoto : partnerPhoto;

                  return (
                    <div 
                      key={cheer.atIso || idx} 
                      className={`flex items-start gap-2.5 animate-fadeIn ${isCheerMine ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Replier Avatar with signature badge */}
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={replierPhoto}
                          alt={replierName}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-stone-200 shadow-2xs"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-2xs ${
                          isCheerMine ? 'bg-[#EAF3EC]' : 'bg-[#FCE4EC]'
                        }`}>
                          <img 
                            src={isCheerMine ? "/my-note-icon-green.png" : "/partner-note-icon-pink.png"} 
                            alt="" 
                            className="w-2.5 h-2.5 object-contain select-none pointer-events-none" 
                          />
                        </div>
                      </div>

                      {/* Reply Bubble */}
                      <div className={`max-w-[78%] sm:max-w-[82%] flex flex-col ${isCheerMine ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className={`text-[10px] font-bold ${isCheerMine ? 'text-[#2D6A4F]' : 'text-[#C23867]'}`}>
                            {replierName}
                          </span>
                          {cheer.atIso && (
                            <span className="text-[9px] text-stone-400">
                              {getTimeAgo(cheer.atIso)}
                            </span>
                          )}
                        </div>

                        <div className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-2xs border ${
                          isCheerMine
                            ? 'bg-[#EAF3EC] text-[#1E3A2B] border-[#D5E7DA] rounded-tr-xs'
                            : 'bg-[#FFF0F4] text-[#701A35] border-[#F8B4C8] rounded-tl-xs'
                        }`}>
                          <p className="whitespace-pre-wrap">{cheer.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={repliesEndRef} />
              </div>
            </div>
          )}

        </div>

        {/* ── BOTTOM DIRECT REPLY COMPOSER (Available to BOTH isMine and !isMine) ── */}
        <div className="px-4 py-3 border-t border-stone-100 bg-white">
          {showReactions && (
            <div className="mb-2 p-1.5 bg-[#FAF5EC] border border-[#E2D7C7] rounded-2xl flex items-center justify-around animate-fadeIn">
              {STATUS_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReactionTap(emoji)}
                  className="text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer select-none p-1"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReactions(prev => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs ${
                showReactions 
                  ? 'bg-[#2D6A4F] text-white' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
              title="Reaction emojis"
            >
              <Smile className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center bg-[#F1F5F9] rounded-full px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#2D6A4F]/30 focus-within:bg-white focus-within:border focus-within:border-[#2D6A4F]">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={120}
                placeholder={
                  isMine
                    ? (threadReplies.length > 0 ? `Reply back to ${partnerName.toLowerCase()}...` : 'Reply to thread...')
                    : `Reply to ${targetName.toLowerCase()}...`
                }
                className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs ${
                replyText.trim()
                  ? 'bg-[#2D6A4F] hover:bg-[#1E4D38] text-white active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sent confirmation */}
          {sentFeedback && (
            <div className="mt-2 py-1.5 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Sent to thread & chat: "{sentFeedback}"</span>
              </div>
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="text-[10px] font-bold text-emerald-700 underline hover:text-emerald-900 shrink-0 ml-1"
                >
                  Open Chat
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
