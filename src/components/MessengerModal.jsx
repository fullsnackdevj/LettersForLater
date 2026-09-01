import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  Heart, 
  Reply, 
  Bookmark, 
  Trash2, 
  Download, 
  Check, 
  Sparkles,
  ZoomIn,
  Search,
  Camera,
  Edit3,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { getNickname } from '../utils/nicknames';
import { getPresenceInfo } from '../utils/presence';
import { compressImage } from '../utils/imageCompressor';
import { downloadImage } from '../utils/fileDownloader';
import VintageAudioPlayer from './VintageAudioPlayer';

// Messenger-Style 7 Core Reactions
const MESSENGER_REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🥰', label: 'Care' },
  { emoji: '😆', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '👍', label: 'Like' }
];

// Categorized Messenger Emoji Library
const EMOJI_CATEGORIES = [
  {
    id: 'love',
    name: 'Love & Romance',
    icon: '❤️',
    emojis: [
      '❤️', '💖', '💕', '💓', '💗', '💘', '💝', '💞', '💟', '💌', 
      '😘', '💋', '🥰', '😍', '😻', '💍', '👩‍❤️‍👨', '💏', '👩‍❤️‍💋‍👨', '🫶', 
      '🫂', '🌹', '🌸', '💐', '🌺', '🌷', '🧸', '✨', '👑', '🕊️'
    ]
  },
  {
    id: 'smileys',
    name: 'Smileys & Feelings',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '🥹', '😅', '😂', '🤣', '🥲', 
      '☺️', '😊', '😇', '😉', '😌', '😋', '😛', '😜', '🤪', '😎', 
      '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🥺', '😢', 
      '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '🤗',
      '🤔', '🫣', '🤭', '🤫', '😶', '🫠', '🙄', '🥱', '😴', '🤤'
    ]
  },
  {
    id: 'lifestyle',
    name: 'Food & Lifestyle',
    icon: '☕',
    emojis: [
      '☕', '🧋', '🍵', '🍦', '🍰', '🎂', '🍫', '🍩', '🍪', '🥞', 
      '🍕', '🍔', '🍟', '🍜', '🍣', '🍙', '🍓', '🍒', '🥑', '🥂', 
      '🍷', '🍿', '🎬', '🎧', '🎮', '✈️', '🏖️', '🏠', '🚗', '🛍️'
    ]
  },
  {
    id: 'nature',
    name: 'Animals & Nature',
    icon: '🐾',
    emojis: [
      '🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🦁', '🐯', '🐥', 
      '🐧', '🦋', '🐝', '🌻', '🌼', '🌙', '⭐', '🌟', '☁️', '🌈', 
      '☀️', '❄️', '🌊', '🔥', '🌴', '🍀', '🍂', '🍁', '🌍', '🪐'
    ]
  }
];

export default function MessengerModal({
  isOpen,
  onClose,
  currentUser,
  pairInfo,
  partnerPresence,
  messages = [],
  onSendMessage,
  onReactToMessage,
  onDeleteMessage,
  onUpdateMessage,
  onSaveToVault,
  onOpenCallPrompt
}) {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  
  // Message Edit & Unsend States
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageToUnsend, setMessageToUnsend] = useState(null);
  const [activeActionSheetMessage, setActiveActionSheetMessage] = useState(null);

  // Tray Drawers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('love');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [activePhotoLightbox, setActivePhotoLightbox] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatAreaRef = useRef(null);
  const lastTapRef = useRef({});

  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [capturedScreenshotUrl, setCapturedScreenshotUrl] = useState(null);

  const currentUserId = currentUser?.uid || 'demo-user-1';
  const currentUserName = getNickname(currentUser?.displayName) || 'Jay';
  const user2Name = getNickname(pairInfo?.user2?.name) || 'Partner';
  const partnerName = currentUserName === user2Name ? 'Jay' : user2Name;
  const partnerPresenceInfo = getPresenceInfo(partnerPresence);

  // Partner's avatar
  const partnerPhoto = pairInfo?.user2?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages.length]);

  // Clean up audio recorder
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  // Show temporary toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Adjust Textarea Height dynamically up to 5 lines (Messenger style)
  const handleTextareaInput = (e) => {
    const text = e.target.value;
    setInputText(text);

    const target = textareaRef.current;
    if (target) {
      target.style.height = 'auto';
      const lineHeight = 22;
      const maxHeight = lineHeight * 5 + 12; // 5 lines limit
      target.style.height = `${Math.min(target.scrollHeight, maxHeight)}px`;
      target.style.overflowY = target.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  // Format message time in PHT (e.g. 10:24 AM)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return '';
    }
  };

  // Format date header (Today, Yesterday, MMM d, yyyy)
  const formatDateHeader = (isoString) => {
    if (!isoString) return '';
    try {
      const msgDate = new Date(isoString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const msgDayStr = msgDate.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
      const todayStr = today.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
      const yesterdayStr = yesterday.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

      if (msgDayStr === todayStr) return 'Today';
      if (msgDayStr === yesterdayStr) return 'Yesterday';

      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(msgDate);
    } catch {
      return '';
    }
  };

  // Check if text is only 1-3 emojis (Messenger style large emoji rendering)
  const getEmojiRenderSize = (text) => {
    if (!text) return null;
    const trimmed = text.trim();
    // Regular expression for emoji detection
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u;
    if (!emojiRegex.test(trimmed)) return null;

    // Count distinct graphemes/emojis
    const emojiArray = Array.from(trimmed.replace(/\s/g, ''));
    if (emojiArray.length === 1 || trimmed.length <= 4) return 'text-5xl';
    if (emojiArray.length <= 3) return 'text-3xl';
    return null;
  };

  // Handle Photo selection with compression
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.75);
      setAttachedImage(compressed);
    } catch (err) {
      console.error('Error compressing chat photo:', err);
      showToast('Could not attach photo');
    }
  };

  // Start audio recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        }
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 60) {
            handleStopRecording(true);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      showToast('Microphone access denied');
    }
  };

  // Stop audio recording
  const handleStopRecording = async (shouldSend = false) => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = recordingSeconds;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        if (shouldSend && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            await handleSend({
              text: '',
              audioBlob,
              audioDataUrl: reader.result,
              durationSec: duration
            });
          };
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Send message
  const handleSend = async (customPayload = null) => {
    const textToSend = customPayload?.text !== undefined ? customPayload.text : inputText.trim();
    const mediaToSend = customPayload?.mediaDataUrl || attachedImage?.dataUrl || customPayload?.mediaUrl;
    const hasAudio = customPayload?.audioBlob || customPayload?.audioDataUrl;

    if (!textToSend && !mediaToSend && !hasAudio) return;

    setIsSending(true);
    try {
      const messageData = {
        text: textToSend,
        mediaDataUrl: mediaToSend || '',
        audioBlob: customPayload?.audioBlob || null,
        audioDataUrl: customPayload?.audioDataUrl || '',
        durationSec: customPayload?.durationSec || 0,
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text ? replyingTo.text.slice(0, 70) : (replyingTo.mediaUrl ? '📷 Photo' : '🎤 Voice Whisper'),
          senderName: replyingTo.senderName
        } : null
      };

      setInputText('');
      setAttachedImage(null);
      setReplyingTo(null);
      setShowEmojiPicker(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      if (onSendMessage) {
        await onSendMessage(messageData);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message');
    } finally {
      setIsSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    showToast('Text copied to clipboard 📋');
    setActiveActionSheetMessage(null);
  };

  // Start editing a message
  const handleStartEdit = (msg) => {
    if (!msg || !msg.text) return;
    setEditingMessage(msg);
    setInputText(msg.text);
    setReplyingTo(null);
    setAttachedImage(null);
    setActiveActionSheetMessage(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }, 50);
  };

  // Save edited message
  const handleSaveEdit = async () => {
    if (!editingMessage || !inputText.trim()) return;
    setIsSending(true);
    try {
      if (onUpdateMessage) {
        await onUpdateMessage(editingMessage.id, inputText.trim());
      }
      showToast('Message updated ✏️');
      setEditingMessage(null);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error updating message:', err);
      showToast('Failed to update message');
    } finally {
      setIsSending(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Trigger unsend modal
  const handleUnsendClick = (msg) => {
    setMessageToUnsend(msg);
    setActiveActionSheetMessage(null);
  };

  // Confirm unsend
  const handleUnsendConfirm = async () => {
    if (!messageToUnsend || !onDeleteMessage) return;
    try {
      await onDeleteMessage(messageToUnsend.id);
      showToast('Message unsent for everyone 🗑️');
    } catch (err) {
      console.error('Error unsending message:', err);
      showToast('Failed to unsend message');
    } finally {
      setMessageToUnsend(null);
      setActiveActionSheetMessage(null);
    }
  };

  // Double tap message to burst hearts; single tap opens Action Menu
  const handleBubbleTap = (e, message) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[message.id] || 0;

    if (now - lastTap < 300) {
      // Double tap -> heart burst
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 26,
        spread: 65,
        origin: { x, y },
        shapes: ['circle'],
        colors: ['#E29578', '#D4AF37', '#A83232', '#F28482'],
        scalar: 1.25,
        ticks: 80
      });

      if (onReactToMessage) {
        onReactToMessage(message.id, '❤️');
      }
      lastTapRef.current[message.id] = 0;
    } else {
      lastTapRef.current[message.id] = now;
      setActiveActionSheetMessage(message);
    }
  };

  // Save message as memory in Vault
  const handleSaveMessageToVault = (msg) => {
    if (!onSaveToVault) {
      showToast('Saved to Vault 💕');
      return;
    }

    const memoryItem = {
      title: `Message from ${msg.senderName}`,
      description: msg.text || (msg.mediaUrl ? 'Shared a sweet photo' : 'Sent a voice whisper'),
      category: 'sweet_memory',
      completionNote: `Saved from couple chat on ${formatTime(msg.createdAtIso)}`,
      completionPhoto: msg.mediaUrl || '',
      isCompleted: true
    };

    onSaveToVault(memoryItem);
    showToast('Saved to your shared Vault! 🔒💕');
    setActiveActionSheetMessage(null);
  };

  // Screenshot / Capture Chat Keepsake
  const handleCaptureScreenshot = async () => {
    if (!chatAreaRef.current || isCapturingScreenshot) return;

    setIsCapturingScreenshot(true);
    showToast('Capturing chat keepsake... 📸✨');

    try {
      // Dismiss active menus
      setActiveReactionMenuId(null);
      setHoveredMessageId(null);
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(chatAreaRef.current, {
        scale: 2, // High resolution (retina 2x)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FDFBF7',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `LettersForLater_Chat_${partnerName}_${Date.now()}.png`;

      // Set preview modal so it appears on screen
      setCapturedScreenshotUrl(dataUrl);

      // Trigger instant download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Celebration burst
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#A83232', '#F8E3B6', '#E29578']
      });

      showToast('Chat keepsake ready! 📸💕');
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      showToast('Could not capture screenshot');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden">
      
      <div 
        className="relative w-full max-w-lg bg-[#FDFBF7] border-2 border-[#E2D7C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[780px]"
        onClick={(e) => {
          e.stopPropagation();
          setActiveReactionMenuId(null);
        }}
      >
        
        {/* ─────────────────────────────────────────────────────────────
            HEADER (Partner Presence, In-Chat Call Shortcut & Close)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2D7C7] bg-[#FAF5EC]/95 shrink-0 z-20">
          
          {/* Left: Partner Profile & Presence */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shadow-xs"
              />
              {partnerPresenceInfo.isOnline ? (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-stone-400 rounded-full border-2 border-white shadow-2xs" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <h3 className="font-serif-vintage font-bold text-sm text-[#36271C] truncate">
                  {partnerName}
                </h3>
                <span className="text-[10px] text-[#A83232] font-mono font-bold bg-[#A83232]/10 px-1.5 py-0.2 rounded-full">
                  Sanctuary
                </span>
              </div>

              <p className="text-[11px] text-[#9E8B75] truncate mt-0.5 font-medium">
                {partnerPresenceInfo.isOnline ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active now</span>
                  </span>
                ) : (
                  <span>{partnerPresenceInfo.badgeText}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Screenshot, Call Shortcut & Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Screenshot Chat Keepsake Button (Circle) */}
            <button
              type="button"
              onClick={handleCaptureScreenshot}
              disabled={isCapturingScreenshot}
              className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                isCapturingScreenshot
                  ? 'bg-amber-100 border-[#D4AF37] text-amber-800 animate-pulse'
                  : 'bg-[#FAF5EC] hover:bg-[#EFE9DE] border-[#D2C3B0] text-[#4A3B2C] hover:text-[#A83232] shadow-xs hover:scale-105 active:scale-95'
              }`}
              title="Screenshot entire chat area as keepsake memory"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Video Call Button (Matching Circle) */}
            {onOpenCallPrompt && (
              <button
                type="button"
                onClick={onOpenCallPrompt}
                className="w-8 h-8 rounded-full bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] border border-[#D4AF37]/60 flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title={`Call ${partnerName}`}
              >
                <Video className="w-4 h-4 text-[#F8E3B6]" />
              </button>
            )}

            {/* Close Button (Circle) */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center transition-colors shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
              title="Close Messenger"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            MESSAGES STREAM CONTAINER (Captured for Screenshot)
           ───────────────────────────────────────────────────────────── */}
        <div 
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 space-y-3 bg-[#FDFBF7]"
        >
          
          {/* Welcome Message */}
          <div className="text-center py-2 px-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#A83232] bg-[#FAF5EC] px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Private Sanctuary for {currentUserName} & {partnerName}</span>
            </div>
            <p className="text-[10px] text-[#9E8B75] italic">
              Double-tap any message to burst hearts 💕
            </p>
          </div>

          {/* Render Messages */}
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[idx - 1];
            const showDateHeader = !prevMsg || formatDateHeader(prevMsg.createdAtIso) !== formatDateHeader(msg.createdAtIso);
            const isHovered = hoveredMessageId === msg.id;
            const isMenuOpen = activeReactionMenuId === msg.id;
            const standaloneEmojiClass = getEmojiRenderSize(msg.text);

            return (
              <React.Fragment key={msg.id || idx}>
                
                {/* Date Header Separator */}
                {showDateHeader && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#9E8B75] bg-[#EFE9DE]/80 border border-[#D2C3B0]/60 px-3 py-0.5 rounded-full shadow-2xs">
                      {formatDateHeader(msg.createdAtIso)}
                    </span>
                  </div>
                )}

                {/* Message Bubble Item */}
                <div 
                  className={`relative flex flex-col group ${isMe ? 'items-end' : 'items-start'} my-1`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  
                  {/* Messenger-Style Floating Pop-up Action Bar */}
                  <div 
                    className={`absolute -top-8 ${isMe ? 'right-2' : 'left-2'} z-30 bg-[#FAF5EC] border border-[#D2C3B0] rounded-full px-1.5 py-0.5 shadow-lg flex items-center gap-1 transition-all ${
                      isHovered || isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Emoji Reaction Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveReactionMenuId(isMenuOpen ? null : msg.id)}
                        className="p-1 hover:bg-[#EFE9DE] text-[#A83232] rounded-full transition-colors cursor-pointer"
                        title="React"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {/* Messenger 7 Quick Reactions Popover */}
                      {isMenuOpen && (
                        <div className={`absolute bottom-8 ${isMe ? 'right-0' : 'left-0'} bg-white border border-[#D4AF37]/50 rounded-full px-2 py-1 shadow-2xl flex items-center gap-1.5 z-40 animate-fadeIn`}>
                          {MESSENGER_REACTIONS.map(({ emoji, label }) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                if (onReactToMessage) onReactToMessage(msg.id, emoji);
                                setActiveReactionMenuId(null);
                              }}
                              className="text-xl hover:scale-135 transition-transform p-1 cursor-pointer transform origin-bottom hover:-translate-y-1"
                              title={label}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply */}
                    <button
                      type="button"
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 hover:bg-[#EFE9DE] text-[#4A3B2C] rounded-full transition-colors cursor-pointer"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit (if mine & text) */}
                    {isMe && msg.text && onUpdateMessage && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(msg)}
                        className="p-1 hover:bg-[#EFE9DE] text-[#4A3B2C] rounded-full transition-colors cursor-pointer"
                        title="Edit Message"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Save to Vault */}
                    <button
                      type="button"
                      onClick={() => handleSaveMessageToVault(msg)}
                      className="p-1 hover:bg-[#EFE9DE] text-amber-700 rounded-full transition-colors cursor-pointer"
                      title="Save to Vault"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Text */}
                    {msg.text && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text)}
                        className="p-1 hover:bg-[#EFE9DE] text-[#4A3B2C] rounded-full transition-colors cursor-pointer"
                        title="Copy Text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Unsend / Delete (if mine) */}
                    {isMe && onDeleteMessage && (
                      <button
                        type="button"
                        onClick={() => handleUnsendClick(msg)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded-full transition-colors cursor-pointer"
                        title="Unsend Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Main Bubble Body */}
                  <div
                    onClick={(e) => handleBubbleTap(e, msg)}
                    className={`relative max-w-[85%] sm:max-w-[78%] rounded-3xl p-3 shadow-xs select-none transition-all cursor-pointer ${
                      standaloneEmojiClass && !msg.mediaUrl && !msg.audioNote && !msg.replyTo
                        ? 'bg-transparent shadow-none border-none p-1'
                        : isMe
                          ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FFF9EE] to-[#FFF5EC] border border-[#D4AF37]/60 text-[#36271C] rounded-br-xs ml-8 active:scale-[0.98]'
                          : 'bg-white border border-[#D2C3B0] text-[#36271C] rounded-bl-xs mr-8 active:scale-[0.98]'
                    }`}
                  >
                    
                    {/* Quoted Reply Snippet */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded-2xl bg-black/5 border-l-3 border-[#A83232] text-xs space-y-0.5">
                        <span className="font-bold text-[10px] text-[#A83232] block">
                          Replying to {msg.replyTo.senderName}
                        </span>
                        <p className="text-[#4A3B2C] truncate italic text-[11px]">
                          "{msg.replyTo.text}"
                        </p>
                      </div>
                    )}

                    {/* Attached Photo or GIF */}
                    {msg.mediaUrl && (
                      <div className="mb-2 relative rounded-2xl overflow-hidden group/photo cursor-pointer">
                        <img
                          src={msg.mediaUrl}
                          alt="Memory"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoLightbox(msg.mediaUrl);
                          }}
                          className="max-h-64 w-full object-cover rounded-2xl hover:scale-102 transition-transform"
                        />
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoLightbox(msg.mediaUrl);
                          }}
                          className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <ZoomIn className="w-6 h-6" />
                        </div>
                      </div>
                    )}

                    {/* Attached Voice Whisper */}
                    {msg.audioNote && (
                      <div className="mb-2 w-full min-w-[220px]" onClick={(e) => e.stopPropagation()}>
                        <VintageAudioPlayer
                          audioUrl={msg.audioNote.storageUrl}
                          durationSec={msg.audioNote.durationSec}
                          authorName={msg.senderName}
                        />
                      </div>
                    )}

                    {/* Message Text (Standalone Big Emojis vs Regular Text) */}
                    {msg.text && (
                      <p className={`leading-relaxed break-words font-medium whitespace-pre-wrap ${
                        standaloneEmojiClass || 'text-xs sm:text-[13px]'
                      }`}>
                        {msg.text}
                      </p>
                    )}

                    {/* Time Stamp & Seen Indicator */}
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] text-[#9E8B75]">
                      <span>{formatTime(msg.createdAtIso)}</span>
                      {msg.isEdited && (
                        <span className="italic text-[9px] text-[#A83232] font-semibold">(edited)</span>
                      )}
                      {isMe && (
                        <span>
                          {msg.seenBy?.some(id => id !== currentUserId) ? (
                            <span className="text-emerald-700 font-bold" title={`Seen by ${partnerName} 💕`}>
                              Seen 💕
                            </span>
                          ) : (
                            <Check className="w-2.5 h-2.5 text-stone-400" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Attached Emoji Reactions Row */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 z-20`}>
                        {Object.entries(msg.reactions).map(([emoji, data]) => {
                          const count = data?.count || 0;
                          if (count <= 0) return null;
                          const hasReacted = data?.users?.includes(currentUserId);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => onReactToMessage && onReactToMessage(msg.id, emoji)}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold shadow-2xs border transition-transform hover:scale-115 active:scale-95 cursor-pointer ${
                                hasReacted 
                                  ? 'bg-[#FAF5EC] border-[#D4AF37] text-[#A83232]' 
                                  : 'bg-white border-[#E2D7C7] text-[#36271C]'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 1 && <span className="font-mono text-[9px]">{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>

                </div>
              </React.Fragment>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            EDITING MESSAGE BANNER
           ───────────────────────────────────────────────────────────── */}
        {editingMessage && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Edit3 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Editing Message
                </span>
                <p className="text-xs text-[#4A3B2C] truncate italic">
                  "{editingMessage.text}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelEdit}
              className="p-1 rounded-full hover:bg-amber-100 text-amber-800 cursor-pointer shrink-0"
              title="Cancel Edit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            QUOTED REPLY PREVIEW BANNER
           ───────────────────────────────────────────────────────────── */}
        {replyingTo && (
          <div className="px-4 py-2 bg-[#FAF5EC] border-t border-[#E2D7C7] flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="w-3.5 h-3.5 text-[#A83232] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#A83232] uppercase tracking-wider block">
                  Replying to {replyingTo.senderName}
                </span>
                <p className="text-xs text-[#4A3B2C] truncate italic">
                  "{replyingTo.text || (replyingTo.mediaUrl ? '📷 Photo' : '🎤 Voice Whisper')}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full hover:bg-[#EFE9DE] text-[#4A3B2C] cursor-pointer shrink-0"
              title="Cancel Reply"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ATTACHED IMAGE PREVIEW (Before Sending)
           ───────────────────────────────────────────────────────────── */}
        {attachedImage && (
          <div className="px-4 py-2 bg-[#FAF5EC] border-t border-[#E2D7C7] flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <img
                src={attachedImage.dataUrl}
                alt="Upload preview"
                className="w-10 h-10 object-cover rounded-xl border border-[#D4AF37]"
              />
              <span className="text-xs text-[#36271C] font-semibold">Photo ready to send</span>
            </div>

            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full hover:bg-[#EFE9DE] text-[#4A3B2C] cursor-pointer"
              title="Remove Photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MESSENGER CATEGORIZED EMOJI PICKER DRAWER
           ───────────────────────────────────────────────────────────── */}
        {showEmojiPicker && (
          <div className="bg-[#FAF5EC] border-t border-[#E2D7C7] p-3 max-h-56 overflow-y-auto custom-scrollbar shrink-0 animate-fadeIn space-y-2.5">
            
            {/* Category Navigation Pills */}
            <div className="flex items-center justify-between gap-1 border-b border-[#E2D7C7] pb-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {EMOJI_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveEmojiCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      activeEmojiCategory === cat.id
                        ? 'bg-[#A83232] text-[#F8E3B6] shadow-xs'
                        : 'bg-white/80 hover:bg-white text-[#4A3B2C] border border-[#D2C3B0]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-[#9E8B75] hover:text-[#36271C] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 text-2xl select-none">
              {(EMOJI_CATEGORIES.find(c => c.id === activeEmojiCategory)?.emojis || []).map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    textareaRef.current?.focus();
                  }}
                  className="p-1 hover:bg-white rounded-xl hover:scale-125 transition-transform flex items-center justify-center cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            INPUT BAR / AUTO-EXPANDING TEXTAREA (Up to 5 Lines)
           ───────────────────────────────────────────────────────────── */}
        <div className="p-2.5 sm:p-3 bg-[#FAF5EC] border-t border-[#E2D7C7] shrink-0">
          
          {isRecording ? (
            /* Live Audio Recording UI */
            <div className="flex items-center justify-between gap-2 bg-white border-2 border-[#A83232] rounded-2xl px-3.5 py-2 animate-pulse shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A83232] animate-ping" />
                <span className="text-xs font-mono font-bold text-[#A83232]">
                  Recording... {recordingSeconds}s / 60s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStopRecording(false)}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStopRecording(true)}
                  className="px-3.5 py-1 rounded-xl bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] text-xs font-bold shadow-xs cursor-pointer"
                >
                  Send Voice
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text & Attachment Input Form */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingMessage) {
                  handleSaveEdit();
                } else {
                  handleSend();
                }
              }}
              className="flex items-end gap-1.5 sm:gap-2"
            >
              
              {/* Media & Emoji Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 pb-1">
                
                {/* Emoji Tray Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    showEmojiPicker 
                      ? 'bg-[#A83232] text-[#F8E3B6] border-[#D4AF37]' 
                      : 'bg-white hover:bg-[#EFE9DE] border-[#D2C3B0] text-[#4A3B2C]'
                  }`}
                  title="Emojis"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Photo Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white hover:bg-[#EFE9DE] border border-[#D2C3B0] text-[#4A3B2C] transition-colors cursor-pointer"
                  title="Attach Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Voice Whisper Button */}
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="p-2 rounded-xl bg-white hover:bg-[#EFE9DE] border border-[#D2C3B0] text-[#4A3B2C] hover:text-[#A83232] transition-colors cursor-pointer"
                  title="Record Voice Whisper"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Auto-expanding Textarea (up to 5 lines like Messenger) */}
              <div className="flex-1 bg-white border border-[#D2C3B0] focus-within:border-[#A83232] focus-within:ring-1 focus-within:ring-[#A83232] rounded-2xl px-3 py-1.5 shadow-2xs transition-all">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editingMessage) {
                        handleSaveEdit();
                      } else {
                        handleSend();
                      }
                    }
                  }}
                  placeholder={editingMessage ? "Edit your message..." : `Whisper a sweet message to ${partnerName}...`}
                  className="w-full bg-transparent text-xs sm:text-[13px] text-[#36271C] placeholder-[#9E8B75] focus:outline-none resize-none max-h-[120px] custom-scrollbar font-medium leading-relaxed"
                />
              </div>

              {/* Send / Save Button */}
              <button
                type="submit"
                disabled={(!inputText.trim() && !attachedImage) || isSending}
                className={`p-2.5 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 pb-2 ${
                  (inputText.trim() || attachedImage) && !isSending
                    ? 'bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] shadow-xs active:scale-95'
                    : 'bg-[#EFE9DE] text-[#9E8B75] opacity-50 cursor-not-allowed'
                }`}
                title={editingMessage ? "Save Edit" : "Send Message"}
              >
                {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>

            </form>
          )}

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          PHOTO LIGHTBOX MODAL
         ───────────────────────────────────────────────────────────── */}
      {activePhotoLightbox && (
        <div 
          onClick={() => setActivePhotoLightbox(null)}
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn"
        >
          <div className="max-w-3xl w-full flex items-center justify-between text-white pb-3">
            <span className="text-xs font-mono text-[#F8E3B6]">
              Photo Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(activePhotoLightbox, `couple_chat_photo_${Date.now()}.jpg`);
                }}
                className="flex items-center gap-1.5 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] px-3.5 py-1 rounded-full text-xs font-bold shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoLightbox(null)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl max-w-full max-h-[80vh] overflow-hidden"
          >
            <img
              src={activePhotoLightbox}
              alt="Full size preview"
              className="max-w-full max-h-[72vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREENSHOT KEEPSAKE PREVIEW MODAL (Appears after capture)
         ───────────────────────────────────────────────────────────── */}
      {capturedScreenshotUrl && (
        <div 
          onClick={() => setCapturedScreenshotUrl(null)}
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FAF5EC] border-2 border-[#D4AF37] rounded-3xl p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2D7C7]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-[#A83232] text-[#F8E3B6] shadow-xs">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif-vintage font-bold text-sm text-[#36271C]">
                    Chat Keepsake Captured!
                  </h3>
                  <p className="text-[11px] text-[#9E8B75]">
                    Saved snapshot with {partnerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCapturedScreenshotUrl(null)}
                className="w-7 h-7 rounded-full bg-[#EFE9DE] hover:bg-[#E2D7C7] text-[#4A3B2C] flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar my-3 rounded-2xl bg-[#FDFBF7] border border-[#D2C3B0] p-2 flex items-center justify-center">
              <img
                src={capturedScreenshotUrl}
                alt="Chat Keepsake"
                className="max-w-full max-h-[52vh] object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  downloadImage(capturedScreenshotUrl, `LettersForLater_Chat_${partnerName}_${Date.now()}.png`);
                  showToast('Photo saved to downloads! 📸💕');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#A83232] hover:bg-[#8B0000] text-[#F8E3B6] py-2.5 px-4 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save to Photos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSaveToVault) {
                    onSaveToVault({
                      title: `Chat Keepsake with ${partnerName}`,
                      description: 'Captured romantic moment from chat sanctuary',
                      category: 'sweet_memory',
                      completionPhoto: capturedScreenshotUrl,
                      isCompleted: true
                    });
                  }
                  showToast('Saved to your shared Vault! 🔒💕');
                }}
                className="flex items-center gap-1.5 bg-[#FAF5EC] hover:bg-[#EFE9DE] border border-[#D4AF37] text-amber-800 py-2.5 px-3.5 rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Save into your couple Vault"
              >
                <Bookmark className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">To Vault</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MESSENGER-STYLE MESSAGE ACTION SHEET (On Message Press / Tap)
         ───────────────────────────────────────────────────────────── */}
      {activeActionSheetMessage && (
        <div 
          onClick={() => setActiveActionSheetMessage(null)}
          className="fixed inset-0 z-80 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FAF5EC] border-2 border-[#D4AF37] rounded-3xl p-4 shadow-2xl space-y-3 animate-scaleUp"
          >
            {/* Top Quick Reactions Row */}
            <div className="bg-white/90 border border-[#E2D7C7] rounded-2xl p-2 flex items-center justify-between shadow-2xs">
              {MESSENGER_REACTIONS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    if (onReactToMessage) onReactToMessage(activeActionSheetMessage.id, emoji);
                    setActiveActionSheetMessage(null);
                  }}
                  className="text-2xl hover:scale-130 active:scale-95 transition-transform p-1 cursor-pointer transform origin-center"
                  title={label}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quoted Message Snippet */}
            <div className="bg-black/5 p-2.5 rounded-2xl border-l-3 border-[#A83232] text-xs">
              <span className="text-[10px] font-bold text-[#A83232] uppercase tracking-wider block">
                {activeActionSheetMessage.senderName}
              </span>
              <p className="text-[#36271C] italic truncate text-xs mt-0.5 font-medium">
                "{activeActionSheetMessage.text || (activeActionSheetMessage.mediaUrl ? '📷 Photo' : '🎤 Voice Whisper')}"
              </p>
            </div>

            {/* Action Buttons List */}
            <div className="space-y-1.5 pt-1">
              
              {/* Reply */}
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(activeActionSheetMessage);
                  setActiveActionSheetMessage(null);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#EFE9DE] text-[#36271C] text-xs font-bold border border-[#E2D7C7] shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Reply className="w-4 h-4 text-[#A83232]" />
                <span>Reply to Message</span>
              </button>

              {/* Edit Message (if mine & text) */}
              {activeActionSheetMessage.senderId === currentUserId && activeActionSheetMessage.text && onUpdateMessage && (
                <button
                  type="button"
                  onClick={() => handleStartEdit(activeActionSheetMessage)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-[#36271C] text-xs font-bold border border-[#E2D7C7] shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Edit Message</span>
                </button>
              )}

              {/* Save to Vault */}
              <button
                type="button"
                onClick={() => handleSaveMessageToVault(activeActionSheetMessage)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-[#36271C] text-xs font-bold border border-[#E2D7C7] shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-700" />
                <span>Save to Couple Vault</span>
              </button>

              {/* Copy Text (if text exists) */}
              {activeActionSheetMessage.text && (
                <button
                  type="button"
                  onClick={() => handleCopyText(activeActionSheetMessage.text)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#EFE9DE] text-[#36271C] text-xs font-bold border border-[#E2D7C7] shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#4A3B2C]" />
                  <span>Copy Text</span>
                </button>
              )}

              {/* Unsend Message (if mine) */}
              {activeActionSheetMessage.senderId === currentUserId && onDeleteMessage && (
                <button
                  type="button"
                  onClick={() => handleUnsendClick(activeActionSheetMessage)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Unsend Message</span>
                </button>
              )}

            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setActiveActionSheetMessage(null)}
              className="w-full py-2.5 rounded-2xl bg-[#EFE9DE] hover:bg-[#E2D7C7] text-xs font-bold text-[#4A3B2C] transition-colors cursor-pointer"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          UNSEND MESSAGE CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────── */}
      {messageToUnsend && (
        <div 
          onClick={() => setMessageToUnsend(null)}
          className="fixed inset-0 z-90 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FAF5EC] border-2 border-[#D4AF37] rounded-3xl p-5 shadow-2xl space-y-4 text-center animate-scaleUp"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif-vintage font-bold text-base text-[#36271C]">
                Unsend Message?
              </h3>
              <p className="text-xs text-[#7A6855] leading-relaxed">
                This message will be unsent and permanently removed for both you and <strong className="text-[#36271C]">{partnerName}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMessageToUnsend(null)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-white hover:bg-[#EFE9DE] border border-[#D2C3B0] text-xs font-bold text-[#4A3B2C] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnsendConfirm}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Unsend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-60 bg-[#36271C] text-[#F8E3B6] border border-[#D4AF37] px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
