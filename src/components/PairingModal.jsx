import React, { useState } from 'react';
import { Key, Users, CheckCircle2, Copy, Sparkles, X, Heart } from 'lucide-react';

export default function PairingModal({ isOpen, onClose, pairInfo, onSavePair }) {
  const [inputCode, setInputCode] = useState(pairInfo?.code || '');
  const [copied, setCopied] = useState(false);
  const [partnerName, setPartnerName] = useState(pairInfo?.user2?.name || '');

  if (!isOpen) return null;

  const handleGenerateNewCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputCode || 'VALENTINE2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    
    onSavePair({
      code: inputCode.trim().toUpperCase(),
      targetUnlockDate: '2032-08-06T00:00:00+08:00',
      user2: { name: partnerName.trim() || 'Partner 💕' }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#36271C]/60 backdrop-blur-sm animate-fadeIn">
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
          <div className="w-12 h-12 rounded-full bg-[#FAF5EC] border-2 border-[#D4AF37] flex items-center justify-center text-[#A83232]">
            <Key className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-bold font-serif-vintage text-center text-[#36271C] mb-1">
          Pair with Your Partner
        </h2>
        <p className="text-xs text-center text-[#9E8B75] mb-6">
          Connect your 6-digit Secret Pair Code to share the 2032 Time Capsule Vault.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Pair Code Input / Display */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B2C] mb-1.5 uppercase tracking-wider">
              Secret Pair Code (6 Digits / Letters)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. LOVE32"
                maxLength={12}
                className="w-full bg-[#FAF6F0] border border-[#D2C3B0] rounded-xl px-4 py-2.5 font-mono text-center font-bold text-lg tracking-widest text-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] p-2.5 rounded-xl border border-[#D2C3B0] flex items-center justify-center transition-colors shrink-0"
                title="Copy Pair Code"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Random Code Generator Helper */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#9E8B75]">Need a new code?</span>
            <button
              type="button"
              onClick={handleGenerateNewCode}
              className="text-[#C86D51] font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Random Code
            </button>
          </div>

          {/* Partner Nickname Optional */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B2C] mb-1.5 uppercase tracking-wider">
              Partner Nickname
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. My Dearest, Babe, Honey"
              className="w-full bg-[#FAF6F0] border border-[#D2C3B0] rounded-xl px-4 py-2 text-sm text-[#36271C] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
            />
          </div>

          {/* Info Card */}
          <div className="bg-[#FAF5EC] p-3 rounded-xl border border-[#EBE3D5] text-xs text-[#4A3B2C] flex items-start gap-2">
            <Heart className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
            <span>
              Both you and your partner must enter the same Pair Code to link your time capsule letters.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 px-4 bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 px-4 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-semibold text-xs rounded-xl transition-all shadow-md"
            >
              Save & Pair
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
