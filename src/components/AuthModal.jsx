import React from 'react';
import { Mail, ShieldCheck, Heart, Sparkles, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSignInGoogle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#36271C]/60 backdrop-blur-sm animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#E2D7C7] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Decorative Tape */}
        <div className="tape-strip"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9E8B75] hover:text-[#36271C] p-1 rounded-full hover:bg-[#EFE9DE] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="wax-seal w-16 h-16 text-3xl font-serif">
            💌
          </div>
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold font-serif-vintage text-center text-[#36271C] mb-2">
          LettersForLater
        </h2>
        
        <p className="text-sm text-center text-[#4A3B2C] font-handwriting text-lg mb-6">
          "Write today. Sealed until the right time."
        </p>

        {/* Value Props */}
        <div className="space-y-3 mb-6 bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE3D5] text-xs text-[#4A3B2C]">
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
            <span>Exchange sealed letters & photos with your partner that stay locked until 2032.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <span>Immutable creation timestamps set in Philippine Standard Time (PHT).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#A83232] shrink-0 mt-0.5" />
            <span>100% Free forever using Firebase Cloud free tier.</span>
          </div>
        </div>

        {/* Google Sign In Button - High Priority Main CTA */}
        <button
          onClick={async () => {
            await onSignInGoogle();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-3 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-base py-4 px-6 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl border border-[#D4AF37]/60 group cursor-pointer"
        >
          {/* White container for Google logo for clean contrast */}
          <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <span className="tracking-wide">Sign In with Google</span>
        </button>

        <p className="text-[11px] text-center text-[#9E8B75] mt-4">
          By signing in, you agree to keep each other's letters locked until the right time.
        </p>

      </div>
    </div>
  );
}
