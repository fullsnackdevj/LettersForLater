import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  Trash2, 
  Send, 
  Sparkles, 
  MessageCircleHeart, 
  Heart,
  Calendar,
  Check
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

const REACTION_EMOJIS = ['❤️', '💪', '☕', '🥰', '🫶', '✨'];

export default function StatusHistoryModal({
  isOpen,
  onClose,
  statusHistory = [],
  currentUser,
  pairInfo,
  onReactToNote,
  onSendCheerToNote,
  onMarkNoteViewed,
  onDeleteNote
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'partner' | 'mine'
  const [replyInputs, setReplyInputs] = useState({});
  const [sentToast, setSentToast] = useState(null);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'Jay';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Kiss';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // Mark unseen notes as viewed when modal opens
  useEffect(() => {
    if (isOpen && statusHistory.length > 0 && onMarkNoteViewed) {
      statusHistory.forEach((note) => {
        if (note.userId !== currentUserId) {
          const viewed = Array.isArray(note.viewedBy) ? note.viewedBy : [];
          if (!viewed.includes(currentUserId)) {
            onMarkNoteViewed(note.id);
          }
        }
      });
    }
  }, [isOpen, statusHistory, currentUserId, onMarkNoteViewed]);

  if (!isOpen) return null;

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

  // Date format helper (e.g. "Today", "Yesterday", "Sep 8, 2026")
  const formatDateGroup = (isoString) => {
    if (!isoString) return 'Recent Notes';
    const noteDate = new Date(isoString);
    const today = new Date();
    if (noteDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (noteDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filtered notes
  const filteredNotes = statusHistory.filter((note) => {
    if (filterMode === 'partner') return note.userId !== currentUserId;
    if (filterMode === 'mine') return note.userId === currentUserId;
    return true;
  });

  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const dateLabel = formatDateGroup(note.updatedAtIso || note.updatedAtPHT);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(note);
    return groups;
  }, {});

  // Unread partner notes count
  const unreadPartnerNotes = statusHistory.filter(
    (n) => n.userId !== currentUserId && !n.viewedBy?.includes(currentUserId)
  );

  const handleSendReply = (noteId) => {
    const text = (replyInputs[noteId] || '').trim();
    if (!text) return;
    if (onSendCheerToNote) {
      onSendCheerToNote(noteId, text);
    }
    setReplyInputs(prev => ({ ...prev, [noteId]: '' }));
    setSentToast(`Sent cheer: "${text}"`);
    setTimeout(() => setSentToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2D7C7] bg-[#FAF5EC]">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-10 h-10 text-base shadow-md flex items-center justify-center">
              📜
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                Past Notes History
              </h2>
              <p className="text-xs text-[#7A6855] font-handwriting text-base -mt-0.5">
                Catch up on what you both were doing & thinking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Catch-up Alert Banner (if partner left notes while user was offline) */}
        {unreadPartnerNotes.length > 0 && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5F5] border-b border-[#D4AF37]/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="text-xs font-bold text-[#A83232]">
              {partnerName} posted {unreadPartnerNotes.length} update{unreadPartnerNotes.length > 1 ? 's' : ''} while you were away!
            </span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 bg-[#FAF5EC]/70 border-b border-[#E2D7C7]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All Notes (${statusHistory.length})` },
              { id: 'partner', label: `${partnerName}'s Notes` },
              { id: 'mine', label: 'My Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  filterMode === tab.id
                    ? 'bg-[#A83232] text-[#F8E3B6] shadow-xs'
                    : 'bg-white/80 text-[#7A6855] hover:bg-white border border-[#D2C3B0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {sentToast && (
            <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px]">{sentToast}</span>
            </div>
          )}
        </div>

        {/* Scrollable Timeline Stream */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-4 sm:p-5 space-y-5">
          {Object.keys(groupedNotes).length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-[#FAF5EC]/50 border border-dashed border-[#D2C3B0] rounded-2xl">
              <div className="text-3xl">💭</div>
              <h3 className="font-serif-vintage font-bold text-base text-[#36271C]">
                No past notes yet
              </h3>
              <p className="text-xs text-[#7A6855]">
                Whenever either of you sets a live note, it will be preserved here so you never miss each other's day.
              </p>
            </div>
          ) : (
            Object.entries(groupedNotes).map(([dateLabel, notes]) => (
              <div key={dateLabel} className="space-y-3">
                
                {/* Date Group Heading */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E8B75]">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-[1px] bg-[#E2D7C7]" />
                </div>

                {/* Notes in this date */}
                <div className="space-y-3">
                  {notes.map((note) => {
                    const isMine = note.userId === currentUserId;
                    const authorName = isMine ? currentUserName : (getNickname(note.userName) || partnerName);
                    const isSeenByPartner = note.viewedBy?.some(id => id !== note.userId);
                    const noteCheers = Array.isArray(note.cheers) ? note.cheers : [];

                    return (
                      <div
                        key={note.id}
                        className={`bg-white border rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all space-y-2.5 ${
                          isMine ? 'border-[#D2C3B0]' : 'border-[#E2D7C7] hover:border-[#D4AF37]'
                        }`}
                      >
                        {/* Note Top Bar: Author & Time */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-[#FAF5EC] border border-[#D4AF37]/50 flex items-center justify-center text-sm shadow-2xs">
                              {note.emoji || '💭'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 leading-none">
                                <span className="text-xs font-bold text-[#36271C]">
                                  {authorName}
                                </span>
                                <span className="text-[10px] text-[#9E8B75]">
                                  • {getTimeAgo(note.updatedAtIso || note.updatedAtPHT)}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#A83232]">
                                {note.statusText}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isSeenByPartner ? (
                              <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-0.5" title="Seen">
                                <Eye className="w-2.5 h-2.5" />
                                <span>Seen</span>
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#9E8B75] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-full font-medium">
                                Unread
                              </span>
                            )}

                            {isMine && onDeleteNote && (
                              <button
                                type="button"
                                onClick={() => onDeleteNote(note.id)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete this note from history"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Custom Note Quote */}
                        {note.customNote && (
                          <div className="bg-[#FAF5EC]/60 border-l-2 border-[#D4AF37] rounded-r-xl p-2 pl-3">
                            <p className="font-handwriting text-base text-[#36271C] italic leading-snug">
                              "{note.customNote}"
                            </p>
                          </div>
                        )}

                        {/* Reactions Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                          {/* Active reactions summary */}
                          <div className="flex flex-wrap gap-1 items-center">
                            {Object.entries(note.reactions || {}).map(([emoji, rData]) => {
                              const count = Number(rData?.count) || 0;
                              if (count <= 0) return null;
                              return (
                                <span
                                  key={emoji}
                                  className="inline-flex items-center gap-1 bg-[#FAF5EC] border border-[#E2D7C7] px-2 py-0.5 rounded-full text-[11px] font-bold text-[#36271C] shadow-2xs"
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[10px] text-[#A83232] font-mono">{count}</span>
                                </span>
                              );
                            })}
                          </div>

                          {/* Quick reaction tap for partner */}
                          {!isMine && onReactToNote && (
                            <div className="flex items-center gap-1">
                              {REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => onReactToNote(note.id, emoji)}
                                  className="text-sm p-1 rounded-lg hover:bg-[#FAF5EC] hover:scale-115 active:scale-125 transition-all cursor-pointer"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Cheers / Replies Thread */}
                        {noteCheers.length > 0 && (
                          <div className="space-y-1.5 pt-1.5 border-t border-dashed border-gray-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E8B75] flex items-center gap-1">
                              <MessageCircleHeart className="w-3 h-3 text-[#A83232]" />
                              <span>Replies</span>
                            </span>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                              {noteCheers.map((cheer, cIdx) => (
                                <div
                                  key={cheer.atIso || cIdx}
                                  className="text-xs bg-[#FAF5EC]/70 border border-[#E2D7C7]/70 rounded-xl p-2 flex items-start gap-1.5"
                                >
                                  <span className="text-[10px] text-[#A83232] font-bold shrink-0">
                                    {cheer.fromId === currentUserId ? 'You:' : `${partnerName}:`}
                                  </span>
                                  <span className="text-[#36271C] leading-snug flex-1 break-words">
                                    "{cheer.text}"
                                  </span>
                                  {cheer.atIso && (
                                    <span className="text-[9px] text-[#9E8B75] shrink-0">
                                      {getTimeAgo(cheer.atIso)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inline Cheer / Reply Form */}
                        {onSendCheerToNote && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendReply(note.id);
                            }}
                            className="flex items-center gap-1.5 pt-1"
                          >
                            <input
                              type="text"
                              value={replyInputs[note.id] || ''}
                              onChange={(e) => setReplyInputs(prev => ({ ...prev, [note.id]: e.target.value }))}
                              placeholder={isMine ? 'Add a follow-up...' : `Send ${authorName} a sweet reply...`}
                              maxLength={80}
                              className="flex-1 min-w-0 bg-[#FAF5EC]/50 border border-[#D2C3B0] focus:border-[#A83232] focus:bg-white rounded-xl px-2.5 py-1 text-xs text-[#36271C] placeholder-[#9E8B75] focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!(replyInputs[note.id] || '').trim()}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                (replyInputs[note.id] || '').trim()
                                  ? 'bg-[#A83232] text-[#F8E3B6] hover:bg-[#8B0000] active:scale-95 shadow-2xs'
                                  : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                              }`}
                              title="Send reply"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </form>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC] flex items-center justify-between text-xs text-[#7A6855]">
          <span>✨ Saved automatically whenever either of you updates a note</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-white hover:bg-[#EAE2D3] border border-[#D2C3B0] text-[#36271C] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
