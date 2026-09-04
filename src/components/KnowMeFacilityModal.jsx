import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Sparkles, 
  Heart, 
  Edit3, 
  Trash2, 
  Plus, 
  Copy, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { KNOW_ME_CATEGORIES } from '../data/knowMeQuestions';
import { getNickname } from '../utils/nicknames';

const REACTION_EMOJIS = ['❤️', '🥰', '✨', '🥺', '😂'];

export default function KnowMeFacilityModal({
  isOpen,
  onClose,
  currentUser,
  pairInfo,
  answers = [],
  onUpdateAnswer,
  onDeleteAnswer,
  onReactAnswer,
  onOpenQuestionPrompt,
  onAddCustomPrompt
}) {
  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || (currentUserId === 'demo-user-1' ? 'Jay' : 'Kiss');
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  const isJay = currentUserName === 'Jay';
  const myPhoto = currentUser?.photoURL || (isJay ? pairInfo?.user1?.photo : pairInfo?.user2?.photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
  const partnerPhoto = (isJay ? pairInfo?.user2?.photo : pairInfo?.user1?.photo) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100';

  // Active Author Tab: 'me' | 'partner'
  const [activeTab, setActiveTab] = useState('me');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Inline editing state
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editInputText, setEditInputText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reaction picker state (which card currently has the mini picker open)
  const [activeReactionPickerId, setActiveReactionPickerId] = useState(null);

  // Custom question dialog state
  const [isAskPromptOpen, setIsAskPromptOpen] = useState(false);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('favorites');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Add own custom note state
  const [isAddOwnPromptOpen, setIsAddOwnPromptOpen] = useState(false);
  const [ownQuestionInput, setOwnQuestionInput] = useState('');
  const [ownAnswerInput, setOwnAnswerInput] = useState('');
  const [ownCategoryInput, setOwnCategoryInput] = useState('favorites');
  const [isSubmittingOwn, setIsSubmittingOwn] = useState(false);

  // Copy toast state
  const [copiedId, setCopiedId] = useState(null);

  // English translation toggles
  const [showTranslationMap, setShowTranslationMap] = useState({});

  const toggleTranslation = (id) => {
    setShowTranslationMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!isOpen) return null;

  // Separate answers by author
  const myAnswers = answers.filter(a => a.authorId === currentUserId);
  const partnerAnswers = answers.filter(a => a.authorId !== currentUserId);

  const displayedList = activeTab === 'me' ? myAnswers : partnerAnswers;

  // Filter by category and search
  const filteredAnswers = displayedList.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const questionMatch = item.questionText?.toLowerCase().includes(q);
      const answerMatch = item.answerText?.toLowerCase().includes(q);
      if (!questionMatch && !answerMatch) return false;
    }
    return true;
  });

  const handleStartEdit = (item) => {
    setEditingAnswerId(item.id);
    setEditInputText(item.answerText || '');
  };

  const handleSaveEdit = async (answerId) => {
    if (!editInputText.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      if (onUpdateAnswer) {
        await onUpdateAnswer(answerId, editInputText.trim());
      }
      setEditingAnswerId(null);
      setEditInputText('');
    } catch (err) {
      console.error('Failed to update answer:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAnswer = (item) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${item.questionText}" — ${item.answerText}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSubmitCustomQuestion = async (e) => {
    e.preventDefault();
    if (!customQuestionInput.trim() || isSubmittingCustom) return;

    setIsSubmittingCustom(true);
    try {
      if (onAddCustomPrompt) {
        await onAddCustomPrompt({
          questionText: customQuestionInput.trim(),
          category: customCategoryInput,
          isCustomQuestion: true
        });
      }
      setCustomQuestionInput('');
      setIsAskPromptOpen(false);
    } catch (err) {
      console.error('Failed to submit custom question:', err);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleSubmitOwnNote = async (e) => {
    e.preventDefault();
    if (!ownQuestionInput.trim() || !ownAnswerInput.trim() || isSubmittingOwn) return;

    setIsSubmittingOwn(true);
    try {
      if (onAddCustomPrompt) {
        await onAddCustomPrompt({
          questionId: `custom_${Date.now()}`,
          questionText: ownQuestionInput.trim(),
          answerText: ownAnswerInput.trim(),
          category: ownCategoryInput,
          isCustomQuestion: true
        });
      }
      setOwnQuestionInput('');
      setOwnAnswerInput('');
      setIsAddOwnPromptOpen(false);
      setActiveTab('me');
    } catch (err) {
      console.error('Failed to submit own note:', err);
    } finally {
      setIsSubmittingOwn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl h-[88vh] sm:h-[84vh] max-h-[720px] min-h-[480px] flex flex-col bg-[#FDFBF7] border-2 border-[#D4AF37]/60 rounded-3xl shadow-2xl overflow-hidden font-sans"
        style={{
          boxShadow: '0 25px 60px rgba(54, 39, 28, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.4)'
        }}
      >
        {/* Top Vintage Ribbon Header */}
        <div className="bg-gradient-to-r from-[#4A0E0E] via-[#5C1515] to-[#2E120A] text-[#F8E3B6] px-4 sm:px-6 py-3.5 border-b border-[#D4AF37]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">📖</span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-serif-vintage tracking-wide text-white truncate">
                Our Little Book of Us
              </h2>
              <p className="text-[10px] sm:text-xs text-[#F8E3B6]/80 truncate font-handwriting text-sm -mt-0.5">
                Sweet memories & answers we've shared
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#F8E3B6]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close book"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Sub-Bar: Segmented Tab Switcher (+ Action Button on Desktop) */}
        <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
          {/* Segmented Capsule Control: Full-width grid on mobile, auto-width inline on desktop */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex bg-[#EFE9DE] p-1 rounded-2xl border border-[#D2C3B0]/60 shadow-2xs">
            <button
              type="button"
              onClick={() => { setActiveTab('me'); setSelectedCategory('all'); }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                activeTab === 'me'
                  ? 'bg-[#A83232] text-[#F8E3B6] shadow-xs'
                  : 'text-[#7A6956] hover:text-[#36271C]'
              }`}
            >
              About {currentUserName} ({myAnswers.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('partner'); setSelectedCategory('all'); }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                activeTab === 'partner'
                  ? 'bg-[#A83232] text-[#F8E3B6] shadow-xs'
                  : 'text-[#7A6956] hover:text-[#36271C]'
              }`}
            >
              About {partnerName} ({partnerAnswers.length})
            </button>
          </div>

          {/* Contextual Action Button (Desktop Only) */}
          <div className="hidden sm:block">
            {activeTab === 'me' ? (
              <button
                type="button"
                onClick={() => setIsAddOwnPromptOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                title="Add a note about yourself"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note ✍️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAskPromptOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                title={`Ask ${partnerName} a question`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ask {partnerName} 💌</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Single-Row Search & Category Filter */}
        <div className="px-4 sm:px-6 py-2 bg-[#FAF5EC]/80 border-b border-[#EFE9DE] flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A69784]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl text-xs text-[#36271C] placeholder-[#A69784] outline-none shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#A69784] hover:text-[#36271C]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl pl-2.5 pr-7 py-1.5 text-xs text-[#5C4A3A] font-semibold outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">All Topics ({displayedList.length})</option>
              {Object.values(KNOW_ME_CATEGORIES).map(cat => {
                const count = displayedList.filter(i => i.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C7A6B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Scrollable Answer Cards List */}
        <div 
          key={activeTab}
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-[#FAF5EC]/40 animate-fadeIn"
        >
          {filteredAnswers.length === 0 ? (
            /* Friendly Empty State */
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EFE9DE] border border-[#D2C3B0] flex items-center justify-center text-xl shadow-inner">
                📖
              </div>
              <h4 className="text-base font-serif-vintage font-bold text-[#36271C]">
                {activeTab === 'me' ? 'Your pages are waiting to be written' : `No notes yet from ${partnerName}`}
              </h4>
              <p className="text-xs text-[#7A6956] max-w-xs mx-auto">
                {activeTab === 'me'
                  ? 'Add your first favorite memory, craving, or quirk so your partner can read it anytime!'
                  : `Ask ${partnerName} a question or wait for them to write their next note.`}
              </p>
              {activeTab === 'me' ? (
                <button
                  type="button"
                  onClick={() => setIsAddOwnPromptOpen(true)}
                  className="mt-2 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Write Your First Note ✍️
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAskPromptOpen(true)}
                  className="mt-2 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ask {partnerName} a Question 💌
                </button>
              )}
            </div>
          ) : (
            /* Cards List */
            filteredAnswers.map((item) => {
              const catInfo = KNOW_ME_CATEGORIES[item.category] || KNOW_ME_CATEGORIES.favorites;
              const isMine = item.authorId === currentUserId;
              const isEditing = editingAnswerId === item.id;
              const reactionsMap = item.reactions || {};
              const authorDisplayName = item.authorName || (isMine ? currentUserName : partnerName);
              const authorPhoto = isMine ? myPhoto : partnerPhoto;

              return (
                <div
                  key={item.id}
                  className="bg-[#FDFBF7] border border-[#EADBCA] hover:border-[#D4AF37]/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 relative overflow-hidden group"
                >
                  {/* Gilded Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent pointer-events-none" />

                  {/* Top Header: Author Profile (Left) & Category Badge (Right) */}
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    {/* Author & Timestamp Lockup (Left) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {authorPhoto ? (
                        <img
                          src={authorPhoto}
                          alt={authorDisplayName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-[#D4AF37]/80 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#4A1010] text-[#F8E3B6] border-2 border-[#D4AF37]/80 flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                          {authorDisplayName.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 leading-tight">
                          <span className="text-xs sm:text-sm font-bold text-[#36271C] truncate">
                            {authorDisplayName}
                          </span>
                          {isMine && (
                            <span className="text-[9px] bg-[#EFE9DE] text-[#7A6956] font-semibold px-1.5 py-0.2 rounded-full shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] text-[#9E8B75] font-mono block truncate leading-tight mt-0.5"
                          title={item.createdAtPHT || ''}
                        >
                          <span className="sm:hidden">
                            {item.createdAtPHT ? item.createdAtPHT.split(' • ')[0] : 'PHT'}
                          </span>
                          <span className="hidden sm:inline">
                            {item.createdAtPHT || 'PHT'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Category Pill Tag (Right) */}
                    <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#FAF5EC] border border-[#E2D7C7] text-[10px] sm:text-[11px] font-semibold text-[#6E5948] shadow-2xs shrink-0 max-w-[48%] sm:max-w-none">
                      <span className="shrink-0">{catInfo.icon}</span>
                      <span className="truncate">{catInfo.label}</span>
                      {item.isCustomQuestion && (
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[8px] sm:text-[9px] font-bold shrink-0">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prompt Section */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#B38F2A]">
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span>Prompt</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-serif-vintage font-bold text-[#4A3B2C] leading-snug">
                      {item.questionText}
                    </h4>
                  </div>

                  {/* Answer Section */}
                  {isEditing ? (
                    <div className="bg-[#FAF5EC] border-2 border-[#A83232] rounded-xl p-3.5 space-y-2.5 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-[#8C7A6B]">
                        <span className="font-bold text-[#A83232]">Editing Your Answer:</span>
                        <span className="font-mono text-[10px]">{editInputText.length}/500</span>
                      </div>
                      <textarea
                        value={editInputText}
                        onChange={(e) => setEditInputText(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-lg p-3 text-sm text-[#36271C] outline-none shadow-xs resize-none"
                      />
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditingAnswerId(null)}
                          className="px-3 py-1.5 rounded-lg text-[#7A6956] hover:bg-[#EFE9DE] font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!editInputText.trim() || isUpdating}
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-4 py-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes 💕'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FAF5EC]/95 border border-[#E8DFC9] rounded-xl p-3.5 sm:p-4 shadow-2xs relative group/answer">
                      {/* Subtle label on top of answer */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#8C7355] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          Answer
                        </span>
                        {item.isEdited && (
                          <span className="text-[10px] text-[#A69784] italic font-mono">(edited)</span>
                        )}
                      </div>

                      {/* Answer text in rich Playfair Display */}
                      <p className="text-base sm:text-lg font-serif-vintage font-bold text-[#2D1F15] leading-relaxed whitespace-pre-wrap">
                        {item.answerText}
                      </p>

                      {/* Optional English Translation */}
                      {showTranslationMap[item.id] && item.translatedText && (
                        <div className="mt-3 pt-2.5 border-t border-[#E8DFC9] bg-white/70 p-2.5 rounded-lg text-xs sm:text-sm text-[#4A3B2C] italic animate-fadeIn">
                          <span className="not-italic font-bold text-[#A83232] text-[10px] mr-1.5">🌐 English:</span>
                          "{item.translatedText}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Bar: Reactions & Tools */}
                  <div className="pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between gap-2 flex-wrap">
                    {/* Left: Reactions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Active Reaction Badges */}
                      {REACTION_EMOJIS.map((emoji) => {
                        const reactors = Object.entries(reactionsMap).filter(([_, emojis]) => Array.isArray(emojis) && emojis.includes(emoji));
                        if (reactors.length === 0) return null;
                        const count = reactors.length;
                        const iReacted = Array.isArray(reactionsMap[currentUserId]) && reactionsMap[currentUserId].includes(emoji);

                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onReactAnswer && onReactAnswer(item.id, emoji)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                              iReacted
                                ? 'bg-rose-100 border border-rose-300 text-rose-800'
                                : 'bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#E2D7C7] text-[#4A3B2C]'
                            }`}
                            title={iReacted ? `You reacted ${emoji}` : `React ${emoji}`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-mono font-bold">{count}</span>
                          </button>
                        );
                      })}

                      {/* Add Reaction Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveReactionPickerId(activeReactionPickerId === item.id ? null : item.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#A83232] bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#E2D7C7] transition-all cursor-pointer shadow-2xs"
                          title="React to this note"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-100" />
                          <span className="text-[11px]">React</span>
                        </button>

                        {/* Floating Quick Reaction Popover */}
                        {activeReactionPickerId === item.id && (
                          <div className="absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 bg-[#36271C] text-white px-2.5 py-1.5 rounded-2xl shadow-xl border border-[#D4AF37]/50 animate-fadeIn">
                            {REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  if (onReactAnswer) onReactAnswer(item.id, emoji);
                                  setActiveReactionPickerId(null);
                                }}
                                className="hover:scale-130 transition-transform p-1 text-base cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 text-[#A69784]">
                      {/* Translation Toggle */}
                      {item.translatedText && item.translatedText.trim().toLowerCase() !== item.answerText.trim().toLowerCase() && (
                        <button
                          type="button"
                          onClick={() => toggleTranslation(item.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer border ${
                            showTranslationMap[item.id]
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#A83232]'
                              : 'bg-[#FAF5EC] hover:bg-[#EFE9DE] border-[#E2D7C7] text-[#7A6956]'
                          }`}
                          title={showTranslationMap[item.id] ? 'Show original answer' : 'Translate into English'}
                        >
                          <span>🌐</span>
                          <span>{showTranslationMap[item.id] ? 'Original' : 'English'}</span>
                        </button>
                      )}

                      {/* Quick Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(item)}
                        className="p-1.5 rounded-lg hover:bg-[#FAF5EC] border border-transparent hover:border-[#E2D7C7] text-[#A69784] hover:text-[#36271C] transition-colors cursor-pointer"
                        title="Copy question and answer"
                      >
                        {copiedId === item.id ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Owner controls: Edit & Delete */}
                      {isMine && !isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-[#FAF5EC] border border-transparent hover:border-[#E2D7C7] text-[#A69784] hover:text-[#A83232] transition-colors cursor-pointer"
                            title="Edit your answer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteAnswer && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete this answer from Our Little Book?')) {
                                  onDeleteAnswer(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 text-[#A69784] hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clean Modal Footer */}
        <div className="bg-[#FAF5EC] border-t border-[#E2D7C7] px-4 sm:px-6 py-2.5 sm:py-3 shrink-0">
          {/* Mobile View: Full-width Primary Action + Counter & Close */}
          <div className="sm:hidden space-y-2">
            {activeTab === 'me' ? (
              <button
                type="button"
                onClick={() => setIsAddOwnPromptOpen(true)}
                className="w-full py-2.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add Note About Yourself ✍️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAskPromptOpen(true)}
                className="w-full py-2.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Ask {partnerName} a Question 💌</span>
              </button>
            )}

            <div className="flex items-center justify-between text-xs text-[#7A6956] pt-0.5">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="font-serif-vintage font-bold text-[#36271C]">
                  {answers.length} {answers.length === 1 ? 'Note' : 'Notes'} Logged
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#36271C] rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                Close Book
              </button>
            </div>
          </div>

          {/* Desktop View: Counter (Left) & Close (Right) */}
          <div className="hidden sm:flex items-center justify-between text-xs text-[#7A6956]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-serif-vintage font-bold text-[#36271C]">
                {answers.length} {answers.length === 1 ? 'Note' : 'Notes'} Logged
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#36271C] rounded-xl font-bold transition-colors cursor-pointer"
            >
              Close Book
            </button>
          </div>
        </div>

        {/* ─── ASK PARTNER QUESTION MODAL ─── */}
        {isAskPromptOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-[#FDFBF7] border-2 border-[#D4AF37] rounded-2xl shadow-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E2D7C7] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💌</span>
                  <h4 className="font-serif-vintage font-bold text-sm text-[#36271C]">
                    Ask {partnerName} a Question
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAskPromptOpen(false)}
                  className="p-1 rounded-full text-[#A69784] hover:text-[#36271C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitCustomQuestion} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                    Select a Category:
                  </label>
                  <div className="relative">
                    <select
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
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
                    Your Question for {partnerName}:
                  </label>
                  <textarea
                    value={customQuestionInput}
                    onChange={(e) => setCustomQuestionInput(e.target.value)}
                    placeholder={`e.g. What is something you've always wanted to know about me?`}
                    rows={3}
                    maxLength={300}
                    autoFocus
                    className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-2.5 text-xs text-[#36271C] outline-none shadow-inner resize-none"
                  />
                  <div className="text-right text-[10px] text-[#A69784] font-mono mt-0.5">
                    {customQuestionInput.length}/300
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAskPromptOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#7A6956]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customQuestionInput.trim() || isSubmittingCustom}
                    className="px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCustom ? 'Sending...' : `Send Question 💕`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD MY OWN NOTE MODAL ─── */}
        {isAddOwnPromptOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-[#FDFBF7] border-2 border-[#D4AF37] rounded-2xl shadow-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E2D7C7] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  <h4 className="font-serif-vintage font-bold text-sm text-[#36271C]">
                    Add a Note About Yourself
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOwnPromptOpen(false)}
                  className="p-1 rounded-full text-[#A69784] hover:text-[#36271C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitOwnNote} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                    Topic Category:
                  </label>
                  <div className="relative">
                    <select
                      value={ownCategoryInput}
                      onChange={(e) => setOwnCategoryInput(e.target.value)}
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
                    Your Question / Topic:
                  </label>
                  <input
                    type="text"
                    value={ownQuestionInput}
                    onChange={(e) => setOwnQuestionInput(e.target.value)}
                    placeholder="e.g. My favorite memory of us, A quirk of mine..."
                    maxLength={150}
                    autoFocus
                    className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-2.5 text-xs text-[#36271C] outline-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#36271C] mb-1">
                    Your Answer:
                  </label>
                  <textarea
                    value={ownAnswerInput}
                    onChange={(e) => setOwnAnswerInput(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-white border border-[#D2C3B0] focus:border-[#A83232] rounded-xl p-2.5 text-xs text-[#36271C] outline-none shadow-inner resize-none"
                  />
                  <div className="text-right text-[10px] text-[#A69784] font-mono mt-0.5">
                    {ownAnswerInput.length}/500
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddOwnPromptOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#7A6956]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!ownQuestionInput.trim() || !ownAnswerInput.trim() || isSubmittingOwn}
                    className="px-4 py-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingOwn ? 'Saving...' : 'Save Note 💕'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
