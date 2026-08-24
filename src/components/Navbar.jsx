import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Lock, 
  LogIn, 
  LogOut, 
  Sparkles, 
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { getCurrentPHT, getCountdownToTarget } from '../utils/pht';
import { getNickname } from '../utils/nicknames';

export default function Navbar({ 
  user, 
  pairInfo, 
  isLettersUnlocked,
  stories = [],
  hasSeenStoriesIntro = false,
  onOpenAuth, 
  onOpenPairing, 
  onOpenInfo,
  onSignOut,
  onOpenStoryViewer,
  onOpenStoryCreator,
  onOpenStoryArchive,
  onOpenStoryIntro
}) {
  const [phtTime, setPhtTime] = useState(getCurrentPHT().fullString);
  const [countdown, setCountdown] = useState(getCountdownToTarget(pairInfo?.targetUnlockDate));
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [partnerNoStoryToast, setPartnerNoStoryToast] = useState(false);

  // Live PHT Clock & Countdown Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setPhtTime(getCurrentPHT().fullString);
      setCountdown(getCountdownToTarget(pairInfo?.targetUnlockDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [pairInfo]);

  // Compute active (non-expired <24h) stories
  const now = Date.now();
  const activeStories = stories.filter(s => {
    if (!s.expiresAtIso) return true;
    return new Date(s.expiresAtIso).getTime() > now;
  });

  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = getNickname(user?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  const myActiveStories = activeStories.filter(s => s.authorId === currentUserId);
  const partnerActiveStories = activeStories.filter(s => s.authorId !== currentUserId);

  // Check if there are UNSEEN stories for the logged-in user
  const myHasUnseen = myActiveStories.some(s => !(s.viewedBy || []).includes(currentUserId));
  const partnerHasUnseen = partnerActiveStories.some(s => !(s.viewedBy || []).includes(currentUserId));

  return (
    <header className="sticky top-0 z-40 bg-[#F6F2EB]/95 backdrop-blur-md border-b border-[#E2D7C7] px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="wax-seal w-9 h-9 sm:w-10 sm:h-10 text-base sm:text-lg font-serif font-bold cursor-pointer hover:scale-105 transition-transform shrink-0">
            L
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold font-serif-vintage tracking-tight text-[#36271C]">
              LettersForLater
            </h1>
            <p className="text-[11px] text-[#9E8B75] hidden md:block font-handwriting text-base -mt-1">
              keeping our memories until the right time
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            OUR STORIES NAVBAR HUB (Avatars + Add Story + Memory Log)
           ───────────────────────────────────────────────────────────── */}
        {user && (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-[#FAF5EC] border border-[#D2C3B0]/70 py-1 px-2 sm:px-3.5 rounded-full shadow-xs">
            
            {/* Story Hub Title Label (Desktop) */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#A83232] pr-1 border-r border-[#D2C3B0]/60">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Our Stories</span>
            </div>

            {/* Jay / Current User Story Avatar Ring */}
            <div className="relative group">
              {/* Attention Glow Badge for first-time / new feature indicator */}
              {!hasSeenStoriesIntro && (
                <span className="absolute -top-1.5 -left-1.5 flex h-3.5 w-3.5 pointer-events-none z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#A83232] border-2 border-white shadow-sm"></span>
                </span>
              )}

              <button
                onClick={() => {
                  if (myActiveStories.length > 0) {
                    onOpenStoryViewer(myActiveStories);
                  } else {
                    onOpenStoryCreator();
                  }
                }}
                className={`relative p-0.5 rounded-full transition-all group-hover:scale-105 active:scale-95 flex items-center justify-center ${
                  !hasSeenStoriesIntro
                    ? 'first-time-feature-glow ring-4 ring-[#D4AF37] ring-offset-2 ring-offset-[#FAF5EC] p-[2px]'
                    : myActiveStories.length > 0 
                      ? myHasUnseen
                        ? 'story-ring-glow animate-story-pulse p-[2px]' 
                        : 'border-2 border-[#D4AF37] ring-1 ring-[#D4AF37]/30 p-[1px]'
                      : 'border-2 border-dashed border-[#D4AF37]/70 p-[1px]'
                }`}
                title={
                  !hasSeenStoriesIntro
                    ? '✨ Tap to discover Our Daily Stories!'
                    : myActiveStories.length > 0 
                      ? `View your stories (${myActiveStories.length} active) • Tap '+' to add another`
                      : `Post a story for today`
                }
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUserName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white"
                />
              </button>

              {/* Dedicated Mini Plus Button (Always accessible on your avatar to add another story!) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStoryCreator();
                }}
                className={`absolute -bottom-0.5 -right-0.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center border border-white text-[9px] sm:text-[10px] font-bold shadow-xs transition-transform cursor-pointer z-10 ${
                  !hasSeenStoriesIntro ? 'animate-bounce shadow-md scale-110 ring-2 ring-[#D4AF37]' : 'hover:scale-115 active:scale-90'
                }`}
                title="Add another story"
              >
                +
              </button>
            </div>

            {/* Partner Story Avatar Ring */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (partnerActiveStories.length > 0) {
                    onOpenStoryViewer(partnerActiveStories);
                  } else {
                    // Partner has no active stories — show friendly toast
                    setPartnerNoStoryToast(true);
                    setTimeout(() => setPartnerNoStoryToast(false), 3000);
                  }
                }}
                className={`relative p-0.5 rounded-full transition-transform ${
                  partnerActiveStories.length > 0 ? 'group-hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-pointer'
                } flex items-center justify-center ${
                  partnerActiveStories.length > 0 
                    ? partnerHasUnseen
                      ? 'story-ring-glow animate-story-pulse p-[2px]' 
                      : 'border-2 border-[#D4AF37] ring-1 ring-[#D4AF37]/30 p-[1px]'
                    : 'border-2 border-dashed border-[#D2C3B0] opacity-85 p-[1px]'
                }`}
                title={
                  partnerActiveStories.length > 0 
                    ? partnerHasUnseen 
                      ? `✨ ${partnerName} posted a new story! (Tap to view)` 
                      : `View ${partnerName}'s Story`
                    : `${partnerName} has not posted a story today yet`
                }
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 border border-white flex items-center justify-center text-rose-800 font-bold text-xs">
                  {partnerName.charAt(0)}
                </div>
              </button>

              {/* Partner No Story Mini Popup / Tooltip */}
              {partnerNoStoryToast && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#36271C] text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] py-1 px-2.5 rounded-xl shadow-xl whitespace-nowrap z-50 animate-fadeIn pointer-events-none">
                  {partnerName} hasn't posted a story today yet 💕
                </div>
              )}
            </div>

            {/* Memory Log / Story Archive Circular Button */}
            <div className="relative group">
              <button
                onClick={onOpenStoryArchive}
                className="relative p-0.5 rounded-full transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-dashed border-[#D2C3B0] hover:border-[#A83232] p-[1px]"
                title="View private Story Archive & Memory Log"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-white flex items-center justify-center text-[#A83232] transition-colors shadow-xs">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A83232]" />
                </div>
              </button>
            </div>

          </div>
        )}

        {/* Live PHT Time & 2032 Countdown Badges (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* PHT Clock */}
          <div className="flex items-center gap-2 bg-[#EFE9DE] border border-[#E2D7C7] px-3 py-1.5 rounded-full text-xs font-mono text-[#4A3B2C] shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{phtTime}</span>
          </div>

          {/* Countdown Pill */}
          <div className="flex items-center gap-2 bg-[#FAF5EC] border border-[#D4AF37]/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#8B0000] shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37] animate-lock-pulse" />
            <span>
              {countdown.isUnlocked ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Vault Unlocked!
                </span>
              ) : (
                <span>
                  Unlock in <strong className="font-mono text-sm text-[#4A1010]">{countdown.years}y {countdown.days}d</strong>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* User & Pair Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* How It Works Info Button */}
          <button
            onClick={onOpenInfo}
            className="flex items-center gap-1 bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#D2C3B0] text-[#A83232] px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            title="How this works in the future"
          >
            <HelpCircle className="w-4 h-4 text-[#A83232]" />
            <span className="hidden xl:inline">Info</span>
          </button>
          
          {/* Wedding Hashtag / Sealed Status Pill */}
          <button
            onClick={isLettersUnlocked ? onOpenPairing : undefined}
            disabled={!isLettersUnlocked}
            className={`hidden sm:flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg transition-colors shadow-sm ${
              isLettersUnlocked
                ? 'bg-[#FDFBF7] hover:bg-[#EFE9DE] border-[#D2C3B0] text-[#36271C] cursor-pointer'
                : 'bg-[#FAF5EC] border-[#E2D7C7] text-[#6E1A1A] cursor-default opacity-85'
            }`}
            title={isLettersUnlocked ? "Wedding Hashtag: #JayFinallyGotAKiss" : "Sealed Until Unlocked in 2032"}
          >
            {isLettersUnlocked ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-mono font-bold tracking-wider text-[#A83232] text-xs">
                  {pairInfo?.code || '#JayFinallyGotAKiss'}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-mono text-[11px] font-bold text-[#6E1A1A]">
                  Sealed
                </span>
              </>
            )}
          </button>

          {/* Auth Button / Profile Avatar */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border-2 border-[#D4AF37] hover:scale-105 transition-transform bg-[#FDFBF7]"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              </button>

              {/* Profile Dropdown Drawer */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FDFBF7] border border-[#E2D7C7] rounded-xl shadow-xl p-4 text-xs z-50 animate-fadeIn">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#EFE9DE]">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm text-[#36271C]">{getNickname(user.displayName)}</p>
                      <p className="text-[#9E8B75] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-3 space-y-2 border-b border-[#EFE9DE]">
                    <div className="flex items-center justify-between text-[#4A3B2C]">
                      <span>Pair Status:</span>
                      <span className="font-mono font-bold text-[#A83232]">{pairInfo?.code}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#4A3B2C]">
                      <span>Timezone:</span>
                      <span className="font-mono text-[10px] bg-[#EFE9DE] px-1.5 py-0.5 rounded">PHT (GMT+8)</span>
                    </div>
                    <div className="flex items-center justify-between text-[#4A3B2C]">
                      <span>Logged Stories:</span>
                      <span className="font-mono text-[11px] font-bold text-[#A83232]">{stories.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 px-3 bg-[#FAF5EC] hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
