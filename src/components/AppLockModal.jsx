import React, { useState, useEffect } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, Camera } from 'lucide-react';
import { getCurrentPHT, validateAppLockPasscode } from '../utils/pht';
import { saveIntruderLog } from '../services/firebase';

export default function AppLockModal({ isOpen, pairCode, onUnlockSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [phtInfo, setPhtInfo] = useState(getCurrentPHT());
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // Live PHT Clock Ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPhtInfo(getCurrentPHT());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Front camera frame snapshot capture
  const captureIntruderSnapshot = async () => {
    let photoDataUrl = '';
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        await video.play();

        // Small delay to allow camera auto-exposure
        await new Promise(res => setTimeout(res, 400));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Stop all video tracks
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.warn('Could not capture camera frame:', err);
    }

    // Save intruder log even if camera stream was blocked
    await saveIntruderLog({
      pairId: pairCode || '#JayFinallyGotAKiss',
      photoDataUrl,
      attemptCount: 3
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCapturing) return;

    if (!passcode.trim()) {
      setErrorMsg('Please enter the security passcode.');
      return;
    }

    if (validateAppLockPasscode(passcode)) {
      setErrorMsg('');
      setFailedAttempts(0);
      onUnlockSuccess();
    } else {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);

      if (nextCount >= 3) {
        // 3rd failed attempt! Trigger camera capture & auto-unlock trap!
        setIsCapturing(true);
        captureIntruderSnapshot().then(() => {
          setIsCapturing(false);
          setFailedAttempts(0);
          onUnlockSuccess(); // Auto-unlock trap!
        });
      } else {
        setErrorMsg('Incorrect passcode. Access denied.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2A1D13] backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FDFBF7] border-2 border-[#D4AF37]/60 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Vintage Paper Tape Strip */}
        <div className="tape-strip"></div>

        {/* Top Header Wax Seal Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="wax-seal w-16 h-16 text-2xl font-serif font-bold shadow-lg">
            {isCapturing ? (
              <Camera className="w-8 h-8 text-[#F8E3B6] animate-pulse" />
            ) : (
              <Lock className="w-8 h-8 text-[#F8E3B6]" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif-vintage text-[#36271C] tracking-tight">
              LettersForLater
            </h1>
            <p className="text-xs text-[#8B0000] font-mono mt-1 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private Vault Security Access</span>
            </p>
          </div>
        </div>

        {/* Current Time Display & Security Description */}
        <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-3.5 rounded-2xl text-center space-y-1">
          <p className="text-[11px] text-[#9E8B75] uppercase font-bold tracking-wider">Current PHT Time</p>
          <p className="text-xs font-mono font-bold text-[#4A3B2C]">{phtInfo.fullString}</p>
        </div>

        {/* Passcode Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A3B2C] uppercase tracking-wider mb-1.5 text-center">
              Enter Security Passcode
            </label>

            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter Passcode"
              disabled={isCapturing}
              autoFocus
              className="w-full bg-[#FAF6F0] border-2 border-[#D2C3B0] focus:border-[#A83232] rounded-2xl px-4 py-3.5 font-mono text-center font-bold text-lg tracking-wider text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#A83232]/20 transition-all placeholder-[#B0A290]"
            />

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isCapturing}
            className="w-full py-3.5 px-4 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-sm rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-[#D4AF37]/50"
          >
            <Key className="w-4 h-4" />
            <span>{isCapturing ? 'Verifying...' : 'Unlock Vault Access'}</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-[#9E8B75] italic">
          LettersForLater Time Capsule Protection • Keeps memories safe
        </p>

      </div>
    </div>
  );
}

