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
  ShieldCheck
} from 'lucide-react';
import LetterCard from './LetterCard';
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
  const [searchQuery, setSearchQuery] = useState('');

  const countdown = getCountdownToTarget(pairInfo?.targetUnlockDate);

  // Separate user and partner letters
  const myLetters = letters.filter(l => l.authorId === (currentUser?.uid || 'demo-user-1'));
  const partnerLetters = letters.filter(l => l.authorId !== (currentUser?.uid || 'demo-user-1'));

  // Filtered list
  const filteredLetters = letters.filter(l => {
    // Check search query
    const titleMatch = l.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = l.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const reasonMatch = l.importantTagReason?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !titleMatch && !contentMatch && !reasonMatch) return false;

    // Filter modes
    if (filterMode === 'important') return l.isVeryImportant;
    if (filterMode === 'drafts') return l.isDraft && l.authorId === (currentUser?.uid || 'demo-user-1');
    return !l.isDraft || l.authorId === (currentUser?.uid || 'demo-user-1');
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 2032 Countdown & Vault Banner */}
      <div className="relative bg-gradient-to-br from-[#4A1010] via-[#6E1A1A] to-[#36271C] text-[#F8E3B6] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden border-2 border-[#D4AF37]/40">
        
        {/* Background Decorative Seals & Ribbons */}
        <div className="absolute right-[-40px] top-[-40px] opacity-10 text-[180px] font-serif pointer-events-none select-none">
          💌
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Time Capsule Vault • Sealed Until August 6, 2032</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-vintage tracking-tight text-[#FDFBF7]">
            Writing for our future selves.
          </h2>

          <p className="text-sm sm:text-base text-[#F4EFE6]/80 leading-relaxed font-handwriting text-xl">
            Letters written today remain safely locked in our cloud vault. Every memory, photo attachment, and PHT timestamp will be revealed together when 2032 arrives.
          </p>

          {/* Live Countdown Grid */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-3 rounded-2xl text-center">
              <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#F3E5AB]">
                {countdown.years}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Years</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-3 rounded-2xl text-center">
              <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#F3E5AB]">
                {countdown.days}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Days</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-3 rounded-2xl text-center">
              <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#F3E5AB]">
                {countdown.hours}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Hours</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-[#D4AF37]/30 p-3 rounded-2xl text-center">
              <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#F3E5AB]">
                {countdown.minutes}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#EFE9DE]/70 font-semibold">Mins</span>
            </div>
          </div>
        </div>

      </div>

      {/* Pair Stats & Write Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* User Letter Count Card */}
        <div className="bg-[#FDFBF7] border border-[#E2D7C7] p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#A83232] text-xl font-bold font-serif shrink-0">
            ✍️
          </div>
          <div>
            <p className="text-xs text-[#9E8B75] uppercase font-bold tracking-wider">Your Sealed Letters</p>
            <p className="text-2xl font-bold font-serif text-[#36271C]">
              {myLetters.filter(l => !l.isDraft).length} <span className="text-xs font-normal text-[#9E8B75]">letters</span>
            </p>
          </div>
        </div>

        {/* Partner Letter Count Card */}
        <div className="bg-[#FDFBF7] border border-[#E2D7C7] p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 text-xl font-bold font-serif shrink-0">
            🔒
          </div>
          <div>
            <p className="text-xs text-[#9E8B75] uppercase font-bold tracking-wider">
              {pairInfo?.user2?.name || 'Partner'}'s Sealed Letters
            </p>
            <p className="text-2xl font-bold font-serif text-[#36271C]">
              {partnerLetters.length} <span className="text-xs font-normal text-rose-700 font-semibold">waiting in vault</span>
            </p>
          </div>
        </div>

        {/* Write Letter Action Button */}
        <button
          onClick={onWriteNew}
          className="bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] p-5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group border border-[#D4AF37]/50"
        >
          <div className="w-10 h-10 rounded-full bg-[#8B0000] border border-[#F8E3B6]/40 flex items-center justify-center text-[#F8E3B6] group-hover:rotate-12 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#F8E3B6]">Write Letter for Later</p>
            <p className="text-[11px] text-[#F8E3B6]/80">Stamp with immutable PHT time & photos</p>
          </div>
        </button>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FDFBF7] p-3 rounded-2xl border border-[#E2D7C7]">
        
        {/* Filter Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              filterMode === 'all' 
                ? 'bg-[#36271C] text-[#FDFBF7]' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            All Vault Letters ({letters.length})
          </button>

          <button
            onClick={() => setFilterMode('important')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              filterMode === 'important' 
                ? 'bg-[#D4AF37] text-[#3D2600]' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Very Important
          </button>

          <button
            onClick={() => setFilterMode('drafts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              filterMode === 'drafts' 
                ? 'bg-[#A83232] text-[#F8E3B6]' 
                : 'text-[#4A3B2C] hover:bg-[#EFE9DE]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Drafts ({myLetters.filter(l => l.isDraft).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9E8B75] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search letters or tags..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#FAF5EC] border border-[#D2C3B0] rounded-xl text-xs text-[#36271C] focus:outline-none focus:ring-1 focus:ring-[#A83232]"
          />
        </div>

      </div>

      {/* Letters Card Grid */}
      {filteredLetters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLetters.map(letter => (
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
      ) : (
        <div className="bg-[#FDFBF7] border-2 border-dashed border-[#D2C3B0] rounded-3xl p-12 text-center space-y-4">
          <div className="wax-seal w-16 h-16 text-3xl font-serif mx-auto">
            📮
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
