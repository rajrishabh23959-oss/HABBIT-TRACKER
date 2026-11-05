import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isChatVisible: false,
  isAddHabitModalVisible: false,
  activeTab: 'Dashboard',

  showChat: () => set({ isChatVisible: true }),
  hideChat: () => set({ isChatVisible: false }),
  toggleChat: () => set(state => ({ isChatVisible: !state.isChatVisible })),

  showAddHabit: () => set({ isAddHabitModalVisible: true }),
  hideAddHabit: () => set({ isAddHabitModalVisible: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
