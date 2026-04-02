'use client';

import { create } from 'zustand';
import type { Constants } from '@/types/api';

interface ConstantsState {
  constants: Constants | null;
  setConstants: (constants: Constants) => void;
}

const defaultConstants: Constants = {
  seoulAverageRent: 730000,
  categoryAverages: {
    food: 420000,
    transport: 80000,
    subscription: 50000,
    shopping: 150000,
    leisure: 220000,
    etc: 100000,
  },
  inflationRate: 0.025,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const useConstantsStore = create<ConstantsState>((set) => ({
  constants: defaultConstants,
  setConstants: (constants) => set({ constants }),
}));
