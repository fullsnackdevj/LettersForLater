import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sparkles, X, RotateCcw } from 'lucide-react';
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
  "Kiss: Akala ko noon, napakatagal ng panahon ng paghihintay para sa atin.",
  "Jay: Pero pinili nating magtiwala sa Kanyang kalooban ngayon, Alam ko nang worth it ang lahat.",
  "Kiss: Lahat ng dasal ko noon, akala ko hindi pinapakinggan.",
  "Jay: Binibigyan ka lang pala ni Lord ng lalaking mag-aalaga sa'yo nang buong puso.",
  "Kiss: Salamat at hindi ka napagod sa paghahanap at paghihintay.",
  "Jay: Paano ako mapapagod kung alam kong ikaw ang dulo ng paghihintay na ito?",
  "Kiss: Minsan naitanong ko kay Lord kung bakit ang tagal.",
  "Jay: Ngayon, alam na natin—pinaghahanda lang Niya tayo para sa tamang panahon.",
  "Kiss: Ang ganda ng kwento natin, kasi gawa ito ng Lord.",
  "Jay: Dahil siya talaga ang sumulat nito mula pa noong una.",
  "Kiss: Noong mga panahong malungkot ako, ikaw kaya ang pinagdarasal ko..",
  "Jay: Sigurado ako, dahil ikaw rin ang laman ng bawat tahimik kong hiling.",
  "Kiss: Akala ko dati hindi na darating ang para sa akin.",
  "Jay: Naging subok lang ang tadhana para mas matutunan nating pahalagahan ang isa't isa.",
  "Kiss: Walang pagsisisi sa lahat ng luha at paghihintay.",
  "Jay: Dahil ang gantimpala ay ikaw—isang regalong galing mismo sa Kanya.",
  "Kiss: Sino ang mag-akala na magtatagpo ang landas natin?",
  "Jay: Walang aksidente kay Lord. Matagal na niyang plano ito.",
  "Kiss: Masaya ako na sabay nating hinintay ang pangako Niya.",
  "Jay: At ngayon, tutuparin na natin ang habambuhay na ito kasama si Lord."
];

/**
 * Custom Hook for making a floating companion draggable with touch & mouse support,
 * viewport boundary clamping, localStorage position persistence, and tap vs drag discrimination.
 */
function useDraggableCompanion({
  storageKey,
  getDefaultPos,
  onTap,
  widthMobile = 160,
  widthDesktop = 224,
  heightMobile = 180,
  heightDesktop = 232,
}) {
  const getDims = useCallback(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    return {
      w: isMobile ? widthMobile : widthDesktop,
      h: isMobile ? heightMobile : heightDesktop,
    };
  }, [widthMobile, widthDesktop, heightMobile, heightDesktop]);

  const [pos, setPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const isMobile = window.innerWidth < 640;
          const w = isMobile ? widthMobile : widthDesktop;
          const h = isMobile ? heightMobile : heightDesktop;
          return {
            x: Math.min(Math.max(0, parsed.x), Math.max(0, window.innerWidth - w)),
            y: Math.min(Math.max(55, parsed.y), Math.max(55, window.innerHeight - h)),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load companion pos from storage', e);
    }
    return getDefaultPos();
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    isDown: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });
  const currentPosRef = useRef(pos);

  useEffect(() => {
    currentPosRef.current = pos;
  }, [pos]);

  // Keep companion clamped within viewport when window resizes
  useEffect(() => {
    const handleResize = () => {
      const { w, h } = getDims();
      setPos((prev) => ({
        x: Math.min(Math.max(0, prev.x), Math.max(0, window.innerWidth - w)),
        y: Math.min(Math.max(55, prev.y), Math.max(55, window.innerHeight - h)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getDims]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = {
      isDown: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      initPosX: pos.x,
      initPosY: pos.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // 5px threshold before activating drag mode
    if (!dragRef.current.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragRef.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragRef.current.hasMoved) {
      const { w, h } = getDims();
      const targetX = dragRef.current.initPosX + dx;
      const targetY = dragRef.current.initPosY + dy;
      const clampedX = Math.min(Math.max(0, targetX), Math.max(0, window.innerWidth - w));
      const clampedY = Math.min(Math.max(55, targetY), Math.max(55, window.innerHeight - h));

      const newPos = { x: clampedX, y: clampedY };
      currentPosRef.current = newPos;
      setPos(newPos);
    }
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDown) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const moved = dragRef.current.hasMoved;

    if (moved) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentPosRef.current));
      } catch (err) {}
    } else {
      // Tap without dragging — trigger interaction
      if (typeof onTap === 'function') {
        onTap();
      }
    }

    dragRef.current.isDown = false;
    dragRef.current.hasMoved = false;
    setIsDragging(false);
  };

  const handlePointerCancel = handlePointerUp;

  const resetPosition = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const defaultPos = getDefaultPos();
    setPos(defaultPos);
    currentPosRef.current = defaultPos;
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {}
  };

  // Check if position deviates significantly from default
  const defaultPos = getDefaultPos();
  const isCustomPos =
    Math.abs(pos.x - defaultPos.x) > 30 || Math.abs(pos.y - defaultPos.y) > 30;

  return {
    pos,
    isDragging,
    hasMovedRef: dragRef,
    isCustomPos,
    resetPosition,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onDoubleClick: resetPosition,
    },
    dims: getDims(),
  };
}

/**
 * Calculates adaptive speech bubble placement and tail coordinate
 * so the bubble never overflows the screen horizontally and flips above/below dynamically.
 */
function getSpeechBubbleLayout(posX, posY, spriteWidth = 180, isNearTopThreshold = 220) {
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 400;
  const isMobile = screenW < 640;
  const bubbleWidth = Math.min(isMobile ? 260 : 320, screenW - 24);
  const isNearTop = posY < isNearTopThreshold;

  const charCenterX = posX + spriteWidth / 2;
  const idealScreenBubbleX = posX + (spriteWidth - bubbleWidth) / 2;
  const screenBubbleX = Math.min(
    Math.max(12, idealScreenBubbleX),
    screenW - bubbleWidth - 12
  );

  const localBubbleX = screenBubbleX - posX;
  const tailLocalX = Math.min(
    Math.max(22, charCenterX - screenBubbleX),
    bubbleWidth - 22
  );

  return {
    isNearTop,
    bubbleWidth,
    localBubbleX,
    tailLocalX,
  };
}

export default function FloatingCompanion({ currentUser, pairInfo }) {
  // Determine if current user is Jay — left companion only shows for Kiss (partner)
  const currentNickname = getNickname(currentUser?.displayName);
  const isJay = currentNickname === 'Jay';

  // Left Companion Speech & Particles State
  const [leftBubbleMessage, setLeftBubbleMessage] = useState(null);
  const [isLeftBouncing, setIsLeftBouncing] = useState(false);
  const [leftFloatingParticles, setLeftFloatingParticles] = useState([]);
  const leftTimeoutRef = useRef(null);

  // Right Companion Speech & Particles State
  const [rightBubbleMessage, setRightBubbleMessage] = useState(null);
  const [isRightBouncing, setIsRightBouncing] = useState(false);
  const [rightFloatingParticles, setRightFloatingParticles] = useState([]);
  const rightTimeoutRef = useRef(null);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([40, 30, 40]); } catch (e) {}
    }
  };

  const showLeftMessage = useCallback(() => {
    const randomMsg = LEFT_COMPANION_MESSAGES[Math.floor(Math.random() * LEFT_COMPANION_MESSAGES.length)];
    setLeftBubbleMessage(randomMsg);

    if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
    leftTimeoutRef.current = setTimeout(() => {
      setLeftBubbleMessage(null);
    }, 5500);
  }, []);

  const showRightMessage = useCallback(() => {
    const randomMsg = RIGHT_COMPANION_MESSAGES[Math.floor(Math.random() * RIGHT_COMPANION_MESSAGES.length)];
    setRightBubbleMessage(randomMsg);

    if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
    rightTimeoutRef.current = setTimeout(() => {
      setRightBubbleMessage(null);
    }, 10000);
  }, []);

  const handleLeftTap = useCallback(() => {
    setIsLeftBouncing(true);
    setTimeout(() => setIsLeftBouncing(false), 600);
    triggerHaptic();

    const newParticles = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -30 - Math.random() * 50,
      scale: 0.9 + Math.random() * 0.5,
      type: idx % 2 === 0 ? 'heart' : 'sparkle',
    }));

    setLeftFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setLeftFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    showLeftMessage();
  }, [showLeftMessage]);

  const handleRightTap = useCallback(() => {
    setIsRightBouncing(true);
    setTimeout(() => setIsRightBouncing(false), 600);
    triggerHaptic();

    const newParticles = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -30 - Math.random() * 50,
      scale: 0.9 + Math.random() * 0.5,
      type: idx % 2 === 0 ? 'heart' : 'sparkle',
    }));

    setRightFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setRightFloatingParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    showRightMessage();
  }, [showRightMessage]);

  // Left Companion (Jay with Lily) Draggable Hook
  const leftCompanion = useDraggableCompanion({
    storageKey: 'lfl_left_companion_pos',
    getDefaultPos: () => {
      if (typeof window === 'undefined') return { x: 8, y: 500 };
      const isMobile = window.innerWidth < 640;
      const h = isMobile ? 160 : 224;
      return {
        x: 8,
        y: Math.max(55, window.innerHeight - h - 10),
      };
    },
    onTap: handleLeftTap,
    widthMobile: 160,
    widthDesktop: 224,
    heightMobile: 160,
    heightDesktop: 224,
  });

  // Right Companion (Bride & Groom) Draggable Hook
  const rightCompanion = useDraggableCompanion({
    storageKey: 'lfl_right_companion_pos',
    getDefaultPos: () => {
      if (typeof window === 'undefined') return { x: 200, y: 500 };
      const isMobile = window.innerWidth < 640;
      const w = isMobile ? 165 : 230;
      const h = isMobile ? 185 : 240;
      return {
        x: Math.max(10, window.innerWidth - w - 10),
        y: Math.max(55, window.innerHeight - h - 10),
      };
    },
    onTap: handleRightTap,
    widthMobile: 165,
    widthDesktop: 230,
    heightMobile: 185,
    heightDesktop: 240,
  });

  // Periodic subtle greeting bubble (every 60s if idle)
  useEffect(() => {
    const interval = setInterval(() => {
      const pickSide = Math.random();
      if (pickSide < 0.35 && !leftBubbleMessage) {
        showLeftMessage();
      } else if (pickSide > 0.65 && !rightBubbleMessage) {
        showRightMessage();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [leftBubbleMessage, rightBubbleMessage, showLeftMessage, showRightMessage]);

  // Clean up message timeouts on unmount
  useEffect(() => {
    return () => {
      if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
      if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
    };
  }, []);

  // Adaptive layouts for speech bubbles
  const leftBubbleLayout = getSpeechBubbleLayout(
    leftCompanion.pos.x,
    leftCompanion.pos.y,
    leftCompanion.dims.w
  );

  const rightBubbleLayout = getSpeechBubbleLayout(
    rightCompanion.pos.x,
    rightCompanion.pos.y,
    rightCompanion.dims.w
  );

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          LEFT COMPANION: Jay & Lily GIF Sprite (Only visible to Kiss)
         ───────────────────────────────────────────────────────────── */}
      {!isJay && (
        <aside
          aria-label="Floating Jay & Lily Companion"
          className="fixed z-40 select-none pointer-events-none"
          style={{
            left: `${leftCompanion.pos.x}px`,
            top: `${leftCompanion.pos.y}px`,
          }}
        >
          <div className="relative pointer-events-auto">
            {/* Left Speech Bubble */}
            {leftBubbleMessage && (
              <div
                onClick={showLeftMessage}
                className={`absolute pointer-events-auto bg-[#FAF5EC] text-[#2D1F15] border-2 border-[#D4AF37]/70 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl font-handwriting text-xl sm:text-2xl font-bold tracking-wide leading-snug animate-fadeIn cursor-pointer hover:border-[#A83232] transition-colors select-text z-50 ${
                  leftBubbleLayout.isNearTop ? 'top-full mt-3' : 'bottom-full mb-3'
                }`}
                style={{
                  left: `${leftBubbleLayout.localBubbleX}px`,
                  width: `${leftBubbleLayout.bubbleWidth}px`,
                  boxShadow: '0 10px 25px -4px rgba(54, 39, 28, 0.3)',
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

                {/* Adaptive Tail pointing to character */}
                <div
                  className={`absolute w-3.5 h-3.5 bg-[#FAF5EC] transform rotate-45 ${
                    leftBubbleLayout.isNearTop
                      ? '-top-2 border-l-2 border-t-2 border-[#D4AF37]/70'
                      : '-bottom-2 border-r-2 border-b-2 border-[#D4AF37]/70'
                  }`}
                  style={{ left: `${leftBubbleLayout.tailLocalX}px` }}
                />
              </div>
            )}

            {/* Left Floating Particles */}
            <div className="relative">
              {leftFloatingParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute pointer-events-none transition-all duration-1000 ease-out"
                  style={{
                    transform: `translate(${particle.x + 40}px, ${particle.y}px) scale(${particle.scale})`,
                    opacity: 0,
                    animation: 'floatUpAndFade 1.2s forwards',
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

            {/* Left Sprite Container (Draggable & Clickable) */}
            <div
              {...leftCompanion.dragHandlers}
              onClick={(e) => e.stopPropagation()}
              className={`group relative select-none transition-transform touch-none ${
                leftCompanion.isDragging
                  ? 'cursor-grabbing scale-105 filter drop-shadow-[0_15px_30px_rgba(212,175,55,0.45)]'
                  : isLeftBouncing
                    ? 'cursor-grab scale-110 -translate-y-2 duration-300'
                    : 'cursor-grab hover:scale-105 active:scale-95 duration-300'
              }`}
              style={{ touchAction: 'none' }}
              title="Drag anywhere! Double-click to reset position, or tap to say hi."
            >
              {/* Soft Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/35 via-rose-300/35 to-amber-300/35 rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Jay & Lily Animated GIF Sprite */}
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-end justify-start filter drop-shadow-2xl pointer-events-none">
                <img
                  src="/char-jay-with-lily.gif"
                  alt="Jay & Lily Companion"
                  className="w-full h-full object-contain object-left-bottom pointer-events-none select-none"
                  draggable="false"
                />
              </div>

              {/* Interactive drag / tap badge */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#4A1010]/95 text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                <span>✨ Drag or tap! 💕</span>
                {leftCompanion.isCustomPos && (
                  <button
                    onClick={leftCompanion.resetPosition}
                    className="pointer-events-auto ml-0.5 hover:text-white p-0.5"
                    title="Reset position to corner"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COMPANION: Bride & Groom Animated GIF Sprite (BRIDE-and-Groom.gif)
         ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Floating Bride & Groom Companion"
        className="fixed z-40 select-none pointer-events-none"
        style={{
          left: `${rightCompanion.pos.x}px`,
          top: `${rightCompanion.pos.y}px`,
        }}
      >
        <div className="relative pointer-events-auto">
          {/* Right Speech Bubble */}
          {rightBubbleMessage && (
            <div
              onClick={showRightMessage}
              className={`absolute pointer-events-auto bg-[#FAF5EC] text-[#2D1F15] border-2 border-[#D4AF37]/70 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl font-handwriting text-xl sm:text-2xl font-bold tracking-wide leading-snug animate-fadeIn cursor-pointer hover:border-[#A83232] transition-colors select-text z-50 ${
                rightBubbleLayout.isNearTop ? 'top-full mt-3' : 'bottom-full mb-3'
              }`}
              style={{
                left: `${rightBubbleLayout.localBubbleX}px`,
                width: `${rightBubbleLayout.bubbleWidth}px`,
                boxShadow: '0 10px 25px -4px rgba(54, 39, 28, 0.3)',
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

              {/* Adaptive Tail pointing to character */}
              <div
                className={`absolute w-3.5 h-3.5 bg-[#FAF5EC] transform rotate-45 ${
                  rightBubbleLayout.isNearTop
                    ? '-top-2 border-l-2 border-t-2 border-[#D4AF37]/70'
                    : '-bottom-2 border-r-2 border-b-2 border-[#D4AF37]/70'
                }`}
                style={{ left: `${rightBubbleLayout.tailLocalX}px` }}
              />
            </div>
          )}

          {/* Right Floating Particles */}
          <div className="relative">
            {rightFloatingParticles.map((particle) => (
              <div
                key={particle.id}
                className="absolute pointer-events-none transition-all duration-1000 ease-out"
                style={{
                  transform: `translate(${particle.x + 80}px, ${particle.y}px) scale(${particle.scale})`,
                  opacity: 0,
                  animation: 'floatUpAndFade 1.2s forwards',
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

          {/* Right Sprite Container (Draggable & Clickable) */}
          <div
            {...rightCompanion.dragHandlers}
            onClick={(e) => e.stopPropagation()}
            className={`group relative select-none transition-transform touch-none ${
              rightCompanion.isDragging
                ? 'cursor-grabbing scale-105 filter drop-shadow-[0_15px_30px_rgba(212,175,55,0.45)]'
                : isRightBouncing
                  ? 'cursor-grab scale-110 -translate-y-2 duration-300'
                  : 'cursor-grab hover:scale-105 active:scale-95 duration-300'
            }`}
            style={{ touchAction: 'none' }}
            title="Drag anywhere! Double-click to reset position, or tap to say hi."
          >
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/35 via-rose-300/35 to-amber-300/35 rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Bride & Groom Animated GIF Sprite */}
            <div className="relative w-40 h-[180px] sm:w-56 sm:h-[232px] flex items-end justify-end filter drop-shadow-2xl pointer-events-none">
              <img
                src="/BRIDE-and-Groom.gif"
                alt="Bride & Groom Companion"
                className="w-full h-full object-contain object-right-bottom pointer-events-none select-none"
                draggable="false"
              />
              {/* White Cat at the Groom's feet */}
              <img
                src="/white-cat.gif"
                alt="White Cat"
                className="absolute bottom-0 left-0 w-14 h-14 sm:w-[72px] sm:h-[72px] object-contain pointer-events-none drop-shadow-md select-none"
                style={{ transform: 'translate(-20%, 5%)' }}
                draggable="false"
              />
              {/* Black Cat at the Bride's left foot */}
              <img
                src="/blackCAT.gif"
                alt="Black Cat"
                className="absolute bottom-0 right-0 w-14 h-14 sm:w-[72px] sm:h-[72px] object-contain pointer-events-none drop-shadow-md select-none"
                style={{ transform: 'translate(20%, 5%)' }}
                draggable="false"
              />
            </div>

            {/* Interactive drag / tap badge */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#4A1010]/95 text-[#F8E3B6] border border-[#D4AF37]/50 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
              <span>✨ Drag or tap! 💍</span>
              {rightCompanion.isCustomPos && (
                <button
                  onClick={rightCompanion.resetPosition}
                  className="pointer-events-auto ml-0.5 hover:text-white p-0.5"
                  title="Reset position to corner"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
