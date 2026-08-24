import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  Bookmark, 
  Download, 
  Check, 
  Eye, 
  AlertTriangle,
  Mail
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { downloadImage } from '../utils/fileDownloader';

const REACTION_EMOJIS = ['❤️', '🥺', '😂', '😚', '✨', '☕', '🫶'];

export default function StoryViewerModal({
  isOpen,
  onClose,
  stories = [],
  initialStoryIndex = 0,
  currentUser,
  pairInfo,
  onReact,
  onDeleteStory,
  onOpenAsLetter,
  onMarkAsViewed
}) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Custom Delete Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Save to Vault / Letter Confirmation Modal State
  const [showVaultConfirm, setShowVaultConfirm] = useState(false);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Sync initial story index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(initialStoryIndex, 0), Math.max(0, stories.length - 1)));
      setDownloadSuccess(false);
      setShowDeleteConfirm(false);
      setShowVaultConfirm(false);
    }
  }, [isOpen, initialStoryIndex, stories.length]);

  // Adjust index or auto-close if all stories were deleted
  useEffect(() => {
    if (isOpen) {
      if (stories.length === 0) {
        onClose();
      } else if (currentIndex >= stories.length) {
        setCurrentIndex(Math.max(0, stories.length - 1));
      }
    }
  }, [stories.length, currentIndex, isOpen, onClose]);

  const currentStory = stories[currentIndex];
  const currentUserId = currentUser?.uid || 'demo-user-1';
  const isAuthor = currentStory?.authorId === currentUserId;

  // Automatically mark current story as viewed
  useEffect(() => {
    if (isOpen && currentStory && onMarkAsViewed) {
      onMarkAsViewed(currentStory.id);
    }
  }, [isOpen, currentStory, onMarkAsViewed]);

  // Move to next story or close if at end
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDownloadSuccess(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // Move to previous story
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setDownloadSuccess(false);
    }
  }, [currentIndex]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen || showDeleteConfirm || showVaultConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDeleteConfirm, showVaultConfirm, handleNext, handlePrev, onClose]);

  // Handle Touch Swipes for mobile
  const handleTouchStart = (e) => {
    if (showDeleteConfirm || showVaultConfirm) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (showDeleteConfirm || showVaultConfirm) return;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (showDeleteConfirm || showVaultConfirm) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  // Handle tap on left/right edges of screen
  const handleClickNavigate = (e) => {
    if (showDeleteConfirm || showVaultConfirm) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.35) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Trigger floating emoji reaction (Only for partner viewing story)
  const handleSendReaction = (emoji) => {
    if (!currentStory || isAuthor) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 40]); } catch (e) {}
    }

    // Spawn floating particle burst
    const newParticles = Array.from({ length: 6 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      emoji,
      left: 20 + Math.random() * 60,
      scale: 0.8 + Math.random() * 0.5,
      rotation: Math.random() * 40 - 20,
      delay: idx * 0.05
    }));

    setFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    onReact(currentStory.id, emoji);
  };

  // Download Story Media
  const handleDownloadStoryMedia = async (e) => {
    e?.stopPropagation();
    if (!currentStory?.mediaUrl) return;

    setIsDownloading(true);
    const fileName = `story_${getNickname(currentStory.authorName)}_${Date.now()}.jpg`;

    try {
      await downloadImage(currentStory.mediaUrl, fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error downloading story media:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Confirmed Delete Action
  const handleConfirmDelete = async () => {
    if (!currentStory || !onDeleteStory) return;
    setIsDeleting(true);
    const storyIdToDelete = currentStory.id;

    try {
      await onDeleteStory(storyIdToDelete);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      
      // If was the last remaining story, close viewer
      if (stories.length <= 1) {
        onClose();
      } else if (currentIndex >= stories.length - 1) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      setIsDeleting(false);
      alert('Failed to delete story. Please try again.');
    }
  };

  // Confirmed Turn Story into Letter Action
  const handleConfirmOpenLetterEditor = () => {
    setShowVaultConfirm(false);
    if (onOpenAsLetter && currentStory) {
      onOpenAsLetter(currentStory);
    }
  };

  if (!isOpen || !currentStory) return null;

  // Relative Time helper
  const getTimeAgo = (isoString) => {
    if (!isoString) return 'Today';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return '1d ago';
  };

  // Full Exact Date & Time Helper
  const formatStoryDateTime = (story) => {
    if (story?.createdAtPHT) {
      return story.createdAtPHT;
    }
    if (story?.createdAtIso) {
      try {
        const d = new Date(story.createdAtIso);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Manila'
        }) + ' PHT';
      } catch (e) {}
    }
    return 'Aug 24, 2026 PHT';
  };

  // Seen Status calculations
  const myName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = myName === user2Name ? 'Jay' : user2Name;
  const viewedList = currentStory.viewedBy || [];
  const isViewedByPartner = viewedList.some(id => id !== currentStory.authorId);
  const isViewedByBoth = viewedList.length >= 2;

  // Active reactions on this story
  const receivedReactions = Object.entries(currentStory.reactions || {}).filter(
    ([_, r]) => (r.count || 0) > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn select-none">
      
      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingParticles.map(p => (
          <span
            key={p.id}
            className="absolute bottom-16 text-3xl animate-floatUp opacity-0"
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

      {/* Left Desktop Arrow */}
      {currentIndex > 0 && !showDeleteConfirm && !showVaultConfirm && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 lg:left-12 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all hover:scale-110 shadow-lg"
          title="Previous Story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right Desktop Arrow */}
      {currentIndex < stories.length - 1 && !showDeleteConfirm && !showVaultConfirm && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 lg:right-12 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all hover:scale-110 shadow-lg"
          title="Next Story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Instagram Story Container */}
      <div className="relative w-full max-w-[420px] h-full max-h-[100vh] sm:max-h-[88vh] sm:rounded-3xl overflow-hidden shadow-2xl bg-[#1C1D24] border sm:border-2 sm:border-[#D4AF37]/40 flex flex-col justify-between">
        
        {/* ─────────────────────────────────────────────────────────────
            TOP HEADER: Segmented Nodes & Author Profile
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent space-y-2">
          
          {/* Segmented Progress Nodes */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div 
                key={s.id || idx}
                onClick={() => !showDeleteConfirm && !showVaultConfirm && setCurrentIndex(idx)}
                className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden cursor-pointer"
              >
                <div 
                  className={`h-full bg-white rounded-full transition-all duration-300 ${
                    idx <= currentIndex ? 'w-full opacity-100' : 'w-0 opacity-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Author Badge, Time, Seen Indicator & Controls */}
          <div className="flex items-center justify-between text-white pt-1">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#A83232]">
                <img
                  src={currentStory.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentStory.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-white"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs sm:text-sm drop-shadow">
                    {getNickname(currentStory.authorName)}
                  </p>
                  {currentStory.moodTag && (
                    <span className="text-base drop-shadow animate-pulse" title="Mood Stamp">
                      {currentStory.moodTag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span className="bg-white/15 text-[#F8E3B6] px-1.5 py-0.2 rounded font-mono text-[9px] font-bold">
                    {getTimeAgo(currentStory.createdAtIso)}
                  </span>
                  <span className="font-mono text-white/90">
                    {formatStoryDateTime(currentStory)}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Action Menu (Clean: Download, Delete, Close) */}
            <div className="flex items-center gap-1.5">
              
              {/* Download photo button */}
              {currentStory.mediaUrl && (
                <button
                  onClick={handleDownloadStoryMedia}
                  disabled={isDownloading}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Download photo to your device"
                >
                  {isDownloading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : downloadSuccess ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Delete button (Only for story author) */}
              {isAuthor && onDeleteStory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-rose-900/80 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Delete Story"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Seen Status Badge Header Indicator */}
          <div className="flex items-center justify-between text-[10px] pt-0.5">
            {isViewedByBoth ? (
              <span className="flex items-center gap-1 bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium shadow-xs">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Seen by both of you 👀💕</span>
              </span>
            ) : isViewedByPartner ? (
              <span className="flex items-center gap-1 bg-amber-950/70 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium shadow-xs">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Seen by {partnerName}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-white/10 text-white/80 border border-white/15 px-2 py-0.5 rounded-full font-medium">
                <Eye className="w-3 h-3 text-white/60" />
                <span>Seen by you • Not seen by {partnerName} yet</span>
              </span>
            )}

            <span className="text-[10px] text-white/60 font-mono">
              Slide {currentIndex + 1} of {stories.length}
            </span>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN STORY PHOTO CONTENT
           ───────────────────────────────────────────────────────────── */}
        <div 
          className="relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer bg-black"
          onClick={handleClickNavigate}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          {currentStory.mediaUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-contain sm:object-cover pointer-events-none"
              />
              
              {/* Optional Polaroid tape effect on top */}
              <div className="tape-strip top-4 opacity-75 pointer-events-none" />

              {/* Floating Emoji Mood Stamp in Corner */}
              {currentStory.moodTag && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-2xl p-2 rounded-2xl border border-white/20 shadow-lg pointer-events-none">
                  {currentStory.moodTag}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center text-white/70 space-y-2">
              <span className="text-4xl">{currentStory.moodTag || '📸'}</span>
              <p className="text-xs font-mono">Snapshot Moment</p>
            </div>
          )}

          {/* Subtle Left / Right tap hints on edges */}
          <div className="absolute left-2 inset-y-0 w-8 flex items-center justify-start opacity-0 hover:opacity-40 transition-opacity pointer-events-none text-white">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <div className="absolute right-2 inset-y-0 w-8 flex items-center justify-end opacity-0 hover:opacity-40 transition-opacity pointer-events-none text-white">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CUSTOM DELETE CONFIRMATION DIALOG OVERLAY
             ───────────────────────────────────────────────────────────── */}
          {showDeleteConfirm && (
            <div 
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#FAF5EC] border-2 border-[#E2D7C7] rounded-3xl p-6 text-center max-w-xs w-full space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif-vintage font-bold text-base text-[#36271C]">
                    Delete this Story?
                  </h4>
                  <p className="text-xs text-[#7A6855] leading-relaxed">
                    This photo snapshot will be permanently removed from your active stories and private memory log.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl border border-[#D2C3B0] bg-white text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#F8E3B6] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CUSTOM SAVE TO VAULT / TURN INTO LETTER DIALOG OVERLAY
             ───────────────────────────────────────────────────────────── */}
          {showVaultConfirm && (
            <div 
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#FAF5EC] border-2 border-[#E2D7C7] rounded-3xl p-6 text-center max-w-xs w-full space-y-4 shadow-2xl">
                <div className="wax-seal w-12 h-12 mx-auto text-xl shadow-md">
                  💌
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-serif-vintage font-bold text-base text-[#36271C]">
                    Turn Story into a Letter?
                  </h4>
                  <p className="text-xs text-[#7A6855] leading-relaxed">
                    This photo will be attached into your Letter Editor so you can write a letter around it and seal it in your 2032 Time Capsule Vault.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleConfirmOpenLetterEditor}
                    className="w-full py-2.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 border border-[#D4AF37]/50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Letter Editor</span>
                  </button>

                  <button
                    onClick={() => setShowVaultConfirm(false)}
                    className="w-full py-2 rounded-xl border border-[#D2C3B0] bg-white text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─────────────────────────────────────────────────────────────
            BOTTOM INTERACTION BAR: 
            - If Partner's Story: Emoji Reactions + Save to Vault
            - If Own Story: Received Reactions + Save to Vault (No self-reacting!)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-2">
          
          <div className="flex items-center justify-between gap-2">
            
            {/* PARTNER'S STORY: Show Emoji Reactions Bar */}
            {!isAuthor ? (
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
                {REACTION_EMOJIS.map((emoji) => {
                  const count = currentStory.reactions?.[emoji]?.count || 0;
                  return (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendReaction(emoji);
                      }}
                      className="relative group bg-white/10 hover:bg-white/25 active:scale-125 border border-white/15 hover:border-[#D4AF37] px-2 sm:px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0 shadow-xs"
                      title={`Send ${emoji}`}
                    >
                      <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">{emoji}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold text-white font-mono">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* OWN STORY: Show Received Reactions summary instead of reacting to self */
              <div className="flex items-center gap-1.5 text-xs text-white/80 py-1">
                {receivedReactions.length > 0 ? (
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[11px] text-[#F8E3B6] font-medium">Reactions:</span>
                    <div className="flex items-center gap-1">
                      {receivedReactions.map(([emoji, r]) => (
                        <span key={emoji} className="inline-flex items-center gap-0.5 text-xs bg-white/10 px-1.5 py-0.5 rounded-md">
                          <span>{emoji}</span>
                          <span className="text-[10px] font-bold font-mono text-white">{r.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-white/50 italic pl-1">
                    Your published story • Waiting for {partnerName}'s reaction
                  </span>
                )}
              </div>
            )}

            {/* Save to Vault / Turn into Letter Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVaultConfirm(true);
              }}
              className="flex items-center gap-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/60 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              title="Turn this photo snapshot into a sealed letter in your 2032 Vault"
            >
              <Mail className="w-3.5 h-3.5 text-[#F8E3B6]" />
              <span className="font-bold">Save as Letter</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
