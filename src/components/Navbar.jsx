import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Lock, 
  LogIn, 
  LogOut, 
  Sparkles, 
  HelpCircle,
  BookOpen,
  Plus,
  Menu,
  X,
  Eye,
  Video,
  Phone,
  MessageCircleHeart,
  ExternalLink,
  FolderHeart,
  ChevronRight
} from 'lucide-react';
import { getCurrentPHT, getCountdownToTarget } from '../utils/pht';
import { getNickname } from '../utils/nicknames';
import { getPresenceInfo } from '../utils/presence';

export default function Navbar({ 
  user, 
  pairInfo, 
  isLettersUnlocked,
  stories = [],
  statuses = {},
  partnerPresence,
  hasSeenStoriesIntro = false,
  unreadMessageCount = 0,
  onOpenAuth, 
  onOpenPairing, 
  onOpenInfo,
  onSignOut,
  onOpenStoryViewer,
  onOpenStoryCreator,
  onOpenStoryArchive,
  onOpenStoryIntro,
  onOpenStatusPicker,
  onOpenStatusDetail,
  onOpenBucketList,
  onOpenCallPrompt,
  onOpenMessenger,
  onOpenKnowMeFacility
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

  // Get partner's photo from their stories, status, or pairInfo
  const partnerPhoto = partnerActiveStories[0]?.authorPhoto 
    || Object.values(statuses || {}).find(s => s.userId !== currentUserId)?.userPhoto
    || pairInfo?.user2?.photo
    || '';

  // Status notes
  const myStatus = statuses?.[currentUserId];
  const partnerStatus = Object.values(statuses || {}).find(s => s.userId !== currentUserId);

  // Check if there are UNSEEN stories for the logged-in user
  const myHasUnseen = myActiveStories.some(s => !(s.viewedBy || []).includes(currentUserId));
  const partnerHasUnseen = partnerActiveStories.some(s => !(s.viewedBy || []).includes(currentUserId));

  // Check if ALL my stories have been seen by partner (only then show the "seen" badge)
  const mySeenByPartner = myActiveStories.length > 0 && myActiveStories.every(s => 
    (s.viewedBy || []).some(id => id !== currentUserId)
  );

  // Check if ANY of my stories have NOT been seen by partner yet (for glow ring)
  const myHasUnseenByPartner = myActiveStories.length > 0 && myActiveStories.some(s => 
    !(s.viewedBy || []).some(id => id !== currentUserId)
  );

  const partnerPresenceInfo = getPresenceInfo(partnerPresence);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F2EB]/95 backdrop-blur-md border-b border-[#E2D7C7] px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="wax-seal w-9 h-9 sm:w-10 sm:h-10 text-base sm:text-lg font-serif font-bold cursor-pointer hover:scale-105 transition-transform shrink-0">
            L
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold font-serif-vintage tracking-tight text-[#36271C]">
              LettersForLater
            </h1>
            <p className="text-[11px] text-[#9E8B75] font-handwriting text-base -mt-1">
              keeping our memories until the right time
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            OUR STORIES NAVBAR HUB (Avatars + Add Story + Memory Log)
           ───────────────────────────────────────────────────────────── */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3.5 bg-[#FAF5EC] border border-[#D2C3B0]/70 py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-xs">
            
            {/* Story Hub Title Label (Desktop) */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#A83232] pr-1.5 border-r border-[#D2C3B0]/60">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Stories</span>
            </div>

            {/* Your Story Avatar Ring + Plus Trigger */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (myActiveStories.length > 0) {
                    onOpenStoryViewer(myActiveStories);
                  } else {
                    onOpenStoryCreator();
                  }
                }}
                className={`relative rounded-full transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center p-[2px] cursor-pointer ${
                  myActiveStories.length > 0 
                    ? myHasUnseenByPartner 
                      ? 'story-ring-glow animate-story-pulse' 
                      : 'border-2 border-[#D2C3B0]'
                    : 'border-2 border-dashed border-[#D2C3B0]/70'
                }`}
                title={
                  myActiveStories.length > 0 
                    ? mySeenByPartner
                      ? `Your stories (${myActiveStories.length}) • Seen by ${partnerName} 💕`
                      : `Your stories (${myActiveStories.length} active) • Tap '+' to add another`
                    : `Post a story for today`
                }
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUserName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white"
                />
              </button>

              {/* Partner Seen Green Eye Badge for Your Story */}
              {mySeenByPartner && (
                <span 
                  className="absolute -top-1 -right-1 bg-emerald-700 text-white rounded-full p-0.5 border border-white shadow-xs z-30 pointer-events-none" 
                  title={`Seen by ${partnerName} 💕`}
                >
                  <Eye className="w-2.5 h-2.5" />
                </span>
              )}

              {/* Dedicated Large Touch-Target Plus Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenStoryCreator();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                }}
                className="absolute -bottom-1 -right-1 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-full w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center border-2 border-white shadow-md transition-all cursor-pointer z-30 touch-manipulation hover:scale-115 active:scale-90 before:content-[''] before:absolute before:-inset-2.5 before:rounded-full"
                title="Add a new story"
                aria-label="Add story"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] text-[#FAF5EC] pointer-events-none" />
              </button>
            </div>

            {/* Partner Story Avatar Ring */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (partnerActiveStories.length > 0) {
                    onOpenStoryViewer(partnerActiveStories);
                  } else {
                    setPartnerNoStoryToast(true);
                    setTimeout(() => setPartnerNoStoryToast(false), 3000);
                  }
                }}
                className={`relative rounded-full transition-transform ${
                  partnerActiveStories.length > 0 ? 'group-hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-pointer'
                } flex items-center justify-center p-[2px] ${
                  partnerActiveStories.length > 0 
                    ? partnerHasUnseen
                      ? 'story-ring-glow animate-story-pulse' 
                      : 'border-2 border-[#D2C3B0]'
                    : 'border-2 border-dashed border-[#D2C3B0] opacity-85'
                }`}
                title={
                  partnerActiveStories.length > 0 
                    ? partnerHasUnseen 
                      ? `✨ ${partnerName} posted a new story! (${partnerPresenceInfo.detailText})` 
                      : `View ${partnerName}'s Story (${partnerPresenceInfo.detailText})`
                    : `${partnerName}: ${partnerPresenceInfo.detailText}`
                }
              >
                {partnerPhoto ? (
                  <img
                    src={partnerPhoto}
                    alt={partnerName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-100 border border-white flex items-center justify-center text-rose-800 font-bold text-xs">
                    {partnerName.charAt(0)}
                  </div>
                )}
              </button>

              {/* Partner Live Online Presence Dot */}
              <div 
                className="absolute -top-0.5 -right-0.5 z-30 pointer-events-none"
                title={`${partnerName}: ${partnerPresenceInfo.detailText}`}
              >
                {partnerPresenceInfo.isOnline ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-xs"></span>
                  </span>
                ) : (
                  <span 
                    className="inline-flex rounded-full h-2.5 w-2.5 bg-stone-400/90 border border-white shadow-2xs" 
                    title={`${partnerName}: ${partnerPresenceInfo.detailText}`}
                  />
                )}
              </div>

              {/* Partner No Story Mini Popup / Tooltip */}
              {partnerNoStoryToast && (
                <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-[#36271C] text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] py-1 px-2.5 rounded-xl shadow-xl whitespace-nowrap z-50 animate-fadeIn pointer-events-none">
                  {partnerName} hasn't posted a story today yet 💕
                </div>
              )}
            </div>

              {/* Memory Log / Story Archive Circular Button */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={onOpenStoryArchive}
                  className="relative p-0.5 rounded-full transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-dashed border-[#D2C3B0] hover:border-[#A83232] cursor-pointer"
                  title="View private Story Archive & Memory Log"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-white flex items-center justify-center text-[#A83232] transition-colors shadow-xs">
                    <BookOpen className="w-4 h-4 text-[#A83232]" />
                  </div>
                </button>
              </div>

              {/* Call Partner Button */}
            {onOpenCallPrompt && (
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={onOpenCallPrompt}
                  className="relative p-0.5 rounded-full transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-[#D4AF37] hover:border-[#A83232] cursor-pointer"
                  title={`Call ${partnerName} • ${partnerPresenceInfo.badgeText}`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#A83232] to-[#8B0000] hover:brightness-110 border border-white flex items-center justify-center text-[#F8E3B6] transition-all shadow-xs relative">
                    <Video className="w-4 h-4 text-[#F8E3B6]" />
                    {partnerPresenceInfo.isOnline && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white shadow-2xs" />
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Couple Messenger / Chat Sanctuary Button */}
            {onOpenMessenger && (
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={onOpenMessenger}
                  className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center border-2 cursor-pointer ${
                    unreadMessageCount > 0 
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/60' 
                      : 'border-[#D4AF37] hover:border-[#A83232]'
                  }`}
                  title={unreadMessageCount > 0 ? `Chat with ${partnerName} (${unreadMessageCount} new message${unreadMessageCount === 1 ? '' : 's'})` : `Chat Sanctuary with ${partnerName}`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#A83232] to-[#8B0000] hover:brightness-110 border border-white flex items-center justify-center text-[#F8E3B6] transition-all shadow-xs relative">
                    <MessageCircleHeart className="w-4 h-4 text-[#F8E3B6]" />
                    
                    {/* Pulsing Notification Dot / Badge */}
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-85"></span>
                        <span className="relative inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#D4AF37] text-[#36271C] text-[9px] font-mono font-bold border border-white shadow-xs">
                          {unreadMessageCount}
                        </span>
                      </span>
                    )}
                  </div>
                </button>
              </div>
            )}

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

          {/* Auth Button / Mobile Hamburger Menu */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all shadow-xs cursor-pointer touch-manipulation active:scale-95 ${
                  isProfileOpen
                    ? 'bg-[#A83232] text-[#F8E3B6] border-[#D4AF37]/60 shadow-md'
                    : 'bg-[#FAF5EC] hover:bg-[#EFE9DE] border-[#D2C3B0] text-[#36271C] hover:scale-105'
                }`}
                title="Open Menu"
                aria-label="Toggle navigation menu"
              >
                {isProfileOpen ? (
                  <X className="w-4 h-4 text-[#F8E3B6]" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#36271C]" />
                )}
              </button>

              {/* Profile Dropdown Drawer */}
              {isProfileOpen && (
                <>
                  {/* Backdrop Dismiss */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 w-64 bg-[#FDFBF7] border border-[#E2D7C7] rounded-2xl shadow-2xl p-4 text-xs z-50 animate-fadeIn">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#EFE9DE]">
                      <img
                        src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#36271C] truncate">{getNickname(user.displayName)}</p>
                        <p className="text-[#9E8B75] truncate text-[11px]">{user.email}</p>
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

                    {/* Navigation Menu Items (Clean Grouped List) */}
                    <div className="pt-2 space-y-0.5">
                      {/* Our Little Book of Us */}
                      {onOpenKnowMeFacility && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onOpenKnowMeFacility();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[#36271C] hover:bg-[#FAF5EC] hover:text-[#A83232] transition-colors cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#FAF5EC] group-hover:bg-[#EFE9DE] border border-[#E2D7C7] flex items-center justify-center text-sm shadow-2xs shrink-0">
                              📖
                            </div>
                            <span className="font-medium truncate">Our Book of Us</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#A69784] group-hover:text-[#A83232] transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </button>
                      )}

                      {/* Chat Sanctuary */}
                      {onOpenMessenger && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onOpenMessenger();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[#36271C] hover:bg-[#FAF5EC] hover:text-[#A83232] transition-colors cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#FAF5EC] group-hover:bg-[#EFE9DE] border border-[#E2D7C7] flex items-center justify-center text-[#A83232] shadow-2xs shrink-0">
                              <MessageCircleHeart className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium truncate">Chat Sanctuary</span>
                          </div>
                          {unreadMessageCount > 0 ? (
                            <span className="bg-[#A83232] text-[#F8E3B6] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-2xs shrink-0">
                              {unreadMessageCount} new
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#A69784] group-hover:text-[#A83232] transition-transform group-hover:translate-x-0.5 shrink-0" />
                          )}
                        </button>
                      )}

                      {/* Call Partner */}
                      {onOpenCallPrompt && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            onOpenCallPrompt();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[#36271C] hover:bg-[#FAF5EC] hover:text-[#A83232] transition-colors cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#FAF5EC] group-hover:bg-[#EFE9DE] border border-[#E2D7C7] flex items-center justify-center text-[#A83232] shadow-2xs shrink-0">
                              <Video className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium truncate">Call {partnerName}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#A69784] group-hover:text-[#A83232] transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </button>
                      )}

                      {/* How It Works & Info */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenInfo();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[#36271C] hover:bg-[#FAF5EC] hover:text-[#A83232] transition-colors cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF5EC] group-hover:bg-[#EFE9DE] border border-[#E2D7C7] flex items-center justify-center text-[#A83232] shadow-2xs shrink-0">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium truncate">How It Works & Info</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A69784] group-hover:text-[#A83232] transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>

                      {/* Google Drive Link */}
                      <a
                        href="https://drive.google.com/drive/folders/16zf1NeDt3F-OJDSGYYnbUpxCTf-VazB1?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[#36271C] hover:bg-[#FAF5EC] hover:text-[#A83232] transition-colors cursor-pointer group no-underline text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF5EC] group-hover:bg-[#EFE9DE] border border-[#E2D7C7] flex items-center justify-center text-[#A83232] shadow-2xs shrink-0">
                            <FolderHeart className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium truncate">Open Google Drive</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#A69784] group-hover:text-[#A83232] shrink-0" />
                      </a>
                    </div>

                    {/* Sign Out Row */}
                    <div className="pt-2 mt-2 border-t border-[#EFE9DE]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/70 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
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
