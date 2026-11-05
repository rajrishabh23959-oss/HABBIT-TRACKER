/**
 * Returns the number of days in a given month/year.
 * @param {number} month - 1-indexed (1=Jan, 12=Dec)
 * @param {number} year
 */
export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * Returns the day of week (0=Sun) for the 1st of a month.
 */
export function getFirstDayOfWeek(month, year) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Returns the month name from 1-indexed month number.
 */
export function getMonthName(month) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[month - 1] || '';
}

/**
 * Returns today's {day, month, year}.
 */
export function getToday() {
  const d = new Date();
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
}

/**
 * Returns an array of week labels (e.g. ["Week 1", "Week 2", ...])
 * and column spans for a given total days.
 */
export function getWeekGroups(totalDays) {
  const groups = [];
  let day = 1;
  let weekNum = 1;
  while (day <= totalDays) {
    const end = Math.min(day + 6, totalDays);
    groups.push({ label: `Week ${weekNum}`, span: end - day + 1 });
    day = end + 1;
    weekNum++;
  }
  return groups;
}

export default { getDaysInMonth, getFirstDayOfWeek, getMonthName, getToday, getWeekGroups };
