import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Clock, 
  Camera, 
  Trash2, 
  Search,
  Check,
  LayoutGrid,
  Plus,
  RefreshCw,
  Image as ImageIcon
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

// Instagram-Style Grid Layout Definitions
const LAYOUT_MODES = [
  {
    id: 'single',
    name: '1 Photo',
    slots: 1,
    description: 'Single Snapshot',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: '2-row',
    name: '2 Rows',
    slots: 2,
    description: 'Top & Bottom Split',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="12" height="5.5" rx="1.5" />
        <rect x="2" y="8.5" width="12" height="5.5" rx="1.5" />
      </svg>
    )
  },
  {
    id: '3-trio',
    name: '3 Photos',
    slots: 3,
    description: '1 Top, 2 Bottom',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="12" height="5.5" rx="1.5" />
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" />
      </svg>
    )
  },
  {
    id: '4-quad',
    name: '4 Grid',
    slots: 4,
    description: '2x2 Quad Collage',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" />
        <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.5" />
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" />
      </svg>
    )
  }
];

// Helper to draw an image with object-fit cover inside an HTML5 Canvas bounding box
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let renderW, renderH, offsetX, offsetY;

  if (imgRatio > targetRatio) {
    renderH = h;
    renderW = h * imgRatio;
    offsetX = x + (w - renderW) / 2;
    offsetY = y;
  } else {
    renderW = w;
    renderH = w / imgRatio;
    offsetX = x;
    offsetY = y + (h - renderH) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  ctx.restore();
}

export default function StoryCreatorModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  pairInfo, 
  onSaveStory 
}) {
  const [selectedLayout, setSelectedLayout] = useState('single');
  const [gridPhotos, setGridPhotos] = useState({}); // { 0: dataUrl, 1: dataUrl, ... }
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const phtTime = getCurrentPHT().fullString;
  const authorNickname = getNickname(currentUser?.displayName) || 'You';

  if (!isOpen) return null;

  const currentLayoutConfig = LAYOUT_MODES.find(l => l.id === selectedLayout) || LAYOUT_MODES[0];
  const uploadedCount = Object.keys(gridPhotos).filter(k => !!gridPhotos[k] && Number(k) < currentLayoutConfig.slots).length;
  const hasAtLeastOnePhoto = uploadedCount > 0;

  // Filter emojis by search query
  const filteredEmojis = emojiSearchQuery.trim()
    ? FB_IG_EMOJIS.filter(item => 
        item.name.toLowerCase().includes(emojiSearchQuery.toLowerCase()) || 
        item.emoji.includes(emojiSearchQuery)
      )
    : FB_IG_EMOJIS;

  // Handle slot file upload
  const handleSlotClick = (slotIdx) => {
    setActiveSlotIndex(slotIdx);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Compress image client-side to save storage & speed up uploads
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setGridPhotos(prev => ({
          ...prev,
          [activeSlotIndex]: compressedDataUrl
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Clear single slot
  const handleClearSlot = (slotIdx, e) => {
    e?.stopPropagation();
    setGridPhotos(prev => {
      const next = { ...prev };
      delete next[slotIdx];
      return next;
    });
  };

  // Switch layout mode cleanly
  const handleLayoutChange = (layoutId) => {
    setSelectedLayout(layoutId);
  };

  // Composite the grid layout into a single 1080x1920 Instagram Story image
  const compositeFinalStory = async () => {
    if (selectedLayout === 'single') {
      return gridPhotos[0] || Object.values(gridPhotos)[0];
    }

    const canvas = document.createElement('canvas');
    const WIDTH = 1080;
    const HEIGHT = 1920;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');

    // Clean dark vintage story frame background
    ctx.fillStyle = '#1A1817';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const GAP = 14; // Clean gap between collage cells

    let slotRects = [];
    if (selectedLayout === '2-row') {
      const halfH = (HEIGHT - GAP) / 2;
      slotRects = [
        { x: 0, y: 0, w: WIDTH, h: halfH },
        { x: 0, y: halfH + GAP, w: WIDTH, h: halfH }
      ];
    } else if (selectedLayout === '3-trio') {
      const halfH = (HEIGHT - GAP) / 2;
      const halfW = (WIDTH - GAP) / 2;
      slotRects = [
        { x: 0, y: 0, w: WIDTH, h: halfH },
        { x: 0, y: halfH + GAP, w: halfW, h: halfH },
        { x: halfW + GAP, y: halfH + GAP, w: halfW, h: halfH }
      ];
    } else if (selectedLayout === '4-quad') {
      const halfW = (WIDTH - GAP) / 2;
      const halfH = (HEIGHT - GAP) / 2;
      slotRects = [
        { x: 0, y: 0, w: halfW, h: halfH },
        { x: halfW + GAP, y: 0, w: halfW, h: halfH },
        { x: 0, y: halfH + GAP, w: halfW, h: halfH },
        { x: halfW + GAP, y: halfH + GAP, w: halfW, h: halfH }
      ];
    }

    // Draw each slot image with object-fit cover
    for (let i = 0; i < slotRects.length; i++) {
      const rect = slotRects[i];
      const dataUrl = gridPhotos[i];
      if (dataUrl) {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = dataUrl;
        });
        drawImageCover(ctx, img, rect.x, rect.y, rect.w, rect.h);
      } else {
        // Fallback subtle fill for unfilled slots
        ctx.fillStyle = '#2D2825';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handlePublish = async () => {
    if (!hasAtLeastOnePhoto) {
      alert('Please add at least one photo to your story!');
      return;
    }

    setIsSubmitting(true);
    try {
      const compositedImage = await compositeFinalStory();

      const newStory = {
        authorId: currentUser?.uid || 'demo-user-1',
        authorName: currentUser?.displayName || 'Jay',
        authorPhoto: currentUser?.photoURL || '',
        pairId: pairInfo?.code || '#JayFinallyGotAKiss',
        type: 'photo',
        dataUrl: compositedImage,
        caption: '',
        moodTag: selectedEmoji || '',
        backgroundStyle: 'parchment',
        fontStyle: 'handwriting',
        layout: selectedLayout
      };

      await onSaveStory(newStory);

      // Reset state and close
      setGridPhotos({});
      setSelectedLayout('single');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn select-none">
      
      {/* Hidden File Input used by all grid slots */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

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
            className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">

          {/* ─────────────────────────────────────────────────────────────
              INSTAGRAM-STYLE LAYOUT / GRID SELECTOR BAR
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#FAF5EC] border border-[#E2D7C7] p-2.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#36271C] flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-[#A83232]" />
                <span>Story Layout</span>
              </span>
              <span className="text-[11px] font-medium text-[#9E8B75]">
                {currentLayoutConfig.name} ({uploadedCount}/{currentLayoutConfig.slots})
              </span>
            </div>

            {/* Layout Mode Pill Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {LAYOUT_MODES.map((mode) => {
                const isSelected = selectedLayout === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleLayoutChange(mode.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A83232] text-[#F8E3B6] shadow-sm scale-105 border border-[#D4AF37]'
                        : 'bg-[#FDFBF7] hover:bg-[#EFE9DE] text-[#4A3B2C] border border-[#E2D7C7]'
                    }`}
                    title={mode.description}
                  >
                    <div className="mb-1">{mode.icon}</div>
                    <span className="text-[10px] font-bold leading-tight truncate w-full">
                      {mode.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              INTERACTIVE GRID COLLAGE CANVAS PREVIEW
             ───────────────────────────────────────────────────────────── */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E2D7C7] bg-[#FAF5EC] p-3 space-y-2">
            
            {/* Story Aspect Container (Portrait Instagram Story) */}
            <div className="relative rounded-xl overflow-hidden bg-[#1A1817] aspect-[9/16] max-h-[340px] sm:max-h-[380px] w-full max-w-[220px] sm:max-w-[240px] mx-auto p-1.5 shadow-2xl flex flex-col justify-between">
              
              {/* Layout Content Rendering */}
              {selectedLayout === 'single' && (
                <div 
                  onClick={() => handleSlotClick(0)}
                  className="relative w-full h-full rounded-lg overflow-hidden bg-[#2D2825] flex items-center justify-center cursor-pointer group"
                >
                  {gridPhotos[0] ? (
                    <>
                      <img src={gridPhotos[0]} alt="Slot 1" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full text-xs font-bold flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleClearSlot(0, e)}
                          className="bg-rose-900/80 hover:bg-rose-950 text-white p-2 rounded-full text-xs font-bold"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#F8E3B6]/70 p-3 text-center space-y-1.5 border-2 border-dashed border-[#D4AF37]/50 rounded-lg w-full h-full hover:border-[#D4AF37]">
                      <div className="w-10 h-10 rounded-full bg-[#A83232]/80 flex items-center justify-center text-[#F8E3B6] shadow-sm">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-bold">Add Photo</span>
                    </div>
                  )}
                </div>
              )}

              {/* 2-Rows (Top / Bottom Split) */}
              {selectedLayout === '2-row' && (
                <div className="grid grid-rows-2 gap-1.5 w-full h-full">
                  {[0, 1].map((slotIdx) => (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className="relative rounded-lg overflow-hidden bg-[#2D2825] flex items-center justify-center cursor-pointer group"
                    >
                      {gridPhotos[slotIdx] ? (
                        <>
                          <img src={gridPhotos[slotIdx]} alt={`Slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <span className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full text-xs">
                              <RefreshCw className="w-3 h-3" />
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleClearSlot(slotIdx, e)}
                              className="bg-rose-900/80 text-white p-1.5 rounded-full text-xs"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#F8E3B6]/70 p-2 text-center space-y-1 border-2 border-dashed border-[#D4AF37]/40 rounded-lg w-full h-full">
                          <Plus className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 3-Photos (1 Top + 2 Bottom) */}
              {selectedLayout === '3-trio' && (
                <div className="grid grid-rows-2 gap-1.5 w-full h-full">
                  {/* Top Featured Slot */}
                  <div
                    onClick={() => handleSlotClick(0)}
                    className="relative rounded-lg overflow-hidden bg-[#2D2825] flex items-center justify-center cursor-pointer group"
                  >
                    {gridPhotos[0] ? (
                      <>
                        <img src={gridPhotos[0]} alt="Slot 1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <span className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full text-xs">
                            <RefreshCw className="w-3 h-3" />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleClearSlot(0, e)}
                            className="bg-rose-900/80 text-white p-1.5 rounded-full text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#F8E3B6]/70 p-2 text-center space-y-1 border-2 border-dashed border-[#D4AF37]/40 rounded-lg w-full h-full">
                        <Plus className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[9px] font-bold">Top Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom 2 Split Slots */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2].map((slotIdx) => (
                      <div
                        key={slotIdx}
                        onClick={() => handleSlotClick(slotIdx)}
                        className="relative rounded-lg overflow-hidden bg-[#2D2825] flex items-center justify-center cursor-pointer group"
                      >
                        {gridPhotos[slotIdx] ? (
                          <>
                            <img src={gridPhotos[slotIdx]} alt={`Slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <span className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full text-xs">
                                <RefreshCw className="w-3 h-3" />
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleClearSlot(slotIdx, e)}
                                className="bg-rose-900/80 text-white p-1.5 rounded-full text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#F8E3B6]/70 p-2 text-center space-y-1 border-2 border-dashed border-[#D4AF37]/40 rounded-lg w-full h-full">
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4-Quad Grid (2x2 Grid) */}
              {selectedLayout === '4-quad' && (
                <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-full">
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className="relative rounded-lg overflow-hidden bg-[#2D2825] flex items-center justify-center cursor-pointer group"
                    >
                      {gridPhotos[slotIdx] ? (
                        <>
                          <img src={gridPhotos[slotIdx]} alt={`Slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <span className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full text-xs">
                              <RefreshCw className="w-3 h-3" />
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleClearSlot(slotIdx, e)}
                              className="bg-rose-900/80 text-white p-1.5 rounded-full text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#F8E3B6]/70 p-2 text-center space-y-1 border-2 border-dashed border-[#D4AF37]/40 rounded-lg w-full h-full">
                          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Author Avatar Badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-white/20 pointer-events-none z-10">
                <span>{authorNickname}</span>
              </div>
            </div>

            {/* Action Bar Below Preview */}
            <div className="flex justify-between items-center px-1 pt-1">
              <span className="text-[10px] text-[#9E8B75] font-mono">
                {phtTime}
              </span>
              
              {hasAtLeastOnePhoto && (
                <button
                  type="button"
                  onClick={() => setGridPhotos({})}
                  className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear all photos</span>
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FB / IG STYLE EMOJI PICKER WITH SEARCH
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#242526] rounded-2xl p-3 sm:p-4 text-white shadow-xl border border-white/10 space-y-3">
            
            {/* Search Bar matching the FB / IG style */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emojiSearchQuery}
                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                placeholder="Search Emoji Stamp"
                className="w-full pl-9 pr-8 py-2 bg-[#3A3B3C] border-none rounded-xl text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              {emojiSearchQuery && (
                <button
                  onClick={() => setEmojiSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
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
                  type="button"
                  onClick={() => setSelectedEmoji('')}
                  className="text-[11px] text-[#F8E3B6] hover:underline cursor-pointer"
                >
                  Clear Stamp
                </button>
              )}
            </div>

            {/* 8-Column Grid matching Screenshot */}
            <div className="max-h-[160px] sm:max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-8 gap-1 sm:gap-1.5 text-center">
                  {filteredEmojis.map((item) => (
                    <button
                      key={item.emoji + item.name}
                      type="button"
                      onClick={() => setSelectedEmoji(selectedEmoji === item.emoji ? '' : item.emoji)}
                      className={`text-2xl sm:text-2xl p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4A3A] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handlePublish}
            disabled={isSubmitting || !hasAtLeastOnePhoto}
            className="flex items-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg border border-[#D4AF37]/50 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#F8E3B6] border-t-transparent rounded-full animate-spin" />
                <span>Composing Story...</span>
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
