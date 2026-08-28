import React, { useRef, useEffect } from 'react';
import { 
  Edit3, 
  Eye, 
  MessageCircleHeart,
  Video
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { getPresenceInfo } from '../utils/presence';

export default function CoupleStatusBanner({
  user,
  pairInfo,
  statuses = {},
  partnerPresence,
  onOpenStatusPicker,
  onOpenStatusDetail,
  onOpenCallPrompt
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

  const myStatusSeen = myStatus?.viewedBy?.some(id => id !== currentUserId);

  const scrollContainerRef = useRef(null);

  // Auto-scroll to partner card if unseen
  useEffect(() => {
    if (isPartnerStatusUnseen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [isPartnerStatusUnseen]);

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
                
                {/* Compact Avatar / Emoji */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform ${
                    isPartnerStatusUnseen
                      ? 'story-ring-glow animate-story-pulse p-[2px]'
                      : 'bg-[#FAF5EC] border border-[#D4AF37]'
                  }`}>
                    <div className="w-full h-full rounded-xl bg-[#FAF5EC] flex items-center justify-center">
                      {partnerStatus?.emoji || '💭'}
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
                    {partnerStatus?.statusText || `${partnerName} is idle`}
                  </p>

                  {partnerStatus?.lastCheer ? (
                    <p className="text-[10px] text-[#A83232] font-semibold flex items-center gap-1 truncate -mt-0.5">
                      <span>💬</span>
                      <span className="truncate">
                        {partnerStatus.lastCheer.fromId === currentUserId ? 'You:' : `${getNickname(partnerStatus.lastCheer.fromName) || partnerName}:`} "{partnerStatus.lastCheer.text}"
                      </span>
                    </p>
                  ) : partnerStatus?.customNote ? (
                    <p className="text-[10px] text-[#7A6855] italic font-handwriting text-xs truncate -mt-0.5">
                      "{partnerStatus.customNote}"
                    </p>
                  ) : null}
                </div>

              </div>

              {/* Compact Right Action Buttons */}
              <div className="shrink-0 flex items-center gap-1.5">
                {onOpenCallPrompt && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCallPrompt();
                    }}
                    className="p-1.5 rounded-xl bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#D2C3B0] hover:border-[#A83232] text-[#A83232] transition-all flex items-center justify-center cursor-pointer group-hover:scale-105 active:scale-95 shadow-2xs"
                    title={`Call ${partnerName}`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#A83232]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (partnerStatus) onOpenStatusDetail(partnerStatus);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer group-hover:scale-105 active:scale-95"
                >
                  <MessageCircleHeart className="w-3 h-3" />
                  <span>React</span>
                </button>
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
              className="w-full bg-white/95 hover:bg-white border border-[#D2C3B0] hover:border-[#A83232] rounded-2xl p-2 sm:p-2.5 shadow-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                
                {/* Compact Avatar / Emoji */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF5EC] border border-[#D2C3B0] group-hover:border-[#A83232] flex items-center justify-center text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform">
                    {myStatus?.emoji || '💬'}
                  </div>
                  {myStatusSeen && (
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
                    {myStatusSeen && (
                      <span className="text-[8px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-full font-medium inline-block">
                        Seen 💕
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-[#36271C] truncate leading-tight">
                    {myStatus?.statusText || '+ Tap to set your mood or activity'}
                  </p>

                  {myStatus?.lastCheer ? (
                    <p className="text-[10px] text-[#A83232] font-semibold flex items-center gap-1 truncate -mt-0.5">
                      <span>💬</span>
                      <span className="truncate">
                        {myStatus.lastCheer.fromId === currentUserId ? 'You:' : `${getNickname(myStatus.lastCheer.fromName) || partnerName}:`} "{myStatus.lastCheer.text}"
                      </span>
                    </p>
                  ) : myStatus?.customNote ? (
                    <p className="text-[10px] text-[#7A6855] italic font-handwriting text-xs truncate -mt-0.5">
                      "{myStatus.customNote}"
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#9E8B75] truncate -mt-0.5">
                      Tap to update note
                    </p>
                  )}
                </div>

              </div>

              {/* Compact Right Action Button */}
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStatusPicker();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF5EC] hover:bg-[#EAE2D3] border border-[#D2C3B0] hover:border-[#A83232] text-[#36271C] text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer group-hover:scale-105 active:scale-95"
                >
                  <Edit3 className="w-3 h-3 text-[#A83232]" />
                  <span>{myStatus ? 'Update' : '+ Set'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
