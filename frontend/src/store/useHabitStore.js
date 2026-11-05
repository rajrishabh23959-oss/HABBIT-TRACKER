import { create } from 'zustand';
import { DEFAULT_HABITS } from '../constants';
import { getDaysInMonth, getToday } from '../utils/dateHelper';

// ─── Helpers ───────────────────────────────────────────────────────────────

function emptyLogs(totalDays) {
  const logs = {};
  for (let d = 1; d <= totalDays; d++) logs[String(d)] = false;
  return logs;
}

function sampleLogs(totalDays) {
  const logs = {};
  for (let d = 1; d <= totalDays; d++) logs[String(d)] = Math.random() < 0.35;
  return logs;
}

function recalcStats(habits, totalDays) {
  const dailyProgress = Array.from({ length: totalDays }, (_, i) => {
    const d = i + 1;
    if (!habits.length) return 0;
    const completed = habits.filter(h => h.logs[String(d)]).length;
    return parseFloat((completed / habits.length).toFixed(2));
  });

  const totalGoal = habits.length * totalDays;
  const totalCompleted = habits.reduce(
    (acc, h) => acc + Object.values(h.logs).filter(Boolean).length, 0
  );

  return {
    dailyProgress,
    overallStats: {
      goal: totalGoal,
      completed: totalCompleted,
      left: totalGoal - totalCompleted,
      completionPercentage: totalGoal === 0 ? 0 : Math.round((totalCompleted / totalGoal) * 100),
    },
  };
}

function buildCleanDashboard(month, year, habitList = null) {
  const totalDays = getDaysInMonth(month, year);
  const baseHabits = habitList || DEFAULT_HABITS;
  const habits = baseHabits.map(h => ({
    ...h,
    logs: emptyLogs(totalDays),
  }));
  const { dailyProgress, overallStats } = recalcStats(habits, totalDays);
  return { month, year, totalDays, habits, wellness: { mood: {}, sleep: {} }, dailyProgress, overallStats };
}

function buildSampleDashboard(month, year, habitList = null) {
  const totalDays = getDaysInMonth(month, year);
  const baseHabits = habitList || DEFAULT_HABITS;
  const habits = baseHabits.map(h => ({ ...h, logs: sampleLogs(totalDays) }));
  const mood = {}, sleep = {};
  for (let d = 1; d <= totalDays; d++) {
    mood[String(d)] = parseFloat((5 + Math.random() * 5).toFixed(1));
    sleep[String(d)] = parseFloat((5 + Math.random() * 4).toFixed(1));
  }
  const { dailyProgress, overallStats } = recalcStats(habits, totalDays);
  return { month, year, totalDays, habits, wellness: { mood, sleep }, dailyProgress, overallStats };
}

// ─── Store ─────────────────────────────────────────────────────────────────
const today = getToday();

export const useHabitStore = create((set, get) => ({
  month: today.month,
  year: today.year,
  data: buildCleanDashboard(today.month, today.year),
  loading: false,
  error: null,

  // ── Init ──────────────────────────────────────────────────────────────
  initUserDashboard: ({ isFresh = true } = {}) => {
    const { month, year } = get();
    const data = isFresh
      ? buildCleanDashboard(month, year)
      : buildSampleDashboard(month, year);
    set({ data });
  },

  // ── Month change ──────────────────────────────────────────────────────
  setMonth: (month, year) => {
    set({ loading: true });
    const { data } = get();
    // preserve current habit list when changing month
    const habitList = data?.habits?.map(h => ({ id: h.id, name: h.name, emoji: h.emoji }));
    const newData = buildCleanDashboard(month, year, habitList);
    set({ month, year, data: newData, loading: false });
  },

  // ── Toggle checkbox ───────────────────────────────────────────────────
  toggleLog: (habitId, day) => {
    set(state => {
      const habits = state.data.habits.map(h => {
        if (h.id !== habitId) return h;
        return { ...h, logs: { ...h.logs, [String(day)]: !h.logs[String(day)] } };
      });
      const { dailyProgress, overallStats } = recalcStats(habits, state.data.totalDays);
      return { data: { ...state.data, habits, dailyProgress, overallStats } };
    });
  },

  // ── Wellness ──────────────────────────────────────────────────────────
  setWellness: (type, day, value) => {
    set(state => ({
      data: {
        ...state.data,
        wellness: {
          ...state.data.wellness,
          [type]: { ...state.data.wellness[type], [String(day)]: value },
        },
      },
    }));
  },

  // ── Add a new habit ───────────────────────────────────────────────────
  addHabit: (name, emoji) => {
    set(state => {
      const newHabit = {
        id: 'h_custom_' + Date.now(),
        name: name.trim(),
        emoji: emoji.trim() || '⭐',
        logs: emptyLogs(state.data.totalDays),
      };
      const habits = [...state.data.habits, newHabit];
      const { dailyProgress, overallStats } = recalcStats(habits, state.data.totalDays);
      return { data: { ...state.data, habits, dailyProgress, overallStats } };
    });
  },

  // ── Delete a habit by id ──────────────────────────────────────────────
  deleteHabit: (habitId) => {
    set(state => {
      const habits = state.data.habits.filter(h => h.id !== habitId);
      const { dailyProgress, overallStats } = recalcStats(habits, state.data.totalDays);
      return { data: { ...state.data, habits, dailyProgress, overallStats } };
    });
  },

  // ── Reorder habits (drag-to-sort) ─────────────────────────────────────
  reorderHabits: (fromIndex, toIndex) => {
    set(state => {
      const habits = [...state.data.habits];
      const [moved] = habits.splice(fromIndex, 1);
      habits.splice(toIndex, 0, moved);
      const { dailyProgress, overallStats } = recalcStats(habits, state.data.totalDays);
      return { data: { ...state.data, habits, dailyProgress, overallStats } };
    });
  },

  // ── Clear / reset ─────────────────────────────────────────────────────
  clearAllCheckboxes: () => {
    const { month, year, data } = get();
    const habitList = data?.habits?.map(h => ({ id: h.id, name: h.name, emoji: h.emoji }));
    set({ data: buildCleanDashboard(month, year, habitList) });
  },

  loadSampleData: () => {
    const { month, year, data } = get();
    const habitList = data?.habits?.map(h => ({ id: h.id, name: h.name, emoji: h.emoji }));
    set({ data: buildSampleDashboard(month, year, habitList) });
  },

  reset: () => {
    const today = getToday();
    set({
      month: today.month,
      year: today.year,
      data: buildCleanDashboard(today.month, today.year),
      loading: false,
      error: null,
    });
  },
}));
