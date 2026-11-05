/**
 * Calculate current streak and longest streak for a habit's logs object.
 * @param {Object} logs - { "1": true, "2": false, ... }
 * @param {number} totalDays - total days in the month
 * @param {number} today - current day number
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
export function calculateStreak(logs, totalDays, today) {
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  for (let d = 1; d <= Math.min(today, totalDays); d++) {
    if (logs[String(d)]) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  // current streak = streak ending today
  let cs = 0;
  for (let d = Math.min(today, totalDays); d >= 1; d--) {
    if (logs[String(d)]) {
      cs++;
    } else {
      break;
    }
  }
  currentStreak = cs;

  return { currentStreak, longestStreak };
}

/**
 * Calculate overall streak: days where ALL habits are completed.
 * @param {Array} habits - array of habit objects with logs
 * @param {number} totalDays
 * @param {number} today
 */
export function calculateOverallStreak(habits, totalDays, today) {
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  for (let d = 1; d <= Math.min(today, totalDays); d++) {
    const allDone = habits.every(h => h.logs[String(d)] === true);
    if (allDone) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  let cs = 0;
  for (let d = Math.min(today, totalDays); d >= 1; d--) {
    const allDone = habits.every(h => h.logs[String(d)] === true);
    if (allDone) cs++;
    else break;
  }
  currentStreak = cs;

  return { currentStreak, longestStreak };
}

export default { calculateStreak, calculateOverallStreak };
