'use client';

import { create } from 'zustand';
import type { Grade, GoodSpending, FixedExpenses, Surplus } from '@/types/finance';
import { calculateSurplus, getGoodSpendingTotal } from '@/lib/surplus';
import { calculateGrade } from '@/lib/grade';

interface FinanceState {
  age: number;
  monthlyIncome: number;
  goodSpendings: GoodSpending[];
  fixedExpenses: FixedExpenses;
  grade: Grade;
  surplus: Surplus;
  setProfile: (profile: {
    age: number;
    monthlyIncome: number;
    goodSpendings: GoodSpending[];
    fixedExpenses: FixedExpenses;
    grade: Grade;
    surplus: Surplus;
  }) => void;
  updateAge: (age: number) => void;
  updateIncome: (income: number) => void;
  setGoodSpendings: (spendings: GoodSpending[]) => void;
  setFixedExpenses: (expenses: FixedExpenses) => void;
  recalculate: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  age: 0,
  monthlyIncome: 0,
  goodSpendings: [],
  fixedExpenses: { rent: 0, utilities: 0, phone: 0 },
  grade: 'RED' as Grade,
  surplus: { monthly: 0, weekly: 0, daily: 0 },

  setProfile: (profile) => set(profile),

  updateAge: (age) => set({ age }),

  updateIncome: (monthlyIncome) => {
    set({ monthlyIncome });
    get().recalculate();
  },

  setGoodSpendings: (goodSpendings) => {
    set({ goodSpendings });
    get().recalculate();
  },

  setFixedExpenses: (fixedExpenses) => {
    set({ fixedExpenses });
    get().recalculate();
  },

  recalculate: () => {
    const { monthlyIncome, goodSpendings, fixedExpenses } = get();
    const surplus = calculateSurplus(monthlyIncome, goodSpendings, fixedExpenses);
    const goodTotal = getGoodSpendingTotal(goodSpendings);
    const grade = calculateGrade(monthlyIncome, goodTotal);
    set({ surplus, grade });
  },
}));
