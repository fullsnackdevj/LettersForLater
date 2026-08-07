import React, { useState } from 'react';
import { Lock, Unlock, X, CheckCircle2, Users, AlertCircle, Key, RefreshCw } from 'lucide-react';

export default function UnlockTimelineModal({ isOpen, onClose, pairInfo, currentUser, onSaveUnlockCode }) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentUserId = currentUser?.uid || 'demo-user-1';
  
  // pairInfo.unlockCodes: { 'user1_uid': 'code', 'user2_uid': 'code' }
  const unlockCodes = pairInfo?.unlockCodes || {};
  const myEnteredCode = unlockCodes[currentUserId];
  
  const enteredUserIds = Object.keys(unlockCodes);
  const partnerId = enteredUserIds.find(id => id !== currentUserId);
  const partnerEnteredCode = partnerId ? unlockCodes[partnerId] : undefined;

  // Case-insensitive trimmed check
  const isMatch = Boolean(
    myEnteredCode && 
    partnerEnteredCode && 
    myEnteredCode.trim().toLowerCase() === partnerEnteredCode.trim().toLowerCase()
  );

  const isMismatch = Boolean(
    myEnteredCode && 
    partnerEnteredCode && 
    !isMatch
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('Please enter a passcode.');
      return;
    }
    setErrorMsg('');
    onSaveUnlockCode(inputCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#36271C]/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#E2D7C7] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Vintage Tape Strip */}
        <div className="tape-strip"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9E8B75] hover:text-[#36271C] p-1 rounded-full hover:bg-[#EFE9DE] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF5EC] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner">
            {isMatch ? (
              <Unlock className="w-7 h-7 text-emerald-600 animate-bounce" />
            ) : (
              <Lock className="w-7 h-7 text-[#A83232]" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold font-serif-vintage text-center text-[#36271C] mb-2">
          Reveal All the Letters
        </h2>
        <p className="text-xs text-center text-[#4A3B2C] mb-6 leading-relaxed">
          The year 2032 has arrived! Both you and your partner must click <strong>"Reveal All the Letters"</strong> and enter the exact same secret passcode (e.g. <em>Kiss</em>) to unlock the letters together.
        </p>

        {myEnteredCode ? (
          <div className="space-y-4">
            {/* My entered passcode card */}
            <div className="bg-[#EFE9DE] rounded-xl p-4 text-center border border-[#E2D7C7]">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your Passcode Saved: <strong className="font-mono text-base text-[#36271C]">"{myEnteredCode}"</strong></span>
              </div>
              <p className="text-[11px] text-[#9E8B75]">Locked in until your partner enters theirs.</p>
            </div>
            
            {!partnerEnteredCode ? (
              <div className="bg-[#FAF5EC] rounded-xl p-4 text-center border border-[#D2C3B0] animate-pulse space-y-1">
                <div className="flex items-center justify-center gap-2 text-[#C86D51] font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Waiting for partner...</span>
                </div>
                <p className="text-[11px] text-[#9E8B75]">
                  Ask your partner to click <strong>"Reveal All the Letters"</strong> and enter their passcode.
                </p>
                <button
                  type="button"
                  onClick={() => onSaveUnlockCode(null)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[#A83232] font-semibold hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Change My Passcode
                </button>
              </div>
            ) : isMismatch ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Incorrect Passcode!</span>
                </div>
                <p className="text-xs text-rose-800">
                  Passcodes do not match. You entered <strong>"{myEnteredCode}"</strong>, but your partner entered a different passcode.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInputCode(myEnteredCode);
                    onSaveUnlockCode(null); // Reset code to edit
                  }}
                  className="mt-2 px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Passcode Again
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Passcodes Match! Vault Unlocked!</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Both you and your partner typed <strong>"{myEnteredCode}"</strong>!
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B2C] mb-1.5 uppercase tracking-wider text-center">
                Enter Secret Passcode
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. Kiss, Forever, Joe"
                className="w-full bg-[#FAF6F0] border border-[#D2C3B0] rounded-xl px-4 py-3 font-mono text-center font-bold text-lg tracking-wider text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
              {errorMsg && (
                <p className="text-xs text-rose-600 mt-1 text-center font-semibold">{errorMsg}</p>
              )}
            </div>
            
            {partnerEnteredCode && (
              <div className="text-xs text-center text-[#C86D51] font-semibold flex items-center justify-center gap-1 bg-[#FAF5EC] py-2 rounded-lg border border-[#EBE3D5]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your partner has already entered their passcode!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Lock In Passcode</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

