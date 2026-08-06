import React, { useState } from 'react';
import { Lock, Unlock, X, CheckCircle2, Users } from 'lucide-react';

export default function UnlockTimelineModal({ isOpen, onClose, pairInfo, currentUser, onSaveUnlockCode }) {
  const [inputCode, setInputCode] = useState('');
  
  if (!isOpen) return null;

  const currentUserId = currentUser?.uid || 'demo-user-1';
  
  // pairInfo.unlockCodes: { 'user1_uid': 'code', 'user2_uid': 'code' }
  const unlockCodes = pairInfo?.unlockCodes || {};
  const myEnteredCode = unlockCodes[currentUserId];
  
  // Count how many users have entered a code
  const enteredUserIds = Object.keys(unlockCodes);
  const numEntered = enteredUserIds.length;
  
  // Check if someone else (partner) has entered a code
  const partnerEnteredCode = enteredUserIds.find(id => id !== currentUserId) !== undefined;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    
    onSaveUnlockCode(inputCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#36271C]/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#E2D7C7] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Tape Effect */}
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
          <div className="w-12 h-12 rounded-full bg-[#FAF5EC] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            {myEnteredCode && partnerEnteredCode && Object.values(unlockCodes).every(c => c === myEnteredCode) ? (
              <Unlock className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold font-serif-vintage text-center text-[#36271C] mb-2">
          Unlock 2032 Timeline
        </h2>
        <p className="text-sm text-center text-[#4A3B2C] mb-6">
          The year 2032 has finally arrived! To open your time capsule timeline, both you and your partner must agree on and enter the same Unlock Code.
        </p>

        {myEnteredCode ? (
          <div className="space-y-4">
            <div className="bg-[#EFE9DE] rounded-xl p-4 text-center border border-[#E2D7C7]">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>You entered your code</span>
              </div>
              <p className="text-xs text-[#9E8B75]">Your code is locked in.</p>
            </div>
            
            {!partnerEnteredCode ? (
              <div className="bg-[#FAF5EC] rounded-xl p-4 text-center border border-[#E2D7C7] animate-pulse">
                <div className="flex items-center justify-center gap-2 text-[#C86D51] font-bold mb-1">
                  <Users className="w-5 h-5" />
                  <span>Waiting for partner...</span>
                </div>
                <p className="text-xs text-[#9E8B75]">Your partner needs to enter their code to unlock.</p>
              </div>
            ) : (
              <div className="bg-[#FAF5EC] rounded-xl p-4 text-center border border-[#E2D7C7]">
                <div className="flex items-center justify-center gap-2 text-red-500 font-bold mb-1">
                  <Lock className="w-5 h-5" />
                  <span>Codes do not match</span>
                </div>
                <p className="text-xs text-[#9E8B75]">You and your partner entered different codes. Please try again.</p>
                <button
                  onClick={() => onSaveUnlockCode(null)} // Reset my code
                  className="mt-3 text-xs font-bold text-[#A83232] hover:underline"
                >
                  Change My Code
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B2C] mb-1.5 uppercase tracking-wider">
                Enter Unlock Code
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. FOREVER"
                className="w-full bg-[#FAF6F0] border border-[#D2C3B0] rounded-xl px-4 py-3 font-mono text-center font-bold text-lg tracking-widest text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>
            
            {partnerEnteredCode && (
              <div className="text-xs text-center text-[#C86D51] font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Your partner has already entered their code!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#B89626] text-[#3D2600] font-bold text-sm rounded-xl transition-all shadow-md"
            >
              Lock In My Code
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
