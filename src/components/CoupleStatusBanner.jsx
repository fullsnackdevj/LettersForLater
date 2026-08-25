import React from 'react';
import { 
  Edit3, 
  Eye 
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function CoupleStatusBanner({
  user,
  pairInfo,
  statuses = {},
  onOpenStatusPicker,
  onOpenStatusDetail
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

  return (
    <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-3 sm:px-4 py-2 select-none shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Jay's / Current User Status Capsule */}
        <button
          type="button"
          onClick={() => {
            if (myStatus) {
              onOpenStatusDetail(myStatus);
            } else {
              onOpenStatusPicker();
            }
          }}
          className="flex-1 min-w-0 flex items-center gap-2.5 bg-white/95 hover:bg-white border border-[#D2C3B0] hover:border-[#A83232] p-2 sm:px-3.5 sm:py-2 rounded-2xl shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] text-left cursor-pointer group"
          title={myStatus ? `Your Status: ${myStatus.statusText} • Tap to view/change` : 'Tap to set what you are doing right now'}
        >
          {/* Avatar / Emoji */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF5EC] border border-[#D4AF37] flex items-center justify-center text-lg sm:text-xl shadow-xs group-hover:scale-110 transition-transform">
              {myStatus?.emoji || '💬'}
            </div>
            {myStatusSeen && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-700 text-white rounded-full p-0.5 border border-white shadow-xs" title="Seen by partner 💕">
                <Eye className="w-2 h-2" />
              </span>
            )}
          </div>

          {/* Status Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-none mb-0.5">
              <span className="text-[10px] font-bold text-[#A83232] uppercase tracking-wider">
                {currentUserName}
              </span>
              {myStatus?.updatedAtIso && (
                <span className="text-[9px] text-[#9E8B75] flex items-center gap-0.5">
                  • {getTimeAgo(myStatus.updatedAtIso)}
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-[#36271C] truncate">
              {myStatus?.statusText || 'Set your live status...'}
            </p>

            {myStatus?.customNote && (
              <p className="text-[10px] text-[#7A6855] italic font-handwriting text-sm truncate -mt-0.5">
                "{myStatus.customNote}"
              </p>
            )}
          </div>

          <Edit3 className="w-3.5 h-3.5 text-[#9E8B75] group-hover:text-[#A83232] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
        </button>

        {/* Center Heart Ribbon */}
        <div className="shrink-0 flex flex-col items-center justify-center px-1 text-center">
          <span className="text-sm sm:text-base animate-pulse">💕</span>
        </div>

        {/* Partner's Status Capsule (PULSES & GLOWS WHEN UNSEEN / NEW!) */}
        <button
          type="button"
          onClick={() => {
            if (partnerStatus) {
              onOpenStatusDetail(partnerStatus);
            }
          }}
          className={`flex-1 min-w-0 flex items-center gap-2.5 transition-all text-left group rounded-2xl p-2 sm:px-3.5 sm:py-2 border ${
            partnerStatus 
              ? isPartnerStatusUnseen
                ? 'bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5F5] border-[#D4AF37] ring-2 ring-[#D4AF37]/80 animate-status-pulse shadow-md hover:scale-[1.02] active:scale-[0.99] cursor-pointer'
                : 'bg-white/95 hover:bg-white border-[#D2C3B0] hover:border-[#A83232] shadow-xs hover:scale-[1.01] active:scale-[0.99] cursor-pointer' 
              : 'bg-white/50 border-dashed border-[#D2C3B0] opacity-80 cursor-default shadow-none'
          }`}
          title={
            partnerStatus 
              ? isPartnerStatusUnseen
                ? `✨ ${partnerName} published a new status! (Tap to view & react)`
                : `${partnerName}: ${partnerStatus.statusText} • Tap to view & react` 
              : `${partnerName} has not posted a status yet`
          }
        >
          {/* Avatar / Emoji with glowing spinning ring if unseen */}
          <div className="relative shrink-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-xs group-hover:scale-110 transition-transform ${
              isPartnerStatusUnseen
                ? 'story-ring-glow animate-story-pulse p-[2px]'
                : 'bg-[#FAF5EC] border border-[#D4AF37]'
            }`}>
              <div className="w-full h-full rounded-full bg-[#FAF5EC] flex items-center justify-center">
                {partnerStatus?.emoji || '💭'}
              </div>
            </div>
            {partnerSeen && !isPartnerStatusUnseen && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-700 text-white rounded-full p-0.5 border border-white shadow-xs" title="Seen by you">
                <Eye className="w-2 h-2" />
              </span>
            )}
          </div>

          {/* Status Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-none mb-0.5">
              <span className="text-[10px] font-bold text-[#A83232] uppercase tracking-wider">
                {partnerName}
              </span>
              {partnerStatus?.updatedAtIso && (
                <span className="text-[9px] text-[#9E8B75] flex items-center gap-0.5">
                  • {getTimeAgo(partnerStatus.updatedAtIso)}
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-[#36271C] truncate">
              {partnerStatus?.statusText || `${partnerName} hasn't posted yet`}
            </p>

            {partnerStatus?.customNote && (
              <p className="text-[10px] text-[#7A6855] italic font-handwriting text-sm truncate -mt-0.5">
                "{partnerStatus.customNote}"
              </p>
            )}
          </div>

          {/* Action Badge: "✨ NEW" if unseen, "React" if already viewed */}
          {partnerStatus && (
            isPartnerStatusUnseen ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-[#A83232] text-[#F8E3B6] border border-[#D4AF37] px-2 py-0.5 rounded-full font-bold shadow-xs animate-bounce shrink-0">
                ✨ NEW
              </span>
            ) : (
              <span className="text-[10px] bg-[#FAF5EC] border border-[#D2C3B0] text-[#A83232] px-2 py-0.5 rounded-full shrink-0 font-bold hidden md:inline-block">
                React
              </span>
            )
          )}
        </button>

      </div>
    </div>
  );
}
