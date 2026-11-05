import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Offline kindness challenges
const OFFLINE_CHALLENGES = [
  { challenge_text: 'Kisi stranger ki aaj genuinely compliment karo', emoji: '😊', category: 'stranger' },
  { challenge_text: 'Ghar par kisi ki bina maange koi kaam kar do', emoji: '🏠', category: 'family' },
  { challenge_text: 'Ek purane dost ko sirf "soch raha tha tujhe" message bhejo', emoji: '💬', category: 'self' },
  { challenge_text: 'Kisi ke liye darwaza khola rakho aur smile karo', emoji: '🚪', category: 'stranger' },
  { challenge_text: 'Apne kisi close person ko ek handwritten note do', emoji: '✉️', category: 'family' },
];

export const useSocialStore = create((set, get) => ({
  // Ghost Mode
  ghostModeEnabled: false,
  partnerContact: '',
  partnerName: '',
  ghostMessage: null,
  missedHabits: [],

  // Anonymous Groups
  currentGroup: null,  // { group_id, goal_tag, members, your_rank, your_progress }
  joinedGoalTag: '',

  // Kindness
  todayChallenge: null,
  kindnessCompleted: false,
  kindnessStreak: 0,

  loading: false,

  // ── Ghost Mode ─────────────────────────────────────────────────────────
  setupGhostMode: async (contact, partnerName, enabled) => {
    set({ ghostModeEnabled: enabled, partnerContact: contact, partnerName });
    const token = useAuthStore.getState().token;
    try {
      await axios.post(
        `${API_BASE}/social/accountability`,
        { contact, partner_name: partnerName, enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {}
  },

  checkGhostNotification: async () => {
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.get(`${API_BASE}/social/ghost-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        ghostMessage: res.data.should_notify ? res.data.message : null,
        missedHabits: res.data.missed_habits || [],
      });
      return res.data;
    } catch (err) {
      return { should_notify: false, message: '', missed_habits: [] };
    }
  },

  // ── Anonymous Groups ────────────────────────────────────────────────────
  joinGroup: async (goalTag, progressPct) => {
    set({ loading: true, joinedGoalTag: goalTag });
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.post(
        `${API_BASE}/social/groups/join`,
        { goal_tag: goalTag, progress_pct: progressPct },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ currentGroup: res.data, loading: false });
    } catch (err) {
      // Local mock group
      set({
        currentGroup: {
          group_id: 'local_grp_1',
          goal_tag: goalTag,
          members: [
            { rank: 1, progress_pct: 87 },
            { rank: 2, progress_pct: 74 },
            { rank: 3, progress_pct: progressPct || 50 },
            { rank: 4, progress_pct: 43 },
            { rank: 5, progress_pct: 28 },
          ],
          your_rank: 3,
          your_progress: progressPct || 50,
          total_members: 5,
        },
        loading: false,
      });
    }
  },

  // ── Kindness ────────────────────────────────────────────────────────────
  loadKindnessChallenge: async () => {
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.get(`${API_BASE}/kindness/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ todayChallenge: res.data });
    } catch (err) {
      // Random offline challenge by today's date
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      set({ todayChallenge: OFFLINE_CHALLENGES[dayOfYear % OFFLINE_CHALLENGES.length] });
    }
  },

  completeKindness: async () => {
    const { todayChallenge } = get();
    if (!todayChallenge) return;
    set({ kindnessCompleted: true });
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.post(
        `${API_BASE}/kindness/complete`,
        { challenge_text: todayChallenge.challenge_text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ kindnessStreak: res.data.streak || 1 });
    } catch (err) {
      set(state => ({ kindnessStreak: state.kindnessStreak + 1 }));
    }
  },

  reset: () => set({
    ghostModeEnabled: false,
    partnerContact: '',
    partnerName: '',
    ghostMessage: null,
    missedHabits: [],
    currentGroup: null,
    joinedGoalTag: '',
    todayChallenge: null,
    kindnessCompleted: false,
    kindnessStreak: 0,
    loading: false,
  }),
}));
