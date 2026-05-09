import { create } from 'zustand';
// import api from '../api/axios';  // закомментируй

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (email, password) => {
    console.log('Заглушка логина:', { email, password });
    const fakeToken = 'fake-jwt-token';
    const fakeUser = { id: 1, name: 'Анна', email };
    localStorage.setItem('token', fakeToken);
    set({ user: fakeUser, token: fakeToken });
  },

  register: async (email, name, password) => {
    console.log('Заглушка регистрации:', { email, name, password });
    const fakeToken = 'fake-jwt-token';
    const fakeUser = { id: 1, name, email };
    localStorage.setItem('token', fakeToken);
    set({ user: fakeUser, token: fakeToken });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;