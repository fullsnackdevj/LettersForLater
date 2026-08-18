import React from 'react';
import { X, Lock, Sparkles, Heart, Clock, Mail, Key, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] border-2 border-[#D2C3B0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Tape Strip */}
        <div className="tape-strip" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9E8B75] hover:text-[#A83232] rounded-full hover:bg-[#FAF5EC] transition-colors"
          title="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="wax-seal w-12 h-12 mx-auto mb-2 shadow-md">
            <Sparkles className="w-6 h-6 text-[#F8E3B6]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif-vintage text-[#36271C]">
            How LettersForLater Works
          </h2>

          <p className="text-xs sm:text-sm text-[#7A6855] font-handwriting text-xl">
            "A sealed time capsule designed for two. Writing today, unlocking together in 2032."
          </p>
        </div>

        {/* Informational Workflow Cards */}
        <div className="space-y-3">
          
          {/* Step 1 */}
          <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-300/80 flex items-center justify-center text-[#A83232] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#36271C] flex items-center gap-1.5">
                <span>1. Write & Stamp Today</span>
              </h4>
              <p className="text-xs text-[#5C4A3A] mt-1 leading-relaxed">
                Write letters, attach memories, and set moods. Each letter is stamped with immutable Philippine Standard Time (PHT).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-100/80 border border-rose-300/80 flex items-center justify-center text-rose-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#36271C] flex items-center gap-1.5">
                <span>2. Sealed Vault & Teasers</span>
              </h4>
              <p className="text-xs text-[#5C4A3A] mt-1 leading-relaxed">
                Letters remain locked until 2032. While sealed, you can see teaser hints (mood, paragraph count, and photo count), keeping the wonder alive!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-100/80 border border-rose-300/80 flex items-center justify-center text-rose-600 shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#36271C] flex items-center gap-1.5">
                <span>3. Daily "I Miss You" Counter</span>
              </h4>
              <p className="text-xs text-[#5C4A3A] mt-1 leading-relaxed">
                Tap the heart button anytime to send live real-time miss taps. The counter tracks how many times you think of each other daily.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-300/80 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Key className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#36271C] flex items-center gap-1.5">
                <span>4. Unlocking Together in 2032</span>
              </h4>
              <p className="text-xs text-[#5C4A3A] mt-1 leading-relaxed">
                On <strong>August 6, 2032</strong> (or when both of you enter your secret unlock codes), the vault unlocks to reveal all sealed memories!
              </p>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Got It! Keep Writing Memories
          </button>
        </div>

      </div>
    </div>
  );
}
