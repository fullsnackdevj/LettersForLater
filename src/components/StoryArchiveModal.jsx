import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Heart, 
  Plus,
  Layers
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function StoryArchiveModal({
  isOpen,
  onClose,
  stories = [],
  currentUser,
  pairInfo,
  onSelectStory,
  onOpenCreateStory
}) {
  const [filterAuthor, setFilterAuthor] = useState('all'); // 'all' | 'me' | 'partner'

  if (!isOpen) return null;

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // Filter stories by author
  const filteredStories = stories.filter(story => {
    if (filterAuthor === 'me' && story.authorId !== currentUserId) return false;
    if (filterAuthor === 'partner' && story.authorId === currentUserId) return false;
    return true;
  });

  const myStoriesCount = stories.filter(s => s.authorId === currentUserId).length;
  const partnerStoriesCount = stories.filter(s => s.authorId !== currentUserId).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ─────────────────────────────────────────────────────────────
            HEADER
           ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#E2D7C7] bg-[#FAF5EC]">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-10 h-10 text-sm shadow-md">
              📸
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-2xl text-[#36271C]">
                Our Stories <span className="text-[#A83232] font-serif font-normal text-base sm:text-xl">• Memory Log</span>
              </h2>
              <p className="text-xs text-[#9E8B75] font-handwriting text-base sm:text-lg -mt-0.5">
                Every snapshot and emoji moment preserved privately for the two of you
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            AUTHOR FILTER TOOLBAR
           ───────────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-3 bg-[#FAF5EC]/90 border-b border-[#E2D7C7] flex items-center justify-between gap-3">
          
          {/* Author Filter Segmented Tabs */}
          <div className="flex items-center gap-1 bg-[#EFE9DE] p-1 rounded-2xl border border-[#D2C3B0]/70 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterAuthor('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterAuthor === 'all'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              All Snapshots ({stories.length})
            </button>

            <button
              onClick={() => setFilterAuthor('me')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                filterAuthor === 'me'
                  ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{currentUserName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterAuthor === 'me' ? 'bg-[#8B0000] text-[#F8E3B6]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {myStoriesCount}
              </span>
            </button>

            <button
              onClick={() => setFilterAuthor('partner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                filterAuthor === 'partner'
                  ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{partnerName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterAuthor === 'partner' ? 'bg-[#AA7C11] text-white' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {partnerStoriesCount}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-[#9E8B75] hidden sm:block font-mono">
            {filteredStories.length} {filteredStories.length === 1 ? 'memory' : 'memories'}
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            STORIES GRID / PHOTO CARDS
           ───────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {filteredStories.map((story) => {
                const totalReactions = Object.values(story.reactions || {}).reduce(
                  (sum, r) => sum + (r.count || 0), 
                  0
                );

                const isStillActive = story.expiresAtIso 
                  ? new Date(story.expiresAtIso).getTime() > Date.now() 
                  : false;

                return (
                  <div
                    key={story.id}
                    onClick={() => onSelectStory(story)}
                    className="group relative rounded-2xl overflow-hidden border border-[#E2D7C7] hover:border-[#D4AF37] bg-[#FAF5EC] shadow-xs hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col aspect-[3/4]"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative flex-1 w-full overflow-hidden bg-[#2D1F15] flex items-center justify-center">
                      {story.mediaUrl ? (
                        <img
                          src={story.mediaUrl}
                          alt="Story thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FAF5EC] text-4xl">
                          {story.moodTag || '📸'}
                        </div>
                      )}

                      {/* Active 24h Badge */}
                      {isStillActive && (
                        <div className="absolute top-2 right-2 bg-[#A83232]/95 text-[#F8E3B6] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/50 shadow-sm backdrop-blur-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </div>
                      )}

                      {/* Reactions Pill */}
                      {totalReactions > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-current" />
                          <span>{totalReactions}</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <div className="px-3 py-1.5 rounded-full bg-black/70 border border-[#D4AF37]/60 text-xs font-bold flex items-center gap-1.5 transform scale-90 group-hover:scale-100 transition-transform">
                          <Sparkles className="w-3.5 h-3.5 text-[#F8E3B6]" />
                          <span>View</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata Bar */}
                    <div className="p-2.5 bg-[#FAF5EC] border-t border-[#E2D7C7] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#36271C] truncate">
                        {getNickname(story.authorName)}
                      </span>
                      <span className="text-[#9E8B75] font-mono text-[10px]">
                        {story.createdAtPHT ? story.createdAtPHT.split(', ')[0] : 'Snapshot'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#FAF5EC]/70 border-2 border-dashed border-[#D2C3B0] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6 space-y-4">
              <div className="wax-seal w-16 h-16 mx-auto text-2xl shadow-lg">
                📸
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                  Your Memory Log is Ready
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6855] font-handwriting text-lg sm:text-xl max-w-sm mx-auto leading-relaxed">
                  Every 24-hour photo snapshot you share together will be safely preserved here in this private log forever.
                </p>
              </div>

              {onOpenCreateStory && (
                <button
                  onClick={onOpenCreateStory}
                  className="inline-flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold px-5 py-2.5 rounded-full shadow-md border border-[#D4AF37]/50 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share First Snapshot</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
           ───────────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC] flex justify-between items-center text-xs text-[#9E8B75]">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-[#A83232]" />
            <span>Total Snapshots Logged: <strong className="font-mono text-[#36271C] font-bold">{stories.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateStory && (
              <button
                onClick={onOpenCreateStory}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-xs shadow-xs transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Snapshot</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#36271C] text-[#F8E3B6] font-bold text-xs hover:bg-[#4A3B2C] transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
