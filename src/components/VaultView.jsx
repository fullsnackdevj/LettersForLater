import React, { useState } from 'react';
import { 
  Plus, 
  Lock, 
  Sparkles, 
  Filter, 
  Search, 
  Star, 
  FileText, 
  Clock, 
  Heart, 
  Key,
  ShieldCheck,
  Mail,
  PenTool,
  Inbox,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LetterCard from './LetterCard';
import MissYouWidget from './MissYouWidget';
import { getCountdownToTarget } from '../utils/pht';

export default function VaultView({ 
  letters, 
  currentUser, 
  pairInfo, 
  onWriteNew, 
  onEditLetter, 
  onViewLetter, 
  onOpenPairing 
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'important' | 'drafts'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const countdown = getCountdownToTarget(pairInfo?.targetUnlockDate);

  // Separate user and partner letters
  const myLetters = letters.filter(l => l.authorId === (currentUser?.uid || 'demo-user-1'));
  const partnerLetters = letters.filter(l => l.authorId !== (currentUser?.uid || 'demo-user-1'));

  // Filtered & Sorted list (Default: Newest First)
  const processedLetters = letters
    .filter(l => {
      // Check search query
      const titleMatch = l.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = l.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const reasonMatch = l.importantTagReason?.toLowerCase().includes(searchQuery.toLowerCase());
      const moodMatch = l.mood?.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchQuery && !titleMatch && !contentMatch && !reasonMatch && !moodMatch) return false;

      // Filter modes
      if (filterMode === 'important') return l.isVeryImportant;
      if (filterMode === 'drafts') return l.isDraft && l.authorId === (currentUser?.uid || 'demo-user-1');
      return !l.isDraft || l.authorId === (currentUser?.uid || 'demo-user-1');
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAtIso || a.createdAtPHT || 0).getTime();
      const timeB = new Date(b.createdAtIso || b.createdAtPHT || 0).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Pagination calculation
  const totalPages = Math.ceil(processedLetters.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedLetters = processedLetters.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      
      {/* 2032 Countdown & Vault Banner (Compact Mobile First) */}
      <div className="relative bg-gradient-to-br from-[#4A1010] via-[#6E1A1A] to-[#36271C] text-[#F8E3B6] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl overflow-hidden border border-[#D4AF37]/40 space-y-3">
        
        {/* Background Decorative Seals */}
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none select-none">
          <Mail className="w-32 h-32 sm:w-48 sm:h-48 text-[#F3E5AB]" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-sm">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
            <span>Time Capsule Vault • Sealed Until August 6, 2032</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold font-serif-vintage tracking-tight text-[#FDFBF7]">
            Writing for our future selves.
          </h2>

          <p className="hidden sm:block text-sm text-[#F4EFE6]/80 leading-relaxed font-handwriting text-xl">
            Letters written today remain safely locked in our cloud vault. Every memory, photo attachment, and PHT timestamp will be revealed together when 2032 arrives.
          </p>

          {/* Compact Live Countdown Grid (Single row on all screens) */}
          <div className="pt-1 grid grid-cols-4 gap-2 max-w-md">
            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-1.5 sm:p-2.5 rounded-xl text-center">
              <span className="block font-mono text-base sm:text-2xl font-bold text-[#F3E5AB]">
                {countdown.years}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Yrs</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-1.5 sm:p-2.5 rounded-xl text-center">
              <span className="block font-mono text-base sm:text-2xl font-bold text-[#F3E5AB]">
                {countdown.days}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Days</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-1.5 sm:p-2.5 rounded-xl text-center">
              <span className="block font-mono text-base sm:text-2xl font-bold text-[#F3E5AB]">
                {countdown.hours}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Hrs</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-1.5 sm:p-2.5 rounded-xl text-center">
              <span className="block font-mono text-base sm:text-2xl font-bold text-[#F3E5AB]">
                {countdown.minutes}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Mins</span>
            </div>
          </div>
        </div>

      </div>

      {/* Pair Stats & Write Action Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* User Letter Count Card */}
        <div className="bg-[#FDFBF7] border border-[#E2D7C7] p-3 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#A83232] shrink-0">
            <PenTool className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">Your Letters</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-[#36271C]">
              {myLetters.filter(l => !l.isDraft).length} <span className="text-[10px] sm:text-xs font-normal text-[#9E8B75]">sealed</span>
            </p>
          </div>
        </div>

        {/* Partner Letter Count Card */}
        <div className="bg-[#FDFBF7] border border-[#E2D7C7] p-3 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <Lock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">
              {pairInfo?.user2?.name || 'Partner'}'s
            </p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-[#36271C]">
              {partnerLetters.length} <span className="text-[10px] sm:text-xs font-normal text-rose-700 font-semibold">waiting</span>
            </p>
          </div>
        </div>

        {/* Write Letter Action Button */}
        <button
          onClick={onWriteNew}
          className="col-span-2 md:col-span-1 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] p-3 sm:p-5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group border border-[#D4AF37]/50"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8B0000] border border-[#F8E3B6]/40 flex items-center justify-center text-[#F8E3B6] group-hover:rotate-12 transition-transform shrink-0">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-bold text-[#F8E3B6]">Write Letter for Later</p>
            <p className="text-[10px] sm:text-[11px] text-[#F8E3B6]/80">Stamp with immutable PHT time & photos</p>
          </div>
        </button>

      </div>

      {/* Real-time "I Miss You" Interactive Counter Widget */}
      <MissYouWidget currentUser={currentUser} pairInfo={pairInfo} />

      {/* Filter Tabs, Sort Dropdown & Search Bar */}
      <div className="bg-[#FDFBF7] p-2.5 sm:p-3.5 rounded-2xl border border-[#E2D7C7] shadow-sm space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
        
        {/* Filter Mode Tabs — horizontal scroll on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto bg-[#FAF5EC] p-0.5 sm:p-1 rounded-xl border border-[#D2C3B0]/60 shrink-0 no-scrollbar">
          <button
            onClick={() => { setFilterMode('all'); setCurrentPage(1); }}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
              filterMode === 'all' 
                ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            All ({letters.length})
          </button>

          <button
            onClick={() => { setFilterMode('important'); setCurrentPage(1); }}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'important' 
                ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            Important
          </button>

          <button
            onClick={() => { setFilterMode('drafts'); setCurrentPage(1); }}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              filterMode === 'drafts' 
                ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Drafts ({myLetters.filter(l => l.isDraft).length})
          </button>
        </div>

        {/* Sort + Search — side by side on mobile */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Sort Order Selector */}
          <div className="flex items-center gap-1 bg-[#FAF5EC] border border-[#D2C3B0] px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shrink-0">
            <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#9E8B75] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-[#36271C] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9E8B75] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search..."
              className="w-full pl-8 sm:pl-9 pr-3 py-1 sm:py-1.5 bg-[#FAF5EC] border border-[#D2C3B0] rounded-xl text-[11px] sm:text-xs text-[#36271C] focus:outline-none focus:ring-1 focus:ring-[#A83232] placeholder-[#A69888]"
            />
          </div>
        </div>

      </div>

      {/* Letters Card Grid */}
      {processedLetters.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLetters.map(letter => (
              <LetterCard
                key={letter.id}
                letter={letter}
                currentUserId={currentUser?.uid || 'demo-user-1'}
                isVaultUnlocked={countdown.isUnlocked}
                onEdit={onEditLetter}
                onView={onViewLetter}
              />
            ))}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 sm:justify-between p-3 sm:p-4 bg-[#FDFBF7] rounded-2xl border border-[#E2D7C7]">
              <p className="hidden sm:block text-xs text-[#7A6855] font-medium">
                Showing <span className="font-bold text-[#36271C]">{startIndex + 1}</span>–<span className="font-bold text-[#36271C]">{Math.min(startIndex + ITEMS_PER_PAGE, processedLetters.length)}</span> of <span className="font-bold text-[#36271C]">{processedLetters.length}</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={validPage === 1}
                  className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-xl border border-[#D2C3B0] bg-[#FAF5EC] text-xs font-bold text-[#36271C] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFE9DE] transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      validPage === page
                        ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm'
                        : 'bg-[#FAF5EC] text-[#5C4A3A] border border-[#D2C3B0]/60 hover:bg-[#EFE9DE]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={validPage === totalPages}
                  className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-xl border border-[#D2C3B0] bg-[#FAF5EC] text-xs font-bold text-[#36271C] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EFE9DE] transition-colors flex items-center justify-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#FDFBF7] border-2 border-dashed border-[#D2C3B0] rounded-3xl p-12 text-center space-y-4">
          <div className="wax-seal w-16 h-16 mx-auto">
            <Inbox className="w-8 h-8 text-[#F8E3B6]" />
          </div>
          <h3 className="text-xl font-bold font-serif-vintage text-[#36271C]">
            No letters found in this view
          </h3>
          <p className="text-xs text-[#9E8B75] max-w-sm mx-auto font-handwriting text-base">
            Start by writing a letter today. It will be sealed safely with Philippine Standard Time until 2032!
          </p>
          <button
            onClick={onWriteNew}
            className="inline-flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Write First Letter
          </button>
        </div>
      )}

    </div>
  );
}
