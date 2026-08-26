import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Check, Trash2, X, ChevronDown, Camera, Sparkles,
  Target, Plane, UtensilsCrossed, Star, Sofa, Palette, 
  CalendarHeart, Trophy, Image as ImageIcon
} from 'lucide-react';
import { getNickname } from '../utils/nicknames';
import { compressImages } from '../utils/imageCompressor';

const CATEGORIES = [
  { key: 'travel', label: '✈️ Travel', icon: Plane, color: '#3B82F6' },
  { key: 'food', label: '🍜 Food & Dining', icon: UtensilsCrossed, color: '#EF4444' },
  { key: 'milestone', label: '🌟 Milestones', icon: Star, color: '#D4AF37' },
  { key: 'cozy', label: '🛋️ Cozy & Sweet', icon: Sofa, color: '#A855F7' },
  { key: 'creative', label: '🎨 Fun & Creative', icon: Palette, color: '#10B981' },
  { key: 'general', label: '💫 General', icon: Target, color: '#6B7280' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

export default function BucketListView({
  bucketItems = [],
  currentUser,
  pairInfo,
  onSaveItem,
  onCompleteItem,
  onDeleteItem
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'todo' | 'done'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [completingItem, setCompletingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add/Edit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formSeason, setFormSeason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Completion Form State
  const [completionNote, setCompletionNote] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fileInputRef = useRef(null);

  const currentUserName = getNickname(currentUser?.displayName) || 'You';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;

  // Filter
  const filtered = useMemo(() => {
    let items = bucketItems;
    if (filter === 'todo') items = items.filter(i => !i.isCompleted);
    if (filter === 'done') items = items.filter(i => i.isCompleted);
    if (categoryFilter !== 'all') items = items.filter(i => i.category === categoryFilter);
    return items;
  }, [bucketItems, filter, categoryFilter]);

  const todoCount = bucketItems.filter(i => !i.isCompleted).length;
  const doneCount = bucketItems.filter(i => i.isCompleted).length;
  const total = bucketItems.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Handlers
  const openAddForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormDesc(item.description || '');
      setFormCategory(item.category || 'general');
      setFormSeason(item.targetSeason || '');
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormDesc('');
      setFormCategory('general');
      setFormSeason('');
    }
    setIsAddOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setIsSaving(true);
    try {
      await onSaveItem({
        ...(editingItem || {}),
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        targetSeason: formSeason
      });
      setIsAddOpen(false);
    } catch (err) {
      console.error('Error saving bucket item:', err);
    }
    setIsSaving(false);
  };

  const openCompleteFlow = (item) => {
    setCompletingItem(item);
    setCompletionNote('');
    setCompletionPhoto(null);
    setIsCompleteOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImages([{ dataUrl: await fileToDataUrl(file), name: file.name }]);
      setCompletionPhoto(compressed[0]?.dataUrl || null);
    } catch {
      const dataUrl = await fileToDataUrl(file);
      setCompletionPhoto(dataUrl);
    }
    setIsCompressing(false);
  };

  const fileToDataUrl = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const handleComplete = async () => {
    if (!completingItem) return;
    setIsCompleting(true);
    try {
      await onCompleteItem(completingItem.id, {
        completionNote,
        completionPhotoDataUrl: completionPhoto
      });
      setIsCompleteOpen(false);
    } catch (err) {
      console.error('Error completing bucket item:', err);
    }
    setIsCompleting(false);
  };

  const handleDelete = async (itemId) => {
    try {
      await onDeleteItem(itemId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting bucket item:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-5">

      {/* Header & Progress */}
      <div className="bg-[#FAF5EC] border border-[#E2D7C7] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="wax-seal w-10 h-10 text-base shadow-md">🎯</div>
            <div>
              <h2 className="font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C]">
                Our Bucket List
              </h2>
              <p className="text-xs text-[#9E8B75] font-handwriting text-base sm:text-lg">
                Dreams and adventures to share together
              </p>
            </div>
          </div>
          <button
            onClick={() => openAddForm()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-md border border-[#D4AF37]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Dream</span>
          </button>
        </div>

        {/* Progress Bar */}
        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7A6855] font-medium">
                <strong className="text-[#36271C] font-mono">{doneCount}</strong> of <strong className="font-mono">{total}</strong> dreams accomplished
              </span>
              <span className="font-bold text-[#A83232] font-mono">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#EFE9DE] rounded-full overflow-hidden border border-[#D2C3B0]/50">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #A83232, #D4AF37)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <div className="flex items-center gap-1 bg-[#EFE9DE] p-1 rounded-2xl border border-[#D2C3B0]/70">
          {[
            { key: 'all', label: 'All', count: total },
            { key: 'todo', label: 'To Do', count: todoCount },
            { key: 'done', label: 'Done', count: doneCount },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-[#36271C] text-[#FDFBF7] shadow-sm'
                  : 'text-[#5C4A3A] hover:bg-[#FAF5EC]'
              }`}
            >
              {f.label}
              <span className={`ml-1 text-[10px] px-1.5 rounded-full font-mono ${
                filter === f.key ? 'bg-[#5A4535] text-[#FDFBF7]' : 'bg-[#E2D7C7] text-[#5C4A3A]'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm'
                : 'bg-[#EFE9DE] text-[#5C4A3A] hover:bg-[#E2D7C7] border border-[#D2C3B0]/50'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                categoryFilter === cat.key
                  ? 'bg-[#D4AF37] text-[#3D2600] shadow-sm'
                  : 'bg-[#EFE9DE] text-[#5C4A3A] hover:bg-[#E2D7C7] border border-[#D2C3B0]/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(item => {
            const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP['general'];
            const creatorName = getNickname(item.createdByName) || 'Unknown';
            const isCompleted = item.isCompleted;

            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#FAF5EC] to-[#F0E8D6] border-[#D4AF37]/60'
                    : 'bg-[#FAF5EC] border-[#E2D7C7] hover:border-[#A83232]/50'
                }`}
              >
                {/* Completion Photo */}
                {isCompleted && item.completionPhoto && (
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                      src={item.completionPhoto}
                      alt="Memory proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#3D2600] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#AA7C11]/50 shadow-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>Accomplished!</span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {/* Category Badge & Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: cat.color + '15',
                            borderColor: cat.color + '40',
                            color: cat.color
                          }}
                        >
                          {cat.label}
                        </span>
                        {isCompleted && !item.completionPhoto && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#AA7C11] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Done
                          </span>
                        )}
                      </div>
                      <h3 className={`font-serif-vintage font-bold text-base leading-snug ${
                        isCompleted ? 'text-[#7A6855] line-through decoration-[#D4AF37]/60' : 'text-[#36271C]'
                      }`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-[#9E8B75] mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    {/* Delete button */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-600 text-white cursor-pointer hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#EFE9DE] text-[#5C4A3A] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="w-7 h-7 rounded-full bg-[#EFE9DE] hover:bg-red-100 text-[#9E8B75] hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Completion Note */}
                  {isCompleted && item.completionNote && (
                    <div className="bg-[#EFE9DE]/70 rounded-xl p-2.5 border border-[#D2C3B0]/50">
                      <p className="text-xs text-[#5C4A3A] font-handwriting text-sm italic">"{item.completionNote}"</p>
                    </div>
                  )}

                  {/* Footer: creator + actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E2D7C7]/60">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9E8B75]">
                      <span className="font-medium">{creatorName}</span>
                      {item.targetSeason && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <CalendarHeart className="w-3 h-3" />
                            {item.targetSeason}
                          </span>
                        </>
                      )}
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => openCompleteFlow(item)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accomplished!</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-[10px] text-[#9E8B75] font-mono">
                        {item.completedAtPHT ? item.completedAtPHT.split(',')[0] : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#FAF5EC]/70 border-2 border-dashed border-[#D2C3B0] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="wax-seal w-16 h-16 mx-auto text-2xl shadow-lg">🎯</div>
          <div className="space-y-1">
            <h3 className="font-serif-vintage font-bold text-lg text-[#36271C]">
              {filter === 'done' ? 'No Adventures Completed Yet' : 'Your Shared Dream Board is Empty'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6855] font-handwriting text-base sm:text-lg max-w-sm mx-auto">
              Start dreaming together — add your first shared adventure to make it real.
            </p>
          </div>
          <button
            onClick={() => openAddForm()}
            className="inline-flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold px-5 py-2.5 rounded-full shadow-md border border-[#D4AF37]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Dream</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────
          ADD / EDIT MODAL
         ──────────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsAddOpen(false)}>
          <div className="w-full max-w-md bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2D7C7] bg-[#FAF5EC]">
              <h3 className="font-serif-vintage font-bold text-base text-[#36271C]">
                {editingItem ? 'Edit Dream' : '✨ Add a New Dream'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1">Dream Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g., Watch the sunrise at the beach together"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D2C3B0] bg-white text-sm text-[#36271C] placeholder-[#9E8B75] focus:border-[#A83232] focus:ring-1 focus:ring-[#A83232]/30 outline-none"
                  maxLength={120}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1">Description (Optional)</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Any extra notes or plans..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#D2C3B0] bg-white text-sm text-[#36271C] placeholder-[#9E8B75] focus:border-[#A83232] focus:ring-1 focus:ring-[#A83232]/30 outline-none resize-none"
                  maxLength={300}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setFormCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        formCategory === cat.key
                          ? 'shadow-sm'
                          : 'bg-white hover:bg-[#FAF5EC]'
                      }`}
                      style={formCategory === cat.key ? {
                        backgroundColor: cat.color + '20',
                        borderColor: cat.color,
                        color: cat.color
                      } : {
                        borderColor: '#D2C3B0'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Season */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1">Target Season / Year (Optional)</label>
                <input
                  type="text"
                  value={formSeason}
                  onChange={e => setFormSeason(e.target.value)}
                  placeholder="e.g., Summer 2027, Before 2030"
                  className="w-full px-3 py-2 rounded-xl border border-[#D2C3B0] bg-white text-sm text-[#36271C] placeholder-[#9E8B75] focus:border-[#A83232] focus:ring-1 focus:ring-[#A83232]/30 outline-none"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC] flex justify-end gap-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || isSaving}
                className="px-5 py-2 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-sm border border-[#D4AF37]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : '✨ Add to Bucket List'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          COMPLETE / ACCOMPLISH MODAL
         ──────────────────────────────────────────── */}
      {isCompleteOpen && completingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsCompleteOpen(false)}>
          <div className="w-full max-w-md bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2D7C7] bg-[#FAF5EC]">
              <h3 className="font-serif-vintage font-bold text-base text-[#36271C]">
                🎉 Mark as Accomplished!
              </h3>
              <button onClick={() => setIsCompleteOpen(false)} className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#EFE9DE] rounded-2xl p-3 border border-[#D2C3B0]/60">
                <p className="font-serif-vintage font-bold text-sm text-[#36271C]">{completingItem.title}</p>
              </div>

              {/* Memory Note */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1">Memory Note (Optional)</label>
                <textarea
                  value={completionNote}
                  onChange={e => setCompletionNote(e.target.value)}
                  placeholder="How did it feel? Any favorite moment?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[#D2C3B0] bg-white text-sm text-[#36271C] placeholder-[#9E8B75] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none resize-none font-handwriting text-base"
                  maxLength={500}
                />
              </div>

              {/* Photo Proof */}
              <div>
                <label className="block text-xs font-bold text-[#5C4A3A] mb-1.5">📸 Memory Photo (Optional)</label>
                {completionPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#D2C3B0]">
                    <img src={completionPhoto} alt="Memory proof" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setCompletionPhoto(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full py-6 border-2 border-dashed border-[#D2C3B0] rounded-2xl text-[#9E8B75] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    {isCompressing ? (
                      <span className="text-xs font-medium">Compressing...</span>
                    ) : (
                      <>
                        <Camera className="w-6 h-6" />
                        <span className="text-xs font-medium">Add Photo Proof</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#E2D7C7] bg-[#FAF5EC] flex justify-end gap-2">
              <button
                onClick={() => setIsCompleteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                {isCompleting ? 'Saving...' : 'Mark Accomplished 🎉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
