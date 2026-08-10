import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ADMIN_USER: User = {
  id: 'admin1',
  name: 'Администратор',
  email: 'admin@enter.tj',
  phone: '+992 000 000000',
  role: 'admin',
};

const DEMO_USER: User = {
  id: 'u1',
  name: 'Rustam Karimov',
  email: 'demo@enter.tj',
  phone: '+992 901 234567',
  role: 'user',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 500));
    // Вход администратора
    if (email === 'admin@enter.tj' && password === 'admin123') {
      set({ user: ADMIN_USER, isAuthenticated: true });
      return true;
    }
    // Демо-вход любого пользователя
    if (email && password.length >= 6) {
      const user: User = { ...DEMO_USER, email };
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  register: async (name, email, phone, _password) => {
    await new Promise((r) => setTimeout(r, 500));
    const user: User = { id: `u_${Date.now()}`, name, email, phone };
    set({ user, isAuthenticated: true });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));
