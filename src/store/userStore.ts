'use client';

import { create } from 'zustand';

interface UserState {
  id: string;
  nickname: string;
  email: string;
  hasCompletedOnboarding: boolean;
  isLoggedIn: boolean;
  setUser: (user: Partial<UserState>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  nickname: '',
  email: '',
  hasCompletedOnboarding: false,
  isLoggedIn: false,
  setUser: (user) => set((state) => ({ ...state, ...user })),
  logout: () =>
    set({
      id: '',
      nickname: '',
      email: '',
      hasCompletedOnboarding: false,
      isLoggedIn: false,
    }),
}));
