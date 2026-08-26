import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  Sparkles, 
  Smile, 
  FileText,
  Lock,
  Save,
  PenTool,
  Zap,
  Heart,
  CloudRain,
  Sun,
  Moon,
  PartyPopper,
  Mic,
  AlertCircle
} from 'lucide-react';
import { getCurrentPHT } from '../utils/pht';
import { compressImages } from '../utils/imageCompressor';
import AudioRecorderWidget from './AudioRecorderWidget';

export const MOOD_CATEGORIES = [
  {
    name: '✨ Warm & Happy',
    options: [
      'Warm & Hopeful',
      'Cozily Peaceful',
      'Morning Sunshine',
      'Deeply Grateful',
      'Celebrating Us',
      'Playful & Sweet',
    ]
  },
  {
    name: '🌙 Deep & Reflective',
    options: [
      'Late Night Thoughts',
      'Bittersweet Memories',
      'Nostalgic & Reflective',
      'Soft & Vulnerable',
      'Missing You Deeply',
      'Quiet Solace',
    ]
  },
  {
    name: '🌧️ Complex & Difficult',
    options: [
      'Heavy-Hearted & Sad',
      'Overwhelmed & Anxious',
      'Rainy Day Musings',
      'Somber & Quiet',
      'Hurt & Needing Comfort',
      'Feeling Lost',
    ]
  },
  {
    name: '🕊️ Healing & Reassurance',
    options: [
      'Apologetic & Remorseful',
      'Healing & Moving Forward',
      'Reassurance & Support',
      'Quiet Forgiveness',
    ]
  }
];

export const MOOD_OPTIONS = MOOD_CATEGORIES.flatMap(cat => cat.options);

export default function LetterEditorModal({ 
  isOpen, 
  onClose, 
  existingLetter, 
  currentUser, 
  pairInfo, 
  onSave 
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVeryImportant, setIsVeryImportant] = useState(false);
  const [importantTagReason, setImportantTagReason] = useState('');
  const [mood, setMood] = useState('Warm & Hopeful');
  const [images, setImages] = useState([]);
  const [audioNote, setAudioNote] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showAbandonPrompt, setShowAbandonPrompt] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  // Immutable PHT & ISO Creation Timestamp State (Preserved from original draft moment)
  const [phtStamp, setPhtStamp] = useState('');
  const [isoStamp, setIsoStamp] = useState('');

  useEffect(() => {
    if (existingLetter) {
      setTitle(existingLetter.title || '');
      setContent(existingLetter.content || '');
      setIsVeryImportant(Boolean(existingLetter.isVeryImportant));
      setImportantTagReason(existingLetter.importantTagReason || '');
      setMood(existingLetter.mood || 'Warm & Hopeful');
      setImages(existingLetter.images || []);
      setAudioNote(existingLetter.audioNote || null);
      setShowAudioRecorder(Boolean(existingLetter.audioNote));
      setShowAbandonPrompt(false);
      setIsDraft(Boolean(existingLetter.isDraft));
      // Preserve original immutable PHT & ISO timestamps from when it was first drafted
      setPhtStamp(existingLetter.createdAtPHT || getCurrentPHT().fullString);
      setIsoStamp(existingLetter.createdAtIso || getCurrentPHT().isoString);
    } else {
      // New Letter / Draft: generate fresh initial PHT & ISO timestamp once
      const phtNow = getCurrentPHT();
      setPhtStamp(phtNow.fullString);
      setIsoStamp(phtNow.isoString);
      setTitle('');
      setContent('');
      setIsVeryImportant(false);
      setImportantTagReason('');
      setMood('Warm & Hopeful');
      setImages([]);
      setAudioNote(null);
      setShowAudioRecorder(false);
      setShowAbandonPrompt(false);
      setIsDraft(false);
    }
  }, [existingLetter, isOpen]);

  if (!isOpen) return null;

  // Handle Bulk Image Upload with Client-Side Canvas Compression
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressing(true);
    try {
      const compressedList = await compressImages(files);
      setImages(prev => [...prev, ...compressedList]);
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!title.trim() && !content.trim()) {
      alert('Please add a title or content to your letter.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: existingLetter?.id,
        pairId: pairInfo?.code || '#JayFinallyGotAKiss',
        authorId: currentUser?.uid || 'demo-user-1',
        authorName: currentUser?.displayName || 'Jay',
        authorPhoto: currentUser?.photoURL || '',
        title: title.trim() || 'Untitled Letter',
        content: content.trim(),
        isVeryImportant,
        importantTagReason: isVeryImportant ? importantTagReason.trim() : '',
        mood,
        images,
        audioNote,
        isDraft: saveAsDraft,
        // Immutable initial creation PHT and ISO stamp (preserved from first draft)
        createdAtPHT: phtStamp,
        createdAtIso: isoStamp
      });
      onClose();
    } catch (err) {
      console.error('Error saving letter:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    if (existingLetter) {
      const titleChanged = (title || '').trim() !== (existingLetter.title || '').trim();
      const contentChanged = (content || '').trim() !== (existingLetter.content || '').trim();
      const moodChanged = mood !== (existingLetter.mood || 'Warm & Hopeful');
      const imagesChanged = (images?.length || 0) !== (existingLetter.images?.length || 0);
      const audioChanged = Boolean(audioNote) !== Boolean(existingLetter.audioNote);
      return titleChanged || contentChanged || moodChanged || imagesChanged || audioChanged;
    }
    return Boolean(title.trim() || content.trim() || images.length > 0 || audioNote);
  };

  const handleRequestClose = () => {
    if (hasUnsavedChanges()) {
      setShowAbandonPrompt(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowAbandonPrompt(false);
    onClose();
  };

  const handleSaveDraftAndClose = async () => {
    setShowAbandonPrompt(false);
    await handleSubmit(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#36271C]/70 backdrop-blur-sm overflow-y-auto animate-fadeIn select-none"
      onClick={handleRequestClose}
    >
      
      {/* Wooden Desk Outer Backdrop */}
      <div 
        className="relative w-full max-w-2xl bg-[#FDFBF7] border-2 border-[#D2C3B0] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Vintage Paper Tape Top Header */}
        <div className="tape-strip"></div>

        {/* Modal Top Bar */}
        <div className="bg-[#FAF5EC] border-b border-[#E2D7C7] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="wax-seal w-8 h-8 shrink-0">
              <PenTool className="w-4 h-4 text-[#F8E3B6]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-serif-vintage text-[#36271C] truncate">
                {existingLetter ? (existingLetter.isDraft ? 'Resume Draft Letter' : 'Edit Your Sealed Letter') : 'Compose Letter for Later'}
              </h2>
              {/* Immutable PHT Stamp Notice */}
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#8B0000] font-mono mt-0.5 flex-wrap">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Written on: <strong>{phtStamp}</strong> (Preserved)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="text-[#9E8B75] hover:text-[#36271C] p-1.5 rounded-full hover:bg-[#EFE9DE] transition-colors shrink-0 cursor-pointer"
            title="Close letter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable Stationery Desk */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 stationery-sheet text-sm">
          
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your letter a memorable title..."
              className="w-full bg-transparent border-b-2 border-[#C8B9A6] focus:border-[#A83232] font-serif-vintage font-bold text-lg sm:text-xl text-[#36271C] placeholder-[#9E8B75] focus:outline-none py-1 transition-colors"
            />
          </div>

          {/* Very Important Toggle & Reason */}
          <div className="bg-[#FAF5EC] p-3.5 sm:p-4 rounded-xl border border-[#EBE3D5] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVeryImportant(!isVeryImportant)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    isVeryImportant 
                      ? 'bg-[#D4AF37] border-[#AA7C11] text-[#3D2600]' 
                      : 'bg-white border-[#C8B9A6] text-transparent'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
                <span className="font-bold text-xs text-[#36271C] uppercase tracking-wider">
                  Mark as "Very Important" ⭐
                </span>
              </div>
              
              {isVeryImportant && (
                <span className="important-ribbon text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Priority Memory
                </span>
              )}
            </div>

            {isVeryImportant && (
              <div className="pt-1 animate-fadeIn">
                <label className="block text-xs font-semibold text-[#8B0000] mb-1">
                  Why is this letter marked Very Important? (Tag context for 2032):
                </label>
                <input
                  type="text"
                  value={importantTagReason}
                  onChange={(e) => setImportantTagReason(e.target.value)}
                  placeholder="e.g. The night we decided our future house, big career milestone..."
                  className="w-full bg-white border border-[#D2C3B0] rounded-lg px-3 py-1.5 text-xs text-[#36271C] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            )}
          </div>

          {/* Mood Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <Smile className="w-4 h-4 text-[#C86D51] shrink-0" />
            <span className="text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">Mood:</span>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-[#FAF5EC] border border-[#D2C3B0] rounded-lg px-2.5 py-1 text-xs text-[#36271C] focus:outline-none max-w-full"
            >
              {MOOD_CATEGORIES.map(category => (
                <optgroup key={category.name} label={category.name}>
                  {category.options.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Main Letter Body Text Area */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="Write your letter here... pour out your feelings, thoughts, and memories for 2032..."
              className="w-full bg-transparent font-typewriter text-[#36271C] text-sm focus:outline-none resize-none leading-[28px] tracking-wide placeholder-[#A69888]"
            />
          </div>

          {/* Bulk Images Dropzone & Polaroid Previews */}
          <div className="border-t border-[#E2D7C7] pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#A83232]" />
                <span className="text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">
                  Photo Attachments ({images.length})
                </span>
              </div>

              {/* Compressed Badge */}
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0">
                <Zap className="w-3 h-3 text-emerald-600" />
                Auto-Compressed (100% Free Storage)
              </span>
            </div>

            {/* Polaroid Thumbnail Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative polaroid-card p-1.5 group">
                    <img
                      src={img.dataUrl || img.storageUrl}
                      alt={img.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="mt-1 flex items-center justify-between text-[10px] text-[#9E8B75]">
                      <span className="truncate max-w-[80px]">{img.name}</span>
                      <span>{img.sizeKb}KB</span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-rose-700 text-white p-1 rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Dropzone Button */}
            <label className="flex items-center justify-center gap-2 w-full p-3.5 sm:p-4 border-2 border-dashed border-[#C8B9A6] hover:border-[#A83232] rounded-xl bg-[#FAF5EC]/60 hover:bg-[#FAF5EC] cursor-pointer transition-colors text-xs text-[#4A3B2C] text-center">
              <Upload className="w-4 h-4 text-[#A83232] shrink-0" />
              <span className="font-semibold">
                {isCompressing ? 'Compressing Photos...' : 'Add Bulk Photos (Auto-compressed to ~150KB)'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isCompressing}
              />
            </label>
          </div>

          {/* 60-Second Spoken Voice Note Attachment */}
          <div className="border-t border-[#E2D7C7] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#A83232]" />
                <span className="text-xs font-bold text-[#4A3B2C] uppercase tracking-wider">
                  Voice Note Attachment {audioNote ? '(1 Recorded)' : ''}
                </span>
              </div>

              {!showAudioRecorder && !audioNote && (
                <button
                  type="button"
                  onClick={() => setShowAudioRecorder(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#A83232] hover:text-[#8B0000] bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#D2C3B0] px-3 py-1 rounded-full transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>+ Record Voice Note (60s)</span>
                </button>
              )}
            </div>

            {showAudioRecorder && (
              <AudioRecorderWidget
                existingAudio={audioNote}
                onAudioRecorded={(audioData) => {
                  setAudioNote(audioData);
                }}
                onCancel={() => {
                  if (!audioNote) {
                    setShowAudioRecorder(false);
                  }
                }}
              />
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF5EC] border-t border-[#E2D7C7] px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] text-xs font-semibold rounded-xl border border-[#D2C3B0] transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 bg-transparent text-[#9E8B75] hover:text-[#36271C] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSaving || isCompressing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSaving ? 'Sealing...' : 'Seal Letter in Vault'}</span>
            </button>
          </div>
        </div>

        {/* Abandon / Save Draft Confirmation Dialog */}
        {showAbandonPrompt && (
          <div 
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowAbandonPrompt(false)}
          >
            <div 
              className="relative bg-[#FAF5EC] border-2 border-[#E2D7C7] rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dismiss / Keep Writing X icon */}
              <button
                type="button"
                onClick={() => setShowAbandonPrompt(false)}
                className="absolute top-4 right-4 text-[#9E8B75] hover:text-[#36271C] p-1.5 rounded-full hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                title="Keep writing"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="wax-seal w-12 h-12 mx-auto text-xl shadow-md">
                ✍️
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif-vintage font-bold text-lg text-[#36271C]">
                  Unsealed Words in Progress
                </h3>
                <p className="text-xs text-[#7A6855] leading-relaxed">
                  You have unsealed changes. Would you like to preserve this letter as a draft or discard it?
                </p>
              </div>

              {/* 2 Clean Side-by-Side Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl border border-[#D2C3B0] bg-white hover:bg-rose-50 hover:border-rose-300 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraftAndClose}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border border-[#D4AF37]/50 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
