import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  RotateCcw, 
  Check, 
  Volume2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

const MAX_DURATION_SEC = 60; // Strictly 60-second limit

export default function AudioRecorderWidget({
  onAudioRecorded, // returns { audioBlob, dataUrl, durationSec, sizeKb }
  onCancel,
  existingAudio = null // { dataUrl, storageUrl, durationSec }
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(existingAudio?.storageUrl || existingAudio?.dataUrl || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(existingAudio?.durationSec || 0);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1 for visual meter
  const [errorMsg, setErrorMsg] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previewAudioRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up streams & audio context on unmount
  const cleanupRecording = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    return () => cleanupRecording();
  }, [cleanupRecording]);

  // Start recording
  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    setIsPlayingPreview(false);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1 // Mono audio for 50% size reduction
        } 
      });
      streamRef.current = stream;

      // Setup audio analyzer for volume visualization
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setVolumeLevel(Math.min(1, avg / 128));
            animationFrameRef.current = requestAnimationFrame(updateMeter);
          }
        };
        updateMeter();
      } catch (err) {
        console.warn('AudioContext visualization not available:', err);
      }

      // Pick best supported low-bitrate MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
        else mimeType = ''; // fallback default
      }

      const options = mimeType ? { 
        mimeType, 
        audioBitsPerSecond: 24000 // Ultra-efficient 24 kbps for speech
      } : { audioBitsPerSecond: 24000 };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          const sizeKb = Math.round(blob.size / 1024);
          setAudioUrl(url);
          setDuration(recordingSecondsRef.current);
          if (onAudioRecorded) {
            onAudioRecorded({
              audioBlob: blob,
              dataUrl,
              durationSec: recordingSecondsRef.current,
              sizeKb
            });
          }
        };
        reader.readAsDataURL(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(500); // chunk every 500ms
      setIsRecording(true);

      // Start ticker
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        recordingSecondsRef.current = elapsed;
        setRecordingSeconds(elapsed);

        if (elapsed >= MAX_DURATION_SEC) {
          stopRecording();
        }
      }, 250);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('Could not access your microphone. Please allow microphone permissions.');
      cleanupRecording();
    }
  };

  const recordingSecondsRef = useRef(0);

  const stopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setVolumeLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
  };

  // Preview Playback Handlers
  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const resetRecording = () => {
    cleanupRecording();
    setAudioUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    setDuration(0);
    setIsPlayingPreview(false);
    if (onAudioRecorded) {
      onAudioRecorded(null);
    }
  };

  const formatSec = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const remainingSecs = Math.max(0, MAX_DURATION_SEC - recordingSeconds);
  const progressPct = (recordingSeconds / MAX_DURATION_SEC) * 100;

  return (
    <div className="bg-[#FAF5EC] border-2 border-[#E2D7C7] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A83232]/15 text-[#A83232] flex items-center justify-center font-bold text-sm">
            🎙️
          </div>
          <div>
            <h4 className="font-serif-vintage font-bold text-sm text-[#36271C] flex items-center gap-1.5">
              <span>Spoken Words</span>
              <span className="text-[10px] font-mono font-normal text-[#9E8B75] bg-[#EFE9DE] px-2 py-0.5 rounded-full">
                60s Max • Safe Archival
              </span>
            </h4>
            <p className="text-[11px] text-[#9E8B75] font-handwriting text-sm">
              Your voice sealed in time (~120 KB ultra-light footprint)
            </p>
          </div>
        </div>

        {onCancel && !isRecording && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#9E8B75] hover:text-[#36271C] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STATE 1: Not recording & no recorded audio yet */}
      {!isRecording && !audioUrl && (
        <div className="text-center py-4 space-y-3">
          <button
            type="button"
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] flex items-center justify-center mx-auto shadow-md border-2 border-[#D4AF37]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title="Start Recording (60s max)"
          >
            <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#4A3B2C]">Tap to Record Voice Note</p>
            <p className="text-[11px] text-[#9E8B75]">Up to 60 seconds of heartfelt words</p>
          </div>
        </div>
      )}

      {/* STATE 2: Actively Recording */}
      {isRecording && (
        <div className="py-2 space-y-4">
          
          {/* Circular Countdown / Progress Bar */}
          <div className="flex items-center justify-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <div 
                className="absolute inset-0 rounded-full bg-[#A83232]/20 animate-ping"
                style={{ animationDuration: '1.5s' }}
              />
              {/* Circular Progress SVG */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#EFE9DE"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#A83232"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 - (213.6 * progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              </svg>
              {/* Timer text in center */}
              <div className="absolute text-center">
                <span className="font-mono font-bold text-xs text-[#A83232]">
                  {formatSec(recordingSeconds)}
                </span>
                <span className="block text-[8px] text-[#9E8B75] -mt-0.5">
                  -{remainingSecs}s
                </span>
              </div>
            </div>

            {/* Live Waveform Bars */}
            <div className="flex items-center gap-1 h-10 px-3 bg-[#EFE9DE] rounded-2xl border border-[#D2C3B0]/60">
              {Array.from({ length: 12 }).map((_, i) => {
                const heightMult = Math.sin((i / 12) * Math.PI) * (0.3 + volumeLevel * 0.7);
                const height = Math.max(4, Math.min(32, heightMult * 32));
                return (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-[#A83232] transition-all duration-75"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls: Stop Recording */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Finish & Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Recorded Audio Preview */}
      {!isRecording && audioUrl && (
        <div className="space-y-3">
          <div className="bg-[#EFE9DE] border border-[#D2C3B0] rounded-2xl p-3 flex items-center justify-between gap-3">
            
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-10 h-10 rounded-full bg-[#A83232] text-[#F8E3B6] flex items-center justify-center shadow-sm hover:bg-[#8B0000] transition-colors cursor-pointer shrink-0"
            >
              {isPlayingPreview ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Playback Progress */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5C4A3A]">
                <span>{formatSec(playbackTime)}</span>
                <span>{formatSec(duration || recordingSeconds)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#D2C3B0]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A83232] rounded-full transition-all duration-100"
                  style={{
                    width: `${duration > 0 ? (playbackTime / duration) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Reset / Re-record button */}
            <button
              type="button"
              onClick={resetRecording}
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#9E8B75] hover:text-[#A83232] flex items-center justify-center border border-[#D2C3B0] transition-colors cursor-pointer shrink-0"
              title="Re-record voice note"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#7A6855] px-1">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Audio attached to letter</span>
            </span>
            <span className="font-mono text-[10px] text-[#9E8B75]">
              {duration ? `${duration}s duration` : ''}
            </span>
          </div>

          {/* Hidden HTML5 Audio Element for preview playback */}
          <audio
            ref={previewAudioRef}
            src={audioUrl}
            onTimeUpdate={() => {
              if (previewAudioRef.current) {
                setPlaybackTime(previewAudioRef.current.currentTime);
              }
            }}
            onEnded={() => {
              setIsPlayingPreview(false);
              setPlaybackTime(0);
            }}
            onLoadedMetadata={() => {
              if (previewAudioRef.current && previewAudioRef.current.duration && !duration) {
                setDuration(Math.round(previewAudioRef.current.duration));
              }
            }}
            className="hidden"
          />
        </div>
      )}

    </div>
  );
}
