import React from 'react';
import { 
  X, 
  Camera, 
  Smile, 
  BookOpen, 
  Mail, 
  Sparkles, 
  Check 
} from 'lucide-react';

export default function StoryIntroModal({
  isOpen,
  onClose,
  onProceed
}) {
  if (!isOpen) return null;

  const handleGotIt = () => {
    try {
      localStorage.setItem('lfl_seen_stories_intro_v2', 'true');
    } catch (e) {}
    onClose();
    if (onProceed) {
      onProceed();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div 
        className="relative bg-[#FAF5EC] border-2 border-[#E2D7C7] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-[#36271C] animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Background decorative watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-5 text-8xl pointer-events-none font-serif">
          📸
        </div>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className="wax-seal w-16 h-16 mx-auto text-2xl shadow-lg flex items-center justify-center">
              📸
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#FAF5EC] p-1 rounded-full border border-[#D4AF37]/60 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif-vintage font-bold text-xl sm:text-2xl text-[#36271C]">
              Welcome to Our Stories
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6855] font-handwriting text-lg sm:text-xl">
              A gentle, quiet way to share our everyday lives
            </p>
          </div>
        </div>

        {/* Simple 4-Step Feature Explanations */}
        <div className="space-y-3.5 bg-white/70 border border-[#E2D7C7] rounded-2xl p-4 sm:p-5 shadow-xs">
          
          {/* Step 1: 24h Daily Snapshots */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-300/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Camera className="w-4 h-4 text-[#A83232]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#36271C]">
                1. 24-Hour Photo Snapshots
              </h4>
              <p className="text-[11px] sm:text-xs text-[#7A6855] leading-relaxed">
                Take or upload a picture of what you're doing today. Your snapshot stays active on your profile for 24 hours.
              </p>
            </div>
          </div>

          {/* Step 2: Pure Emojis Only */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100/80 border border-rose-300/80 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
              <Smile className="w-4 h-4 text-[#A83232]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#36271C]">
                2. Express with Pure Emojis
              </h4>
              <p className="text-[11px] sm:text-xs text-[#7A6855] leading-relaxed">
                No texting or chatting needed. Express your mood with emoji stamps and send warm emoji reactions.
              </p>
            </div>
          </div>

          {/* Step 3: Private Memory Log */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#36271C]">
                3. Private Memory Log
              </h4>
              <p className="text-[11px] sm:text-xs text-[#7A6855] leading-relaxed">
                All daily photos are automatically saved forever. You can view your full memory log anytime by tapping the 📖 book icon in the story hub.
              </p>
            </div>
          </div>

          {/* Step 4: Save to 2032 Vault */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 border border-purple-300/80 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-[#A83232]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#36271C]">
                4. Save as a Letter Anytime
              </h4>
              <p className="text-[11px] sm:text-xs text-[#7A6855] leading-relaxed">
                Turn any favorite photo into a sealed letter inside your 2032 Time Capsule Vault with a single tap.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleGotIt}
            className="w-full py-3 rounded-2xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Got it, Let's Begin!</span>
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#9E8B75] hover:text-[#36271C] hover:bg-[#EFE9DE] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
