import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token });
      return { success: true, user: res.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ошибка входа' };
    }
  },
  
  register: async (email, username, password, role = 'student') => {
    try {
      const res = await api.post('/auth/register', { email, username, password, role });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token });
      return { success: true, user: res.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ошибка регистрации' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  // Добавляем метод для проверки роли
  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'admin';
  },
  
  isStudent: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'student';
  },
  
  // Обновление пользователя (например, после смены пароля)
  updateUser: (userData) => {
    set({ user: { ...useAuthStore.getState().user, ...userData } });
  }
}));

export default useAuthStore;