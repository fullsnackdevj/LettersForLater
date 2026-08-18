import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { getNickname } from '../utils/nicknames';

const COMPANION_MESSAGES = [
  "Hi Kiss!, I miss You na!",
  "Kamusta ka? :)",
  "Check mo mga repost ko sa tikTok!",
  "Huyy, mag heart ka naman sa story :(",
  "Miss you! 1million + + + ! haha",
  "Sorry po if ito lang kaya ko pang gawin.",
  "Beautiful Lilies for you!",
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

export default function FloatingCompanion({ currentUser, pairInfo }) {
  const [bubbleMessage, setBubbleMessage] = useState(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState([]);
  const messageTimeoutRef = useRef(null);

  // Periodic subtle greeting bubble (every 40s if idle)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!bubbleMessage && Math.random() < 0.45) {
        showRandomMessage();
      }
    }, 40000);

    return () => clearInterval(interval);
  }, [bubbleMessage]);

  // Clean up message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const showRandomMessage = () => {
    const randomMsg = COMPANION_MESSAGES[Math.floor(Math.random() * COMPANION_MESSAGES.length)];
    setBubbleMessage(randomMsg);

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setBubbleMessage(null);
    }, 5500);
  };

  const handleSpriteClick = () => {
    // Bounce effect
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([40, 30, 40]); } catch (e) {}
    }

    // Spawn floating mini hearts/stars
    const newParticles = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -30 - Math.random() * 50,
      scale: 0.9 + Math.random() * 0.5,
      type: idx % 2 === 0 ? 'heart' : 'sparkle'
    }));

    setFloatingParticles(prev => [...prev, ...newParticles]);

    // Clean particles after animation
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    // Show or cycle speech bubble
    showRandomMessage();
  };

  return (
    <aside aria-label="Floating Jay & Lily Companion" className="fixed bottom-0 left-[5px] z-40 flex flex-col items-start pointer-events-none select-none">
      
      {/* Speech Bubble */}
      {bubbleMessage && (
        <div 
          onClick={showRandomMessage}
          className="pointer-events-auto mb-1.5 ml-3 bg-[#FAF5EC] text-[#2D1F15] border-2 border-[#D4AF37]/70 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl max-w-[270px] sm:max-w-[340px] font-handwriting text-xl sm:text-2xl font-bold tracking-wide leading-snug animate-fadeIn cursor-pointer hover:border-[#A83232] transition-colors relative select-text"
          style={{
            boxShadow: '0 10px 25px -4px rgba(54, 39, 28, 0.3)'
          }}
        >
          {/* Close tiny button on bubble */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBubbleMessage(null);
            }}
            className="absolute -top-2 -right-2 bg-[#4A1010] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:scale-110 transition-transform shadow-sm"
            title="Dismiss message"
          >
            <X className="w-3 h-3" />
          </button>

          <span>{bubbleMessage}</span>

          {/* Speech bubble pointer / tail pointing down to character on left */}
          <div className="absolute -bottom-2 left-8 w-3.5 h-3.5 bg-[#FAF5EC] border-r-2 border-b-2 border-[#D4AF37]/70 transform rotate-45" />
        </div>
      )}

      {/* Floating Particles (Hearts & Sparkles) */}
      <div className="relative">
        {floatingParticles.map((particle) => (
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

      {/* Companion Container */}
      <div className="flex items-end pointer-events-auto">
        
        {/* Character Sprite */}
        <div
          onClick={handleSpriteClick}
          className={`group relative cursor-pointer transition-transform duration-300 ${
            isBouncing ? 'scale-110 -translate-y-2' : 'hover:scale-105 active:scale-95'
          }`}
          title="Tap Jay & Lily to say hi!"
        >
          {/* Soft Ambient Glow under sprite */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/35 via-rose-300/35 to-amber-300/35 rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Jay & Lily Animated GIF Sprite - Flush to bottom-left */}
          <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-end justify-start filter drop-shadow-2xl">
            <img
              src="/char-jay-with-lily.gif"
              alt="Jay & Lily Companion"
              className="w-full h-full object-contain object-left-bottom pointer-events-none"
            />
          </div>

          {/* Little tap indicator badge */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#4A1010]/90 text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Tap us! 💕
          </div>
        </div>

      </div>

    </aside>
  );
}
