/**
 * Utility to calculate live presence and "last seen" status for couple
 */

export function getPresenceInfo(presenceDoc) {
  if (!presenceDoc) {
    return {
      isOnline: false,
      badgeText: 'Offline',
      detailText: 'Currently offline',
      statusColor: 'bg-zinc-400'
    };
  }

  const lastSeenMs = presenceDoc.lastSeenIso ? new Date(presenceDoc.lastSeenIso).getTime() : 0;
  const diffMs = Date.now() - lastSeenMs;
  
  // Considered online if flagged online AND heartbeat was sent within last 75 seconds
  const isOnline = presenceDoc.isOnline !== false && lastSeenMs > 0 && diffMs < 75000;

  if (isOnline) {
    return {
      isOnline: true,
      badgeText: 'Online',
      detailText: 'Active on the app right now 💕',
      statusColor: 'bg-emerald-500'
    };
  }

  if (!lastSeenMs) {
    return {
      isOnline: false,
      badgeText: 'Offline',
      detailText: 'Offline',
      statusColor: 'bg-zinc-400'
    };
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    return {
      isOnline: false,
      badgeText: 'Just left',
      detailText: 'Active just now',
      statusColor: 'bg-amber-400'
    };
  }
  if (mins < 60) {
    return {
      isOnline: false,
      badgeText: `${mins}m ago`,
      detailText: `Last active ${mins}m ago`,
      statusColor: 'bg-zinc-400'
    };
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return {
      isOnline: false,
      badgeText: `${hours}h ago`,
      detailText: `Last active ${hours}h ago`,
      statusColor: 'bg-zinc-400'
    };
  }

  const days = Math.floor(hours / 24);
  return {
    isOnline: false,
    badgeText: `${days}d ago`,
    detailText: `Last active ${days}d ago`,
    statusColor: 'bg-zinc-400'
  };
}
