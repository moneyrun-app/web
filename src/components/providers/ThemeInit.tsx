'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeInit() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => { initTheme(); }, [initTheme]);
  return null;
}
