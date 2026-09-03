/**
 * LettersForLater - WebRTC & Firestore Realtime Signaling Service
 * Enables peer-to-peer, encrypted 1-on-1 Audio and Video calling
 * with zero external paid APIs (using native WebRTC + free Google STUN).
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Audio Ringtone Synthesizer using Web Audio API (No external mp3 assets required)
class CallRingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playIncomingChime() {
    this.stop();
    const playNote = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Sweet romantic chord)

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.5);
        });

        // Haptic feedback
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
          try { window.navigator.vibrate([200, 100, 200]); } catch {}
        }
      } catch (e) {
        console.warn('Ringtone error:', e);
      }
    };

    playNote();
    this.intervalId = setInterval(playNote, 2200);
  }

  playOutgoingRingback() {
    this.stop();
    const playPulse = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // Standard gentle ring tone

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.35);
      } catch (e) {}
    };

    playPulse();
    this.intervalId = setInterval(playPulse, 3500);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const ringtonePlayer = new CallRingtonePlayer();

/**
 * Get user media stream (camera + microphone)
 */
export async function getLocalUserMedia(callType = 'video', facingMode = 'user') {
  const isVideo = callType === 'video';
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: isVideo ? {
      facingMode: facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    } : false
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.warn(`getUserMedia (${callType}) failed with full constraints, trying fallback:`, err);
    // Fallback to basic audio/video if specific constraints failed
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo ? true : false
    });
  }
}

/**
 * Switch camera between Front / Back
 * @param {MediaStream} localStream - The active local media stream
 * @param {string} currentFacingMode - 'user' or 'environment'
 * @param {RTCPeerConnection} [peerConnection] - The active WebRTC peer connection (required to push new track to remote peer)
 */
export async function switchCameraTrack(localStream, currentFacingMode, peerConnection) {
  if (!localStream) return currentFacingMode;
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    const newVideoTrack = newStream.getVideoTracks()[0];
    const oldVideoTrack = localStream.getVideoTracks()[0];

    // Replace the track on the PeerConnection's video sender so the remote
    // peer receives the new camera feed instead of a frozen frame.
    if (peerConnection) {
      const videoSender = peerConnection.getSenders().find(
        sender => sender.track && sender.track.kind === 'video'
      );
      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      }
    }

    // Swap the track on the local MediaStream (updates local preview)
    if (oldVideoTrack) {
      localStream.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }
    localStream.addTrack(newVideoTrack);
    return newFacingMode;
  } catch (e) {
    console.warn('Could not switch camera:', e);
    return currentFacingMode;
  }
}

/**
 * Clean up active media streams
 */
export function stopMediaStream(stream) {
  if (!stream) return;
  try {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  } catch (e) {
    console.warn('Error stopping stream tracks:', e);
  }
}

/**
 * Listen for Incoming Calls on the active pair channel
 */
export function listenForIncomingCalls(pairCode, currentUserId, onCallUpdate) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();

  if (isFirebaseConfigured && db) {
    const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
    return onSnapshot(callDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const callData = { id: snapshot.id, ...snapshot.data() };
        onCallUpdate(callData);
      } else {
        onCallUpdate(null);
      }
    }, (err) => {
      console.warn('Call listener snapshot error:', err);
    });
  }

  // Fallback for demo / offline environment via localStorage event
  const checkLocalCall = () => {
    try {
      const raw = localStorage.getItem(`lfl_active_call_${cleanCode}`);
      if (raw) {
        onCallUpdate(JSON.parse(raw));
      } else {
        onCallUpdate(null);
      }
    } catch (e) {}
  };

  window.addEventListener('storage', checkLocalCall);
  checkLocalCall();
  return () => window.removeEventListener('storage', checkLocalCall);
}

/**
 * Initiate an Outgoing Call
 */
export async function startOutgoingCall({
  pairCode,
  callerUser,
  receiverUser,
  callType = 'video',
  localStream,
  onRemoteStream,
  onCallStateChange
}) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const callerId = callerUser?.uid || 'demo-user-1';
  const receiverId = receiverUser?.uid || 'demo-partner-2';

  const pc = new RTCPeerConnection(ICE_SERVERS);
  const activeUnsubscribes = [];

  // Add local stream tracks to PeerConnection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming remote media tracks
  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      onRemoteStream(event.streams[0]);
    }
  };

  // Connection state changes
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  if (isFirebaseConfigured && db) {
    const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
    const callerCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'callerCandidates');
    const receiverCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'receiverCandidates');

    // Collect ICE candidates and push to Firestore
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(callerCandidatesCol, event.candidate.toJSON()).catch(() => {});
      }
    };

    // Create SDP Offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const callPayload = {
      pairCode: cleanCode,
      status: 'ringing',
      callType,
      createdAtIso: new Date().toISOString(),
      caller: {
        uid: callerId,
        name: callerUser?.displayName || 'Jay',
        photo: callerUser?.photoURL || ''
      },
      receiver: {
        uid: receiverId,
        name: receiverUser?.displayName || receiverUser?.name || 'Partner',
        photo: receiverUser?.photoURL || receiverUser?.photo || ''
      },
      offer: {
        type: offerDescription.type,
        sdp: offerDescription.sdp
      },
      reaction: null
    };

    await setDoc(callDocRef, callPayload);

    // Listen for SDP Answer from Receiver
    const unsubDoc = onSnapshot(callDocRef, async (snapshot) => {
      if (!snapshot.exists()) {
        onCallStateChange({ status: 'ended' });
        return;
      }
      const data = snapshot.data();
      onCallStateChange(data);

      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(answerDescription);
      }
    });
    activeUnsubscribes.push(unsubDoc);

    // Listen for Receiver ICE Candidates
    const unsubIce = onSnapshot(receiverCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidateData = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {});
        }
      });
    });
    activeUnsubscribes.push(unsubIce);

    return {
      peerConnection: pc,
      cleanup: async () => {
        activeUnsubscribes.forEach(unsub => unsub());
        pc.close();
      }
    };
  }

  // Local storage fallback for offline demo testing
  return {
    peerConnection: pc,
    cleanup: () => pc.close()
  };
}

/**
 * Accept an Incoming Call
 */
export async function acceptIncomingCall({
  pairCode,
  callData,
  localStream,
  onRemoteStream,
  onCallStateChange
}) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  const pc = new RTCPeerConnection(ICE_SERVERS);
  const activeUnsubscribes = [];

  // Add local stream tracks to PeerConnection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming remote media tracks
  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      onRemoteStream(event.streams[0]);
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  if (isFirebaseConfigured && db && callData) {
    const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
    const callerCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'callerCandidates');
    const receiverCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'receiverCandidates');

    // Collect ICE candidates and push to Firestore
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(receiverCandidatesCol, event.candidate.toJSON()).catch(() => {});
      }
    };

    // Set Remote Description from Caller's Offer
    if (callData.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    }

    // Create SDP Answer
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    await updateDoc(callDocRef, {
      status: 'connected',
      connectedAtIso: new Date().toISOString(),
      answer: {
        type: answerDescription.type,
        sdp: answerDescription.sdp
      }
    });

    // Listen for call state updates (e.g. ended, reactions)
    const unsubDoc = onSnapshot(callDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        onCallStateChange({ status: 'ended' });
        return;
      }
      onCallStateChange(snapshot.data());
    });
    activeUnsubscribes.push(unsubDoc);

    // Listen for Caller ICE Candidates
    const unsubIce = onSnapshot(callerCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidateData = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {});
        }
      });
    });
    activeUnsubscribes.push(unsubIce);

    return {
      peerConnection: pc,
      cleanup: async () => {
        activeUnsubscribes.forEach(unsub => unsub());
        pc.close();
      }
    };
  }

  return {
    peerConnection: pc,
    cleanup: () => pc.close()
  };
}

/**
 * End or Decline an Active/Incoming Call
 */
export async function terminateCall(pairCode, status = 'ended') {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  ringtonePlayer.stop();

  if (isFirebaseConfigured && db) {
    try {
      const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
      const snap = await getDoc(callDocRef);
      if (snap.exists()) {
        await updateDoc(callDocRef, {
          status,
          endedAtIso: new Date().toISOString()
        });
        // Remove document after 2.5 seconds to allow remote party to receive 'ended' status
        setTimeout(async () => {
          try {
            await deleteDoc(callDocRef);
          } catch (e) {}
        }, 2500);
      }
    } catch (e) {
      console.warn('Error terminating call:', e);
    }
  }

  try {
    localStorage.removeItem(`lfl_active_call_${cleanCode}`);
  } catch (e) {}
}

/**
 * Send real-time romantic reaction during active call
 */
export async function sendCallReaction(pairCode, emoji, senderId) {
  const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
  if (isFirebaseConfigured && db) {
    try {
      const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
      await updateDoc(callDocRef, {
        reaction: {
          id: Date.now(),
          emoji,
          senderId,
          atIso: new Date().toISOString()
        }
      });
    } catch (e) {}
  }
}
