import React from 'react';
import { Lock, Edit, Star, Clock, Image as ImageIcon, Sparkles, FileText, User } from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function LetterCard({ 
  letter, 
  currentUserId, 
  isVaultUnlocked, 
  onEdit, 
  onView 
}) {
  const isOwner = letter.authorId === currentUserId;
  const isSealedPartnerLetter = !isOwner && !isVaultUnlocked && !letter.isDraft;

  // Sealed Partner Envelope (Locked until 2032)
  if (isSealedPartnerLetter) {
    // Count paragraphs from content (split by double newlines or single newlines with content)
    const paragraphCount = letter.content
      ? letter.content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1
      : 0;
    const photoCount = letter.images?.length || 0;

    return (
      <div className="polaroid-card group cursor-pointer bg-[#F7F2EA] border-2 border-dashed border-[#D2C3B0] p-5 sm:p-6 text-center">
        <div className="tape-strip"></div>

        {/* Sealed Wax Stamp */}
        <div className="flex justify-center mb-3">
          <div className="wax-seal w-12 h-12 animate-lock-pulse">
            <Lock className="w-6 h-6 text-[#F8E3B6]" />
          </div>
        </div>

        <h3 className="font-serif-vintage font-bold text-base sm:text-lg text-[#36271C] mb-1">
          Sealed Letter from {getNickname(letter.authorName) || 'Partner'}
        </h3>
        
        <p className="text-xs text-[#9E8B75] font-handwriting text-base mb-3">
          "Contents & photos will unlock in 2032"
        </p>

        {/* Letter Hints / Teaser Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {/* Mood Hint */}
          {letter.mood && (
            <span className="bg-[#FAF5EC] border border-[#D2C3B0] text-[#A83232] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full">
              {letter.mood}
            </span>
          )}

          {/* Paragraph Count Hint */}
          {paragraphCount > 0 && (
            <span className="bg-[#FAF5EC] border border-[#D2C3B0] text-[#5C4A3A] text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {paragraphCount} {paragraphCount === 1 ? 'paragraph' : 'paragraphs'}
            </span>
          )}

          {/* Photo Count Hint */}
          {photoCount > 0 && (
            <span className="bg-[#FAF5EC] border border-[#D2C3B0] text-[#5C4A3A] text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'} attached
            </span>
          )}
        </div>

        {/* Immutable Creation Date */}
        <div className="inline-flex items-center gap-1.5 bg-[#EFE9DE] px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-[#8B0000]">
          <Clock className="w-3 h-3" />
          <span>Written: {letter.createdAtPHT}</span>
        </div>

        {/* Very Important Badge hint */}
        {letter.isVeryImportant && (
          <div className="mt-3">
            <span className="important-ribbon text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Marked Very Important
            </span>
          </div>
        )}
      </div>
    );
  }

  // Owner Letter / Unlocked Letter Card
  return (
    <div 
      onClick={() => onView(letter)}
      className={`polaroid-card cursor-pointer flex flex-col justify-between ${
        letter.isDraft ? 'bg-[#FAF6F0] border-amber-300' : 'bg-white'
      }`}
    >
      <div className="tape-strip"></div>

      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <img
              src={letter.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
              alt={letter.authorName}
              className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]"
            />
            <span className="text-xs font-bold text-[#4A3B2C] truncate">
              {isOwner ? 'You' : getNickname(letter.authorName)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {letter.isDraft && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Draft
              </span>
            )}
            
            {/* Very Important Badge */}
            {letter.isVeryImportant && (
              <span className="important-ribbon text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-current" />
                Very Important
              </span>
            )}

            {/* Owner Edit Button */}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(letter);
                }}
                className="p-1 text-[#9E8B75] hover:text-[#A83232] rounded hover:bg-[#FAF5EC] transition-colors"
                title="Edit your letter"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Letter Title */}
        <h3 className="font-serif-vintage font-bold text-lg text-[#36271C] line-clamp-1 mb-1">
          {letter.title || 'Untitled Letter'}
        </h3>

        {/* Mood Stamp */}
        {letter.mood && (
          <p className="text-[11px] text-[#A83232] font-semibold mb-2">
            {letter.mood}
          </p>
        )}

        {/* Very Important Reason Tag */}
        {letter.isVeryImportant && letter.importantTagReason && (
          <div className="bg-[#FAF5EC] border-l-2 border-[#D4AF37] px-2.5 py-1.5 rounded text-[11px] text-[#4A3B2C] mb-3 italic">
            "{letter.importantTagReason}"
          </div>
        )}

        {/* Excerpt Body */}
        <p className="font-typewriter text-xs text-[#5C4A3A] line-clamp-3 leading-relaxed mb-4">
          {letter.content}
        </p>

        {/* Attached Polaroid Thumbnails */}
        {letter.images && letter.images.length > 0 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            {letter.images.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img.storageUrl || img.dataUrl}
                alt={`Photo ${i+1}`}
                className="w-12 h-12 object-cover rounded border border-[#E2D7C7] shrink-0"
              />
            ))}
            {letter.images.length > 3 && (
              <div className="w-12 h-12 bg-[#FAF5EC] border border-[#E2D7C7] rounded flex items-center justify-center text-[10px] font-bold text-[#A83232]">
                +{letter.images.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Immutable Creation PHT Date */}
      <div className="border-t border-[#EFE9DE] pt-2.5 flex items-center justify-between text-[11px] text-[#9E8B75] font-mono">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#C86D51]" />
          <span>{letter.createdAtPHT}</span>
        </div>

        {letter.images?.length > 0 && (
          <div className="flex items-center gap-1 text-[#4A3B2C]">
            <ImageIcon className="w-3 h-3" />
            <span>{letter.images.length}</span>
          </div>
        )}
      </div>

    </div>
  );
}
