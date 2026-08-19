import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { getNickname } from '../utils/nicknames';

const LEFT_COMPANION_MESSAGES = [
  "Hi Kiss!, I miss You na!",
  "Kamusta ka? :)",
  "Check mo mga repost ko sa tikTok!",
  "Huyy, mag heart ka naman sa story :(",
  "Miss you! 1million + + + ! haha",
  "Sorry po if ito lang kaya ko pang gawin.",
  "Beautiful Lilies for you! 🌸",
  "Don’t forget to eat!",
  "Wag puro matamis ahhh!",
  "Psst! nag devotion ka na ba?",
  "hala i miss you na ulet :(",
  "wag ka mag alala sakin :)",
  "dont overthink things kase :)",
  "ohh malungkot ka ba? sulatan mo ko :)",
  "miss you po huhu!",
  "miss na miss na miss na misss na kita!",
  "ayy nakatulog hahaha",
  "oyyy bangon na..",
  "kamusta ka??",
  "tara kape tayo.. :)",
  "uyy kwento ka naman, sulat ka saken.",
  "hahhaa, ayaw patalo sa pag pindot ng miss button!",
  "i love your hair today!",
  "I miss your smile.",
  "I miss your voice.",
  "oh baket? miss mo na ako? :)",
  "aray ko, dahan dahan naman.",
  "yes po?",
  "matulog at wag na magpuyat please.",
  "mag-aral ng mabuti po ha :)",
  "pag nag ooverthink ka sulat ka sakin :)",
  "lam mo miss na miss na kita.",
  "lam mo lagi ka nasa isipan ko :)",
  "tsaka ano, kahit nasa work ako, napapangiti mo ko.",
  "officially missing you!",
  "waaaaa miss na kita."
];

const RIGHT_COMPANION_MESSAGES = [
  "Hi Love! Nandito lang ako palagi :)",
  "Miss you po sobra! ❤️",
  "Don't forget to drink water! 💧",
  "Galingan mo today ha! Proud of you!",
  "Kain ka na po ng lunch/dinner :)",
  "Sending you virtual hugs and kisses! 🤗",
  "Pahinga ka rin pag napapagod ha.",
  "I'm always cheering for you! ✨",
  "Lagi kang mag-iingat please.",
  "Counting down the days... ⏳",
  "Mahal na mahal kita! 💕",
  "Smile ka na, ang ganda ganda mo kaya :)"
];

export default function FloatingCompanion({ currentUser, pairInfo }) {
  // Left Companion (Jay with Lily) State
  const [leftBubbleMessage, setLeftBubbleMessage] = useState(null);
  const [isLeftBouncing, setIsLeftBouncing] = useState(false);
  const [leftFloatingParticles, setLeftFloatingParticles] = useState([]);
  const leftTimeoutRef = useRef(null);

  // Right Companion (Jay Sprite) State
  const [rightBubbleMessage, setRightBubbleMessage] = useState(null);
  const [isRightBouncing, setIsRightBouncing] = useState(false);
  const [rightFloatingParticles, setRightFloatingParticles] = useState([]);
  const rightTimeoutRef = useRef(null);

  // Periodic subtle greeting bubble (every 40s if idle)
  useEffect(() => {
    const interval = setInterval(() => {
      const pickSide = Math.random();
      if (pickSide < 0.35 && !leftBubbleMessage) {
        showLeftMessage();
      } else if (pickSide > 0.65 && !rightBubbleMessage) {
        showRightMessage();
      }
    }, 38000);

    return () => clearInterval(interval);
  }, [leftBubbleMessage, rightBubbleMessage]);

  // Clean up message timeouts on unmount
  useEffect(() => {
    return () => {
      if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
      if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
    };
  }, []);

  const showLeftMessage = () => {
    const randomMsg = LEFT_COMPANION_MESSAGES[Math.floor(Math.random() * LEFT_COMPANION_MESSAGES.length)];
    setLeftBubbleMessage(randomMsg);

    if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
    leftTimeoutRef.current = setTimeout(() => {
      setLeftBubbleMessage(null);
    }, 5500);
  };

  const showRightMessage = () => {
    const randomMsg = RIGHT_COMPANION_MESSAGES[Math.floor(Math.random() * RIGHT_COMPANION_MESSAGES.length)];
    setRightBubbleMessage(randomMsg);

    if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
    rightTimeoutRef.current = setTimeout(() => {
      setRightBubbleMessage(null);
    }, 5500);
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([40, 30, 40]); } catch (e) {}
    }
  };

  const handleLeftSpriteClick = () => {
    setIsLeftBouncing(true);
    setTimeout(() => setIsLeftBouncing(false), 600);
    triggerHaptic();

    const newParticles = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -30 - Math.random() * 50,
      scale: 0.9 + Math.random() * 0.5,
      type: idx % 2 === 0 ? 'heart' : 'sparkle'
    }));

    setLeftFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setLeftFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    showLeftMessage();
  };

  const handleRightSpriteClick = () => {
    setIsRightBouncing(true);
    setTimeout(() => setIsRightBouncing(false), 600);
    triggerHaptic();

    const newParticles = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -30 - Math.random() * 50,
      scale: 0.9 + Math.random() * 0.5,
      type: idx % 2 === 0 ? 'heart' : 'sparkle'
    }));

    setRightFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setRightFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    showRightMessage();
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          LEFT COMPANION: Jay & Lily GIF Sprite
         ───────────────────────────────────────────────────────────── */}
      <aside aria-label="Floating Jay & Lily Companion" className="fixed bottom-0 left-[5px] z-40 flex flex-col items-start pointer-events-none select-none">
        
        {/* Left Speech Bubble */}
        {leftBubbleMessage && (
          <div 
            onClick={showLeftMessage}
            className="pointer-events-auto mb-1.5 ml-3 bg-[#FAF5EC] text-[#2D1F15] border-2 border-[#D4AF37]/70 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl max-w-[260px] sm:max-w-[320px] font-handwriting text-xl sm:text-2xl font-bold tracking-wide leading-snug animate-fadeIn cursor-pointer hover:border-[#A83232] transition-colors relative select-text"
            style={{
              boxShadow: '0 10px 25px -4px rgba(54, 39, 28, 0.3)'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLeftBubbleMessage(null);
              }}
              className="absolute -top-2 -right-2 bg-[#4A1010] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:scale-110 transition-transform shadow-sm"
              title="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>

            <span>{leftBubbleMessage}</span>

            {/* Pointer tail pointing down to character on left */}
            <div className="absolute -bottom-2 left-8 w-3.5 h-3.5 bg-[#FAF5EC] border-r-2 border-b-2 border-[#D4AF37]/70 transform rotate-45" />
          </div>
        )}

        {/* Left Floating Particles */}
        <div className="relative">
          {leftFloatingParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute pointer-events-none transition-all duration-1000 ease-out"
              style={{
                transform: `translate(${particle.x + 28}px, ${particle.y}px) scale(${particle.scale})`,
                opacity: 0,
                animation: 'floatUpAndFade 1.2s forwards'
              }}
            >
              {particle.type === 'heart' ? (
                <Heart className="w-5 h-5 text-rose-500 fill-current drop-shadow-sm" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-500 drop-shadow-sm" />
              )}
            </div>
          ))}
        </div>

        {/* Left Sprite Container */}
        <div className="flex items-end pointer-events-auto">
          <div
            onClick={handleLeftSpriteClick}
            className={`group relative cursor-pointer transition-transform duration-300 ${
              isLeftBouncing ? 'scale-110 -translate-y-2' : 'hover:scale-105 active:scale-95'
            }`}
            title="Tap Jay & Lily to say hi!"
          >
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/35 via-rose-300/35 to-amber-300/35 rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Jay & Lily Animated GIF Sprite */}
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-end justify-start filter drop-shadow-2xl">
              <img
                src="/char-jay-with-lily.gif"
                alt="Jay & Lily Companion"
                className="w-full h-full object-contain object-left-bottom pointer-events-none"
              />
            </div>

            {/* Little tap badge */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#4A1010]/90 text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Tap us! 💕
            </div>
          </div>
        </div>

      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COMPANION: Jay Animated GIF Sprite (char-sprite-jay.gif)
         ───────────────────────────────────────────────────────────── */}
      <aside aria-label="Floating Jay Companion" className="fixed bottom-0 right-[12px] z-40 flex flex-col items-end pointer-events-none select-none">
        
        {/* Right Speech Bubble */}
        {rightBubbleMessage && (
          <div 
            onClick={showRightMessage}
            className="pointer-events-auto mb-1.5 mr-2 sm:mr-3 bg-[#FAF5EC] text-[#2D1F15] border-2 border-[#D4AF37]/70 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl max-w-[260px] sm:max-w-[320px] font-handwriting text-xl sm:text-2xl font-bold tracking-wide leading-snug animate-fadeIn cursor-pointer hover:border-[#A83232] transition-colors relative select-text"
            style={{
              boxShadow: '0 10px 25px -4px rgba(54, 39, 28, 0.3)'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRightBubbleMessage(null);
              }}
              className="absolute -top-2 -left-2 bg-[#4A1010] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:scale-110 transition-transform shadow-sm"
              title="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>

            <span>{rightBubbleMessage}</span>

            {/* Pointer tail pointing down to character on right */}
            <div className="absolute -bottom-2 right-8 w-3.5 h-3.5 bg-[#FAF5EC] border-r-2 border-b-2 border-[#D4AF37]/70 transform rotate-45" />
          </div>
        )}

        {/* Right Floating Particles */}
        <div className="relative">
          {rightFloatingParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute pointer-events-none transition-all duration-1000 ease-out"
              style={{
                transform: `translate(${particle.x - 28}px, ${particle.y}px) scale(${particle.scale})`,
                opacity: 0,
                animation: 'floatUpAndFade 1.2s forwards'
              }}
            >
              {particle.type === 'heart' ? (
                <Heart className="w-5 h-5 text-rose-500 fill-current drop-shadow-sm" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-500 drop-shadow-sm" />
              )}
            </div>
          ))}
        </div>

        {/* Right Sprite Container */}
        <div className="flex items-end pointer-events-auto">
          <div
            onClick={handleRightSpriteClick}
            className={`group relative cursor-pointer transition-transform duration-300 ${
              isRightBouncing ? 'scale-110 -translate-y-2' : 'hover:scale-105 active:scale-95'
            }`}
            title="Tap Jay to say hi!"
          >
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/35 via-rose-300/35 to-amber-300/35 rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Jay Animated GIF Sprite with exact matching height (flipped horizontally) */}
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-end justify-end filter drop-shadow-2xl">
              <img
                src="/char-sprite-jay.gif"
                alt="Jay Companion"
                className="w-full h-full object-contain object-left-bottom pointer-events-none -scale-x-100"
              />
            </div>

            {/* Little tap badge */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#4A1010]/90 text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Tap Jay! ✨
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
