import React, { useRef, useEffect } from 'react';
import { 
  FileText,
  Eye, 
  ScrollText
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { getPresenceInfo } from '../utils/presence';

export default function CoupleStatusBanner({
  user,
  pairInfo,
  statuses = {},
  statusHistory = [],
  partnerPresence,
  onOpenStatusPicker,
  onOpenStatusDetail,
  onOpenCallPrompt,
  onOpenStatusHistory
}) {
  if (!user) return null;

  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = getNickname(user?.displayName) || 'Jay';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  const myStatus = statuses?.[currentUserId];
  const partnerStatus = Object.values(statuses || {}).find(s => s.userId !== currentUserId);

  const getTimeAgo = (isoString) => {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const partnerSeen = partnerStatus?.viewedBy?.includes(currentUserId);
  const isPartnerStatusUnseen = Boolean(
    partnerStatus && 
    Array.isArray(partnerStatus.viewedBy) && 
    !partnerStatus.viewedBy.includes(currentUserId)
  );

  const isMyStatusUnseen = Boolean(
    myStatus &&
    Array.isArray(myStatus.viewedBy) &&
    !myStatus.viewedBy.includes(currentUserId)
  );

  const myStatusSeen = myStatus?.viewedBy?.some(id => id !== currentUserId);

  const scrollContainerRef = useRef(null);

  // Auto-scroll to partner card if unseen
  useEffect(() => {
    if (isPartnerStatusUnseen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [isPartnerStatusUnseen]);

  const unreadHistoryCount = (statusHistory || []).filter(
    n => n.userId !== currentUserId && !n.viewedBy?.includes(currentUserId)
  ).length;

  return (
    <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] py-2 px-2.5 sm:px-4 select-none shadow-xs overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Horizontal Snap Carousel with Peek Effect */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2.5 sm:gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-0.5 items-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          
          {/* ─────────────────────────────────────────────────────────────
              CARD 1: PARTNER'S LIVE NOTE (PEEK CAROUSEL)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-[86%] sm:w-[90%] md:w-[92%] shrink-0 snap-start">
            <div 
              onClick={() => {
                if (partnerStatus) onOpenStatusDetail(partnerStatus);
              }}
              className={`w-full bg-white/95 hover:bg-white border rounded-2xl p-2 sm:p-2.5 shadow-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                isPartnerStatusUnseen 
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/70 bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5F5]'
                  : 'border-[#D2C3B0] hover:border-[#A83232]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                
                {/* Compact Note Icon */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${
                    isPartnerStatusUnseen
                      ? 'story-ring-glow animate-story-pulse p-[2px]'
                      : 'bg-[#EAF3EC] border border-[#D5E7DA]'
                  }`}>
                    <div className="w-full h-full rounded-xl bg-[#EAF3EC] flex items-center justify-center text-[#2D6A4F]">
                      <FileText className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                  </div>
                  {partnerSeen && !isPartnerStatusUnseen && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-700 text-white rounded-full p-0.5 border border-white shadow-xs" title="Seen by you">
                      <Eye className="w-2 h-2" />
                    </span>
                  )}
                </div>

                {/* Compact Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-none mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#A83232] uppercase tracking-wider truncate">
                      {partnerName}'s Live Note
                    </span>
                    
                    {/* Partner Presence Badge */}
                    {(() => {
                      const presenceInfo = getPresenceInfo(partnerPresence);
                      return presenceInfo.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#9E8B75] shrink-0">
                          • {presenceInfo.badgeText}
                        </span>
                      );
                    })()}

                    {isPartnerStatusUnseen && (
                      <span className="text-[8px] bg-[#A83232] text-[#F8E3B6] border border-[#D4AF37] px-1 py-0.2 rounded-full font-bold shadow-xs animate-bounce shrink-0">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-[#36271C] truncate leading-tight">
                    {partnerStatus?.customNote || partnerStatus?.statusText || `${partnerName} hasn't shared a note yet`}
                  </p>

                  {partnerStatus?.lastCheer && (
                    <p className="text-[10px] text-[#A83232] font-semibold flex items-center gap-1 truncate -mt-0.5">
                      <span>💬</span>
                      <span className="truncate">
                        {partnerStatus.lastCheer.fromId === currentUserId ? 'You:' : `${getNickname(partnerStatus.lastCheer.fromName) || partnerName}:`} "{partnerStatus.lastCheer.text}"
                      </span>
                    </p>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CARD 2: YOUR LIVE NOTE (PEEK CAROUSEL)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-[86%] sm:w-[90%] md:w-[92%] shrink-0 snap-start">
            <div 
              onClick={() => {
                if (myStatus) onOpenStatusDetail(myStatus);
                else onOpenStatusPicker();
              }}
              className={`w-full bg-white/95 hover:bg-white border rounded-2xl p-2 sm:p-2.5 shadow-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                isMyStatusUnseen
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/70 bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5F5]'
                  : 'border-[#D2C3B0] hover:border-[#A83232]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                
                {/* Compact Note Icon */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${
                    isMyStatusUnseen
                      ? 'story-ring-glow animate-story-pulse p-[2px]'
                      : 'bg-[#EAF3EC] border border-[#D5E7DA] group-hover:border-[#2D6A4F]'
                  }`}>
                    <div className="w-full h-full rounded-xl bg-[#EAF3EC] flex items-center justify-center text-[#2D6A4F]">
                      <FileText className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                  </div>
                  {myStatusSeen && !isMyStatusUnseen && (
                    <span className="absolute -top-0.5 -right-0.5 bg-emerald-700 text-white rounded-full p-0.5 border border-white shadow-xs" title="Seen by partner 💕">
                      <Eye className="w-2 h-2" />
                    </span>
                  )}
                </div>

                {/* Compact Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-none mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#36271C] uppercase tracking-wider truncate">
                      {currentUserName}'s Note (You)
                    </span>
                    {myStatus?.updatedAtIso && (
                      <span className="text-[9px] text-[#9E8B75] shrink-0">
                        • {getTimeAgo(myStatus.updatedAtIso)}
                      </span>
                    )}
                    {isMyStatusUnseen && (
                      <span className="text-[8px] bg-[#A83232] text-[#F8E3B6] border border-[#D4AF37] px-1 py-0.2 rounded-full font-bold shadow-xs animate-bounce shrink-0">
                        NEW REPLY
                      </span>
                    )}
                    {myStatusSeen && !isMyStatusUnseen && (
                      <span className="text-[8px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-full font-medium inline-block">
                        Seen 💕
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-[#36271C] truncate leading-tight">
                    {myStatus?.customNote || myStatus?.statusText || '+ Tap to share a thought...'}
                  </p>

                  {myStatus?.lastCheer && (
                    <p className="text-[10px] text-[#A83232] font-semibold flex items-center gap-1 truncate -mt-0.5">
                      <span>💬</span>
                      <span className="truncate">
                        {myStatus.lastCheer.fromId === currentUserId ? 'You:' : `${getNickname(myStatus.lastCheer.fromName) || partnerName}:`} "{myStatus.lastCheer.text}"
                      </span>
                    </p>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CARD 3: PAST NOTES HISTORY SHORTCUT (CAROUSEL SLIDE)
             ───────────────────────────────────────────────────────────── */}
          {onOpenStatusHistory && (
            <div className="w-[68%] sm:w-[50%] md:w-[35%] shrink-0 snap-start">
              <div 
                onClick={onOpenStatusHistory}
                className="w-full bg-white/95 hover:bg-white border border-dashed border-[#D2C3B0] hover:border-[#A83232] rounded-2xl p-2 sm:p-2.5 shadow-xs transition-all flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF5EC] border border-[#D2C3B0] group-hover:border-[#A83232] flex items-center justify-center text-[#A83232] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#A83232] uppercase tracking-wider truncate">
                        Past Notes Log
                      </span>
                      {unreadHistoryCount > 0 && (
                        <span className="text-[8px] bg-[#A83232] text-[#F8E3B6] border border-[#D4AF37] px-1 py-0.2 rounded-full font-bold shadow-xs animate-pulse shrink-0">
                          {unreadHistoryCount} NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[#36271C] truncate leading-tight">
                      Browse timeline
                    </p>
                    <p className="text-[9px] text-[#9E8B75] truncate -mt-0.5">
                      {statusHistory.length} saved notes
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2 py-0.5 rounded-xl bg-[#FAF5EC] group-hover:bg-[#A83232] text-[#36271C] group-hover:text-white text-[10px] font-bold border border-[#D2C3B0] group-hover:border-[#A83232] transition-colors">
                    View
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
