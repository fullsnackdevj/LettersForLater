import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sparkles, AlertTriangle, Timer } from 'lucide-react';
import { recordMissYou, subscribeToDailyMisses } from '../services/firebase';
import { getTodayPHTKey } from '../utils/pht';
import { getNickname } from '../utils/nicknames';

const SPAM_THRESHOLD = 5;        // consecutive rapid taps to trigger cooldown
const SPAM_WINDOW_MS = 2000;     // max ms between taps to count as consecutive
const COOLDOWN_SECONDS = 60;     // cooldown duration in seconds

export default function MissYouWidget({ currentUser, pairInfo }) {
  const [missData, setMissData] = useState({ total: 0 });
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isPressing, setIsPressing] = useState(false);

  // Spam detection state
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showSpamToast, setShowSpamToast] = useState(false);
  const rapidTapCount = useRef(0);
  const lastTapTime = useRef(0);
  const cooldownTimer = useRef(null);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName || currentUser?.email?.split('@')[0]);
  const partnerName = getNickname(pairInfo?.user2?.name) || 'Partner';

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

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  // Start the 1-minute cooldown
  const startCooldown = useCallback(() => {
    setIsCoolingDown(true);
    setShowSpamToast(true);
    setCooldownRemaining(COOLDOWN_SECONDS);
    rapidTapCount.current = 0;

    // Haptic buzz pattern for spam warning
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([100, 50, 100, 50, 200]); } catch (e) {}
    }

    // Hide the toast after 4 seconds
    setTimeout(() => setShowSpamToast(false), 4000);

    // Countdown interval
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    const endTime = Date.now() + COOLDOWN_SECONDS * 1000;

    cooldownTimer.current = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
        setIsCoolingDown(false);
        setCooldownRemaining(0);
        rapidTapCount.current = 0;
        lastTapTime.current = 0;
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
  }, []);

  // Derived count metrics
  const myCount = missData[`count_${currentUserId}`] || 0;
  const partnerCount = Math.max(0, (missData.total || 0) - myCount);

  // Tap Handler - Increments count & triggers particle animation
  const handleTap = async () => {
    // Block taps during cooldown
    if (isCoolingDown) return;

    // Track rapid consecutive taps
    const now = Date.now();
    if (now - lastTapTime.current <= SPAM_WINDOW_MS) {
      rapidTapCount.current += 1;
    } else {
      rapidTapCount.current = 1; // reset if too much time passed
    }
    lastTapTime.current = now;

    // Check if spam threshold reached
    if (rapidTapCount.current >= SPAM_THRESHOLD) {
      startCooldown();
      return; // don't record this tap
    }

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

  // Format remaining seconds as 0:SS
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="relative bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-sm text-center overflow-hidden space-y-2.5 sm:space-y-5">
      
      {/* Decorative Tape Strip */}
      <div className="tape-strip" />

      {/* Spam Toast Notification */}
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showSpamToast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-rose-400/30 flex items-center gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap">
          <span className="text-base">😳💖</span>
          <span>Sobrang Miss naman yan {currentUserName}.</span>
        </div>
      </div>

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
          {/* Outer Pulse Glow Ring - changes color during cooldown */}
          <div className={`absolute -inset-2.5 sm:-inset-3 rounded-full blur-md pointer-events-none ${
            isCoolingDown
              ? 'bg-gradient-to-r from-amber-500/30 via-red-500/30 to-amber-500/30 animate-pulse'
              : 'bg-gradient-to-r from-rose-400/25 via-amber-400/25 to-rose-400/25 animate-pulse'
          }`} />

          <button
            onClick={handleTap}
            disabled={isCoolingDown}
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
              isCoolingDown
                ? 'bg-gradient-to-br from-[#6B6B6B] via-[#4A4A4A] to-[#333333] text-[#999] border-[#888] cursor-not-allowed opacity-70 scale-95'
                : `bg-gradient-to-br from-[#A83232] via-[#6E1A1A] to-[#4A1010] text-[#F8E3B6] border-[#D4AF37] cursor-pointer ${
                    isPressing ? 'scale-90 shadow-inner' : 'hover:scale-105 hover:shadow-2xl'
                  }`
            }`}
            title={isCoolingDown ? 'Cooldown active — wait a moment!' : "Tap to send an 'I Miss You' heart!"}
          >
            <div className={`absolute inset-1.5 rounded-full border border-dashed pointer-events-none ${
              isCoolingDown ? 'border-[#999]/30' : 'border-[#F8E3B6]/40'
            }`} />
            
            {isCoolingDown ? (
              <>
                <Timer className="w-7 h-7 sm:w-9 sm:h-9 text-[#999] drop-shadow-md animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold font-mono text-[#BBB] mt-0.5 drop-shadow">
                  {formatTime(cooldownRemaining)}
                </span>
              </>
            ) : (
              <>
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-[#F8E3B6] drop-shadow-md transition-transform group-hover:scale-110" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#F8E3B6] mt-0.5 drop-shadow">
                  MISS YOU
                </span>
              </>
            )}
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

      {/* Cooldown Warning Banner */}
      {isCoolingDown && (
        <div className="relative z-10 flex items-center justify-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
          <span>Sandali lang {currentUserName}, wait until <strong className="font-mono">{formatTime(cooldownRemaining)}</strong> 😄</span>
        </div>
      )}

      {/* Bottom Total Summary Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 bg-[#FAF5EC] border border-[#D2C3B0] px-4 py-1.5 rounded-full text-xs font-semibold text-[#5C4A3A]">
        <Heart className="w-3.5 h-3.5 text-[#A83232] fill-current" />
        <span>Total Shared Misses Today: <strong className="font-mono text-sm text-[#A83232] font-bold">{missData.total || 0}</strong></span>
      </div>

    </div>
  );
}
