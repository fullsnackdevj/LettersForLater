import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getNickname } from '../utils/nicknames';

// Extracts emoji if user includes one in their text
const extractEmoji = (text) => {
  const emojiMatch = text.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
  return emojiMatch ? emojiMatch[0] : null;
};

export default function StatusPickerModal({
  isOpen,
  onClose,
  currentStatus,
  currentUser,
  onSaveStatus
}) {
  const [noteText, setNoteText] = useState(() => currentStatus?.customNote || currentStatus?.statusText || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setNoteText(currentStatus?.customNote || currentStatus?.statusText || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const myPhoto = currentUser?.photoURL || '';

  const handleShare = async () => {
    if (!noteText.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const trimmed = noteText.trim();
      const detectedEmoji = extractEmoji(trimmed);
      
      await onSaveStatus({
        statusId: `note_${Date.now()}`,
        statusText: trimmed,
        customNote: trimmed,
        emoji: detectedEmoji || '',
        category: 'daily'
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Failed to share note:', err);
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 animate-scaleIn border border-stone-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── TOP HEADER: Close X, "New note", Share Button ─────────── */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-bold text-stone-900 text-lg sm:text-xl">
            {currentStatus ? 'Update note' : 'New note'}
          </h2>

          <button
            type="button"
            onClick={handleShare}
            disabled={!noteText.trim() || isSaving}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-2xs cursor-pointer ${
              noteText.trim() && !isSaving
                ? 'bg-[#0D4D3A] hover:bg-[#08382A] text-white active:scale-95'
                : 'bg-[#0D4D3A]/40 text-white/70 cursor-not-allowed opacity-50'
            }`}
          >
            {isSaving ? 'Saving...' : (currentStatus ? 'Update' : 'Share')}
          </button>
        </div>

        {/* ── BODY: Avatar on Left, Mint Note Bubble on Right ──────── */}
        <div className="flex items-start gap-3 sm:gap-3.5 mb-2.5">
          {/* Profile Avatar */}
          <div className="relative shrink-0">
            <img
              src={myPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={currentUserName}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border border-stone-200 shadow-2xs"
            />
          </div>

          {/* Mint Message Bubble */}
          <div className="flex-1 bg-[#E3F2E9] rounded-2xl rounded-tl-sm px-4 py-3 border border-[#CEE5D6] shadow-2xs focus-within:ring-2 focus-within:ring-[#0D4D3A]/20 transition-all">
            <textarea
              ref={inputRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 60))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (noteText.trim() && !isSaving) handleShare();
                }
              }}
              maxLength={60}
              rows={2}
              placeholder="Share a thought..."
              className="w-full bg-transparent text-stone-900 text-sm sm:text-base font-normal resize-none focus:outline-none placeholder-stone-400 leading-relaxed"
            />
          </div>
        </div>

        {/* ── FOOTER: "Visible for 24h" on Left, Character Counter on Right ── */}
        <div className="flex items-center justify-between px-1 text-xs text-stone-400 font-normal select-none">
          <span>Visible for 24h</span>
          <span>{noteText.length}/60</span>
        </div>

      </div>
    </div>
  );
}
