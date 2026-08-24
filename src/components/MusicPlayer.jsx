import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Disc, 
  Music, 
  Sparkles,
  SkipBack,
  SkipForward,
  ListMusic,
  Check,
  Radio
} from 'lucide-react';
import { DEFAULT_PLAYLIST } from '../data/playlist';

export default function MusicPlayer({ playlist = DEFAULT_PLAYLIST }) {
  const audioRef = useRef(null);
  
  // Track Index with LocalStorage Persistence
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('lettersforlater_music_index');
      const idx = parseInt(saved, 10);
      return !isNaN(idx) && idx >= 0 && idx < playlist.length ? idx : 0;
    } catch {
      return 0;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [hasOpenedPlaylist, setHasOpenedPlaylist] = useState(() => {
    try {
      return localStorage.getItem('lettersforlater_music_playlist_opened') === 'true';
    } catch {
      return false;
    }
  });

  const currentTrack = playlist[currentTrackIndex] || playlist[0] || {
    id: 'default',
    title: 'Background Music',
    artist: '',
    src: ''
  };

  // Sync track index to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lettersforlater_music_index', currentTrackIndex.toString());
    } catch {}
  }, [currentTrackIndex]);

  // Attempt Autoplay / Track Change Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    audio.src = currentTrack.src;
    audio.load();

    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setIsAutoplayBlocked(false);
      } catch (err) {
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
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [currentTrack.src]);

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

  // Switch to Next Song
  const handleNextTrack = () => {
    if (playlist.length <= 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
  };

  // Switch to Previous Song
  const handlePrevTrack = () => {
    if (playlist.length <= 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    setCurrentTrackIndex(prev => (prev - 1 + playlist.length) % playlist.length);
  };

  // Select Specific Song from Playlist
  const handleSelectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaylistOpen(false);
  };

  return (
    <div className="bg-[#4A1010] text-[#F8E3B6] border-b border-[#D4AF37]/30 px-3 sm:px-6 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[50px] flex items-center shadow-md relative z-50 select-none">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
        onEnded={handleNextTrack}
        loop={playlist.length === 1}
      />

      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left: Spinning Vinyl & Scrolling Marquee Track Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
          <div 
            className="relative shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={togglePlay}
            title={isPlaying ? "Pause Music" : "Play Music"}
          >
            <Disc className={`w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-[#D4AF37] ${isPlaying ? 'animate-spinVinyl' : 'opacity-60'}`} />
          </div>

          {/* Marquee Track Info Container (Title — Artist) */}
          <div className="relative overflow-hidden flex-1 max-w-[170px] xs:max-w-[240px] sm:max-w-[340px] md:max-w-[480px] lg:max-w-[620px] [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)]">
            <div className="animate-music-marquee inline-flex items-center gap-10 whitespace-nowrap">
              
              {/* First Copy */}
              <div className="flex items-center gap-2 font-serif-vintage font-bold text-xs sm:text-sm text-[#FDFBF7] tracking-wide">
                <span>{currentTrack.title}</span>
                {currentTrack.artist && (
                  <span className="text-[#F3E5AB]/90 font-sans font-medium text-[11px] sm:text-xs">
                    — {currentTrack.artist}
                  </span>
                )}
                <span className="text-[#D4AF37] text-[10px]">✨</span>
              </div>

              {/* Second Copy (for continuous seamless looping) */}
              <div className="flex items-center gap-2 font-serif-vintage font-bold text-xs sm:text-sm text-[#FDFBF7] tracking-wide" aria-hidden="true">
                <span>{currentTrack.title}</span>
                {currentTrack.artist && (
                  <span className="text-[#F3E5AB]/90 font-sans font-medium text-[11px] sm:text-xs">
                    — {currentTrack.artist}
                  </span>
                )}
                <span className="text-[#D4AF37] text-[10px]">✨</span>
              </div>

            </div>
          </div>
        </div>

        {/* Center: Tap to Play/Unmute Prompt if Autoplay Blocked */}
        {isAutoplayBlocked && !isPlaying && (
          <button
            onClick={togglePlay}
            className="animate-bounce bg-[#D4AF37] text-[#3D2600] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Music className="w-3 h-3 fill-current" />
            <span>Tap to Play Song 🎵</span>
          </button>
        )}

        {/* Right Controls: Prev, Play/Pause, Next, Playlist, Mute */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Previous Track (if multiple songs) */}
          {playlist.length > 1 && (
            <button
              onClick={handlePrevTrack}
              className="p-1.5 sm:p-2 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="p-1.5 sm:p-2 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
            title={isPlaying ? "Pause Music" : "Play Music"}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track (if multiple songs) */}
          {playlist.length > 1 && (
            <button
              onClick={handleNextTrack}
              className="p-1.5 sm:p-2 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Playlist Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !isPlaylistOpen;
                setIsPlaylistOpen(next);
                if (!hasOpenedPlaylist) {
                  setHasOpenedPlaylist(true);
                  try {
                    localStorage.setItem('lettersforlater_music_playlist_opened', 'true');
                  } catch {}
                }
              }}
              className={`relative p-1.5 sm:p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                isPlaylistOpen
                  ? 'bg-[#D4AF37] text-[#3D2600] border-[#D4AF37]'
                  : 'bg-[#6E1A1A] hover:bg-[#8B0000] border-[#D4AF37]/40 text-[#F8E3B6]'
              }`}
              title="View Playlist"
              aria-label="View playlist"
            >
              <ListMusic className="w-3.5 h-3.5" />
              {playlist.length > 1 && !hasOpenedPlaylist && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#3D2600] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {playlist.length}
                </span>
              )}
            </button>

            {/* Playlist Dropdown Popover */}
            {isPlaylistOpen && (
              <>
                {/* Backdrop dismiss */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsPlaylistOpen(false)} 
                />

                <div 
                  className="absolute right-0 top-10 w-64 sm:w-72 bg-[#2B0B0B]/95 backdrop-blur-xl border border-[#D4AF37]/60 rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2 py-1 border-b border-[#D4AF37]/20 text-[#F8E3B6]">
                    <div className="flex items-center gap-1.5 font-bold font-serif-vintage text-xs">
                      <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Our Soundtrack</span>
                    </div>
                    <span className="text-[10px] text-[#F3E5AB]/70 font-mono">
                      {playlist.length} {playlist.length === 1 ? 'Song' : 'Songs'}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {playlist.map((track, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      return (
                        <button
                          key={track.id || idx}
                          type="button"
                          onClick={() => handleSelectTrack(idx)}
                          className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F8E3B6]'
                              : 'hover:bg-white/10 text-white/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isCurrent 
                                ? 'bg-[#D4AF37] text-[#3D2600]' 
                                : 'bg-black/40 text-white/60'
                            }`}>
                              {isCurrent && isPlaying ? (
                                <Disc className="w-3.5 h-3.5 animate-spinVinyl text-[#3D2600]" />
                              ) : (
                                idx + 1
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className={`font-semibold text-xs truncate ${isCurrent ? 'text-[#FDFBF7]' : 'text-white/90'}`}>
                                {track.title}
                              </p>
                              {track.artist && (
                                <p className="text-[10px] text-white/50 truncate">
                                  {track.artist}
                                </p>
                              )}
                            </div>
                          </div>

                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1 border-t border-white/10 text-[10px] text-center text-white/50 font-handwriting text-sm">
                    Drop more songs in <code className="text-[#D4AF37] font-mono text-[9px]">public/songs/</code> anytime!
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-lg bg-[#6E1A1A] hover:bg-[#8B0000] border border-[#D4AF37]/40 text-[#F8E3B6] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
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
