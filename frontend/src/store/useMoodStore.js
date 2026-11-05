import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Offline fallback suggestions
const OFFLINE_SUGGESTIONS = {
  tired: [
    { name: '10-min Walk', emoji: '🚶', reason: 'Light movement boosts energy without strain', adapted_from: 'Gym' },
    { name: '5-min Stretching', emoji: '🤸', reason: 'Releases tension from tiredness', adapted_from: 'Stretching' },
    { name: '3 Deep Breaths', emoji: '🧘', reason: 'Quick reset for your nervous system', adapted_from: 'Meditation' },
  ],
  stressed: [
    { name: '2-min Box Breathing', emoji: '💨', reason: 'Activates your parasympathetic nervous system', adapted_from: null },
    { name: '5-min Meditation', emoji: '🧘', reason: 'Lowers cortisol in under 5 minutes', adapted_from: 'Meditation' },
    { name: 'Write 3 Gratitudes', emoji: '📝', reason: 'Shifts focus from stress to appreciation', adapted_from: null },
  ],
  energetic: [
    { name: 'Full Gym Workout', emoji: '💪', reason: 'Channel that energy into peak performance!', adapted_from: 'Gym' },
    { name: '30-min Run', emoji: '🏃', reason: 'Perfect day to push your limits', adapted_from: null },
    { name: 'Cold Shower Challenge', emoji: '🚿', reason: 'Amplify your energy', adapted_from: 'Cold Shower' },
  ],
  happy: [
    { name: 'Call a Friend', emoji: '📞', reason: 'Spread the joy and strengthen connections', adapted_from: null },
    { name: 'Learn Something New', emoji: '📖', reason: 'Happy mind absorbs knowledge better', adapted_from: 'Reading' },
    { name: 'Help Someone Today', emoji: '🤝', reason: 'Multiplies your happiness through giving', adapted_from: null },
  ],
};

const MOOD_MESSAGES = {
  tired: 'Aap thake hue hain — aaj chhote goals se shuru karein! 💪',
  stressed: 'Stress normal hai. Pehle breathe karein, phir sochein. 🌿',
  energetic: 'Aap aaj force mein hain! Bade goals attack karein! 🔥',
  happy: 'Khushi ka mood — aaj kuch nayi aadatein banane ka perfect time! 😊',
};

export const useMoodStore = create((set, get) => ({
  currentMood: null,
  suggestions: [],
  motivationalQuote: '',
  moodMessage: '',
  showMoodModal: false,
  loading: false,
  habitStacks: [], // [{habitId, trigger, sentence}]

  setShowMoodModal: (val) => set({ showMoodModal: val }),

  checkIn: async (mood) => {
    set({ loading: true, currentMood: mood });
    const token = useAuthStore.getState().token;

    try {
      const res = await axios.post(
        `${API_BASE}/mood/checkin`,
        { mood },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      set({
        suggestions: res.data.suggestions || [],
        moodMessage: res.data.message || MOOD_MESSAGES[mood] || '',
        motivationalQuote: res.data.motivational_quote || '',
        loading: false,
      });
    } catch (err) {
      // Offline fallback
      set({
        suggestions: OFFLINE_SUGGESTIONS[mood] || [],
        moodMessage: MOOD_MESSAGES[mood] || 'Aaj bhi ek step aage badhein!',
        motivationalQuote: 'Small steps every day lead to big changes.',
        loading: false,
      });
    }
  },

  saveHabitStack: async (habitId, newHabitName, trigger) => {
    const token = useAuthStore.getState().token;
    try {
      const res = await axios.post(
        `${API_BASE}/mood/stack`,
        { habit_id: habitId, new_habit_name: newHabitName, trigger },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      const stack = {
        habitId,
        trigger: res.data.trigger,
        sentence: res.data.ai_suggestion,
        bestTriggers: res.data.best_triggers || [],
      };
      set(state => ({ habitStacks: [...state.habitStacks, stack] }));
      return stack;
    } catch (err) {
      const stack = { habitId, trigger, sentence: `${trigger} ke baad main ${newHabitName} karunga! 💪` };
      set(state => ({ habitStacks: [...state.habitStacks, stack] }));
      return stack;
    }
  },

  clearMood: () => set({ currentMood: null, suggestions: [], showMoodModal: false }),
  reset: () => set({
    currentMood: null,
    suggestions: [],
    motivationalQuote: '',
    moodMessage: '',
    showMoodModal: false,
    loading: false,
    habitStacks: [],
  }),
}));
