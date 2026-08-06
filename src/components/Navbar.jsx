import React, { useState, useEffect } from 'react';
import { Clock, Lock, Heart, Key, LogIn, LogOut, User, Sparkles, AlertCircle } from 'lucide-react';
import { getCurrentPHT, getCountdownToTarget } from '../utils/pht';

export default function Navbar({ 
  user, 
  pairInfo, 
  onOpenAuth, 
  onOpenPairing, 
  onSignOut 
}) {
  const [phtTime, setPhtTime] = useState(getCurrentPHT().fullString);
  const [countdown, setCountdown] = useState(getCountdownToTarget(pairInfo?.targetUnlockDate));
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Live PHT Clock & Countdown Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setPhtTime(getCurrentPHT().fullString);
      setCountdown(getCountdownToTarget(pairInfo?.targetUnlockDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [pairInfo]);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F2EB]/90 backdrop-blur-md border-b border-[#E2D7C7] px-4 lg:px-8 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="wax-seal w-10 h-10 text-lg font-serif font-bold cursor-pointer hover:scale-105 transition-transform">
            L
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-serif-vintage tracking-tight text-[#36271C]">
              LettersForLater
            </h1>
            <p className="text-xs text-[#9E8B75] hidden sm:block font-handwriting text-base -mt-1">
              keeping our memories until the right time
            </p>
          </div>
        </div>

        {/* Live PHT Time & 2032 Countdown Badges */}
        <div className="hidden md:flex items-center gap-3">
          {/* PHT Clock */}
          <div className="flex items-center gap-2 bg-[#EFE9DE] border border-[#E2D7C7] px-3 py-1.5 rounded-full text-xs font-mono text-[#4A3B2C] shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{phtTime}</span>
          </div>

          {/* Countdown Pill */}
          <div className="flex items-center gap-2 bg-[#FAF5EC] border border-[#D4AF37]/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#8B0000] shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37] animate-lock-pulse" />
            <span>
              {countdown.isUnlocked ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Vault Unlocked!
                </span>
              ) : (
                <span>
                  Unlock in <strong className="font-mono text-sm text-[#4A1010]">{countdown.years}y {countdown.days}d {countdown.hours}h {countdown.minutes}m</strong> (2032)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* User & Pair Actions */}
        <div className="flex items-center gap-3">
          
          {/* Pair Code Status Button */}
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-2 bg-[#FDFBF7] hover:bg-[#EFE9DE] border border-[#D2C3B0] text-[#36271C] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            title="Manage Partner Pairing Code"
          >
            <Key className="w-3.5 h-3.5 text-[#C86D51]" />
            <span className="hidden sm:inline">Pair:</span>
            <span className="font-mono font-bold tracking-wider text-[#A83232]">
              {pairInfo?.code || 'PAIR-NOW'}
            </span>
          </button>

          {/* Auth Button / Profile Avatar */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border-2 border-[#D4AF37] hover:scale-105 transition-transform bg-[#FDFBF7]"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {/* Profile Dropdown Drawer */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FDFBF7] border border-[#E2D7C7] rounded-xl shadow-xl p-4 text-xs z-50 animate-fadeIn">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#EFE9DE]">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm text-[#36271C]">{user.displayName}</p>
                      <p className="text-[#9E8B75] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-3 space-y-2 border-b border-[#EFE9DE]">
                    <div className="flex items-center justify-between text-[#4A3B2C]">
                      <span>Pair Status:</span>
                      <span className="font-mono font-bold text-[#A83232]">{pairInfo?.code}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#4A3B2C]">
                      <span>Timezone:</span>
                      <span className="font-mono text-[10px] bg-[#EFE9DE] px-1.5 py-0.5 rounded">PHT (GMT+8)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-[#FAF5EC] hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
