import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  Check, 
  PenTool
} from 'lucide-react';
import { STATUS_CATEGORIES, STATUS_PRESETS } from '../data/statusPresets';
import { getNickname } from '../utils/nicknames';

export default function StatusPickerModal({
  isOpen,
  onClose,
  currentStatus,
  currentUser,
  onSaveStatus
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(() => currentStatus?.statusId || 'working_now');
  const [customNote, setCustomNote] = useState(() => currentStatus?.customNote || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentUserName = getNickname(currentUser?.displayName) || 'You';

  // Filter presets
  const filteredPresets = STATUS_PRESETS.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;
    const matchesSearch = p.text.toLowerCase().includes(q) || (p.filipino && p.filipino.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const selectedPreset = STATUS_PRESETS.find(p => p.id === selectedPresetId) || STATUS_PRESETS[0];

  const handleConfirm = async () => {
    if (!selectedPreset) return;
    setIsSaving(true);
    try {
      await onSaveStatus({
        statusId: selectedPreset.id,
        statusText: selectedPreset.text,
        emoji: selectedPreset.emoji,
        category: selectedPreset.category,
        customNote: customNote.trim()
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Error saving status:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2D7C7] bg-[#FAF5EC]">
          <div className="flex items-center gap-3">
            <div className="wax-seal w-10 h-10 text-base shadow-md">
              💬
            </div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                What are you doing right now?
              </h2>
              <p className="text-xs text-[#7A6855] font-handwriting text-base -mt-0.5">
                Let your partner know with a quick live status note
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills & Search */}
        <div className="px-5 sm:px-6 py-3 bg-[#FAF5EC]/80 border-b border-[#E2D7C7] space-y-2.5">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9E8B75] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity (e.g. work, school, coffee, dinner)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D2C3B0] bg-white text-xs text-[#36271C] focus:outline-none focus:border-[#A83232] placeholder-[#A69888]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9E8B75] hover:text-[#36271C]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {STATUS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#A83232] text-[#F8E3B6] shadow-xs'
                    : 'bg-[#EFE9DE] text-[#5C4A3A] hover:bg-[#E2D7C7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Presets Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar max-h-[38vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF5EC] border-[#A83232] shadow-sm ring-1 ring-[#A83232]'
                      : 'bg-white/80 border-[#E2D7C7] hover:border-[#D4AF37] hover:bg-[#FAF5EC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0 select-none">
                      {preset.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#36271C] truncate">
                        {preset.text}
                      </p>
                      {preset.filipino && (
                        <p className="text-[10px] text-[#9E8B75] italic truncate">
                          "{preset.filipino}"
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#A83232] text-[#F8E3B6] flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-8 text-[#9E8B75] space-y-1">
              <p className="text-xs">No preset found matching "{searchQuery}"</p>
              <p className="text-[11px]">You can still write a custom note below!</p>
            </div>
          )}
        </div>

        {/* Optional Custom Note Input */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC]/90 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#5C4A3A]">
            <span className="font-bold flex items-center gap-1">
              <PenTool className="w-3 h-3 text-[#A83232]" />
              <span>Add Custom Detail (Optional)</span>
            </span>
            <span className="text-[10px] text-[#9E8B75]">{customNote.length}/50</span>
          </div>

          <input
            type="text"
            maxLength={50}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. at Starbucks, studying with classmates, almost done..."
            className="w-full px-3 py-1.5 rounded-xl border border-[#D2C3B0] bg-white text-xs text-[#36271C] focus:outline-none focus:border-[#A83232] placeholder-[#A69888]"
          />
        </div>

        {/* Footer Preview & Submit */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E2D7C7] bg-[#FAF5EC] flex items-center justify-between gap-3">
          {/* Active Preview */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">{selectedPreset?.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#36271C] truncate">
                {selectedPreset?.text}
              </p>
              {customNote.trim() && (
                <p className="text-[10px] text-[#A83232] font-medium truncate">
                  "{customNote.trim()}"
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[#D2C3B0] bg-white text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border border-[#D4AF37]/50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-[#F8E3B6] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#F8E3B6]" />
              )}
              <span>Post Status</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
