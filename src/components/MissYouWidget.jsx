import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Flame } from 'lucide-react';
import { recordMissYou, subscribeToDailyMisses } from '../services/firebase';
import { getTodayPHTKey } from '../utils/pht';

export default function MissYouWidget({ currentUser, pairInfo }) {
  const [missData, setMissData] = useState({ total: 0 });
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isPressing, setIsPressing] = useState(false);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const partnerName = pairInfo?.user2?.name || 'Partner';

  const todayKey = getTodayPHTKey();
  const pairCode = pairInfo?.code || '#JayFinallyGotAKiss';

  // Realtime subscription to daily misses
  useEffect(() => {
    const unsubscribe = subscribeToDailyMisses(pairCode, todayKey, (data) => {
      if (data) setMissData(data);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pairCode, todayKey]);

  // Derived count metrics
  const myCount = missData[`count_${currentUserId}`] || 0;
  const partnerCount = Math.max(0, (missData.total || 0) - myCount);

  // Tap Handler - Increments count & triggers particle animation
  const handleTap = async () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 180);

    // Haptic Feedback if supported
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([30, 50, 30]); } catch (e) {}
    }

    // Trigger Floating Particle Burst
    const emojis = ['💖', '💕', '✨', '💓', '💗', '❤️'];
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + Math.random(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 80 + 10,
      rotation: Math.random() * 40 - 20,
      scale: 0.8 + Math.random() * 0.6,
      delay: i * 0.04
    }));

    setFloatingHearts(prev => [...prev, ...newHearts]);

    // Clean up particles after animation duration
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1200);

    // Record miss count to Firebase / Local Storage
    try {
      await recordMissYou(pairCode, currentUser, todayKey);
    } catch (e) {
      console.error('Failed to record miss-you tap:', e);
    }
  };

  return (
    <div className="relative bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-sm text-center overflow-hidden space-y-2.5 sm:space-y-5">
      
      {/* Decorative Tape Strip */}
      <div className="tape-strip" />

      {/* Floating Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingHearts.map(h => (
          <span
            key={h.id}
            className="absolute bottom-6 text-2xl sm:text-3xl animate-floatUp opacity-0"
            style={{
              left: `${h.left}%`,
              transform: `rotate(${h.rotation}deg) scale(${h.scale})`,
              animationDelay: `${h.delay}s`
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Header Info */}
      <div className="space-y-0.5 z-10 relative">
        <div className="inline-flex items-center gap-1.5 bg-[#FAF5EC] border border-[#D2C3B0] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#A83232]">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
          <span>Daily Connection</span>
        </div>
        
        <h3 className="text-lg sm:text-3xl font-bold font-serif-vintage text-[#36271C] tracking-tight">
          Thinking Of You Today
        </h3>

        <p className="hidden sm:block text-[#7A6855] font-handwriting text-xl sm:text-2xl">
          "Tap the heart whenever you catch yourself missing each other."
        </p>
      </div>

      {/* Center Interactive Layout: You Count | Circular Wax Seal | Partner Count */}
      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-8 py-1">
        
        {/* Left Side: You Count */}
        <div className="flex flex-col items-center bg-[#FAF5EC] border border-[#E2D7C7] px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl min-w-[85px] sm:min-w-[100px] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9E8B75]">You</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-[#36271C] my-0.5">{myCount}</span>
          <span className="text-[10px] sm:text-[11px] text-[#A69888] font-medium">taps today</span>
        </div>

        {/* Center Circular Wax Seal Button */}
        <div className="relative shrink-0">
          {/* Outer Pulse Glow Ring */}
          <div className="absolute -inset-2.5 sm:-inset-3 bg-gradient-to-r from-rose-400/25 via-amber-400/25 to-rose-400/25 rounded-full blur-md animate-pulse pointer-events-none" />

          <button
            onClick={handleTap}
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#A83232] via-[#6E1A1A] to-[#4A1010] text-[#F8E3B6] shadow-xl border-2 border-[#D4AF37] flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
              isPressing ? 'scale-90 shadow-inner' : 'hover:scale-105 hover:shadow-2xl'
            }`}
            title="Tap to send an 'I Miss You' heart!"
          >
            <div className="absolute inset-1.5 rounded-full border border-dashed border-[#F8E3B6]/40 pointer-events-none" />
            
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-[#F8E3B6] drop-shadow-md transition-transform group-hover:scale-110" />
            
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#F8E3B6] mt-0.5 drop-shadow">
              MISS YOU
            </span>
          </button>
        </div>

        {/* Right Side: Partner Count */}
        <div className="flex flex-col items-center bg-[#FAF5EC] border border-[#E2D7C7] px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl min-w-[85px] sm:min-w-[100px] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#9E8B75] truncate max-w-[85px] sm:max-w-[100px]">
            {partnerName}
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 my-0.5">{partnerCount}</span>
          <span className="text-[10px] sm:text-[11px] text-[#A69888] font-medium">taps today</span>
        </div>

      </div>

      {/* Bottom Total Summary Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 bg-[#FAF5EC] border border-[#D2C3B0] px-4 py-1.5 rounded-full text-xs font-semibold text-[#5C4A3A]">
        <Heart className="w-3.5 h-3.5 text-[#A83232] fill-current" />
        <span>Total Shared Misses Today: <strong className="font-mono text-sm text-[#A83232] font-bold">{missData.total || 0}</strong></span>
      </div>

    </div>
  );
}
