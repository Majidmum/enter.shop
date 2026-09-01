import { create } from 'zustand';
import type { User } from '@/types';
import { supabase } from '@/db/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

async function buildUserFromSession(
  supabaseUser: { id: string; email?: string | null }
): Promise<User> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  return {
    id: supabaseUser.id,
    name: profile?.full_name || supabaseUser.email?.split('@')[0] || '',
    email: supabaseUser.email || '',
    phone: profile?.phone,
    role: (profile?.role as 'user' | 'admin') || 'user',
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  // Восстановить сессию при перезагрузке страницы (реальный вход через Supabase,
  // не "любой пароль от 6 символов" — вход возможен только с существующим
  // в Supabase Auth аккаунтом и правильным паролем)
  restoreSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user = await buildUserFromSession(session.user);
      set({ user, isAuthenticated: true, loading: false });
    } else {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return false;
    }
    const user = await buildUserFromSession(data.user);
    set({ user, isAuthenticated: true });
    return true;
  },

  register: async (name, email, phone, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error || !data.user) {
      return false;
    }
    // Профиль в public.profiles создаётся автоматически триггером handle_new_user.
    // Дозаполняем имя и телефон.
    await supabase
      .from('profiles')
      .update({ full_name: name, phone })
      .eq('id', data.user.id);

    const user: User = { id: data.user.id, name, email, phone, role: 'user' };
    set({ user, isAuthenticated: true });
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
