/**
 * Check if a given timestamp is Monday at 00:00
 */
export const isMondayMidnight = (timestamp: number): boolean => {
  const date = new Date(timestamp * 1000);
  const day = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();

  return day === 1 && hour === 0 && minute === 0;
};

/**
 * Check if we crossed a Monday midnight boundary
 * Works with any game speed by finding the next Monday midnight after prevTime
 * and checking if it falls before currentTime
 */
export const crossedMondayMidnight = (prevTime: number, currentTime: number): boolean => {
  if (prevTime >= currentTime) return false;

  // Get the next Monday midnight after prevTime
  const prevDate = new Date(prevTime * 1000);

  // Calculate days until next Monday (0 = Sunday, 1 = Monday, etc.)
  const currentDay = prevDate.getUTCDay();
  let daysUntilMonday = (8 - currentDay) % 7; // Days until next Monday
  if (daysUntilMonday === 0) {
    // If it's already Monday, check if we're past midnight
    const isMondayPastMidnight = prevDate.getUTCHours() > 0 || prevDate.getUTCMinutes() > 0;
    if (isMondayPastMidnight) {
      daysUntilMonday = 7; // Go to next Monday
    }
  }

  // Calculate the next Monday midnight timestamp
  const nextMondayMidnight = new Date(Date.UTC(
    prevDate.getUTCFullYear(),
    prevDate.getUTCMonth(),
    prevDate.getUTCDate() + daysUntilMonday,
    0, 0, 0, 0
  ));
  const nextMondayTimestamp = nextMondayMidnight.getTime() / 1000;

  // Check if we crossed this Monday midnight
  return nextMondayTimestamp > prevTime && nextMondayTimestamp <= currentTime;
};

/**
 * Get the year from a Unix timestamp
 */
export const getYearFromTimestamp = (timestamp: number): number => {
  return new Date(timestamp * 1000).getUTCFullYear();
};

/**
 * Format Unix timestamp to readable date
 */
export const formatGameTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

/**
 * Get timestamp from 7 days ago
 */
export const getTimestampWeekAgo = (timestamp: number): number => {
  return timestamp - (7 * 24 * 3600);
};

