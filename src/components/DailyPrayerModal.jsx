import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Trash2, 
  Archive, 
  Clock, 
  Check, 
  AlertCircle,
  RotateCcw,
  Feather
} from 'lucide-react';
import { getCurrentPHT } from '../utils/pht';
import { getNickname } from '../utils/nicknames';

export default function DailyPrayerModal({
  isOpen,
  onClose,
  prayers = [],
  currentUser,
  pairInfo,
  onSavePrayer,
  onMarkPrayed,
  onDeletePrayer
}) {
  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'Jay';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // Tabs: 'active' | 'archive'
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archive'
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [prayedBurstId, setPrayedBurstId] = useState(null);

  // Categorize requests: Active (<= 24 hours & not archived) vs Archive (> 24 hours or archived)
  const { activeRequests, archivedRequests } = useMemo(() => {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const active = [];
    const archived = [];

    prayers.forEach(item => {
      const createdTime = new Date(item.createdAtIso || 0).getTime();
      const isOlderThan24h = now - createdTime > TWENTY_FOUR_HOURS;

      if (item.isArchived || isOlderThan24h) {
        archived.push(item);
      } else {
        active.push(item);
      }
    });

    return { activeRequests: active, archivedRequests: archived };
  }, [prayers]);

  if (!isOpen) return null;

  const handleSendRequest = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSavePrayer({
        text,
        createdBy: currentUserId,
        createdByName: currentUserName,
        isArchived: false
      });
      setInputText('');
    } catch (err) {
      console.error('Error sending prayer request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrayClick = async (item) => {
    if (!item?.id) return;
    try {
      setPrayedBurstId(item.id);
      setTimeout(() => setPrayedBurstId(null), 1600);
      await onMarkPrayed(item.id);
    } catch (err) {
      console.error('Error marking prayer as prayed:', err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!id) return;
    try {
      await onDeletePrayer(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting prayer request:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#2A1D13]/80 backdrop-blur-md overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF6EE] border-2 border-[#D4AF37]/50 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#4A1010] via-[#5C1616] to-[#36271C] text-[#F8E3B6] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#D4AF37]/40 shadow-md">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-10 h-10 text-lg shrink-0 shadow-lg border border-[#F8E3B6]/40 flex items-center justify-center">
              🙏
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#FDFBF7] tracking-tight">
                Prayer Requests
              </h2>
              <p className="text-xs text-[#F8E3B6]/80 -mt-0.5 font-medium">
                Send prayer requests to each other • Tap to pray
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#F8E3B6]/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle Sub-Header (Active vs Archive) */}
        <div className="bg-[#EFE7D8] px-4 sm:px-6 py-2.5 border-b border-[#D8CCBA] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('active')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'active'
                  ? 'bg-[#4A1010] text-[#F8E3B6] shadow-xs'
                  : 'bg-[#FAF5EC]/70 text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>Active Requests</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                viewMode === 'active' ? 'bg-[#36271C] text-[#F8E3B6]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {activeRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('archive')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'archive'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-xs'
                  : 'bg-[#FAF5EC]/70 text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                viewMode === 'archive' ? 'bg-[#5A4535] text-[#FDFBF7]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {archivedRequests.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-[#7A6855] font-medium hidden sm:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9E8B75]" />
            <span>Requests auto-archive after 24h</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto max-h-[65vh] p-3 sm:p-6 space-y-4 lined-notebook-sheet">
          
          {/* ACTIVE VIEW */}
          {viewMode === 'active' && (
            <div className="space-y-3 sm:space-y-4">
              
              {/* Send Prayer Request Form */}
              <form onSubmit={handleSendRequest} className="bg-white/95 border-2 border-[#D4AF37]/60 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5">
                <p className="text-xs font-bold text-[#4A1010] flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Ask {partnerName} to pray for you:</span>
                </p>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write your prayer request here...\n(e.g. Please pray for my peace of mind and work today 🙏)`}
                  className="w-full min-h-[75px] sm:min-h-[85px] bg-[#FAF5EC]/90 border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-3 text-xs sm:text-sm text-[#36271C] placeholder-[#9E8B75] focus:outline-none transition-all resize-none font-medium leading-relaxed"
                  maxLength={400}
                />
                <div className="flex justify-end pt-0.5">
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSubmitting}
                    className="w-full sm:w-auto py-2.5 sm:py-2 px-5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Prayer Request'}</span>
                  </button>
                </div>
              </form>

              {/* Active Requests List */}
              <div className="space-y-3 pt-1">
                {activeRequests.map((item) => {
                  const isMine = item.createdBy === currentUserId || item.createdByName === currentUserName;
                  const isPrayed = Boolean(item.prayedBy || item.prayedByName);
                  const requesterName = isMine ? 'You' : (item.createdByName || partnerName);
                  const isPrayedByMe = item.prayedBy === currentUserId || (isPrayed && !isMine);

                  return (
                    <div 
                      key={item.id}
                      className="bg-white/95 border border-[#E2D7C7] hover:border-[#D4AF37] rounded-2xl p-4 shadow-xs space-y-3 transition-all"
                    >
                      {/* Top Header info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isMine 
                              ? 'bg-amber-50 text-[#A83232] border-amber-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {isMine ? '🙏' : '🕊️'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-[#36271C]">
                              {isMine ? `From You` : `From ${requesterName}`}
                            </span>
                            <span className="text-[10px] text-[#9E8B75] ml-2">
                              {item.createdAtPHT || 'Recently'}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-[#9E8B75] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Prayer Request Text */}
                      <p className="text-xs sm:text-sm text-[#36271C] font-medium leading-relaxed bg-[#FAF5EC]/70 p-3 rounded-xl border border-[#D2C3B0]/50 whitespace-pre-wrap">
                        "{item.text}"
                      </p>

                      {/* Status / Pray Action Row */}
                      <div className="flex items-center justify-between pt-1">
                        {/* CASE 1: Partner's request & NOT yet prayed by you -> Show Pray Button */}
                        {!isMine && !isPrayed && (
                          <button
                            type="button"
                            onClick={() => handlePrayClick(item)}
                            className="w-full py-2 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                          >
                            <span className="text-base">🙏</span>
                            <span>Tap to Pray for {requesterName}</span>
                          </button>
                        )}

                        {/* CASE 2: Partner's request & YOU already prayed */}
                        {!isMine && isPrayed && (
                          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-1.5 px-3 rounded-xl flex items-center justify-between text-xs font-bold animate-fadeIn">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>You already prayed for this</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {item.prayedAtPHT ? `at ${item.prayedAtPHT.split('•')[1] || item.prayedAtPHT}` : '🙏'}
                            </span>
                          </div>
                        )}

                        {/* CASE 3: Your request & Partner ALREADY prayed for it */}
                        {isMine && isPrayed && (
                          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-1.5 px-3 rounded-xl flex items-center justify-between text-xs font-bold animate-fadeIn shadow-xs">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Already prayed by {item.prayedByName || partnerName} 🙏</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {item.prayedAtPHT ? item.prayedAtPHT.split('•')[1] || '' : ''}
                            </span>
                          </div>
                        )}

                        {/* CASE 4: Your request & Partner HAS NOT prayed yet */}
                        {isMine && !isPrayed && (
                          <div className="w-full bg-[#FAF5EC] border border-[#D2C3B0] text-[#7A6855] py-1.5 px-3 rounded-xl flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1.5">
                              <Feather className="w-3.5 h-3.5 text-[#9E8B75] animate-pulse" />
                              <span>Waiting for {partnerName} to pray 🕊️</span>
                            </span>
                            <span className="text-[10px] text-[#9E8B75]">Active</span>
                          </div>
                        )}
                      </div>

                      {/* Pray Burst Animation Toast */}
                      {prayedBurstId === item.id && (
                        <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 py-1.5 px-3 rounded-xl animate-fadeIn">
                          🙏 Prayed for {requesterName}! Status updated on both ends ✨
                        </div>
                      )}
                    </div>
                  );
                })}

                {activeRequests.length === 0 && (
                  <div className="text-center py-10 space-y-1.5 bg-white/40 border border-dashed border-[#D2C3B0] rounded-2xl">
                    <p className="text-sm font-serif-vintage font-bold text-[#5C4A3A]">
                      No active prayer requests right now
                    </p>
                    <p className="text-xs text-[#9E8B75]">
                      Type a prayer request above so {partnerName} can pray for you today 🙏
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ARCHIVE VIEW */}
          {viewMode === 'archive' && (
            <div className="space-y-3">
              <div className="bg-[#FAF5EC] border border-[#D2C3B0] p-3 rounded-xl text-xs text-[#5C4A3A] flex items-center justify-between">
                <span>Prayer requests older than 24 hours are kept here.</span>
                <button
                  type="button"
                  onClick={() => setViewMode('active')}
                  className="text-xs font-bold text-[#A83232] hover:underline cursor-pointer"
                >
                  Back to Active
                </button>
              </div>

              {archivedRequests.map((item) => {
                const isMine = item.createdBy === currentUserId || item.createdByName === currentUserName;
                const requesterName = isMine ? 'You' : (item.createdByName || partnerName);
                const isPrayed = Boolean(item.prayedBy || item.prayedByName);

                return (
                  <div
                    key={item.id}
                    className="bg-white/80 border border-[#E2D7C7] rounded-2xl p-3.5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#36271C]">
                          {isMine ? 'Your Request' : `From ${requesterName}`}
                        </span>
                        <span className="text-[10px] text-[#9E8B75]">
                          {item.createdAtPHT}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="text-[#9E8B75] hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#5C4A3A] italic pl-3 border-l-2 border-[#D4AF37]/50">
                      "{item.text}"
                    </p>

                    <div className="text-[11px] text-[#7A6855] flex items-center justify-between pt-1">
                      <span>
                        {isPrayed ? `✓ Prayed by ${item.prayedByName || 'Partner'} 🙏` : 'Unprayed before archive'}
                      </span>
                      <span className="text-[10px] text-[#9E8B75]">Archived</span>
                    </div>
                  </div>
                );
              })}

              {archivedRequests.length === 0 && (
                <div className="text-center py-10 space-y-1.5 bg-white/40 border border-dashed border-[#D2C3B0] rounded-2xl">
                  <p className="text-sm font-serif-vintage font-bold text-[#5C4A3A]">
                    No archived requests yet
                  </p>
                  <p className="text-xs text-[#9E8B75]">
                    Requests older than 24 hours will automatically appear here.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F3EDE0] border-t border-[#E2D7C7] px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-[#7A6855] shrink-0 font-medium">
          <span>
            {activeRequests.length > 0 ? `${activeRequests.length} active request(s)` : 'No pending requests'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF5EC] hover:bg-[#EAE2D3] border border-[#D2C3B0] text-[#4A3B2C] font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FDFBF7] border-2 border-[#D4AF37] p-5 rounded-2xl shadow-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center gap-2 text-[#8B0000] font-bold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Delete Prayer Request?</span>
              </div>
              <p className="text-xs text-[#5C4A3A]">
                Are you sure you want to delete this prayer request? This cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#5C4A3A] bg-[#FAF5EC] hover:bg-[#EAE2D3] border border-[#D2C3B0] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(deleteConfirmId)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
