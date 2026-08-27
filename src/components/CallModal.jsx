import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Heart, 
  Sparkles,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';

export default function CallModal({
  isOpen,
  callData,
  currentUserId,
  localStream,
  remoteStream,
  isMinimized,
  onToggleMinimize,
  onAccept,
  onDecline,
  onEndCall,
  onSendReaction,
  onToggleMic,
  onToggleVideo,
  onSwitchCamera,
  facingMode = 'user'
}) {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const minLocalVideoRef = useRef(null);
  const minRemoteVideoRef = useRef(null);

  const isIncoming = callData?.status === 'ringing' && callData?.receiver?.uid === currentUserId;
  const isOutgoing = callData?.status === 'ringing' && callData?.caller?.uid === currentUserId;
  const isConnected = callData?.status === 'connected';
  const callType = callData?.callType || 'video';

  const partner = callData?.caller?.uid === currentUserId ? callData?.receiver : callData?.caller;
  const partnerName = getNickname(partner?.name) || 'Partner';
  const partnerPhoto = partner?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  // Attach local media stream to video elements
  useEffect(() => {
    if (localStream) {
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      if (minLocalVideoRef.current) minLocalVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isMinimized, isConnected, isOutgoing]);

  // Attach remote media stream to video elements
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      if (minRemoteVideoRef.current) minRemoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isMinimized, isConnected]);

  // Track call duration when connected
  useEffect(() => {
    let timer;
    if (isConnected) {
      const startTime = callData?.connectedAtIso ? new Date(callData.connectedAtIso).getTime() : Date.now();
      timer = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isConnected, callData?.connectedAtIso]);

  // Listen to in-call reactions
  useEffect(() => {
    if (callData?.reaction?.id) {
      const newHeart = {
        id: callData.reaction.id + Math.random(),
        emoji: callData.reaction.emoji || '💖',
        left: 20 + Math.random() * 60,
        scale: 0.9 + Math.random() * 0.5,
        rotation: Math.random() * 40 - 20
      };
      setFloatingHearts(prev => [...prev, newHeart]);
      setTimeout(() => {
        setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1600);
    }
  }, [callData?.reaction?.id]);

  // ── Guard: render nothing when modal is not active ──
  if ((!isOpen && !isMinimized) || !callData) {
    return null;
  }

  // Format call duration MM:SS
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMicToggle = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
    if (onToggleMic) onToggleMic();
  };

  const handleVideoToggle = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
    if (onToggleVideo) onToggleVideo();
  };

  const handleSwitchCamera = async () => {
    if (onSwitchCamera) {
      const newMode = await onSwitchCamera(currentFacingMode);
      setCurrentFacingMode(newMode);
    }
  };

  const triggerReaction = (emoji = '💖') => {
    // Spawn local burst
    const newHeart = {
      id: Date.now() + Math.random(),
      emoji,
      left: 20 + Math.random() * 60,
      scale: 1 + Math.random() * 0.4,
      rotation: Math.random() * 40 - 20
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1600);

    if (onSendReaction) onSendReaction(emoji);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. MINIMIZED FLOATING CALL BUBBLE (PIP)
  // ─────────────────────────────────────────────────────────────
  if (isMinimized && isConnected) {
    return (
      <div className="fixed bottom-20 sm:bottom-24 right-4 z-50 animate-fadeIn">
        <div className="relative w-44 sm:w-52 bg-[#1C1D24] border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden p-2.5 space-y-2 group">
          
          {/* Video or Avatar Thumbnail */}
          <div className="relative w-full aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center">
            {callType === 'video' && remoteStream ? (
              <video
                ref={minRemoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] mx-auto shadow-md"
                />
              </div>
            )}

            {/* Timer Badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#F8E3B6]">
              {formatDuration(callDuration)}
            </div>

            {/* Expand Button */}
            <button
              type="button"
              onClick={onToggleMinimize}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md"
              title="Expand call"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Bottom Bar: Name + Mute + End Call */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#FDFBF7] truncate max-w-[80px]">
              {partnerName}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMicMuted ? 'bg-red-500/80 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
                title={isMicMuted ? 'Unmute' : 'Mute'}
              >
                {isMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={onEndCall}
                className="w-7 h-7 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-xs"
                title="End Call"
              >
                <PhoneOff className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. FULLSCREEN / MODAL VIEW (Incoming, Outgoing & Connected)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-lg animate-fadeIn overflow-hidden">
      
      {/* Floating Reaction Hearts Burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingHearts.map(h => (
          <span
            key={h.id}
            className="absolute bottom-24 text-4xl animate-floatUp opacity-0 select-none"
            style={{
              left: `${h.left}%`,
              transform: `rotate(${h.rotation}deg) scale(${h.scale})`
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      <div 
        className="relative w-full max-w-xl bg-[#14151B] border sm:border-2 border-[#D4AF37]/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[800px] text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 backdrop-blur-md border-b border-white/10 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
            <div>
              <h3 className="font-serif-vintage font-bold text-base text-[#F8E3B6] leading-tight">
                {isConnected ? `${partnerName}` : isIncoming ? `Incoming Call` : `Calling ${partnerName}...`}
              </h3>
              <p className="text-[10px] font-mono text-white/70">
                {isConnected ? formatDuration(callDuration) : callType === 'video' ? 'HD Video Call' : 'Voice Call'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                type="button"
                onClick={onToggleMinimize}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Minimize call"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            A. INCOMING CALL RINGING SCREEN
           ───────────────────────────────────────────────────────────── */}
        {isIncoming && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-8 text-center space-y-6">
            
            <div className="pt-6 space-y-4">
              {/* Pulsating Partner Avatar Ring */}
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-[#A83232]/40 animate-ping" />
                <div className="absolute -inset-3 rounded-full border-2 border-[#D4AF37]/60 animate-pulse" />
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#D4AF37] shadow-2xl mx-auto"
                />
              </div>

              <div>
                <h2 className="font-serif-vintage font-bold text-2xl sm:text-3xl text-[#F8E3B6]">
                  {partnerName}
                </h2>
                <p className="text-sm text-white/80 flex items-center justify-center gap-1.5 mt-1 font-sans">
                  {callType === 'video' ? <Video className="w-4 h-4 text-[#D4AF37]" /> : <Phone className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Incoming {callType === 'video' ? 'Video' : 'Voice'} Call</span>
                </p>
              </div>
            </div>

            {/* Accept & Decline Buttons */}
            <div className="flex items-center justify-center gap-8 w-full pb-4">
              
              {/* Decline Button */}
              <button
                type="button"
                onClick={onDecline}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-rose-300">Decline</span>
              </button>

              {/* Accept Button */}
              <button
                type="button"
                onClick={onAccept}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ring-4 ring-emerald-400/40 animate-pulse">
                  {callType === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                </div>
                <span className="text-xs font-bold text-emerald-300">Accept</span>
              </button>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            B. OUTGOING CALL RINGING SCREEN
           ───────────────────────────────────────────────────────────── */}
        {isOutgoing && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-8 text-center space-y-6">
            
            <div className="pt-6 space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-[#D4AF37]/30 animate-ping" />
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#D4AF37] shadow-2xl mx-auto"
                />
              </div>

              <div>
                <h2 className="font-serif-vintage font-bold text-2xl sm:text-3xl text-[#F8E3B6]">
                  {partnerName}
                </h2>
                <p className="text-sm text-white/80 flex items-center justify-center gap-1.5 mt-1 font-sans animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Calling your love...</span>
                </p>
              </div>
            </div>

            {/* End / Cancel Outgoing Call Button */}
            <div className="pb-4">
              <button
                type="button"
                onClick={onEndCall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-rose-300">Cancel</span>
              </button>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            C. CONNECTED CALL SCREEN (Video or Voice)
           ───────────────────────────────────────────────────────────── */}
        {isConnected && (
          <div className="relative flex-1 flex flex-col bg-black overflow-hidden">
            
            {/* Main Stage (Remote Video or Audio Wave Visualizer) */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              
              {callType === 'video' && remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Voice Call Visualizer Screen */
                <div className="text-center space-y-6 p-6">
                  <div className="relative inline-block">
                    <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/20 animate-pulse" />
                    <img
                      src={partnerPhoto}
                      alt={partnerName}
                      className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#D4AF37] shadow-2xl mx-auto"
                    />
                  </div>

                  <div>
                    <h3 className="font-serif-vintage font-bold text-2xl text-[#F8E3B6]">
                      {partnerName}
                    </h3>
                    
                    {/* Animated Sound Wave Bars */}
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                      {[40, 70, 100, 60, 85, 45, 90, 60, 75, 50].map((h, i) => (
                        <span
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-[#D4AF37] to-[#F8E3B6] rounded-full animate-pulse"
                          style={{
                            height: `${h * 0.4}px`,
                            animationDelay: `${i * 0.12}s`,
                            animationDuration: '0.8s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Local Video Thumbnail PIP (in bottom-right of stage during Video Call) */}
              {callType === 'video' && localStream && (
                <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-3/4 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-black/80 z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-white/70">
                      Camera Off
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom In-Call Controls Toolbar */}
            <div className="flex items-center justify-around px-4 py-4 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 z-30">
              
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera Toggle (Video Call Only) */}
              {callType === 'video' && (
                <button
                  type="button"
                  onClick={handleVideoToggle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                  title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Flip Camera (Mobile Video Call) */}
              {callType === 'video' && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  title="Switch Front/Back camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {/* Romantic Floating Heart Burst */}
              <button
                type="button"
                onClick={() => triggerReaction('💖')}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#A83232] to-[#D4AF37] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-125 cursor-pointer shadow-lg"
                title="Send hearts to partner 💕"
              >
                <Heart className="w-6 h-6 fill-current text-[#FDFBF7]" />
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={onEndCall}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

            </div>

          </div>
        )}

        {/* Security watermark footer */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-black/90 text-[9px] text-white/50 border-t border-white/5 shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Encrypted Peer-to-Peer Stream • LettersForLater</span>
        </div>

      </div>
    </div>
  );
}
