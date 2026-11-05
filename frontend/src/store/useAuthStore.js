import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false, // Default: Customer must log in first!

  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),

  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { access_token, user } = res.data;
      set({ token: access_token, user, isAuthenticated: true });
      return user;
    } catch (err) {
      if (err.response) {
        // C2: The request was made and the server responded with a status code
        // that falls out of the range of 2xx. Do NOT mock user, rethrow the error.
        console.error('API login failed with response:', err.response.data);
        throw err;
      } else {
        // Network error (no response)
        console.log('Network error, logging in locally:', err.message);
        const mockUser = {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0] || 'Customer',
          email,
          xp: 0,
          level: 1,
        };
        set({ user: mockUser, isAuthenticated: true });
        return mockUser;
      }
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      const { access_token, user } = res.data;
      set({ token: access_token, user, isAuthenticated: true });
      return user;
    } catch (err) {
      if (err.response) {
        console.error('API register failed with response:', err.response.data);
        throw err;
      } else {
        console.log('Network error, creating local user:', err.message);
        const mockUser = {
          id: 'usr_' + Date.now(),
          name,
          email,
          xp: 0,
          level: 1,
        };
        set({ user: mockUser, isAuthenticated: true });
        return mockUser;
      }
    }
  },

  addXP: (amount) =>
    set(state => {
      if (!state.user) return {};
      const newXP = Math.max(0, state.user.xp + amount);
      const newLevel = Math.floor(newXP / 500) + 1;
      return { user: { ...state.user, xp: newXP, level: newLevel } };
    }),

  logout: () => {
    // C8: Clear auth state
    set({ user: null, token: null, isAuthenticated: false });
    
    // Clear other stores (importing them dynamically to avoid circular dependencies if any)
    try {
      const { useHabitStore } = require('./useHabitStore');
      const { useMoodStore } = require('./useMoodStore');
      const { useAntiHabitStore } = require('./useAntiHabitStore');
      const { useSocialStore } = require('./useSocialStore');
      
      if (useHabitStore && typeof useHabitStore.getState().reset === 'function') useHabitStore.getState().reset();
      if (useMoodStore && typeof useMoodStore.getState().reset === 'function') useMoodStore.getState().reset();
      if (useAntiHabitStore && typeof useAntiHabitStore.getState().reset === 'function') useAntiHabitStore.getState().reset();
      if (useSocialStore && typeof useSocialStore.getState().reset === 'function') useSocialStore.getState().reset();
    } catch (e) {
      console.warn("Could not clear all stores on logout", e);
    }
  },
}));
