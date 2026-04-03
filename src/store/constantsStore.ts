'use client';

import { create } from 'zustand';
import type { Constants } from '@/types/api';

interface ConstantsState {
  constants: Constants | null;
  setConstants: (constants: Constants) => void;
}

const defaultConstants: Constants = {
  exchangeRate: 1350,
  oilPrice: 75.5,
  inflationRate: 0.025,
  minPensionGoal: 1_300_000,
  seoulAverageRent: 730_000,
  categoryAverages: {
    food: 420_000,
    transport: 80_000,
    subscription: 50_000,
    shopping: 150_000,
    leisure: 220_000,
    etc: 100_000,
  },
  updatedAt: '2026-04-01T00:00:00.000Z',
};

export const useConstantsStore = create<ConstantsState>((set) => ({
  constants: defaultConstants,
  setConstants: (constants) => set({ constants }),
}));
