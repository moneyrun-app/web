'use client';

import { create } from 'zustand';
import type { UserRole } from '@/types/api';

interface UserState {
  id: string;
  nickname: string;
  email: string;
  hasCompletedOnboarding: boolean;
  role: UserRole;
  isLoggedIn: boolean;
  setUser: (user: Partial<UserState>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  nickname: '',
  email: '',
  hasCompletedOnboarding: false,
  role: 'user',
  isLoggedIn: false,
  setUser: (user) => set((state) => ({ ...state, ...user })),
  logout: () =>
    set({
      id: '',
      nickname: '',
      email: '',
      hasCompletedOnboarding: false,
      role: 'user',
      isLoggedIn: false,
    }),
}));
