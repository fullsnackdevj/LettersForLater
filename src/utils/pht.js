// Philippine Standard Time (PHT - GMT+8 / Asia/Manila) utilities

export const DEFAULT_TARGET_UNLOCK_DATE = '2032-08-06T00:00:00+08:00';

/**
 * Format current date & time in Philippine Standard Time (PHT)
 */
export function getCurrentPHT() {
  const now = new Date();
  
  // Format options for Manila timezone
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = dateFormatter.format(now);
  const formattedTime = timeFormatter.format(now);
  
  return {
    dateString: formattedDate,
    timeString: formattedTime,
    fullString: `${formattedDate} • ${formattedTime} PHT`,
    isoString: now.toISOString(),
    timestamp: now.getTime()
  };
}

/**
 * Format a given timestamp/ISO string into PHT date & time
 */
export function formatToPHT(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${formattedDate} • ${formattedTime} PHT`;
}

/**
 * Calculate countdown remaining until target unlock date (e.g., August 6, 2032)
 */
export function getCountdownToTarget(targetDateIso = DEFAULT_TARGET_UNLOCK_DATE) {
  const targetTime = new Date(targetDateIso).getTime();
  const currentTime = new Date().getTime();
  const diff = targetTime - currentTime;

  if (diff <= 0) {
    return {
      years: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUnlocked: true,
      totalDiffMs: 0
    };
  }

  const secondsTotal = Math.floor(diff / 1000);
  const minutesTotal = Math.floor(secondsTotal / 60);
  const hoursTotal = Math.floor(minutesTotal / 60);
  const daysTotal = Math.floor(hoursTotal / 24);

  // Approximate 365.25 days per year
  const years = Math.floor(daysTotal / 365);
  const remainingDays = daysTotal % 365;
  const hours = hoursTotal % 24;
  const minutes = minutesTotal % 60;
  const seconds = secondsTotal % 60;

  return {
    years,
    days: remainingDays,
    totalDays: daysTotal,
    hours,
    minutes,
    seconds,
    isUnlocked: false,
    totalDiffMs: diff
  };
}
