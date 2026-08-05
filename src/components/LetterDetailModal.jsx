import React, { useState } from 'react';
import { X, Clock, Star, Trash2, Edit, ZoomIn, Heart, ShieldAlert } from 'lucide-react';

export default function LetterDetailModal({ 
  letter, 
  isOpen, 
  onClose, 
  currentUserId, 
  onEdit, 
  onDelete 
}) {
  const [activePhoto, setActivePhoto] = useState(null);

  if (!isOpen || !letter) return null;

  const isOwner = letter.authorId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#36271C]/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      
      {/* Detail Card Container */}
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] border-2 border-[#D2C3B0] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Tape Effect */}
        <div className="tape-strip"></div>

        {/* Modal Top Bar */}
        <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={letter.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={letter.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <div>
              <p className="font-bold text-sm text-[#36271C]">
                {isOwner ? 'Written by You' : `Written by ${letter.authorName}`}
              </p>
              <div className="flex items-center gap-1 text-xs text-[#8B0000] font-mono mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{letter.createdAtPHT}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 stationery-sheet">
          
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

            <h1 className="text-2xl font-bold font-serif-vintage text-[#36271C]">
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
          {letter.images && letter.images.length > 0 && (
            <div className="border-t border-[#E2D7C7] pt-5 space-y-3">
              <h4 className="text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">
                Photo Gallery ({letter.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {letter.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhoto(img.dataUrl)}
                    className="polaroid-card cursor-pointer group p-2"
                  >
                    <div className="relative overflow-hidden rounded">
                      <img
                        src={img.dataUrl}
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

      {/* Fullscreen Photo Lightbox Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-4 rounded-xl shadow-2xl border-8 border-white">
            <img
              src={activePhoto}
              alt="Full Polaroid View"
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            <p className="text-center font-handwriting text-xl text-[#36271C] mt-2">
              Memory Snapshot 💕
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
