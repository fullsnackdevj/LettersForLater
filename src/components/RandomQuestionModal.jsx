import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Shuffle, Heart, X, BookOpen, Edit3, Check, ArrowLeft, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KNOW_ME_CATEGORIES, getRandomQuestion, KNOW_ME_QUESTIONS } from '../data/knowMeQuestions';
import { getNickname } from '../utils/nicknames';

export default function RandomQuestionModal({
  isOpen,
  onClose,
  currentUser,
  pairInfo,
  existingAnswers = [],
  onSaveAnswer,
  onOpenFacility
}) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const successTimeoutRef = useRef(null);

  // Manual Question & Answer mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customCategory, setCustomCategory] = useState('favorites');

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const userName = getNickname(currentUser?.displayName) || (currentUserId === 'demo-user-1' ? 'Jay' : 'Kiss');

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Initialize with a question not yet answered by this user
  useEffect(() => {
    if (isOpen && !currentQuestion) {
      const myAnsweredQuestionIds = existingAnswers
        .filter(a => a.authorId === currentUserId)
        .map(a => a.questionId);
      
      const q = getRandomQuestion(myAnsweredQuestionIds);
      setCurrentQuestion(q);
      setAnswerText('');
      setCustomQuestionText('');
      setIsCustomMode(false);
      setIsSuccess(false);
    }
  }, [isOpen, existingAnswers, currentUserId, currentQuestion]);

  if (!isOpen) return null;

  const categoryInfo = isCustomMode 
    ? (KNOW_ME_CATEGORIES[customCategory] || KNOW_ME_CATEGORIES.favorites)
    : (currentQuestion ? (KNOW_ME_CATEGORIES[currentQuestion.category] || KNOW_ME_CATEGORIES.favorites) : KNOW_ME_CATEGORIES.favorites);

  const handleShuffle = () => {
    setIsShuffling(true);
    const myAnsweredQuestionIds = existingAnswers
      .filter(a => a.authorId === currentUserId)
      .map(a => a.questionId);
    
    // Pick another question different from current
    const available = KNOW_ME_QUESTIONS.filter(
      q => q.id !== currentQuestion?.id && !myAnsweredQuestionIds.includes(q.id)
    );
    const nextQ = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)]
      : KNOW_ME_QUESTIONS[Math.floor(Math.random() * KNOW_ME_QUESTIONS.length)];

    setTimeout(() => {
      setCurrentQuestion(nextQ);
      setAnswerText('');
      setIsShuffling(false);
    }, 200);
  };

  const handleDone = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    setIsSuccess(false);
    setIsCustomMode(false);
    setCustomQuestionText('');
    setAnswerText('');
    onClose();
  };

  const handleAnswerAnother = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    setIsSuccess(false);
    setIsCustomMode(false);
    setCustomQuestionText('');
    setAnswerText('');
    handleShuffle();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const finalQuestionText = isCustomMode ? customQuestionText.trim() : currentQuestion?.text;
    const finalAnswerText = answerText.trim();

    if (!finalQuestionText || !finalAnswerText) return;

    setIsSaving(true);
    try {
      if (onSaveAnswer) {
        await onSaveAnswer({
          questionId: isCustomMode ? `custom_${Date.now()}` : currentQuestion.id,
          questionText: finalQuestionText,
          category: isCustomMode ? customCategory : currentQuestion.category,
          answerText: finalAnswerText,
          isCustomQuestion: isCustomMode
        });
      }

      // Trigger celebratory heart confetti
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#A83232', '#D4AF37', '#F8E3B6', '#E2847A']
        });
      } catch (err) {}

      setIsSuccess(true);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      // Gentle auto-close after 5.5s unless user chooses to answer another or done
      successTimeoutRef.current = setTimeout(() => {
        handleDone();
      }, 5500);
    } catch (err) {
      console.error('Error saving answer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#FDFBF7] border-2 border-[#D4AF37]/60 rounded-3xl shadow-2xl overflow-hidden transform transition-all"
        style={{
          boxShadow: '0 20px 50px rgba(54, 39, 28, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.4)'
        }}
      >
        {/* Top Decorative Vintage Header */}
        <div className="bg-gradient-to-r from-[#5C1515] via-[#7B1B1B] to-[#4A0E0E] text-[#F8E3B6] px-5 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">💭</span>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#F8E3B6]/80 font-bold">
                {isCustomMode ? 'Create Your Own Note' : 'A Little Question for You'}
              </p>
              <h3 className="text-xs sm:text-sm font-serif-vintage font-bold text-white tracking-wide">
                {isCustomMode ? `Share something about yourself, ${userName}` : `Hey ${userName}, we want to know...`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#F8E3B6]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Ask me later"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {isSuccess ? (
            /* Success State */
            <div className="py-7 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center shadow-md animate-bounce">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-serif-vintage font-bold text-[#36271C]">
                Saved to Our Little Book! 📖✨
              </h4>
              <p className="text-xs text-[#7A6956] max-w-xs mx-auto">
                Your note is now part of our forever memories. Your partner can read it anytime!
              </p>

              {/* Action Choices: Done vs Answer Another Question */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#7A6956] hover:text-[#36271C] hover:bg-[#EFE9DE] border border-[#D2C3B0] rounded-xl transition-colors cursor-pointer"
                >
                  Done for Today ✨
                </button>

                <button
                  type="button"
                  onClick={handleAnswerAnother}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold rounded-xl shadow-xs border border-[#D4AF37]/40 hover:scale-102 transition-all cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Answer Another Question 🎲</span>
                </button>
              </div>

              {onOpenFacility && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleDone();
                      onOpenFacility();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A83232] hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    View in Our Little Book
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Toggle Header: Random vs Custom Question */}
              <div className="flex items-center justify-between gap-2 pb-0.5">
                <span className="text-[11px] font-bold text-[#7A6956]">
                  {isCustomMode ? '✍️ Your Custom Question:' : "Today's Question (1 of 1):"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(!isCustomMode);
                    setAnswerText('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A83232] hover:text-[#8B0000] transition-colors cursor-pointer"
                >
                  {isCustomMode ? (
                    <>
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to Random 🎲</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3 h-3" />
                      <span>Write My Own ✍️</span>
                    </>
                  )}
                </button>
              </div>

              {isCustomMode ? (
                /* ─── CUSTOM QUESTION INPUT FORM ─── */
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                      Pick a Topic Category:
                    </label>
                    <div className="relative">
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl pl-3 pr-9 py-2.5 text-xs text-[#36271C] outline-none cursor-pointer shadow-2xs font-medium"
                      >
                        {Object.values(KNOW_ME_CATEGORIES).map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8C7A6B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                      Your Custom Question or Topic:
                    </label>
                    <input
                      type="text"
                      value={customQuestionText}
                      onChange={(e) => setCustomQuestionText(e.target.value)}
                      placeholder="e.g. My favorite memory of us, A quirk of mine..."
                      maxLength={150}
                      autoFocus
                      className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-2.5 text-xs sm:text-sm text-[#36271C] outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                      Your Answer:
                    </label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write your answer here..."
                      rows={3}
                      maxLength={500}
                      disabled={isSaving}
                      className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-2.5 text-xs sm:text-sm text-[#36271C] placeholder-[#A69784] resize-none outline-none shadow-inner"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 text-xs font-semibold text-[#7A6956] hover:text-[#36271C] hover:bg-[#EFE9DE] rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!customQuestionText.trim() || !answerText.trim() || isSaving}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                        !customQuestionText.trim() || !answerText.trim() || isSaving
                          ? 'bg-[#D2C3B0] text-white opacity-60 cursor-not-allowed'
                          : 'bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] hover:scale-102 active:scale-98 border border-[#D4AF37]/50'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-3.5 h-3.5 fill-current text-[#F8E3B6]" />
                          <span>Save to Our Book</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* ─── RANDOM QUESTION PROMPT FORM ─── */
                <>
                  {currentQuestion && (
                    <div 
                      className={`bg-[#FAF5EC] border border-[#E2D7C7] rounded-2xl p-4 sm:p-5 relative transition-all duration-200 ${
                        isShuffling ? 'opacity-40 scale-98' : 'opacity-100 scale-100'
                      }`}
                    >
                      {/* Category Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${categoryInfo.color}`}>
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.label}</span>
                        </span>

                        {/* Another Question / Shuffle Button */}
                        <button
                          type="button"
                          onClick={handleShuffle}
                          disabled={isShuffling}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A6956] hover:text-[#A83232] bg-white/70 hover:bg-white border border-[#D2C3B0]/60 px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs"
                          title="Want a different question? Click to get another question"
                        >
                          <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin text-[#A83232]' : ''}`} />
                          <span>Another Question 🎲</span>
                        </button>
                      </div>

                      {/* Question Text */}
                      <h4 className="text-base sm:text-lg font-serif-vintage font-bold text-[#36271C] leading-snug">
                        "{currentQuestion.text}"
                      </h4>
                    </div>
                  )}

                  {/* Answer Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder={currentQuestion?.placeholder || "Type your honest answer here..."}
                        rows={3}
                        maxLength={500}
                        disabled={isSaving}
                        autoFocus
                        className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] focus:ring-2 focus:ring-[#A83232]/20 rounded-xl p-3 text-xs sm:text-sm text-[#36271C] placeholder-[#A69784] resize-none outline-none transition-all shadow-inner font-sans"
                      />
                      <div className="flex justify-between items-center text-[10px] text-[#A69784] px-1 mt-1 font-mono">
                        <span>Press Save when ready</span>
                        <span>{answerText.length}/500</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-semibold text-[#7A6956] hover:text-[#36271C] hover:bg-[#EFE9DE] rounded-xl transition-colors cursor-pointer"
                      >
                        Ask me later
                      </button>

                      <button
                        type="submit"
                        disabled={!answerText.trim() || isSaving}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                          !answerText.trim() || isSaving
                            ? 'bg-[#D2C3B0] text-white opacity-60 cursor-not-allowed'
                            : 'bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] hover:scale-102 active:scale-98 border border-[#D4AF37]/50'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5 fill-current text-[#F8E3B6]" />
                            <span>Save to Our Book</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}

        </div>

        {/* Vintage Footer Ribbon */}
        <div className="bg-[#FAF5EC] border-t border-[#E2D7C7] px-4 py-2.5 flex items-center justify-between text-[10px] text-[#9E8B75]">
          <span className="flex items-center gap-1 font-serif-vintage">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            1 daily question • Tap "Another Question 🎲" anytime
          </span>
          {onOpenFacility && (
            <button
              type="button"
              onClick={() => {
                handleDone();
                onOpenFacility();
              }}
              className="text-[#A83232] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Our Little Book</span>
              <BookOpen className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
