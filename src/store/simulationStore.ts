'use client';

import { create } from 'zustand';
import type { SimulationInput } from '@/types/finance';

const STORAGE_KEY = 'moneyrun_simulation';

interface SimulationState {
  input: SimulationInput;
  hasResult: boolean;
  setInput: (input: Partial<SimulationInput>) => void;
  setHasResult: (v: boolean) => void;
  loadFromSession: () => void;
  saveToSession: () => void;
  clearSession: () => void;
}

const defaultInput: SimulationInput = {
  nickname: '',
  age: 0,
  retirementAge: 0,
  pensionStartAge: 0,
  monthlyIncome: 0,
  monthlyInvestment: 0,
  monthlyFixedCost: 0,
  monthlyVariableCost: 0,
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  input: defaultInput,
  hasResult: false,

  setInput: (partial) => {
    set((s) => ({ input: { ...s.input, ...partial } }));
    get().saveToSession();
  },

  setHasResult: (hasResult) => set({ hasResult }),

  loadFromSession: () => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SimulationInput;
        set({ input: { ...defaultInput, ...parsed }, hasResult: false });
      } catch {
        // ignore
      }
    }
  },

  saveToSession: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(get().input));
  },

  clearSession: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  },
}));
