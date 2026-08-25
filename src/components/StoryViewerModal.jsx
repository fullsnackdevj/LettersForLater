import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Download, 
  Check, 
  Eye, 
  AlertTriangle,
  Mail,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { downloadImage } from '../utils/fileDownloader';

const REACTION_EMOJIS = ['❤️', '🥺', '😂', '😚', '✨', '☕', '🫶'];
const STORY_DURATION_MS = 15000; // 15 seconds per story slide

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
  onMarkAsViewed,
  onOpenStoryCreator
}) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [floatingParticles, setFloatingParticles] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Custom Delete Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Save to Vault / Letter Confirmation Modal State
  const [showVaultConfirm, setShowVaultConfirm] = useState(false);

  // High precision timer and animation frame tracking
  const rafIdRef = useRef(null);
  const elapsedMsRef = useRef(0);
  const lastTimeRef = useRef(null);

  // Gesture and touch refs
  const touchStartRef = useRef(null);
  const pointerDownTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const holdTimeoutRef = useRef(null);

  // Image preloader cache
  const preloadedUrlsRef = useRef(new Set());

  // Helper to preload images for instant zero-lag switching
  const preloadImage = useCallback((url) => {
    if (!url || preloadedUrlsRef.current.has(url)) return;
    preloadedUrlsRef.current.add(url);
    const img = new Image();
    img.src = url;
    if (img.decode) {
      img.decode().catch(() => {});
    }
  }, []);

  // Preload adjacent images whenever stories or currentIndex change
  useEffect(() => {
    if (!isOpen || !stories.length) return;

    // Current story
    if (stories[currentIndex]?.mediaUrl) {
      preloadImage(stories[currentIndex].mediaUrl);
    }
    // Next 2 stories
    if (stories[currentIndex + 1]?.mediaUrl) {
      preloadImage(stories[currentIndex + 1].mediaUrl);
    }
    if (stories[currentIndex + 2]?.mediaUrl) {
      preloadImage(stories[currentIndex + 2].mediaUrl);
    }
    // Previous story
    if (stories[currentIndex - 1]?.mediaUrl) {
      preloadImage(stories[currentIndex - 1].mediaUrl);
    }
  }, [isOpen, stories, currentIndex, preloadImage]);

  // Sync initial story index when modal opens
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.min(Math.max(initialStoryIndex, 0), Math.max(0, stories.length - 1));
      setCurrentIndex(validIndex);
      elapsedMsRef.current = 0;
      setProgress(0);
      setIsMenuOpen(false);
      setIsPaused(false);
      setDownloadSuccess(false);
      setShowDeleteConfirm(false);
      setShowVaultConfirm(false);
    }
  }, [isOpen, initialStoryIndex, stories.length]);

  // Auto-close if all stories were deleted or clamp index
  useEffect(() => {
    if (isOpen) {
      if (stories.length === 0) {
        onClose();
      } else if (currentIndex >= stories.length) {
        setCurrentIndex(Math.max(0, stories.length - 1));
        elapsedMsRef.current = 0;
        setProgress(0);
      }
    }
  }, [stories.length, currentIndex, isOpen, onClose]);

  const currentStory = stories[currentIndex];
  const currentUserId = currentUser?.uid || 'demo-user-1';
  const isAuthor = currentStory?.authorId === currentUserId;

  // Automatically mark current story as viewed (only if not already marked to prevent render spam)
  useEffect(() => {
    if (isOpen && currentStory && onMarkAsViewed) {
      const viewedList = Array.isArray(currentStory.viewedBy) ? currentStory.viewedBy : [];
      if (!viewedList.includes(currentUserId)) {
        onMarkAsViewed(currentStory.id);
      }
    }
  }, [isOpen, currentStory, currentUserId, onMarkAsViewed]);

  // Move to next story or close if at end
  const handleNext = useCallback(() => {
    elapsedMsRef.current = 0;
    setProgress(0);
    setIsMenuOpen(false);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDownloadSuccess(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // Move to previous story
  const handlePrev = useCallback(() => {
    elapsedMsRef.current = 0;
    setProgress(0);
    setIsMenuOpen(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setDownloadSuccess(false);
    }
  }, [currentIndex]);

  // High-Precision RAF Timer Engine for active story slide
  useEffect(() => {
    if (!isOpen || showDeleteConfirm || showVaultConfirm || isMenuOpen || isPaused || !currentStory) {
      lastTimeRef.current = null;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const tick = (now) => {
      if (!isMounted) return;

      if (lastTimeRef.current != null) {
        const delta = now - lastTimeRef.current;
        // Avoid jumps if browser tab was throttled/backgrounded
        if (delta > 0 && delta < 500) {
          elapsedMsRef.current += delta;
        }
      }
      lastTimeRef.current = now;

      const currentPct = Math.min((elapsedMsRef.current / STORY_DURATION_MS) * 100, 100);
      setProgress(currentPct);

      if (elapsedMsRef.current >= STORY_DURATION_MS) {
        handleNext();
      } else {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    lastTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [isOpen, showDeleteConfirm, showVaultConfirm, isMenuOpen, isPaused, currentStory, handleNext]);

  // Reset progress when index changes
  useEffect(() => {
    elapsedMsRef.current = 0;
    setProgress(0);
    setIsMenuOpen(false);
    lastTimeRef.current = null;
  }, [currentIndex]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen || showDeleteConfirm || showVaultConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDeleteConfirm, showVaultConfirm, isMenuOpen, handleNext, handlePrev, onClose]);

  // Unified Pointer & Touch Gesture Handling (Zero-Lag + Instant Response)
  const handlePointerDown = (e) => {
    if (showDeleteConfirm || showVaultConfirm || isMenuOpen) return;
    if (e.button !== undefined && e.button !== 0) return; // Only primary mouse button

    isHoldingRef.current = false;
    pointerDownTimeRef.current = Date.now();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };

    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
    }, 180);
  };

  const handlePointerMove = (e) => {
    if (!touchStartRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffX = Math.abs(clientX - touchStartRef.current.x);
    const diffY = Math.abs(clientY - touchStartRef.current.y);

    // If moved more than threshold, cancel hold
    if (diffX > 15 || diffY > 15) {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    }
  };

  const handlePointerUp = (e) => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    const wasHolding = isHoldingRef.current;
    isHoldingRef.current = false;
    setIsPaused(false);

    if (showDeleteConfirm || showVaultConfirm || isMenuOpen) return;
    if (!touchStartRef.current) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const diffX = clientX - touchStartRef.current.x;
    const diffY = clientY - touchStartRef.current.y;
    const holdDuration = Date.now() - (pointerDownTimeRef.current || 0);
    touchStartRef.current = null;

    // If user was holding down to pause, just resume without navigating
    if (wasHolding || holdDuration > 220) {
      return;
    }

    // Swipe threshold check
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handlePrev(); // Swiped right -> previous
      } else {
        handleNext(); // Swiped left -> next
      }
      return;
    }

    // Tap Navigation: Left 35% -> previous, Right 65% -> next
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const tapX = clientX - rect.left;

    if (tapX < rect.width * 0.35) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handlePointerCancel = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    isHoldingRef.current = false;
    setIsPaused(false);
    touchStartRef.current = null;
  };

  // Trigger floating emoji reaction (Both users can react, max 10 per emoji per user)
  const handleSendReaction = (emoji) => {
    if (!currentStory) return;

    const emojiData = currentStory.reactions?.[emoji];
    const userCounts = emojiData?.userCounts || {};
    let myCount = Number(userCounts[currentUserId]);
    if (myCount === undefined || isNaN(myCount)) {
      myCount = emojiData?.users?.includes(currentUserId) && emojiData?.count ? emojiData.count : 0;
    }

    if (myCount >= 10) return; // Max 10 reached for this user

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 40]); } catch (e) {}
    }

    // Spawn floating particle burst
    const newParticles = Array.from({ length: 6 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      emoji,
      left: 15 + Math.random() * 70,
      scale: 0.8 + Math.random() * 0.5,
      rotation: Math.random() * 40 - 20,
      delay: idx * 0.04
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

  // Relative Time helper (Instagram compact format)
  const getTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
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


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn select-none touch-none">
      
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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden md:flex absolute left-4 lg:left-12 z-30 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer border border-white/20"
          title="Previous Story"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Right Desktop Arrow */}
      {currentIndex < stories.length - 1 && !showDeleteConfirm && !showVaultConfirm && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden md:flex absolute right-4 lg:right-12 z-30 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer border border-white/20"
          title="Next Story"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Main Instagram Story Container */}
      <div className="relative w-full max-w-[420px] h-full max-h-[100vh] sm:max-h-[88vh] sm:rounded-3xl overflow-hidden shadow-2xl bg-[#1C1D24] border sm:border-2 sm:border-[#D4AF37]/40 flex flex-col justify-between">
        
        {/* ─────────────────────────────────────────────────────────────
            TOP HEADER: Segmented Progress (15s) & Clean Profile Bar
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent space-y-2.5">
          
          {/* Segmented Progress Nodes (High-Precision 15s RAF auto-fill) */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => {
              let widthPct = 0;
              if (idx < currentIndex) {
                widthPct = 100;
              } else if (idx === currentIndex) {
                widthPct = progress;
              }

              return (
                <div 
                  key={s.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showDeleteConfirm && !showVaultConfirm) {
                      elapsedMsRef.current = 0;
                      setProgress(0);
                      setCurrentIndex(idx);
                    }
                  }}
                  className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden cursor-pointer p-0 select-none shadow-xs"
                >
                  <div 
                    className="h-full bg-white rounded-full transition-none will-change-[width]"
                    style={{ 
                      width: `${widthPct}%`
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Badge, Time & Controls (Single Clean Line) */}
          <div className="flex items-center justify-between text-white pt-0.5">
            <div 
              className="flex items-center gap-2 min-w-0 pr-2"
              title={formatStoryDateTime(currentStory)}
            >
              {/* Avatar */}
              <img
                src={currentStory.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentStory.authorName}
                className="w-8 h-8 rounded-full object-cover border border-white/80 shrink-0 shadow-sm"
              />

              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="font-bold text-xs sm:text-sm text-white drop-shadow truncate">
                  {getNickname(currentStory.authorName)}
                </span>
                
                {currentStory.moodTag && (
                  <span className="text-sm shrink-0" title="Mood Stamp">
                    {currentStory.moodTag}
                  </span>
                )}

                <span className="text-white/40 text-xs shrink-0">•</span>

                <span className="text-xs text-white/75 shrink-0 font-medium">
                  {getTimeAgo(currentStory.createdAtIso)}
                </span>
              </div>
            </div>

            {/* Top Right Action Menu: Three Horizontal Dots [...] & Close [X] */}
            <div className="relative flex items-center gap-1.5 shrink-0">
              
              {/* Three Horizontal Dots Menu Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(prev => !prev);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer touch-manipulation ${
                  isMenuOpen 
                    ? 'bg-[#A83232] text-[#F8E3B6] scale-105' 
                    : 'bg-black/40 hover:bg-black/70 text-white active:scale-95'
                }`}
                title="Story Options"
                aria-label="Story options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer"
                title="Close"
                aria-label="Close story viewer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Three Dots Dropdown Menu Popover */}
              {isMenuOpen && (
                <>
                  {/* Backdrop dismiss */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }} 
                  />

                  <div 
                    className="absolute right-0 top-10 w-44 bg-[#261B14]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn space-y-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Add New Story */}
                    {onOpenStoryCreator && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenStoryCreator();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F8E3B6] hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#A83232] flex items-center justify-center text-[#F8E3B6] shrink-0">
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span>Add New Story</span>
                      </button>
                    )}

                    {/* Download Photo */}
                    {currentStory.mediaUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          setIsMenuOpen(false);
                          handleDownloadStoryMedia(e);
                        }}
                        disabled={isDownloading}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
                          {isDownloading ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : downloadSuccess ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span>{downloadSuccess ? 'Downloaded!' : 'Save Photo'}</span>
                      </button>
                    )}

                    {/* Delete Story (Only if Author) */}
                    {isAuthor && onDeleteStory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-left border-t border-white/10 pt-1.5 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center text-rose-300 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                        <span>Delete Story</span>
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>

          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN STORY PHOTO CONTENT (Unified Gesture / Tap Handler)
           ───────────────────────────────────────────────────────────── */}
        <div 
          className="relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer bg-black select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          {currentStory.mediaUrl ? (
            <div className="relative w-full h-full flex items-center justify-center transition-opacity duration-150 ease-out">
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain sm:object-cover pointer-events-none select-none transition-transform duration-200"
              />
              
              {/* Optional Polaroid tape effect on top */}
              <div className="tape-strip top-4 opacity-75 pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center text-white/70 space-y-2">
              <span className="text-4xl">{currentStory.moodTag || '📸'}</span>
              <p className="text-xs font-mono">Snapshot Moment</p>
            </div>
          )}

          {/* Subtle Left / Right tap indicator hints on edges */}
          <div className="absolute left-2 inset-y-0 w-8 flex items-center justify-start opacity-0 hover:opacity-40 transition-opacity pointer-events-none text-white">
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="absolute right-2 inset-y-0 w-8 flex items-center justify-end opacity-0 hover:opacity-40 transition-opacity pointer-events-none text-white">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Pause Indicator overlay on long press */}
          {isPaused && !showDeleteConfirm && !showVaultConfirm && !isMenuOpen && (
            <div className="absolute top-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white/80 border border-white/20 animate-fadeIn pointer-events-none">
              ⏸ Paused
            </div>
          )}

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
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl border border-[#D2C3B0] bg-white text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
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
                    type="button"
                    onClick={handleConfirmOpenLetterEditor}
                    className="w-full py-2.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 border border-[#D4AF37]/50 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Letter Editor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVaultConfirm(false)}
                    className="w-full py-2 rounded-xl border border-[#D2C3B0] bg-white text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
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
            - Tier 1: 7 Emojis Grid (Full width, zero horizontal cropping)
            - Tier 2: Seen Status (Left) + Save as Letter Button (Right)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-2.5">
          
          {/* Tier 1: Emoji Reactions Grid (Evenly distributed, zero horizontal scrolling or cropping) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-center justify-items-center w-full">
            {REACTION_EMOJIS.map((emoji) => {
              const emojiData = currentStory.reactions?.[emoji];
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendReaction(emoji);
                  }}
                  disabled={isMaxed}
                  className={`relative group w-full max-w-[44px] aspect-square rounded-2xl flex items-center justify-center transition-all touch-manipulation cursor-pointer ${
                    isMaxed 
                      ? 'bg-white/5 border border-white/10 opacity-70 cursor-not-allowed' 
                      : hasReacted
                        ? 'bg-white/20 border border-[#D4AF37] shadow-sm hover:scale-110 active:scale-125'
                        : 'bg-white/10 hover:bg-white/20 active:scale-125 border border-white/15 hover:border-white/40'
                  }`}
                  title={isMaxed ? `Reached max (10/10) reactions for ${emoji}` : `Send ${emoji} (${myCount}/10)`}
                  aria-label={`React ${emoji}`}
                >
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform select-none">
                    {emoji}
                  </span>
                  
                  {/* Reaction Count Badge */}
                  {totalCount > 0 && (
                    <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 min-w-[17px] text-[10px] font-mono font-bold rounded-full shadow-md border text-center ${
                      isMaxed 
                        ? 'bg-[#A83232] text-[#F8E3B6] border-[#D4AF37]' 
                        : hasReacted
                          ? 'bg-[#D4AF37] text-[#36271C] border-white/60'
                          : 'bg-black/80 text-white border-white/30'
                    }`}>
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tier 2: Bottom Status & Actions (Seen by + Save as Letter) */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            
            {/* Seen Status Badge */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-xs truncate ${
                isViewedByBoth || isViewedByPartner
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/50 border-white/15 text-white/75'
              }`}>
                <Eye className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="truncate">
                  {isViewedByBoth
                    ? `Seen by ${partnerName} & You 💕`
                    : isViewedByPartner
                      ? `Seen by ${partnerName}`
                      : 'Seen only by you'}
                </span>
              </span>
            </div>

            {/* Save to Vault / Turn into Letter Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVaultConfirm(true);
              }}
              className="flex items-center gap-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/60 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              title="Turn this photo snapshot into a sealed letter in your 2032 Vault"
            >
              <Mail className="w-3.5 h-3.5 text-[#F8E3B6]" />
              <span>Save as Letter</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
