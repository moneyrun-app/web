'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-sub hover:bg-surface transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
