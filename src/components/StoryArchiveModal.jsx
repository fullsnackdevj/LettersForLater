import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Heart, 
  Plus, 
  Layers, 
  Eye, 
  Calendar, 
  Grid, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

// Date helper for Manila / PHT timezone
function getStoryDateInfo(story) {
  let date;
  if (story.createdAtIso) {
    date = new Date(story.createdAtIso);
  } else if (story.createdAtPHT) {
    const rawDatePart = story.createdAtPHT.split(' • ')[0];
    date = new Date(rawDatePart);
  } else {
    date = new Date();
  }
  if (isNaN(date.getTime())) date = new Date();

  const year = date.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'Asia/Manila' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'Asia/Manila' });
  const monthShort = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Manila' });
  const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${monthName} ${year}`;
  const monthShortLabel = `${monthShort} ${year}`;
  const dayKey = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const dayLabel = date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    timeZone: 'Asia/Manila' 
  });

  return { date, year, monthKey, monthLabel, monthShortLabel, dayKey, dayLabel };
}

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
  const [timelineScope, setTimelineScope] = useState('all'); // 'years' | 'months' | 'all'
  const [selectedMonthKey, setSelectedMonthKey] = useState('all'); // 'all' | 'YYYY-MM'
  const [selectedYearKey, setSelectedYearKey] = useState('all'); // 'all' | 'YYYY'

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // 1. Author filtering
  const authorFilteredStories = useMemo(() => {
    return stories.filter(story => {
      if (filterAuthor === 'me' && story.authorId !== currentUserId) return false;
      if (filterAuthor === 'partner' && story.authorId === currentUserId) return false;
      return true;
    });
  }, [stories, filterAuthor, currentUserId]);

  const myStoriesCount = stories.filter(s => s.authorId === currentUserId).length;
  const partnerStoriesCount = stories.filter(s => s.authorId !== currentUserId).length;

  // 2. Compute available Months for quick-jump pill bar
  const availableMonths = useMemo(() => {
    const map = new Map();
    authorFilteredStories.forEach(story => {
      const { monthKey, monthShortLabel, year } = getStoryDateInfo(story);
      if (!map.has(monthKey)) {
        map.set(monthKey, { monthKey, monthShortLabel, year, count: 0 });
      }
      map.get(monthKey).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [authorFilteredStories]);

  // 3. Month Groups calculation for 'months' view
  const monthGroups = useMemo(() => {
    const map = new Map();
    authorFilteredStories.forEach(story => {
      const { monthKey, monthLabel, year } = getStoryDateInfo(story);
      if (selectedYearKey !== 'all' && year !== selectedYearKey) return;

      if (!map.has(monthKey)) {
        map.set(monthKey, { 
          monthKey, 
          monthLabel, 
          year, 
          items: [] 
        });
      }
      map.get(monthKey).items.push(story);
    });

    return Array.from(map.values())
      .map(g => ({
        ...g,
        count: g.items.length,
        coverPhoto: g.items.find(s => s.mediaUrl)?.mediaUrl || g.items[0]?.mediaUrl || '',
        previewPhotos: g.items.filter(s => s.mediaUrl).slice(0, 3),
        moods: Array.from(new Set(g.items.map(s => s.moodTag).filter(Boolean))).slice(0, 4)
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [authorFilteredStories, selectedYearKey]);

  // 4. Year Groups calculation for 'years' view
  const yearGroups = useMemo(() => {
    const map = new Map();
    authorFilteredStories.forEach(story => {
      const { year } = getStoryDateInfo(story);
      if (!map.has(year)) {
        map.set(year, { year, items: [] });
      }
      map.get(year).items.push(story);
    });

    return Array.from(map.values())
      .map(g => ({
        year: g.year,
        count: g.items.length,
        coverPhoto: g.items.find(s => s.mediaUrl)?.mediaUrl || g.items[0]?.mediaUrl || '',
        previewPhotos: g.items.filter(s => s.mediaUrl).slice(0, 4),
        moods: Array.from(new Set(g.items.map(s => s.moodTag).filter(Boolean))).slice(0, 5)
      }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [authorFilteredStories]);

  // 5. Filtered snapshots in 'all' view
  const displayedSnapshots = useMemo(() => {
    if (selectedMonthKey === 'all') return authorFilteredStories;
    return authorFilteredStories.filter(s => getStoryDateInfo(s).monthKey === selectedMonthKey);
  }, [authorFilteredStories, selectedMonthKey]);

  // 6. Group displayed snapshots by Date Day Header for clear readable sections
  const daySections = useMemo(() => {
    const map = new Map();
    displayedSnapshots.forEach(story => {
      const { dayKey, dayLabel } = getStoryDateInfo(story);
      if (!map.has(dayKey)) {
        map.set(dayKey, { dayKey, dayLabel, items: [] });
      }
      map.get(dayKey).items.push(story);
    });
    return Array.from(map.values()).sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  }, [displayedSnapshots]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-4xl bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ─────────────────────────────────────────────────────────────
            HEADER (Brand + Title + Close)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-[#E2D7C7] bg-[#FAF5EC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-10 h-10 text-sm shadow-md">
              📸
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-2xl text-[#36271C] leading-tight">
                Our Stories <span className="text-[#A83232] font-serif font-normal text-base sm:text-xl">• Memory Log</span>
              </h2>
              <p className="text-xs text-[#9E8B75] font-handwriting text-base sm:text-lg -mt-0.5">
                Every snapshot and emoji moment preserved privately for the two of you
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CLEAN UNIFIED TOOLBAR (Author Tabs + Timeline Scope)
           ───────────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FAF5EC] border-b border-[#E2D7C7] flex items-center justify-between gap-3 shrink-0">
          
          {/* Left: Author Filter Segmented Tabs */}
          <div className="flex items-center gap-1 bg-[#EFE9DE] p-1 rounded-2xl border border-[#D2C3B0]/70 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterAuthor('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterAuthor === 'all'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>Together</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterAuthor === 'all' ? 'bg-[#5A4535] text-[#FDFBF7]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {stories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterAuthor('me')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                filterAuthor === 'me'
                  ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{currentUserName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterAuthor === 'me' ? 'bg-[#8B0000] text-[#F8E3B6]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {myStoriesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterAuthor('partner')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                filterAuthor === 'partner'
                  ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <span>{partnerName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterAuthor === 'partner' ? 'bg-[#AA7C11] text-white' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>
                {partnerStoriesCount}
              </span>
            </button>
          </div>

          {/* Right: iOS Gallery Scope Switcher [ Years | Months | Days ] */}
          <div className="flex items-center gap-0.5 bg-[#EFE9DE] p-1 rounded-2xl border border-[#D2C3B0]/70 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setTimelineScope('years');
                setSelectedYearKey('all');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timelineScope === 'years'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              Years
            </button>

            <button
              type="button"
              onClick={() => {
                setTimelineScope('months');
                setSelectedYearKey('all');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timelineScope === 'months'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              Months
            </button>

            <button
              type="button"
              onClick={() => {
                setTimelineScope('all');
                setSelectedMonthKey('all');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                timelineScope === 'all'
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Days</span>
            </button>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN GALLERY CONTENT (Dynamic based on Scope: Years, Months, All)
           ───────────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* ─────────────────────────────────────────────────────────
              VIEW 1: YEARS OVERVIEW (iOS Style)
             ───────────────────────────────────────────────────────── */}
          {timelineScope === 'years' && (
            <div className="space-y-4 animate-fadeIn py-4 sm:py-6">
              {yearGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {yearGroups.map((group) => (
                    <div
                      key={group.year}
                      onClick={() => {
                        setSelectedYearKey(group.year);
                        setTimelineScope('months');
                      }}
                      className="group bg-[#FAF5EC] border border-[#E2D7C7] hover:border-[#D4AF37] rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                    >
                      {/* Photo Collage Preview */}
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#2D1F15] mb-3.5">
                        {group.coverPhoto ? (
                          <img
                            src={group.coverPhoto}
                            alt={`${group.year} highlights`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl bg-[#FAF5EC]">
                            📸
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <h3 className="text-2xl font-bold font-serif-vintage tracking-tight">
                                {group.year}
                              </h3>
                              <p className="text-xs text-[#F8E3B6] font-mono">
                                {group.count} {group.count === 1 ? 'snapshot' : 'snapshots'} logged
                              </p>
                            </div>

                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#A83232] transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini highlights footer */}
                      <div className="flex items-center justify-between text-xs text-[#7A6855] px-1">
                        <div className="flex items-center gap-1 text-base">
                          {group.moods.map((emoji, i) => (
                            <span key={i}>{emoji}</span>
                          ))}
                        </div>
                        <span className="font-bold text-[#A83232] flex items-center gap-0.5 group-hover:underline">
                          <span>Explore Year</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#9E8B75]">
                  <p>No snapshots found for this selection.</p>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              VIEW 2: MONTHS OVERVIEW (iOS Style)
             ───────────────────────────────────────────────────────── */}
          {timelineScope === 'months' && (
            <div className="space-y-4 animate-fadeIn py-4 sm:py-6">
              {selectedYearKey !== 'all' && (
                <div className="flex items-center justify-between pb-2 border-b border-[#E2D7C7]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYearKey('all');
                      setTimelineScope('years');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A83232] hover:text-[#8B0000] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Years</span>
                  </button>
                  <span className="font-serif-vintage font-bold text-sm text-[#36271C]">
                    Year: {selectedYearKey}
                  </span>
                </div>
              )}

              {monthGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                  {monthGroups.map((group) => (
                    <div
                      key={group.monthKey}
                      onClick={() => {
                        setSelectedMonthKey(group.monthKey);
                        setTimelineScope('all');
                      }}
                      className="group bg-[#FAF5EC] border border-[#E2D7C7] hover:border-[#D4AF37] rounded-3xl p-3.5 shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col"
                    >
                      {/* Photo Collage Preview */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#2D1F15] mb-3">
                        {group.coverPhoto ? (
                          <img
                            src={group.coverPhoto}
                            alt={group.monthLabel}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#FAF5EC]">
                            📸
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3">
                          <span className="text-[10px] font-mono text-[#F8E3B6] font-bold">
                            {group.count} {group.count === 1 ? 'memory' : 'memories'}
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif-vintage font-bold text-base text-[#36271C] group-hover:text-[#A83232] transition-colors">
                            {group.monthLabel}
                          </h4>
                          <div className="flex items-center gap-1 text-sm mt-0.5">
                            {group.moods.map((m, i) => (
                              <span key={i}>{m}</span>
                            ))}
                          </div>
                        </div>

                        <span className="w-7 h-7 rounded-full bg-white border border-[#D2C3B0] flex items-center justify-center text-[#A83232] group-hover:bg-[#A83232] group-hover:text-white transition-colors shadow-2xs">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#9E8B75]">
                  <p>No snapshots found for this selection.</p>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              VIEW 3: ALL DETAILED SNAPSHOTS (Grouped by Date Headers)
             ───────────────────────────────────────────────────────── */}
          {timelineScope === 'all' && (
            <div className="space-y-6 animate-fadeIn py-4 sm:py-6">
              
              {/* Selected Month Header Banner when filtered */}
              {selectedMonthKey !== 'all' && (
                <div className="flex items-center justify-between bg-[#EFE9DE] border border-[#D2C3B0] px-4 py-2 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A83232]" />
                    <span className="font-serif-vintage font-bold text-sm text-[#36271C]">
                      Filtered: {availableMonths.find(m => m.monthKey === selectedMonthKey)?.monthShortLabel || selectedMonthKey}
                    </span>
                    <span className="text-xs text-[#7A6855] font-mono">
                      ({displayedSnapshots.length} {displayedSnapshots.length === 1 ? 'snapshot' : 'snapshots'})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMonthKey('all')}
                    className="text-xs font-bold text-[#A83232] hover:text-[#8B0000] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Months</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {displayedSnapshots.length > 0 ? (
                daySections.map((section) => (
                  <div key={section.dayKey} className="space-y-3">
                    
                    {/* Sticky Date Section Header */}
                    <div className="flex items-center gap-2 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md py-2 -mx-4 sm:-mx-6 px-4 sm:px-6 z-10 border-b border-[#E2D7C7]/60">
                      <Calendar className="w-3.5 h-3.5 text-[#A83232]" />
                      <h3 className="font-serif-vintage font-bold text-sm text-[#36271C]">
                        {section.dayLabel}
                      </h3>
                      <span className="text-[10px] font-mono text-[#9E8B75] bg-[#EFE9DE] px-2 py-0.5 rounded-full">
                        {section.items.length}
                      </span>
                    </div>

                    {/* Snapshots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                      {section.items.map((story) => {
                        const totalReactions = Object.values(story.reactions || {}).reduce(
                          (sum, r) => sum + (r.count || 0), 
                          0
                        );

                        const isStillActive = story.expiresAtIso 
                          ? new Date(story.expiresAtIso).getTime() > Date.now() 
                          : false;

                        const isMine = story.authorId === currentUserId;
                        const isSeenByPartner = (story.viewedBy || []).some(id => id !== story.authorId);

                        // Find overall index in displayedSnapshots for viewer
                        const snapshotIndex = displayedSnapshots.findIndex(s => s.id === story.id);

                        return (
                          <div
                            key={story.id}
                            onClick={() => onSelectStory(story, displayedSnapshots, snapshotIndex >= 0 ? snapshotIndex : 0)}
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

                              {/* Partner Seen Badge */}
                              {isMine && isSeenByPartner && (
                                <div 
                                  className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/60 shadow-xs backdrop-blur-xs flex items-center gap-1 z-10"
                                  title={`Seen by ${partnerName} 💕`}
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span className="hidden sm:inline">Seen</span>
                                </div>
                              )}

                              {/* Active 24h Badge */}
                              {isStillActive && (
                                <div className="absolute top-2 right-2 bg-[#A83232]/95 text-[#F8E3B6] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/50 shadow-sm backdrop-blur-xs flex items-center gap-1 z-10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Active</span>
                                </div>
                              )}

                              {/* Reactions Pill */}
                              {totalReactions > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
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
                                {story.createdAtPHT ? story.createdAtPHT.split(', ')[1]?.split(' • ')[0] || 'Today' : 'Snapshot'}
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))
              ) : (
                /* Empty State */
                <div className="bg-[#FAF5EC]/70 border-2 border-dashed border-[#D2C3B0] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6 space-y-4">
                  <div className="wax-seal w-16 h-16 mx-auto text-2xl shadow-lg">
                    📸
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                      No Snapshots in this Period
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A6855] font-handwriting text-lg sm:text-xl max-w-sm mx-auto leading-relaxed">
                      Every 24-hour photo snapshot you share together will be safely preserved here in this private log forever.
                    </p>
                  </div>

                  {onOpenCreateStory && (
                    <button
                      type="button"
                      onClick={onOpenCreateStory}
                      className="inline-flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold px-5 py-2.5 rounded-full shadow-md border border-[#D4AF37]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Share First Snapshot</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
           ───────────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC] flex justify-between items-center text-xs text-[#9E8B75] shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-[#A83232]" />
            <span>Total Memories: <strong className="font-mono text-[#36271C] font-bold">{authorFilteredStories.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateStory && (
              <button
                type="button"
                onClick={onOpenCreateStory}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Snapshot</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#36271C] text-[#F8E3B6] font-bold text-xs hover:bg-[#4A3B2C] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

