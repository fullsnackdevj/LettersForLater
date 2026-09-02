import { getNickname } from './nicknames';

const LAST_READ_KEY_PREFIX = 'lfl_last_read_chat_';

/**
 * Gets the stored timestamp when the user last read/viewed the chat
 */
export function getLastReadChatTimestamp(pairCode, userId) {
  try {
    const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
    const cleanUser = userId || 'demo-user-1';
    const key = `${LAST_READ_KEY_PREFIX}${cleanCode}_${cleanUser}`;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Sets the timestamp when the user read/viewed the chat
 */
export function setLastReadChatTimestamp(pairCode, userId, timestamp = Date.now()) {
  try {
    const cleanCode = (pairCode || '#JayFinallyGotAKiss').toUpperCase();
    const cleanUser = userId || 'demo-user-1';
    const key = `${LAST_READ_KEY_PREFIX}${cleanCode}_${cleanUser}`;
    localStorage.setItem(key, String(timestamp));
  } catch {}
}

/**
 * Checks if a message was authored by the current logged-in user
 */
export function isMessageFromMe(msg, user, pairInfo) {
  if (!msg) return false;
  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = getNickname(user?.displayName || 'Jay');

  // Direct ID check
  if (msg.senderId && msg.senderId === currentUserId) return true;

  // Email check
  if (user?.email && msg.senderEmail && msg.senderEmail.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }

  // Sender Name matching (e.g. "Jay" vs "Kiss")
  if (msg.senderName && currentUserName && currentUserName !== 'Partner') {
    if (getNickname(msg.senderName) === currentUserName) return true;
  }

  return false;
}

/**
 * Checks if a message has been read/seen by the current logged-in user
 */
export function isMessageReadByMe(msg, user, pairInfo, lastReadTimestamp = 0) {
  if (!msg) return true;

  // Own messages are always considered read by self
  if (isMessageFromMe(msg, user, pairInfo)) return true;

  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = getNickname(user?.displayName || 'Jay');
  const userEmail = user?.email?.toLowerCase();

  const seenList = Array.isArray(msg.seenBy) ? msg.seenBy : [];

  // Check if seenBy list contains any user identifier
  const isSeenInDoc = seenList.some(id => {
    if (!id) return false;
    if (id === currentUserId) return true;
    if (currentUserName && getNickname(id) === currentUserName) return true;
    if (userEmail && String(id).toLowerCase() === userEmail) return true;
    return false;
  });

  if (isSeenInDoc) return true;

  // Check against lastReadTimestamp
  if (lastReadTimestamp && msg.createdAtIso) {
    const msgTime = new Date(msg.createdAtIso).getTime();
    if (!isNaN(msgTime) && msgTime <= lastReadTimestamp) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a message sent by me has been seen by the partner
 */
export function isMessageSeenByPartner(msg, user, pairInfo) {
  if (!msg || !Array.isArray(msg.seenBy)) return false;

  const currentUserId = user?.uid || 'demo-user-1';
  const currentUserName = getNickname(user?.displayName || 'Jay');
  const userEmail = user?.email?.toLowerCase();

  return msg.seenBy.some(id => {
    if (!id) return false;
    if (id === currentUserId) return false;
    if (currentUserName && getNickname(id) === currentUserName) return false;
    if (userEmail && String(id).toLowerCase() === userEmail) return false;
    return true;
  });
}
