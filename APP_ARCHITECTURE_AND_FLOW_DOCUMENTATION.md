# LettersForLater - Complete System Architecture, Flow & Redesign Specification

> **Document Purpose**: This document provides an exhaustive, production-grade technical and UX specification of the **LettersForLater** couple application. It is engineered to be fed directly into an AI system or development team to understand every single data model, user journey, component hierarchy, signaling mechanism, and visual design token in order to redesign or re-architect the entire application without losing any functionality.

---

## 1. Executive Summary & Product Vision

### 1.1 What is LettersForLater?
**LettersForLater** is an intimate, private digital sanctuary and time-capsule web application designed exclusively for two people in a committed relationship (**Jay & Kiss**). 

The platform combines three key emotional pillars:
1. **Long-Term Time Capsule**: Letters written today are sealed with digital wax seals and locked until a predetermined milestone date in the future (**February 14, 2032**), creating anticipation and deep sentimental value.
2. **Real-Time Intimate Presence & Micro-Touchpoints**: Features like **Live Status Notes** (*"What We're Doing Right Now"*), **24-Hour Stories**, **P2P Audio/Video Calling**, **In-App Messenger**, **Daily Misses Counter**, and **Draggable Floating Companions**.
3. **Shared Couple Life & Growth**: **Shared Bucket List**, **Daily Prayer Requests**, and **"Our Little Book of Us"** (a deep couple quiz/prompt facility where answers unlock once both partners participate).

---

## 2. Technology Stack & Infrastructure

| Layer | Technologies Used | Description & Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** (`^19.2.8`) + **Vite 8** (`^8.2.0`) | Cutting-edge React with high-performance HMR and production bundling. |
| **Styling & Design System** | **Tailwind CSS v4** (`^4.3.3`) + PostCSS | Utility-first styling supplemented with custom vintage animations and parchment paper CSS textures. |
| **Database & Realtime Sync** | **Firebase Cloud Firestore v12** (`^12.17.1`) | Realtime document listeners (`onSnapshot`) for letters, stories, live notes, calls, bucket lists, and chats. |
| **Authentication** | **Firebase Auth** (Google Sign-In) + Custom PIN App Lock | Dual-tier access: Google OAuth for profile identity + a 4-digit PIN security lock for device privacy. |
| **Media & Audio Storage** | **Firebase Cloud Storage** + Base64/DataURL fallback | Stores letter audio notes, voice messages, bucket list photos, and story media. |
| **Audio/Video Calling Engine** | **Native WebRTC** + Google Public STUN | Zero external cost, encrypted 1-on-1 P2P video & audio calling using Firestore document signaling. |
| **Audio Synthesis** | **Web Audio API** (`AudioContext`) | Pure code synthesis of romantic chime ringtones for incoming/outgoing calls without loading external audio assets. |
| **Utilities & Assets** | **Lucide React**, **Canvas Confetti**, **HTML2Canvas**, **date-fns-tz** | Strict Philippine Time (**Asia/Manila, UTC+8 / PHT**) timezone synchronization for all countdowns and milestones. |
| **Offline Resilience** | **LocalStorage Dual-Engine Architecture** | Every service function possesses a complete localStorage fallback mirror, allowing full offline/demo capability. |

---

## 3. High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                           CLIENT BROWSER                                           |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  |                                      Top-Level Shell                                         |  |
|  |           [AppLockModal (PIN)]  --->  [AuthModal / Pairing]  --->  [Navbar & MusicPlayer]     |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                  |                                                 |
|  +-----------------------------------------------+----------------------------------------------+  |
|  |                                  Interactive Presence Layer                                  |  |
|  |     [CoupleStatusBanner]            [FloatingCompanion (Jay & Kiss)]       [MissYouWidget]   |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                  |                                                 |
|  +-----------------------------------------------+----------------------------------------------+  |
|  |                                     Main Viewport Switcher                                   |  |
|  |       [VaultView (Default 2032 Capsule)]      <-------->       [TimelineView (Unlocked)]     |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                  |                                                 |
|  +----------------------------------------------------------------------------------------------+  |
|  |                                  Feature Modals & Workspaces                                 |  |
|  |  * LetterEditorModal / LetterDetailModal (Voice Notes, Wax Seals, Paper Themes)              |  |
|  |  * StoryCreatorModal / StoryViewerModal / StoryArchiveModal (24h Disappearing Photos)       |  |
|  |  * StatusPickerModal / StatusDetailModal (32 Activity Presets, Cheers & 10x Reactions)       |  |
|  |  * CallModal / CallPromptModal (WebRTC Audio/Video Calls with synthesized chime)             |  |
|  |  * MessengerModal (Realtime couple chat, voice clips, photo sharing)                        |  |
|  |  * KnowMeFacilityModal ("Little Book of Us" mutual couple quiz)                              |  |
|  |  * BucketListModal / BucketListView (Shared dreams, completion photos & notes)              |  |
|  |  * DailyPrayerModal (Spiritual communion, "Amen" counter, answered prayers)                  |  |
|  +----------------------------------------------------------------------------------------------+  |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                      BACKEND & SIGNALING LAYER                                     |
|                                                                                                    |
|  +---------------------------+  +-------------------------------+  +----------------------------+  |
|  |     Cloud Firestore       |  |     Firebase Cloud Storage    |  |       WebRTC P2P Mesh      |  |
|  | - pairs/{code}            |  | - /audio/voice_notes/         |  | - Google STUN Servers      |  |
|  | - letters/{letterId}      |  | - /stories/photos/            |  | - Direct audio/video       |  |
|  | - statuses/{userId}       |  | - /bucket_list/photos/        |  |   streaming between        |  |
|  | - stories/{storyId}       |  |                               |  |   Jay & Kiss devices       |  |
|  | - calls/{pairCode}        |  |                               |  |                            |  |
|  +---------------------------+  +-------------------------------+  +----------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Firestore Database Schema & Data Models

All couple data is scoped under a unique pair code (default: `#JAYFINALLYGOTAKISS`).

### 4.1 Pair Record: `pairs/{pairCode}`
```json
{
  "code": "#JAYFINALLYGOTAKISS",
  "createdAt": "2026-02-14T00:00:00.000Z",
  "user1": {
    "uid": "demo-user-1",
    "name": "Jay",
    "photo": "https://...",
    "email": "jay@example.com"
  },
  "user2": {
    "uid": "demo-user-2",
    "name": "Kiss",
    "photo": "https://...",
    "email": "kiss@example.com"
  },
  "unlockDate": "2032-02-14T00:00:00+08:00",
  "pinCode": "1234"
}
```

### 4.2 Letters: `letters/{letterId}`
```json
{
  "id": "letter_1710000000000",
  "pairId": "#JAYFINALLYGOTAKISS",
  "authorId": "demo-user-1",
  "authorName": "Jay",
  "authorPhoto": "https://...",
  "recipientName": "Kiss",
  "title": "A Promise for 2032",
  "content": "My dearest Kiss, if you are reading this, our time has come...",
  "sealType": "ruby_heart",
  "paperTheme": "vintage_parchment",
  "fontFamily": "font-serif-vintage",
  "createdAt": "2026-09-08T12:00:00.000Z",
  "createdAtPHT": "Sep 8, 2026, 8:00:00 PM",
  "unlockDate": "2032-02-14T00:00:00+08:00",
  "isRead": false,
  "audioNote": {
    "storageUrl": "https://firebasestorage.googleapis.com/...",
    "durationSec": 45,
    "sizeKb": 120
  }
}
```

### 4.3 Live Status & Micro-Notes: `pairs/{pairCode}/statuses/{userId}`
```json
{
  "userId": "demo-user-1",
  "userName": "Jay",
  "userPhoto": "https://...",
  "statusId": "heading_home_work",
  "statusText": "Heading home from work",
  "emoji": "🚗",
  "category": "work_school",
  "customNote": "Traffic on EDSA, but thinking of you!",
  "updatedAtPHT": "Sep 8, 2026, 7:30:00 PM",
  "updatedAtIso": "2026-09-08T11:30:00.000Z",
  "viewedBy": ["demo-user-1", "demo-user-2"],
  "lastSeenByName": "Kiss",
  "seenAt_demo-user-2": "2026-09-08T11:35:00.000Z",
  "reactions": {
    "❤️": {
      "count": 5,
      "userCounts": { "demo-user-2": 5 },
      "users": ["demo-user-2"],
      "lastReactedBy": "Kiss",
      "lastReactedAt": "2026-09-08T11:36:00.000Z"
    }
  },
  "lastCheer": {
    "text": "Ingat sa biyahe pauwi love! 🚗💕",
    "fromName": "Kiss",
    "fromId": "demo-user-2",
    "atIso": "2026-09-08T11:36:00.000Z"
  },
  "cheers": [
    {
      "text": "Ingat sa biyahe pauwi love! 🚗💕",
      "fromName": "Kiss",
      "fromId": "demo-user-2",
      "atIso": "2026-09-08T11:36:00.000Z"
    }
  ]
}
```

### 4.4 Disappearing Stories: `pairs/{pairCode}/stories/{storyId}`
```json
{
  "id": "story_1710000000000",
  "pairId": "#JAYFINALLYGOTAKISS",
  "authorId": "demo-user-2",
  "authorName": "Kiss",
  "authorPhoto": "https://...",
  "type": "photo",
  "mediaUrl": "https://...",
  "caption": "Look at the sunset today ✨",
  "frameStyle": "polaroid",
  "aspectRatio": "3:4",
  "createdAtIso": "2026-09-08T09:00:00.000Z",
  "expiresAtIso": "2026-09-09T09:00:00.000Z",
  "viewedBy": ["demo-user-2", "demo-user-1"],
  "reactions": {
    "😍": { "count": 3, "users": ["demo-user-1"] }
  },
  "comments": [
    {
      "userId": "demo-user-1",
      "userName": "Jay",
      "text": "Ang ganda mo!",
      "timestamp": "2026-09-08T09:15:00.000Z"
    }
  ]
}
```

### 4.5 WebRTC Call Signaling: `pairs/{pairCode}/calls/{pairCode}`
```json
{
  "status": "ringing",
  "type": "video",
  "caller": { "uid": "demo-user-1", "name": "Jay", "photo": "https://..." },
  "receiver": { "uid": "demo-user-2", "name": "Kiss", "photo": "https://..." },
  "startedAt": "2026-09-08T11:40:00.000Z",
  "offer": { "type": "offer", "sdp": "v=0\r\no=..." },
  "answer": null
}
```
*Subcollections for ICE candidates*:
- `calls/{pairCode}/callerCandidates/{id}`
- `calls/{pairCode}/receiverCandidates/{id}`

### 4.6 Bucket List Items: `pairs/{pairCode}/bucketList/{itemId}`
```json
{
  "id": "bucket_1",
  "title": "Watch Northern Lights in Norway",
  "category": "travel",
  "description": "Sleep in a glass igloo and watch the aurora borealis together.",
  "targetYear": "2028",
  "isCompleted": false,
  "completedAtIso": null,
  "completionNote": null,
  "completionPhotoUrl": null
}
```

### 4.7 Know-Me ("Little Book of Us"): `pairs/{pairCode}/knowMeAnswers/{userId_questionId}`
```json
{
  "questionId": "q_favorite_memory",
  "category": "romance",
  "userId": "demo-user-1",
  "userName": "Jay",
  "answerText": "When we walked under the rain sharing one small umbrella.",
  "answeredAtIso": "2026-09-08T10:00:00.000Z"
}
```
*Mutual Disclosure Rule*: Partner answers remain masked until *both* users submit their answers for that question ID.

---

## 5. Complete User Journeys & Flow Details

### Flow 1: Initialization, App Lock & Auth
1. **PIN Code Lock Screen (`AppLockModal.jsx`)**:
   - Every session is gated by a 4-digit PIN (default `1234` or custom saved PIN).
   - Features haptic feedback on numeric keypad, shake animation on incorrect attempts, and PIN change facility.
2. **Pairing & Identity (`PairingModal.jsx` / `AuthModal.jsx`)**:
   - The app verifies Google Sign-In or loads the active user session.
   - Users are tied to their partner via the hashtag `#JAYFINALLYGOTAKISS`.
   - Nickname utilities automatically format names as "Jay" and "Kiss" across all dialogues and notification toasts.

### Flow 2: Time Capsule Vault vs. 2032 Timeline
- **Default Mode (`VaultView.jsx`)**:
  - Displays a mechanical vintage safe / vault motif.
  - Features real-time animated countdown dials ticking down years, days, hours, minutes, and seconds to **February 14, 2032**.
  - Shows sealed letter envelopes with wax seals and recipient names.
  - Letters are locked: tapping them explains they cannot be unsealed until the target milestone date.
- **Unlocked Mode (`TimelineView.jsx`)**:
  - Accessible via the Navbar tab or when the date reaches 2032.
  - Displays a chronological river of love letters, opened parchment sheets, play buttons for voice notes, and milestone photos.

### Flow 3: Letter Writing & Sealing Experience
1. **Editor Opening (`LetterEditorModal.jsx`)**:
   - Triggered by the floating "+ Write Letter" button.
2. **Stationery Customization**:
   - Users select paper textures (Vintage Parchment, Antique Rose, Midnight Blue, French Linen).
   - Users choose typography (Vintage Serif, Romantic Cursive, Typewriter Monospace).
3. **Voice Note Attachment (`AudioRecorderWidget.jsx` & `VintageAudioPlayer.jsx`)**:
   - User can record a live microphone voice note.
   - Visual waveform preview, timer, pause/play, and automatic upload to Firebase Cloud Storage.
4. **Digital Wax Sealing**:
   - User picks a seal emblem (Ruby Heart, Gold Crown, Rose Emblem, Forever Infinity).
   - Tapping "Seal Letter" triggers a melting wax sound, 3D seal stamp animation, confetti shower (`canvas-confetti`), and stores the letter into Firestore.

### Flow 4: 24-Hour Disappearing Stories
1. **Creation (`StoryCreatorModal.jsx`)**:
   - Photo upload with client-side image compression (`imageCompressor.js`).
   - Frame selectors: **Polaroid**, **Film Strip**, **Vintage Stamp**, or **Classic Grid**.
   - Custom captions with adjustable text color and background gradients.
2. **Viewing Experience (`StoryViewerModal.jsx`)**:
   - Instagram/Snapchat style fullscreen viewer.
   - Segments progress bar at the top (5 seconds per story).
   - Tap left to go back, tap right to advance, hold/press to pause.
   - Quick emoji reaction bar and direct text reply input.
3. **Archiving (`StoryArchiveModal.jsx`)**:
   - When 24 hours expire, stories transition into the permanent couple archive where they are grouped by month and year.

### Flow 5: Live Status Notes & Sweet Cheers
1. **Live Ribbon (`CoupleStatusBanner.jsx`)**:
   - Persistent banner at the top of the main screen.
   - Displays Partner's card and User's card with peek carousel.
   - Shows live presence indicator (Active Green pulse vs. "Last seen 15m ago").
   - Seen indicator (`Seen by Kiss 💕` with eye icon).
2. **Status Picker (`StatusPickerModal.jsx`)**:
   - 32 categorized activity presets (Work & School, Food & Breaks, Daily Life, Love & Faith).
   - Custom note text input (e.g. *"Craving ramen right now"*).
3. **Status Detail & Cheer Replies (`StatusDetailModal.jsx`)**:
   - Speech bubble UI showing avatar, activity emoji, and custom note.
   - **Sweet Cheers**: Quick preset pills (e.g., *"Ingat sa biyahe love!"*, *"Good luck sa meeting!"*).
   - **10x Emoji Reactions**: Tap up to 10 times with haptic feedback and upward-floating particle physics.
   - Continuous chat-like reply thread on the note.

### Flow 6: Realtime Peer-to-Peer WebRTC Audio/Video Calls
1. **Call Invitation (`CallPromptModal.jsx`)**:
   - One tap initiates either an **Audio Call** or **Video Call**.
2. **Ringtone Synthesis (`webrtc.js` -> `CallRingtonePlayer`)**:
   - Uses Web Audio API oscillator nodes to generate an in-browser musical chime (`C5 -> E5 -> G5 -> C6`) without audio file downloads.
3. **Signaling State Machine**:
   - `ringing` -> Caller creates offer SDP in `calls/{pairCode}`.
   - Receiver listens via `onSnapshot`, answers, and writes answer SDP.
   - ICE candidates exchange through subcollections.
   - State flips to `connected`.
4. **Active Call Window (`CallModal.jsx`)**:
   - Fullscreen video stream with Picture-in-Picture local camera preview.
   - Floating control dock: Mute Microphone, Flip/Toggle Camera, Switch to Audio-only, Hang Up.

### Flow 7: In-App Couple Messenger (`MessengerModal.jsx`)
- Floating chat bubble with unread badge.
- Real-time Firestore chat stream.
- Voice memo audio recorder and player directly in chat bubbles.
- Image attachments with fullscreen lightbox preview.
- "Typing..." indicators and message read receipts (`Seen at 8:42 PM`).

### Flow 8: "Our Little Book of Us" (`KnowMeFacilityModal.jsx`)
- Deep couple questionnaire facility featuring over 50 thoughtful prompts across categories: *Romance, Childhood, Deep Soul, Future Dreams, Quirks*.
- "Both must answer to reveal" lock mechanism preventing one partner from peeking before writing their own thoughts.
- Side-by-side comparison view celebrating matching and surprising answers.

### Flow 9: Draggable Floating Companions (`FloatingCompanion.jsx`)
- Two cute companion avatars floating over the interface representing Jay and Kiss.
- Draggable anywhere on the screen with touch/mouse pointer capture and viewport clamping.
- Tapping triggers a bouncing squash-and-stretch animation, particle bursts of hearts and stars, and randomized speech bubbles with sweet Tagalog/English romantic dialogues.

### Flow 10: Romantic Music Player (`MusicPlayer.jsx`)
- Vinyl record player widget floating in the bottom corner.
- Plays romantic lo-fi acoustic couple tracks (`playlist.js`).
- Spinning record animation with needle drop, track names, and mute/volume controls.

---

## 6. Directory Structure & File Map

```
LettersForLater/
├── public/                      # Static assets & icons
├── src/
│   ├── assets/                  # Images, SVGs, paper textures
│   ├── components/              # 31 React UI Components
│   │   ├── AppLockModal.jsx         # PIN code privacy lock screen
│   │   ├── AudioRecorderWidget.jsx  # Microphone voice recorder with waveform
│   │   ├── AuthModal.jsx            # Google Auth & profile modal
│   │   ├── BucketListModal.jsx      # New bucket list item creator
│   │   ├── BucketListView.jsx       # Bucket list cards & progress overview
│   │   ├── CallModal.jsx            # WebRTC video/audio call interface
│   │   ├── CallPromptModal.jsx      # Audio/Video call launcher prompt
│   │   ├── CoupleStatusBanner.jsx   # Live note ribbon on top of screen
│   │   ├── DailyPrayerModal.jsx     # Prayer requests & "Amen" facility
│   │   ├── FloatingCompanion.jsx    # Physics-based draggable companions
│   │   ├── InfoModal.jsx            # 2032 time capsule rules & guide
│   │   ├── KnowMeFacilityModal.jsx  # "Our Little Book of Us" couple quiz
│   │   ├── LetterCard.jsx           # Wax-sealed letter envelope component
│   │   ├── LetterDetailModal.jsx    # Unlocked letter reader & audio player
│   │   ├── LetterEditorModal.jsx    # Rich letter composer & wax stamp tool
│   │   ├── MessengerModal.jsx       # In-app realtime couple chat window
│   │   ├── MissYouWidget.jsx        # "I Miss You" heart tap counter
│   │   ├── MusicPlayer.jsx          # Romantic vinyl music player
│   │   ├── Navbar.jsx               # Header navigation & status indicators
│   │   ├── PairingModal.jsx         # Couple pairing code modal
│   │   ├── RandomQuestionModal.jsx  # Conversation prompt generator
│   │   ├── StatusDetailModal.jsx    # Live note detail, cheers & 10x reactions
│   │   ├── StatusPickerModal.jsx    # 32 activity presets & note input
│   │   ├── StoryArchiveModal.jsx    # Expired 24h story memory vault
│   │   ├── StoryCreatorModal.jsx    # Multi-frame story photo composer
│   │   ├── StoryIntroModal.jsx      # Story feature guide & explanation
│   │   ├── StoryViewerModal.jsx     # Fullscreen story viewer & progress bars
│   │   ├── TimelineView.jsx         # Chronological unlocked letters feed
│   │   ├── UnlockTimelineModal.jsx  # 2032 unlock celebration modal
│   │   ├── VaultView.jsx            # Mechanical time capsule vault safe
│   │   └── VintageAudioPlayer.jsx   # Retro phonograph/tape audio player
│   ├── data/
│   │   ├── knowMeQuestions.js       # 50+ deep couple questions & categories
│   │   ├── playlist.js              # Curated romantic background songs
│   │   └── statusPresets.js         # 32 activity presets & tailored cheers
│   ├── services/
│   │   ├── firebase.js              # Firestore & Storage operations (2000+ LOC)
│   │   └── webrtc.js                # WebRTC engine & audio synthesizer
│   ├── utils/
│   │   ├── chatUtils.js             # Formatting, message timestamp grouping
│   │   ├── fileDownloader.js        # Export letters/stories as images
│   │   ├── imageCompressor.js       # Canvas image resizer & compression
│   │   ├── nicknames.js             # Name normalizer ("Jay", "Kiss")
│   │   ├── pht.js                   # Philippine Time (UTC+8) conversions
│   │   ├── presence.js              # Realtime online/offline heartbeat
│   │   └── translator.js            # Romantic Tagalog-English helpers
│   ├── App.css
│   ├── App.jsx                      # Main orchestrator & state container
│   ├── index.css                    # Tailwind imports & vintage paper styles
│   └── main.jsx                     # Vite React entry point
├── firestore.rules              # Firebase security rules
└── package.json                 # Dependencies & project metadata
```

---

## 7. Design System, Aesthetics & Styling Tokens

The visual identity of LettersForLater is centered around **Timeless Vintage Romance**, avoiding cold modern minimalism in favor of warm, tactile, sentimental textures.

### 7.1 Color Palette
- **Parchment Cream (Background)**: `#FAF5EC`, `#FDFBF7`, `#F4EFE6`
- **Antique Paper Border**: `#E2D7C7`, `#D2C3B0`
- **Burgundy Wine (Primary Action)**: `#A83232`, `#8B0000`
- **Gold Leaf Accent**: `#D4AF37`, `#F8E3B6`, `#E6CA65`
- **Vintage Ink (Typography)**: `#36271C`, `#4A3B2C`, `#7A6855`
- **Emerald Forest (Seen / Online Badges)**: `#047857`, `#ECFDF5`

### 7.2 Custom CSS Texture Classes (`index.css`)
- `.wax-seal`: Deep circular 3D wax stamp styling with inner embossed ring, glossy highlight, and drop shadow.
- `.lined-notebook-sheet`: Vintage lined paper notebook texture with horizontal blue margins and pink ledger lines.
- `.vintage-parchment`: Textured mottled paper background mimicking aged cotton stationery.
- `.polaroid-frame`: Classic Polaroid photograph white border with wide bottom margin for handwritten captions.
- `.story-ring-glow`: Animated spinning gradient border (Burgundy + Gold) indicating unviewed live content.

---

## 8. State Architecture & Data Flow in `App.jsx`

`App.jsx` serves as the primary state hub and event dispatcher. It maintains the following core state hooks:

```javascript
// Auth & Locks
const [user, setUser] = useState(null);
const [isAppUnlocked, setIsAppUnlocked] = useState(false);
const [pairInfo, setPairInfo] = useState(null);

// Main Navigation
const [activeTab, setActiveTab] = useState('vault'); // 'vault' | 'timeline'

// Letters
const [letters, setLetters] = useState([]);
const [selectedLetter, setSelectedLetter] = useState(null);
const [isEditorOpen, setIsEditorOpen] = useState(false);
const [isDetailOpen, setIsDetailOpen] = useState(false);

// Live Status Notes
const [statuses, setStatuses] = useState({});
const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
const [isStatusDetailOpen, setIsStatusDetailOpen] = useState(false);
const [selectedStatusForDetail, setSelectedStatusForDetail] = useState(null);

// Stories
const [stories, setStories] = useState([]);
const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
const [viewerStories, setViewerStories] = useState([]);
const [initialStoryIndex, setInitialStoryIndex] = useState(0);

// WebRTC Calling
const [activeCall, setActiveCall] = useState(null);
const [isCallPromptOpen, setIsCallPromptOpen] = useState(false);

// Couple Features
const [bucketItems, setBucketItems] = useState([]);
const [prayers, setPrayers] = useState([]);
const [isMessengerOpen, setIsMessengerOpen] = useState(false);
const [isKnowMeFacilityOpen, setIsKnowMeFacilityOpen] = useState(false);
```

### Realtime Subscription Lifecycle:
When `pairInfo.code` is loaded:
1. `subscribeToStatuses` sets up a Firestore `onSnapshot` for `pairs/{code}/statuses`.
2. `subscribeToStories` listens for active non-expired stories in `pairs/{code}/stories`.
3. `subscribeToLetters` queries `letters` where `pairId == code`.
4. `subscribeToCalls` listens on `pairs/{code}/calls/{code}` to trigger incoming call modals immediately when partner dials.
5. Heartbeat timer updates `pairs/{code}/presence/{userId}` every 30 seconds.

---

## 9. Key Opportunities & Guidance for the Redesigning AI

When redesigning this application, prioritize the following architectural and visual upgrades:

### 1. State Management Modernization
- **Current Pattern**: `App.jsx` handles dozens of state variables and passes callbacks down 2-3 component layers.
- **Recommended Redesign**: Split state into modular React Contexts or lightweight stores (e.g. **Zustand** or **React Context**):
  - `AuthContext` (PIN lock, user identity, pairing code)
  - `LettersContext` (letters, drafts, unlocking)
  - `StoriesContext` (active stories, viewer queue)
  - `PresenceCallContext` (WebRTC signaling, live status, partner heartbeat)
  - `ChatContext` (messenger messages, typing status)

### 2. UI/UX Layout Options
- **Desktop vs. Mobile**: Currently responsive, but feels primarily mobile-first. A redesigned layout could feature a dual-pane desktop dashboard (e.g., Left: Interactive 2032 Time Capsule Vault; Right: Live Status, Chat & Companion Drawer).
- **Smooth Page Transitions**: Integrate `framer-motion` or CSS View Transitions for opening the letter envelopes, expanding story modals, and flipping through the "Little Book of Us" pages.

### 3. Aspect Ratio & Story Media Rendering
- Maintain consistent letterboxing/pillarboxing for photo stories across diverse aspect ratios (e.g. 9:16 mobile portrait vs. 1:1 square) so photos never crop partner faces.

### 4. Preservation of Core Intimacy
- Do NOT remove the whimsical, emotional touches: the **synthesized romantic chord ringtone**, the **draggable companions with Tagalog dialogues**, the **wax sealing confetti animation**, and the strict **2032 countdown lock**. These define the soul of LettersForLater.

---
*End of Architectural & Functional Flow Documentation for LettersForLater.*
