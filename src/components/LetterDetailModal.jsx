import React, { useState, useEffect } from 'react';
import { X, Clock, Star, Trash2, Edit, ZoomIn, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LetterDetailModal({ 
  letter, 
  isOpen, 
  onClose, 
  currentUserId, 
  onEdit, 
  onDelete 
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  
  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    // Reset photo index when modal closes or letter changes
    if (!isOpen) setActivePhotoIndex(null);
  }, [isOpen, letter]);

  // Keyboard navigation listener for full screen lightbox
  useEffect(() => {
    if (activePhotoIndex === null || !letter?.images?.length) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev + 1) % letter.images.length);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev - 1 + letter.images.length) % letter.images.length);
      } else if (e.key === 'Escape') {
        setActivePhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, letter?.images]);

  if (!isOpen || !letter) return null;

  const isOwner = letter.authorId === currentUserId;
  const images = letter.images || [];

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    if (!images.length) return;
    setActivePhotoIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    if (!images.length) return;
    setActivePhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!images.length) return;
    const diff = touchStartX - touchEndX;
    // Swipe Threshold: 50px
    if (diff > 50) {
      // Swiped Left -> Next Photo
      handleNextPhoto();
    } else if (diff < -50) {
      // Swiped Right -> Previous Photo
      handlePrevPhoto();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#36271C]/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      
      {/* Detail Card Container */}
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] border-2 border-[#D2C3B0] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Tape Effect */}
        <div className="tape-strip"></div>

        {/* Modal Top Bar */}
        <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={letter.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={letter.authorName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <div>
              <p className="font-bold text-xs sm:text-sm text-[#36271C]">
                {isOwner ? 'Written by You' : `Written by ${letter.authorName}`}
              </p>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#8B0000] font-mono mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{letter.createdAtPHT}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(letter);
                  }}
                  className="p-2 text-[#4A3B2C] hover:text-[#A83232] rounded-lg hover:bg-[#EFE9DE] transition-colors"
                  title="Edit Letter"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this letter?')) {
                      onDelete(letter.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Letter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="text-[#9E8B75] hover:text-[#36271C] p-2 rounded-full hover:bg-[#EFE9DE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Stationary Parchment */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 stationery-sheet">
          
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {letter.isVeryImportant && (
                <span className="important-ribbon text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Very Important Memory
                </span>
              )}
              {letter.mood && (
                <span className="bg-[#FAF5EC] border border-[#D2C3B0] text-[#A83232] text-xs font-bold px-3 py-1 rounded-full">
                  {letter.mood}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif-vintage text-[#36271C]">
              {letter.title || 'Untitled Letter'}
            </h1>
          </div>

          {/* Very Important Context Explanation */}
          {letter.isVeryImportant && letter.importantTagReason && (
            <div className="bg-[#FAF5EC] border-l-4 border-[#D4AF37] p-3.5 rounded-r-xl text-xs text-[#36271C]">
              <p className="font-bold text-[#AA7C11] mb-1">⭐ Why this was marked Very Important:</p>
              <p className="italic font-serif">{letter.importantTagReason}</p>
            </div>
          )}

          {/* Letter Body Content */}
          <div className="font-typewriter text-sm text-[#36271C] leading-[28px] whitespace-pre-wrap tracking-wide">
            {letter.content}
          </div>

          {/* Image Attachments Polaroid Lightbox Grid */}
          {images.length > 0 && (
            <div className="border-t border-[#E2D7C7] pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">
                  Photo Gallery ({images.length})
                </h4>
                <span className="text-[11px] text-[#9E8B75] italic">
                  Click to open interactive gallery
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className="polaroid-card cursor-pointer group p-2"
                  >
                    <div className="relative overflow-hidden rounded">
                      <img
                        src={img.storageUrl || img.dataUrl}
                        alt={img.name}
                        className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <ZoomIn className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-center font-handwriting text-sm text-[#4A3B2C] truncate">
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAF5EC] border-t border-[#E2D7C7] px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Close Letter
          </button>
        </div>

      </div>

      {/* Interactive Photo Gallery Lightbox Modal with Touch Swipe & Nav Controls */}
      {activePhotoIndex !== null && images[activePhotoIndex] && (
        <div 
          onClick={() => setActivePhotoIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          {/* Top Gallery Header Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3 px-2">
            <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Photo {activePhotoIndex + 1} of {images.length}
            </span>
            
            <p className="text-xs text-white/70 hidden sm:block font-sans">
              Swipe left/right or use arrow keys to view
            </p>

            <button
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              title="Close Gallery"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Polaroid Container with Nav Arrows */}
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            
            {/* Previous Arrow Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:-left-6 z-20 p-2.5 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full border border-white/30 backdrop-blur-sm transition-transform hover:scale-110 shadow-xl"
                title="Previous Photo (Swipe Right)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Polaroid Photo Frame */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full bg-white p-3 sm:p-5 rounded-2xl shadow-2xl border-4 sm:border-8 border-white select-none transition-all"
            >
              <img
                src={images[activePhotoIndex].storageUrl || images[activePhotoIndex].dataUrl}
                alt={images[activePhotoIndex].name || 'Memory Photo'}
                className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded"
              />
              <div className="mt-3 flex items-center justify-between px-1">
                <p className="text-center font-handwriting text-lg sm:text-xl text-[#36271C] flex items-center gap-1.5 mx-auto">
                  <span>{images[activePhotoIndex].name || 'Memory Snapshot'}</span>
                  <Heart className="w-4 h-4 text-rose-500 fill-current shrink-0" />
                </p>
              </div>
            </div>

            {/* Next Arrow Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:-right-6 z-20 p-2.5 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full border border-white/30 backdrop-blur-sm transition-transform hover:scale-110 shadow-xl"
                title="Next Photo (Swipe Left)"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

          </div>

          {/* Bottom Thumbnail Strip Indicator */}
          {images.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="mt-4 flex items-center gap-2 overflow-x-auto max-w-xl p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative shrink-0 rounded-lg overflow-hidden transition-all ${
                    idx === activePhotoIndex
                      ? 'ring-2 ring-amber-400 scale-105 opacity-100'
                      : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={img.storageUrl || img.dataUrl}
                    alt={img.name}
                    className="w-12 h-12 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

