import React from 'react';
import { 
  X, 
  Video, 
  Phone, 
  Sparkles, 
  Heart,
  ShieldCheck
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { getPresenceInfo } from '../utils/presence';

export default function CallPromptModal({
  isOpen,
  onClose,
  partner,
  partnerPresence,
  onStartCall
}) {
  if (!isOpen) return null;

  const partnerName = getNickname(partner?.name) || 'Partner';
  const partnerPhoto = partner?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
  const presenceInfo = getPresenceInfo(partnerPresence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-sm bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Partner Avatar & Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="relative inline-block">
            <img
              src={partnerPhoto}
              alt={partnerName}
              className="w-20 h-20 rounded-full object-cover border-3 border-[#D4AF37] shadow-md mx-auto"
            />
            {/* Live Presence Dot on Avatar */}
            {presenceInfo.isOnline ? (
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-stone-400 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-white/80"></span>
              </span>
            )}
          </div>

          <div>
            <h3 className="font-serif-vintage font-bold text-xl text-[#36271C]">
              Call {partnerName}
            </h3>
            
            {/* Live Presence Pill */}
            <div className="mt-1 flex items-center justify-center">
              {presenceInfo.isOnline ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online on the app 💕</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                  <span>{presenceInfo.detailText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call Type Options */}
        <div className="space-y-3">
          
          {/* Video Call Option */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartCall('video');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#A83232] to-[#8B0000] text-[#F8E3B6] hover:brightness-110 active:scale-98 transition-all flex items-center gap-3.5 shadow-md border border-[#D4AF37]/50 group cursor-pointer text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5 text-[#F8E3B6]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#FDFBF7]">Video Call</span>
                <span className="text-[9px] bg-[#D4AF37] text-[#36271C] font-bold px-1.5 py-0.2 rounded-full">HD</span>
              </div>
              <p className="text-[11px] text-[#F8E3B6]/80 truncate">
                Face-to-face video with floating hearts
              </p>
            </div>
          </button>

          {/* Voice Call Option */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartCall('audio');
            }}
            className="w-full p-4 rounded-2xl bg-[#FAF5EC] hover:bg-[#EFE9DE] active:scale-98 transition-all flex items-center gap-3.5 shadow-xs border border-[#D2C3B0] group cursor-pointer text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[#36271C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 text-[#F8E3B6]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm text-[#36271C]">Voice Call</span>
              <p className="text-[11px] text-[#7A6855] truncate">
                Cozy audio call with sound waves
              </p>
            </div>
          </button>

        </div>

        {/* Offline Friendly Note */}
        {!presenceInfo.isOnline && (
          <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span className="leading-tight">
              {partnerName} is not active on the app right now. She will hear your call as soon as she opens LettersForLater!
            </span>
          </div>
        )}

        {/* Security & Privacy Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9E8B75] pt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Peer-to-Peer • 100% Private</span>
        </div>

      </div>
    </div>
  );
}
