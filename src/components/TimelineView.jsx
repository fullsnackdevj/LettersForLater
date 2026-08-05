import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Clock, Star, Image as ImageIcon } from 'lucide-react';
import LetterCard from './LetterCard';

export default function TimelineView({ letters, currentUser, onViewLetter }) {
  
  // Trigger celebration confetti on view load
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  // Sort letters chronologically by initial ISO creation timestamp
  const sortedLetters = [...letters].sort((a, b) => 
    new Date(a.createdAtIso || 0) - new Date(b.createdAtIso || 0)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Celebration Unlocked Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#C86D51] text-[#3D2600] rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-3 relative overflow-hidden">
        
        <div className="wax-seal w-16 h-16 text-3xl font-serif mx-auto shadow-xl">
          ✨
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-serif-vintage tracking-tight">
          Our Time Capsule Unlocked!
        </h1>
        
        <p className="text-base sm:text-lg font-handwriting text-2xl text-[#3D2600]/90 max-w-2xl mx-auto">
          "Six years of sealed thoughts, laughter, and photos — now yours to read together."
        </p>

        <div className="pt-2 flex justify-center items-center gap-2 text-xs font-mono font-bold bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full w-fit mx-auto">
          <Clock className="w-4 h-4 text-[#8B0000]" />
          <span>Total Sealed Memories: {sortedLetters.length} Letters</span>
        </div>
      </div>

      {/* Vertical Scrapbook Timeline */}
      <div className="relative border-l-2 border-[#D2C3B0] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        
        {sortedLetters.map((letter, idx) => {
          const isOwner = letter.authorId === (currentUser?.uid || 'demo-user-1');

          return (
            <div key={letter.id} className="relative group">
              
              {/* Timeline Stamp Node */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-8 h-8 rounded-full bg-[#FAF5EC] border-2 border-[#A83232] flex items-center justify-center text-xs font-bold text-[#A83232] shadow-md">
                {idx + 1}
              </div>

              {/* Memory Node Card */}
              <div className="w-full">
                <LetterCard
                  letter={letter}
                  currentUserId={currentUser?.uid || 'demo-user-1'}
                  isVaultUnlocked={true}
                  onEdit={() => {}}
                  onView={onViewLetter}
                />
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}
