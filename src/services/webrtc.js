/**
 * LettersForLater - WebRTC & Firestore Realtime Signaling Service
 * Enables peer-to-peer, encrypted 1-on-1 Audio and Video calling
 * with zero external paid APIs (using native WebRTC + free Google STUN).
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured, sendChatMessage } from './firebase';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

// Helper to remove obsolete ICE candidates from subcollections
async function purgeOldCandidates(colRef) {
  try {
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref).catch(() => {}));
      await Promise.all(deletePromises);
    }
  } catch (e) {
    console.warn('[WebRTC] Error purging old candidates:', e);
  }
}

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
  const callSessionId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const pc = new RTCPeerConnection(ICE_SERVERS);
  const activeUnsubscribes = [];
  const candidateQueue = [];
  let isRemoteDescriptionSet = false;

  // Add local stream tracks to PeerConnection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming remote media tracks reliably across browsers
  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    console.log('[WebRTC] Caller ontrack received:', event.track.kind, event.track.id);
    if (event.streams && event.streams[0]) {
      event.streams[0].getTracks().forEach(track => {
        if (!remoteStream.getTracks().some(t => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    } else if (event.track) {
      if (!remoteStream.getTracks().some(t => t.id === event.track.id)) {
        remoteStream.addTrack(event.track);
      }
    }

    event.track.onunmute = () => {
      onRemoteStream(new MediaStream(remoteStream.getTracks()));
    };

    onRemoteStream(new MediaStream(remoteStream.getTracks()));
  };

  // Connection state changes
  pc.onconnectionstatechange = () => {
    console.log('[WebRTC] Caller connectionState:', pc.connectionState);
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log('[WebRTC] Caller iceConnectionState:', pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  const addCandidate = async (candidateData) => {
    if (!candidateData || !candidateData.candidate) return;
    // Discard candidates from prior calls
    if (candidateData.callSessionId && candidateData.callSessionId !== callSessionId) {
      return;
    }

    const rtcCandidate = new RTCIceCandidate({
      candidate: candidateData.candidate,
      sdpMid: candidateData.sdpMid,
      sdpMLineIndex: candidateData.sdpMLineIndex,
      usernameFragment: candidateData.usernameFragment
    });

    if (!isRemoteDescriptionSet || !pc.remoteDescription) {
      candidateQueue.push(rtcCandidate);
    } else {
      try {
        await pc.addIceCandidate(rtcCandidate);
      } catch (err) {
        console.warn('[WebRTC] Caller addIceCandidate error:', err);
      }
    }
  };

  const flushCandidateQueue = async () => {
    isRemoteDescriptionSet = true;
    while (candidateQueue.length > 0) {
      const cand = candidateQueue.shift();
      try {
        await pc.addIceCandidate(cand);
      } catch (err) {
        console.warn('[WebRTC] Caller flush candidate error:', err);
      }
    }
  };

  if (isFirebaseConfigured && db) {
    const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
    const callerCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'callerCandidates');
    const receiverCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'receiverCandidates');

    // Purge any stale candidates from past sessions to ensure a clean start
    purgeOldCandidates(callerCandidatesCol);
    purgeOldCandidates(receiverCandidatesCol);

    // Collect ICE candidates and push to Firestore with callSessionId
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        addDoc(callerCandidatesCol, {
          ...event.candidate.toJSON(),
          callSessionId,
          createdAt: Date.now()
        }).catch((e) => console.warn('[WebRTC] Error saving caller candidate:', e));
      }
    };

    // Create SDP Offer
    const offerDescription = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === 'video'
    });
    await pc.setLocalDescription(offerDescription);

    const callPayload = {
      pairCode: cleanCode,
      callSessionId,
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
        await flushCandidateQueue();
      }
    });
    activeUnsubscribes.push(unsubDoc);

    // Listen for Receiver ICE Candidates
    const unsubIce = onSnapshot(receiverCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          addCandidate(change.doc.data());
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
  const callSessionId = callData?.callSessionId || `call_${Date.now()}`;
  const pc = new RTCPeerConnection(ICE_SERVERS);
  const activeUnsubscribes = [];
  const candidateQueue = [];
  let isRemoteDescriptionSet = false;

  // Add local stream tracks to PeerConnection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming remote media tracks reliably across browsers
  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    console.log('[WebRTC] Receiver ontrack received:', event.track.kind, event.track.id);
    if (event.streams && event.streams[0]) {
      event.streams[0].getTracks().forEach(track => {
        if (!remoteStream.getTracks().some(t => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    } else if (event.track) {
      if (!remoteStream.getTracks().some(t => t.id === event.track.id)) {
        remoteStream.addTrack(event.track);
      }
    }

    event.track.onunmute = () => {
      onRemoteStream(new MediaStream(remoteStream.getTracks()));
    };

    onRemoteStream(new MediaStream(remoteStream.getTracks()));
  };

  pc.onconnectionstatechange = () => {
    console.log('[WebRTC] Receiver connectionState:', pc.connectionState);
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log('[WebRTC] Receiver iceConnectionState:', pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed') {
      onCallStateChange({ status: 'ended' });
    }
  };

  const addCandidate = async (candidateData) => {
    if (!candidateData || !candidateData.candidate) return;
    // Discard candidates from prior calls
    if (candidateData.callSessionId && candidateData.callSessionId !== callSessionId) {
      return;
    }

    const rtcCandidate = new RTCIceCandidate({
      candidate: candidateData.candidate,
      sdpMid: candidateData.sdpMid,
      sdpMLineIndex: candidateData.sdpMLineIndex,
      usernameFragment: candidateData.usernameFragment
    });

    if (!isRemoteDescriptionSet || !pc.remoteDescription) {
      candidateQueue.push(rtcCandidate);
    } else {
      try {
        await pc.addIceCandidate(rtcCandidate);
      } catch (err) {
        console.warn('[WebRTC] Receiver addIceCandidate error:', err);
      }
    }
  };

  const flushCandidateQueue = async () => {
    isRemoteDescriptionSet = true;
    while (candidateQueue.length > 0) {
      const cand = candidateQueue.shift();
      try {
        await pc.addIceCandidate(cand);
      } catch (err) {
        console.warn('[WebRTC] Receiver flush candidate error:', err);
      }
    }
  };

  if (isFirebaseConfigured && db && callData) {
    const callDocRef = doc(db, 'pairs', cleanCode, 'calls', 'active');
    const callerCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'callerCandidates');
    const receiverCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'receiverCandidates');

    // Collect ICE candidates and push to Firestore with callSessionId
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        addDoc(receiverCandidatesCol, {
          ...event.candidate.toJSON(),
          callSessionId,
          createdAt: Date.now()
        }).catch((e) => console.warn('[WebRTC] Error saving receiver candidate:', e));
      }
    };

    // Set Remote Description from Caller's Offer and drain any early candidates
    if (callData.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
      await flushCandidateQueue();
    }

    // Create SDP Answer
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    await updateDoc(callDocRef, {
      status: 'connected',
      connectedAtIso: new Date().toISOString(),
      callSessionId,
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
          addCandidate(change.doc.data());
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
        const data = snap.data();
        const wasConnected = Boolean(data.connectedAtIso || data.status === 'connected');

        // Post missed call notification to chat if the call was never answered
        if (!wasConnected && !data.missedLogged && (status === 'ended' || status === 'rejected' || status === 'unanswered')) {
          try {
            const caller = data.caller || {};
            const callType = data.callType || 'video';
            const text = callType === 'audio' ? '📞 Missed audio call' : '📹 Missed video call';

            await sendChatMessage(cleanCode, {
              uid: caller.uid || 'demo-user-1',
              displayName: caller.name || 'Partner',
              photoURL: caller.photo || ''
            }, {
              text,
              callInfo: {
                status: 'missed',
                callType,
                callerId: caller.uid,
                callerName: caller.name,
                receiverId: data.receiver?.uid,
                receiverName: data.receiver?.name,
                atIso: new Date().toISOString()
              }
            });
          } catch (chatErr) {
            console.warn('Failed to log missed call to chat widget:', chatErr);
          }
        }

        await updateDoc(callDocRef, {
          status,
          endedAtIso: new Date().toISOString(),
          missedLogged: true
        });

        // Remove document and purge candidate subcollections after 2.5 seconds
        setTimeout(async () => {
          try {
            await deleteDoc(callDocRef);
            const callerCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'callerCandidates');
            const receiverCandidatesCol = collection(db, 'pairs', cleanCode, 'calls', 'active', 'receiverCandidates');
            purgeOldCandidates(callerCandidatesCol);
            purgeOldCandidates(receiverCandidatesCol);
          } catch (e) {}
        }, 2500);
      }
    } catch (e) {
      console.warn('Error terminating call:', e);
    }
  }

  try {
    const localKey = `lfl_active_call_${cleanCode}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.connectedAtIso && !data.missedLogged) {
        const caller = data.caller || {};
        const callType = data.callType || 'video';
        const text = callType === 'audio' ? '📞 Missed audio call' : '📹 Missed video call';
        sendChatMessage(cleanCode, caller, {
          text,
          callInfo: {
            status: 'missed',
            callType,
            callerId: caller.uid,
            callerName: caller.name
          }
        }).catch(() => {});
      }
    }
    localStorage.removeItem(localKey);
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
