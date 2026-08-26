import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import LetterCard from './LetterCard';
import MissYouWidget from './MissYouWidget';
import { getCountdownToTarget } from '../utils/pht';
import { getNickname } from '../utils/nicknames';

export default function VaultView({ 
  letters, 
  currentUser, 
  pairInfo, 
  onWriteNew, 
  onEditLetter, 
  onViewLetter, 
  onOpenPairing,
  onOpenInfo,
  onOpenTimeline,
  onOpenBucketList,
  onOpenPrayers,
  isLettersUnlocked = false,
  bucketItems = [],
  prayers = []
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'important' | 'drafts'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const countdown = getCountdownToTarget(pairInfo?.targetUnlockDate);
  const currentUserId = currentUser?.uid || 'demo-user-1';

  // Separate user and partner letters
  const myLetters = letters.filter(l => l.authorId === currentUserId);
  const partnerLetters = letters.filter(l => l.authorId !== currentUserId);

  // 1. Track Seen Partner Letters
  const [lastSeenPartnerLetters, setLastSeenPartnerLetters] = useState(() => {
    try {
      const stored = localStorage.getItem(`lfl_seen_partner_letters_${currentUserId}`);
      return stored !== null ? Number(stored) : partnerLetters.length;
    } catch (e) {
      return partnerLetters.length;
    }
  });

  const hasNewPartnerLetters = partnerLetters.length > lastSeenPartnerLetters;

  const handlePartnerLettersClick = () => {
    try {
      localStorage.setItem(`lfl_seen_partner_letters_${currentUserId}`, partnerLetters.length);
      setLastSeenPartnerLetters(partnerLetters.length);
    } catch (e) {}
  };

  // 2. Track Seen Partner Bucket List Items (Exclude own additions)
  const partnerBucketItems = useMemo(() => {
    return bucketItems.filter(i => i.createdBy && i.createdBy !== currentUserId);
  }, [bucketItems, currentUserId]);

  const [lastSeenBucketTime, setLastSeenBucketTime] = useState(() => {
    try {
      const stored = localStorage.getItem(`lfl_seen_partner_bucket_${currentUserId}`);
      return stored !== null ? Number(stored) : Date.now();
    } catch (e) {
      return Date.now();
    }
  });

  const hasNewPartnerBucketItems = useMemo(() => {
    return partnerBucketItems.some(i => {
      const createdTime = new Date(i.createdAtIso || 0).getTime();
      return createdTime > lastSeenBucketTime;
    });
  }, [partnerBucketItems, lastSeenBucketTime]);

  const handleOpenBucketListWithSeen = () => {
    try {
      const now = Date.now();
      localStorage.setItem(`lfl_seen_partner_bucket_${currentUserId}`, now);
      setLastSeenBucketTime(now);
    } catch (e) {}
    if (onOpenBucketList) onOpenBucketList();
  };

  // 3. Track Seen Prayer Activity (New partner request OR partner prayed for your request)
  const [lastSeenPrayerTime, setLastSeenPrayerTime] = useState(() => {
    try {
      const stored = localStorage.getItem(`lfl_seen_partner_prayer_${currentUserId}`);
      return stored !== null ? Number(stored) : Date.now();
    } catch (e) {
      return Date.now();
    }
  });

  const hasNewPrayerActivity = useMemo(() => {
    return prayers.some(p => {
      // Case A: Partner added a new active request
      if (p.createdBy && p.createdBy !== currentUserId && !p.isArchived) {
        const createdTime = new Date(p.createdAtIso || 0).getTime();
        if (createdTime > lastSeenPrayerTime) return true;
      }
      // Case B: Partner prayed for your request
      if (p.createdBy === currentUserId && p.prayedBy && p.prayedBy !== currentUserId) {
        const prayedTime = new Date(p.prayedAtIso || p.createdAtIso || 0).getTime();
        if (prayedTime > lastSeenPrayerTime) return true;
      }
      return false;
    });
  }, [prayers, currentUserId, lastSeenPrayerTime]);

  const handleOpenPrayersWithSeen = () => {
    try {
      const now = Date.now();
      localStorage.setItem(`lfl_seen_partner_prayer_${currentUserId}`, now);
      setLastSeenPrayerTime(now);
    } catch (e) {}
    if (onOpenPrayers) onOpenPrayers();
  };

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
      
      {/* 2032 Countdown & Vault Banner */}
      <div className="relative bg-gradient-to-br from-[#4A0E0E] via-[#5C1515] to-[#2E120A] text-[#F8E3B6] rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden border border-[#D4AF37]/40 space-y-4">
        
        {/* Soft Ambient Glow & Postal Watermark */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none select-none">
          <Mail className="w-48 h-48 sm:w-64 sm:h-64 text-[#F8E3B6]" />
        </div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          
          {/* Time-based Greeting */}
          <div>
            <h1 className="text-lg sm:text-2xl font-handwriting text-[#F8E3B6] tracking-wide">
              {(() => {
                const hour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })).getHours();
                const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
                const icon = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';
                return `${greeting}, ${getNickname(currentUser?.displayName)}! ${icon}`;
              })()}
            </h1>
          </div>

          {/* Elegant Shimmering Headline */}
          <h2 className="text-[18px] sm:text-3xl lg:text-4xl font-bold font-serif-vintage tracking-tight bg-gradient-to-r from-[#FFFDF9] via-[#F8E3B6] to-[#E6C687] bg-clip-text text-transparent">
            Writing for our future selves.
          </h2>

          <p className="hidden md:block text-xs sm:text-sm text-[#F4EFE6]/80 leading-relaxed font-sans max-w-2xl">
            Every memory, photo, and prayer sealed today in our private vault will be revealed together when 2032 arrives.
          </p>

          {/* Glassmorphism Countdown Timer Ribbon */}
          <div className="pt-1">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md bg-black/25 backdrop-blur-xl border border-[#D4AF37]/30 p-2 sm:p-2.5 rounded-2xl shadow-inner">
              
              <div className="bg-white/[0.06] border border-[#D4AF37]/20 py-2 sm:py-2.5 px-1 rounded-xl text-center shadow-xs">
                <span className="block font-serif-vintage text-lg sm:text-3xl font-bold text-[#FFFDF9] leading-none">
                  {countdown.years}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F8E3B6]/70 font-mono font-semibold mt-1.5 block">
                  Years
                </span>
              </div>

              <div className="bg-white/[0.06] border border-[#D4AF37]/20 py-2 sm:py-2.5 px-1 rounded-xl text-center shadow-xs">
                <span className="block font-serif-vintage text-lg sm:text-3xl font-bold text-[#FFFDF9] leading-none">
                  {countdown.days}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F8E3B6]/70 font-mono font-semibold mt-1.5 block">
                  Days
                </span>
              </div>

              <div className="bg-white/[0.06] border border-[#D4AF37]/20 py-2 sm:py-2.5 px-1 rounded-xl text-center shadow-xs">
                <span className="block font-serif-vintage text-lg sm:text-3xl font-bold text-[#FFFDF9] leading-none">
                  {countdown.hours}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F8E3B6]/70 font-mono font-semibold mt-1.5 block">
                  Hours
                </span>
              </div>

              <div className="bg-white/[0.06] border border-[#D4AF37]/20 py-2 sm:py-2.5 px-1 rounded-xl text-center shadow-xs">
                <span className="block font-serif-vintage text-lg sm:text-3xl font-bold text-[#FFFDF9] leading-none">
                  {countdown.minutes}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F8E3B6]/70 font-mono font-semibold mt-1.5 block">
                  Mins
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Pair Stats, Bucket List, Daily Prayer & Write Action Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* User Letter Count Card */}
        <div className="bg-[#FDFBF7] border border-[#E2D7C7] p-3 sm:p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="wax-seal w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base shrink-0 shadow-xs flex items-center justify-center text-[#F8E3B6]">
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8E3B6]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">Your Letters</p>
            <p className="text-lg sm:text-2xl font-bold font-serif text-[#36271C]">
              {myLetters.filter(l => !l.isDraft).length} <span className="text-[10px] sm:text-xs font-normal text-[#9E8B75]">sealed</span>
            </p>
          </div>
        </div>

        {/* Partner Letter Count Card */}
        <div 
          onClick={handlePartnerLettersClick}
          className="relative bg-[#FDFBF7] border border-[#E2D7C7] p-3 sm:p-4 rounded-2xl shadow-sm flex items-center gap-3 transition-all cursor-pointer hover:border-[#D4AF37]"
        >
          {hasNewPartnerLetters && (
            <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5" title="New letter from partner">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A83232] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A83232] border border-white shadow-xs"></span>
            </span>
          )}
          <div className="wax-seal w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base shrink-0 shadow-xs flex items-center justify-center text-[#F8E3B6]">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8E3B6]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">
              {(() => {
                const u2 = getNickname(pairInfo?.user2?.name) || 'Partner';
                const me = getNickname(currentUser?.displayName);
                return me === u2 ? 'Jay' : u2;
              })()}'s
            </p>
            <p className="text-lg sm:text-2xl font-bold font-serif text-[#36271C]">
              {partnerLetters.length} <span className="text-[10px] sm:text-xs font-normal text-rose-700 font-semibold">waiting</span>
            </p>
          </div>
        </div>

        {/* Our Bucket List Action Card */}
        {onOpenBucketList && (
          <button
            type="button"
            onClick={handleOpenBucketListWithSeen}
            className="relative bg-[#FDFBF7] hover:bg-[#FAF5EC] border border-[#D2C3B0] hover:border-[#D4AF37] p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left cursor-pointer group"
          >
            {hasNewPartnerBucketItems && (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5" title="New wish added by partner">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A83232] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A83232] border border-white shadow-xs"></span>
              </span>
            )}
            <div className="wax-seal w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              ✨
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">Our Bucket List</p>
              <p className="text-sm sm:text-base font-bold font-serif-vintage text-[#36271C] truncate">
                {bucketItems.length > 0 ? `${bucketItems.filter(i => i.isCompleted).length}/${bucketItems.length} Goals` : 'Our Fantasies'}
              </p>
            </div>
          </button>
        )}

        {/* Prayer Request Action Card */}
        {onOpenPrayers && (
          <button
            type="button"
            onClick={handleOpenPrayersWithSeen}
            className="relative bg-[#FDFBF7] hover:bg-[#FAF5EC] border border-[#D2C3B0] hover:border-[#D4AF37] p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left cursor-pointer group"
          >
            {hasNewPrayerActivity && (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5" title="New prayer activity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A83232] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A83232] border border-white shadow-xs"></span>
              </span>
            )}
            <div className="wax-seal w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              🙏
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-[#9E8B75] uppercase font-bold tracking-wider truncate">Prayer Request</p>
              <p className="text-sm sm:text-base font-bold font-serif-vintage text-[#36271C] truncate">
                {(() => {
                  const now = Date.now();
                  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
                  const active = prayers.filter(p => !p.isArchived && (now - new Date(p.createdAtIso || 0).getTime() <= TWENTY_FOUR_HOURS));
                  if (active.length > 0) {
                    return `${active.length} ${active.length === 1 ? 'Request' : 'Requests'}`;
                  }
                  return 'Add Request';
                })()}
              </p>
            </div>
          </button>
        )}

        {/* Write Letter & Timeline Actions Column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
          {/* Write Letter Action Button */}
          <button
            onClick={onWriteNew}
            className="w-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] p-2.5 sm:p-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group border border-[#D4AF37]/50 cursor-pointer"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8B0000] border border-[#F8E3B6]/40 flex items-center justify-center text-[#F8E3B6] group-hover:rotate-12 transition-transform shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#F8E3B6]">Write Letter for Later</span>
          </button>

          {/* Locked Timeline Button directly below Write Letter — matching exact size & height */}
          <button
            type="button"
            onClick={onOpenTimeline}
            disabled={!countdown.isUnlocked}
            className={`w-full p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-center gap-2 border ${
              !countdown.isUnlocked
                ? 'bg-[#EFE9DE]/90 text-[#9E8B75] border-[#D2C3B0]/60 cursor-not-allowed opacity-80'
                : isLettersUnlocked
                  ? 'bg-[#D4AF37] hover:bg-[#AA7C11] text-[#3D2600] border-[#AA7C11]/50 cursor-pointer shadow-md transform hover:-translate-y-0.5'
                  : 'bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border-[#D4AF37]/50 cursor-pointer shadow-md transform hover:-translate-y-0.5'
            }`}
            title={!countdown.isUnlocked ? 'Timeline remains locked until August 6, 2032' : 'View Unlocked Timeline'}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center shrink-0 ${
              !countdown.isUnlocked
                ? 'bg-[#E4DCD0] border-[#D2C3B0] text-[#9E8B75]'
                : isLettersUnlocked
                  ? 'bg-[#AA7C11] border-[#F8E3B6]/40 text-[#F8E3B6]'
                  : 'bg-[#8B0000] border-[#F8E3B6]/40 text-[#F8E3B6]'
            }`}>
              {!countdown.isUnlocked ? (
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isLettersUnlocked ? (
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold truncate">
              {!countdown.isUnlocked 
                ? 'Locked Until The Right Time' 
                : isLettersUnlocked 
                  ? 'Unlocked Timeline' 
                  : 'Reveal All The Letters'}
            </span>
          </button>
        </div>

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
