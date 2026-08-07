import React, { useState, useEffect } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getCurrentPHT, validateAppLockPasscode } from '../utils/pht';

export default function AppLockModal({ isOpen, onUnlockSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phtInfo, setPhtInfo] = useState(getCurrentPHT());

  // Live PHT Clock Ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPhtInfo(getCurrentPHT());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Please enter the security passcode.');
      return;
    }

    if (validateAppLockPasscode(passcode)) {
      setErrorMsg('');
      onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect passcode. Access denied.');
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
            <Lock className="w-8 h-8 text-[#F8E3B6]" />
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

        {/* Passcode Entry Form with Eye Toggle */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A3B2C] uppercase tracking-wider mb-1.5 text-center">
              Enter Security Passcode
            </label>

            <div className="relative">
              <input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter Passcode"
                autoFocus
                className="w-full bg-[#FAF6F0] border-2 border-[#D2C3B0] focus:border-[#A83232] rounded-2xl pl-4 pr-12 py-3.5 font-mono text-center font-bold text-lg tracking-wider text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#A83232]/20 transition-all placeholder-[#B0A290]"
              />

              {/* Eye Toggle Visibility Button */}
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E8B75] hover:text-[#36271C] p-1.5 rounded-lg transition-colors"
                title={showPasscode ? "Hide Passcode" : "Show Passcode"}
              >
                {showPasscode ? <EyeOff className="w-5 h-5 text-[#A83232]" /> : <Eye className="w-5 h-5 text-[#9E8B75]" />}
              </button>
            </div>

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
            className="w-full py-3.5 px-4 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-sm rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-[#D4AF37]/50"
          >
            <Key className="w-4 h-4" />
            <span>Unlock Vault Access</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-[#9E8B75] italic">
          LettersForLater Time Capsule Protection • Keeps memories safe
        </p>

      </div>
    </div>
  );
}


