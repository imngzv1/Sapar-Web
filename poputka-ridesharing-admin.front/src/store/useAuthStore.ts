import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string | number;
  login: string;
}

interface AuthState {
  admin: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  init: () => void;
}

const STORAGE_KEY = 'admin_session';

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  loading: false,
  error: null,

  init: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        set({ admin: JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  },

  login: async (login: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, login, password')
        .eq('login', login)
        .limit(1)
        .maybeSingle();

      if (error) {
        set({ loading: false, error: 'Ошибка подключения к базе' });
        return false;
      }

      if (!data || data.password !== password) {
        set({ loading: false, error: 'Неверный логин или пароль' });
        return false;
      }

      const admin: AdminUser = { id: data.id, login: data.login };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
      set({ admin, loading: false, error: null });
      return true;
    } catch (e) {
      set({ loading: false, error: 'Ошибка подключения к базе' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ admin: null, error: null });
  },
}));
