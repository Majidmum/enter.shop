import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const DEMO_USER: User = {
  id: 'u1',
  name: 'Rustam Karimov',
  email: 'demo@enter.tj',
  phone: '+992 901 234567',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 500));
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
