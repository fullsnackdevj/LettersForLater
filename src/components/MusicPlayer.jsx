import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc, Music, Sparkles } from 'lucide-react';

export default function MusicPlayer({ audioSrc = '/Tugon (The Wedding Version).mp3', songTitle = 'Tugon (The Wedding Version)' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  // Attempt Autoplay on Mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setIsAutoplayBlocked(false);
      } catch (err) {
        // Autoplay was blocked by browser policy requiring user gesture
        console.log('Autoplay audio blocked by browser policy:', err);
        setIsPlaying(false);
        setIsAutoplayBlocked(true);
      }
    };

    attemptPlay();

    // Global first-click handler to unlock audio if blocked
    const handleFirstUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        }).catch(() => {});
      }
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('touchstart', handleFirstUserInteraction);

    return () => {
      if (audio) audio.pause();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [audioSrc]);

  // Toggle Play / Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        setIsAutoplayBlocked(false);
      }).catch(err => {
        console.error('Playback error:', err);
      });
    }
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="bg-[#4A1010] text-[#F8E3B6] border-b border-[#D4AF37]/30 px-3 sm:px-6 py-1.5 shadow-md relative z-50">
      {/* Hidden HTML5 Audio/Video Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        loop
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        
        {/* Left: Spinning Vinyl & Song Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <Disc className={`w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] ${isPlaying ? 'animate-spinVinyl' : 'opacity-60'}`} />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-serif-vintage font-bold text-xs sm:text-sm text-[#FDFBF7] truncate">
              {songTitle}
            </span>

            {isPlaying && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E5AB] text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                Playing
              </span>
            )}
          </div>
        </div>

        {/* Center: Tap to Play/Unmute Prompt if Autoplay Blocked */}
        {isAutoplayBlocked && !isPlaying && (
          <button
            onClick={togglePlay}
            className="animate-bounce bg-[#D4AF37] text-[#3D2600] px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1 shrink-0"
          >
            <Music className="w-3 h-3 fill-current" />
            <span>Tap to Play Song 🎵</span>
          </button>
        )}

        {/* Right Controls: Play/Pause & Mute Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center"
            title={isPlaying ? "Pause Music" : "Play Music"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#F8E3B6]" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
