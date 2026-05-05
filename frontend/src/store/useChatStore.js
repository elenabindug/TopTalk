import { create } from 'zustand';

const useChatStore = create((set) => ({
  user: null,
  messages: [],
  setUser: (userData) => set({ user: userData }),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
}));

export default useChatStore;