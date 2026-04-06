import { create } from 'zustand';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'moneyrun_theme';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: next });
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem(STORAGE_KEY, next);
  },

  initTheme: () => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = saved ?? 'light';
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
}));
