import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function VintageAudioPlayer({
  audioUrl,
  durationSec = 0,
  authorName = 'Partner',
  title = 'Voice Note'
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => (Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0));
  const audioRef = useRef(null);

  useEffect(() => {
    if (Number.isFinite(durationSec) && durationSec > 0) {
      setDuration(durationSec);
    }
  }, [durationSec]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !effectiveDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * effectiveDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatSec = (secs) => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const effectiveDuration = Number.isFinite(duration) && duration > 0 
    ? duration 
    : (Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0);

  const safeCurrentTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;
  const progressPct = effectiveDuration > 0 ? Math.min(100, (safeCurrentTime / effectiveDuration) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-[#2D1F15] via-[#24170E] to-[#1F140D] border border-[#D4AF37]/50 rounded-2xl px-3.5 py-2.5 text-[#FAF5EC] shadow-md select-none my-1">
      
      <div className="flex items-center gap-3">
        
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] flex items-center justify-center shadow-md border border-[#D4AF37]/60 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isPlaying ? 'Pause' : 'Play Voice Note'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Center: Title + Scrubbable Waveform Bar */}
        <div className="flex-1 min-w-0 space-y-1">
          
          {/* Top Label */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#A83232] text-[#F8E3B6] font-bold shrink-0">
                VOICE
              </span>
              <span className="font-serif-vintage font-bold text-xs text-[#F8E3B6] truncate">
                Voice note from {getNickname(authorName)} 💕
              </span>
            </div>

            {/* Time Ticker */}
            <div className="text-[10px] font-mono text-[#D4AF37] shrink-0">
              <span>{formatSec(safeCurrentTime)}</span>
              <span className="text-[#9E8B75] mx-0.5">/</span>
              <span>{effectiveDuration > 0 ? formatSec(effectiveDuration) : '0:60'}</span>
            </div>
          </div>

          {/* Interactive Scrub Waveform */}
          <div
            onClick={handleSeek}
            className="w-full h-4 bg-[#140C07] rounded-md border border-[#D4AF37]/30 p-0.5 flex items-center cursor-pointer relative overflow-hidden group"
          >
            {/* Waveform graphic bars */}
            <div className="absolute inset-0 flex items-center justify-around px-1.5 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
              {Array.from({ length: 28 }).map((_, i) => {
                const heightMult = 0.25 + 0.75 * Math.abs(Math.sin((i / 28) * Math.PI * 3));
                const isPast = (i / 28) * 100 <= progressPct;
                return (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-colors ${
                      isPast ? 'bg-[#F8E3B6]' : 'bg-[#7A6855]'
                    } ${isPlaying ? 'animate-pulse' : ''}`}
                    style={{ 
                      height: `${heightMult * 10}px`,
                      animationDelay: `${(i % 4) * 0.1}s`
                    }}
                  />
                );
              })}
            </div>

            {/* Progress Fill Bar */}
            <div
              className="h-full bg-[#A83232]/50 rounded-xs transition-all pointer-events-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>

        </div>

        {/* Right Animated Mini Cassette Reel */}
        <div className="w-7 h-7 rounded-full bg-[#1A0F08] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
          <div className={`w-4.5 h-4.5 rounded-full border border-dashed border-[#F8E3B6]/60 flex items-center justify-center ${
            isPlaying ? 'animate-spin' : ''
          }`} style={{ animationDuration: '2.5s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          </div>
        </div>

      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          const d = audioRef.current?.duration;
          if (Number.isFinite(d) && d > 0) {
            setDuration(Math.round(d));
          } else if (durationSec) {
            setDuration(durationSec);
          }
        }}
        onDurationChange={() => {
          const d = audioRef.current?.duration;
          if (Number.isFinite(d) && d > 0) {
            setDuration(Math.round(d));
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        className="hidden"
      />

    </div>
  );
}
