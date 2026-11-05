import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const useAntiHabitStore = create((set, get) => ({
  antiHabits: [
    { id: 'anti_default_1', name: 'Late Night Screen Time', emoji: '📱' },
    { id: 'anti_default_2', name: 'Junk Food & Soda', emoji: '🍔' },
  ],
  urgeTimerActive: false,
  urgeTimerHabitId: null,
  timerSeconds: 60,
  breathingPhase: 'idle', // idle | inhale | hold | exhale
  loading: false,
  stats: {},             // { [habitId]: stats }

  loadAntiHabits: async () => {
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.get(`${API_BASE}/anti-habits/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.length > 0) {
        set({ antiHabits: res.data });
      }
    } catch (err) {
      // Use local state
    }
  },

  createAntiHabit: async (name, emoji) => {
    const token = useAuthStore.getState().token;
    const localHabit = {
      id: 'anti_' + Date.now(),
      name: name.trim(),
      emoji: emoji || '🚫',
    };
    set(state => ({ antiHabits: [...state.antiHabits, localHabit] }));

    try {
      const res = await axios.post(
        `${API_BASE}/anti-habits/create`,
        { name, emoji: emoji || '🚫' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update with server id
      set(state => ({
        antiHabits: state.antiHabits.map(h =>
          h.id === localHabit.id ? { ...h, id: res.data.id } : h
        ),
      }));
    } catch (err) {}
  },

  deleteAntiHabit: (habitId) => {
    set(state => ({
      antiHabits: state.antiHabits.filter(h => h.id !== habitId),
    }));
  },

  startUrgeTimer: (habitId) => {
    set({
      urgeTimerActive: true,
      urgeTimerHabitId: habitId,
      timerSeconds: 60,
      breathingPhase: 'inhale',
    });
  },

  tickTimer: () => {
    set(state => {
      if (state.timerSeconds <= 0) return { urgeTimerActive: false, breathingPhase: 'idle' };
      const secs = state.timerSeconds - 1;
      // Breathing cycle: 4s inhale, 4s hold, 4s exhale
      const cyclePos = (60 - secs) % 12;
      let phase = 'inhale';
      if (cyclePos >= 4 && cyclePos < 8) phase = 'hold';
      else if (cyclePos >= 8) phase = 'exhale';
      return { timerSeconds: secs, breathingPhase: phase };
    });
  },

  completeBreathing: async (resisted = true) => {
    const { urgeTimerHabitId } = get();
    set({ urgeTimerActive: false, breathingPhase: 'idle', timerSeconds: 60 });

    const token = useAuthStore.getState().token;
    try {
      await axios.post(
        `${API_BASE}/anti-habits/urge`,
        { habit_id: urgeTimerHabitId, resisted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {}

    // Update local stats
    set(state => ({
      stats: {
        ...state.stats,
        [urgeTimerHabitId]: {
          ...(state.stats[urgeTimerHabitId] || {}),
          today_slips: resisted
            ? (state.stats[urgeTimerHabitId]?.today_slips || 0)
            : (state.stats[urgeTimerHabitId]?.today_slips || 0) + 1,
        },
      },
    }));
  },

  logSlip: async (habitId) => {
    set({ urgeTimerActive: false });
    const token = useAuthStore.getState().token;
    try {
      await axios.post(
        `${API_BASE}/anti-habits/urge`,
        { habit_id: habitId, resisted: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {}
    set(state => ({
      stats: {
        ...state.stats,
        [habitId]: {
          ...(state.stats[habitId] || {}),
          today_slips: (state.stats[habitId]?.today_slips || 0) + 1,
        },
      },
    }));
  },

  reset: () => set({
    antiHabits: [],
    urgeTimerActive: false,
    urgeTimerHabitId: null,
    timerSeconds: 60,
    breathingPhase: 'idle',
    loading: false,
    stats: {},
  }),
}));
