import { create } from 'zustand';

export const useChatBotStore = create((set) => ({
  isOpen: false,
  openChatBot: () => set({ isOpen: true }),
  closeChatBot: () => set({ isOpen: false }),
}));
