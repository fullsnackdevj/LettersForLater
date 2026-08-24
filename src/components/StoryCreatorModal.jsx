import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Clock, 
  Camera, 
  Trash2, 
  Search,
  Check
} from 'lucide-react';
import { getCurrentPHT } from '../utils/pht';
import { getNickname } from '../utils/nicknames';

// Full FB / IG emoji set matching the exact grid from the screenshot + searchable keywords
const FB_IG_EMOJIS = [
  // ── ROW 1 (from screenshot) ──
  { emoji: '❤️', name: 'heart love red romantic miss you' },
  { emoji: '🤗', name: 'hug hugging happy warm love embrace' },
  { emoji: '😂', name: 'laugh lol haha tears joy funny' },
  { emoji: '😚', name: 'kiss kissing closed eyes cute love' },
  { emoji: '🫵', name: 'point pointing you index target' },
  { emoji: '😒', name: 'unamused side eye bored annoyed meh' },
  { emoji: '🎶', name: 'music notes song melody listen audio' },
  { emoji: '😭', name: 'cry crying sob tears sad missing heartbreak' },

  // ── ROW 2 (from screenshot) ──
  { emoji: '😌', name: 'relieved peaceful calm content smile rest' },
  { emoji: '🥺', name: 'pleading puppy eyes please miss you cute' },
  { emoji: '🤫', name: 'shush quiet secret silent whisper' },
  { emoji: '☕', name: 'coffee tea cafe morning work drink study' },
  { emoji: '💍', name: 'ring diamond wedding engagement promise love marry' },
  { emoji: '😆', name: 'laugh grinning squinting haha joy lol' },
  { emoji: '💧', name: 'droplet water sweat tear drop rain' },
  { emoji: '🥱', name: 'yawn yawning tired sleepy bored exhausted' },

  // ── ROW 3 (from screenshot) ──
  { emoji: '✨', name: 'sparkles sparkle magic shine stars pretty' },
  { emoji: '🔪', name: 'knife kitchen cook food weapon sharp' },
  { emoji: '🫡', name: 'salute yes sir respect okay acknowledge' },
  { emoji: '😶', name: 'speechless quiet blank mouthless silent no words' },
  { emoji: '🫶', name: 'heart hands love heart care affection' },
  { emoji: '🔄', name: 'repeat cycle refresh reload arrows loop' },
  { emoji: '❌', name: 'cross red x mark no cancel stop wrong' },
  { emoji: '😘', name: 'kiss blow kiss heart flirt romantic' },

  // ── ROW 4 (from screenshot) ──
  { emoji: '🤭', name: 'giggle oops hand over mouth shy cute secret' },
  { emoji: '🤔', name: 'think thinking hmm wonder ponder question' },
  { emoji: '🫳', name: 'hand palm down drop reach grab' },
  { emoji: '🙁', name: 'frown sad frowning unhappy down upset' },
  { emoji: '🫶🏻', name: 'heart hands light love care' },
  { emoji: '🎸', name: 'guitar electric music rock play band' },
  { emoji: '😴', name: 'sleep sleepy night tired zzz dream bed' },
  { emoji: '👏', name: 'clap clapping applause bravo well done cheers' },

  // ── Popular Extended Everyday Moments ──
  { emoji: '💖', name: 'sparkling heart pink love romantic' },
  { emoji: '🥰', name: 'hearts in love smiling sweet adoration' },
  { emoji: '🔥', name: 'fire flame lit hot cool workout' },
  { emoji: '💌', name: 'love letter mail envelope message stamp' },
  { emoji: '🍕', name: 'pizza food eating lunch dinner snack' },
  { emoji: '🍔', name: 'burger food eating meal' },
  { emoji: '🍜', name: 'ramen noodles soup food meal dinner' },
  { emoji: '🏃‍♂️', name: 'running run workout exercise fitness gym walk' },
  { emoji: '📚', name: 'book books study reading learn school' },
  { emoji: '🎧', name: 'headphones listening music podcast chill' },
  { emoji: '🚗', name: 'car drive driving travel road trip commute' },
  { emoji: '🌧️', name: 'rain raincloud raining rainy weather cozy' },
  { emoji: '🌅', name: 'sunrise sunset morning sun golden hour dawn' },
  { emoji: '🌙', name: 'moon night goodnight evening stars' },
  { emoji: '🧸', name: 'teddy bear plushie comfort cute hug miss you' },
  { emoji: '🌿', name: 'plant green leaf nature peaceful grow' },
  { emoji: '🕊️', name: 'dove bird peace holy prayer hope' },
  { emoji: '📸', name: 'camera photo picture snapshot capture memories' },
  { emoji: '🎮', name: 'game gaming play controller console' },
  { emoji: '🍿', name: 'popcorn movie cinema watch netflix' },
  { emoji: '👀', name: 'eyes look looking seeing spy curious' },
  { emoji: '🙈', name: 'see no evil monkey shy embarrassed cute' },
  { emoji: '💯', name: '100 perfect full score best accurate' },
  { emoji: '🌸', name: 'cherry blossom flower blossom spring pink bloom' }
];

export default function StoryCreatorModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  pairInfo, 
  onSaveStory 
}) {
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const phtTime = getCurrentPHT().fullString;
  const authorNickname = getNickname(currentUser?.displayName) || 'You';

  if (!isOpen) return null;

  // Filter emojis by search query
  const filteredEmojis = emojiSearchQuery.trim()
    ? FB_IG_EMOJIS.filter(item => 
        item.name.toLowerCase().includes(emojiSearchQuery.toLowerCase()) || 
        item.emoji.includes(emojiSearchQuery)
      )
    : FB_IG_EMOJIS;

  // Compress image client-side to save storage & speed up uploads
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSize = file.size;
    const originalFormatted = originalSize > 1024 * 1024 
      ? `${(originalSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(originalSize / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
        const compressedBytes = Math.round((compressedDataUrl.length * 3) / 4);
        const compressedKb = `${Math.round(compressedBytes / 1024)} KB`;
        const savedPercent = Math.max(0, Math.round((1 - compressedBytes / originalSize) * 100));

        setCompressionInfo({
          original: originalFormatted,
          compressed: compressedKb,
          savedPercent: `${savedPercent}%`
        });
        setPhotoDataUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!photoDataUrl) {
      alert('Please select a photo for your story!');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStory = {
        authorId: currentUser?.uid || 'demo-user-1',
        authorName: currentUser?.displayName || 'Jay',
        authorPhoto: currentUser?.photoURL || '',
        pairId: pairInfo?.code || '#JayFinallyGotAKiss',
        type: 'photo',
        dataUrl: photoDataUrl,
        caption: '', // No text caption
        moodTag: selectedEmoji || '', // Pure emoji stamp
        backgroundStyle: 'parchment',
        fontStyle: 'handwriting'
      };

      await onSaveStory(newStory);

      // Reset state and close
      setPhotoDataUrl(null);
      setSelectedEmoji('❤️');
      setEmojiSearchQuery('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to create story:', err);
      setIsSubmitting(false);
      alert('Failed to publish story. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2D7C7] bg-[#FAF5EC]">
          <div className="flex items-center gap-2.5">
            <div className="wax-seal w-8 h-8 text-xs font-serif font-bold">
              📸
            </div>
            <div>
              <h3 className="font-serif-vintage font-bold text-base sm:text-lg text-[#36271C]">
                Share a Snapshot
              </h3>
              <p className="text-[11px] text-[#9E8B75] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#A83232]" />
                <span>24-Hour Story • Preserved in Memory Log</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">

          {/* Photo Upload Area or Live Preview */}
          {!photoDataUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D4AF37]/70 hover:border-[#A83232] bg-[#FAF5EC] rounded-2xl p-8 text-center cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center justify-center gap-3 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#A83232] group-hover:scale-110 transition-transform shadow-sm">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm sm:text-base text-[#36271C]">
                  Choose Photo for Today
                </p>
                <p className="text-xs text-[#9E8B75] max-w-xs">
                  Tap to upload a picture from your camera or gallery
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E2D7C7] bg-[#FAF5EC] p-3 space-y-2">
              
              {/* Polaroid Frame Preview */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-[300px] sm:max-h-[340px] flex items-center justify-center">
                <img
                  src={photoDataUrl}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />

                {/* Selected Pure Emoji Stamp Overlay */}
                {selectedEmoji && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-2xl p-2 rounded-2xl border border-white/20 shadow-lg animate-bounce">
                    {selectedEmoji}
                  </div>
                )}

                {/* Author Avatar Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border border-white/20">
                  <span>{authorNickname}</span>
                </div>
              </div>

              {/* Live Client-Side Storage Optimization Badge */}
              {compressionInfo && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-[11px] font-medium shadow-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Optimized: <strong className="font-mono">{compressionInfo.original}</strong> ➔ <strong className="font-mono">{compressionInfo.compressed}</strong></span>
                  </span>
                  <span className="bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    {compressionInfo.savedPercent} saved
                  </span>
                </div>
              )}

              {/* Action Bar Below Preview */}
              <div className="flex justify-between items-center px-1 pt-1">
                <span className="text-[10px] text-[#9E8B75] font-mono">
                  {phtTime}
                </span>
                <button
                  onClick={() => {
                    setPhotoDataUrl(null);
                    setCompressionInfo(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Choose another photo</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              FB / IG STYLE EMOJI PICKER WITH SEARCH (Matching Screenshot)
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#242526] rounded-2xl p-3 sm:p-4 text-white shadow-xl border border-white/10 space-y-3">
            
            {/* Search Bar matching the FB / IG style */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emojiSearchQuery}
                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                placeholder="Search Emoji"
                className="w-full pl-9 pr-8 py-2 bg-[#3A3B3C] border-none rounded-xl text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              {emojiSearchQuery && (
                <button
                  onClick={() => setEmojiSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selected Stamp Preview Bar */}
            <div className="flex items-center justify-between text-xs px-1 text-white/70">
              <span className="flex items-center gap-1.5">
                <span>Selected Stamp:</span>
                {selectedEmoji ? (
                  <span className="text-xl bg-white/15 px-2 py-0.5 rounded-lg border border-white/20 inline-block animate-pulse">
                    {selectedEmoji}
                  </span>
                ) : (
                  <span className="italic text-white/40">None</span>
                )}
              </span>

              {selectedEmoji && (
                <button
                  onClick={() => setSelectedEmoji('')}
                  className="text-[11px] text-[#F8E3B6] hover:underline"
                >
                  Clear Stamp
                </button>
              )}
            </div>

            {/* 8-Column Grid matching Screenshot */}
            <div className="max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
              {filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-8 gap-1 sm:gap-1.5 text-center">
                  {filteredEmojis.map((item) => (
                    <button
                      key={item.emoji + item.name}
                      type="button"
                      onClick={() => setSelectedEmoji(selectedEmoji === item.emoji ? '' : item.emoji)}
                      className={`text-2xl sm:text-2xl p-1.5 rounded-xl transition-all flex items-center justify-center ${
                        selectedEmoji === item.emoji
                          ? 'bg-[#A83232] scale-120 shadow-md ring-2 ring-[#D4AF37]'
                          : 'hover:bg-white/15 active:scale-95'
                      }`}
                      title={item.name}
                    >
                      <span className="transform hover:scale-120 transition-transform">
                        {item.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-white/50">
                  No matching emoji found for "{emojiSearchQuery}"
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-[#E2D7C7] bg-[#FAF5EC] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePublish}
            disabled={isSubmitting || !photoDataUrl}
            className="flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg border border-[#D4AF37]/50 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#F8E3B6] border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F8E3B6]" />
                <span>Publish Snapshot</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
