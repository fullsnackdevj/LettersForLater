import React, { useState, useEffect } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { getCurrentPHT, generateDynamicPasscode, validateAppLockPasscode } from '../utils/pht';

export default function AppLockModal({ isOpen, onUnlockSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHint, setShowHint] = useState(false);
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

  const currentDynamicCode = generateDynamicPasscode(new Date(), 'Asia/Manila');

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
      setErrorMsg('Incorrect passcode! Check current day, date, & time (e.g. fri12145am) or use your backup code.');
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

        {/* Passcode Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">
                Enter Security Passcode
              </label>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-[#C86D51] hover:underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showHint ? 'Hide Format' : 'Passcode Format'}</span>
              </button>
            </div>

            <input
              type="text"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. fri12145am"
              autoFocus
              className="w-full bg-[#FAF6F0] border-2 border-[#D2C3B0] focus:border-[#A83232] rounded-2xl px-4 py-3.5 font-mono text-center font-bold text-lg tracking-wider text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#A83232]/20 transition-all placeholder-[#B0A290]"
            />

            {/* Passcode Format Hint Box */}
            {showHint && (
              <div className="mt-2 bg-[#F3E5AB]/40 border border-[#D4AF37]/50 rounded-xl p-3 text-[11px] text-[#4A3B2C] space-y-1 animate-fadeIn">
                <p className="font-bold text-[#8B0000]">🔑 Passcode Formula:</p>
                <p><code>[day][date][time]</code> (lowercase, no colons/spaces)</p>
                <p className="text-[#9E8B75] italic">Example for Fri, 12th, 1:45am → <strong>fri12145am</strong></p>
                <p className="text-[10px] text-amber-900 pt-1 font-semibold">
                  💡 Hint for right now: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">{currentDynamicCode}</span>
                </p>
              </div>
            )}

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
