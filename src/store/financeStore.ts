'use client';

import { create } from 'zustand';
import type { Grade, VariableCost } from '@/types/finance';
import { calculateVariableCost } from '@/lib/variable-cost';
import { calculateGrade } from '@/lib/grade';

interface FinanceState {
  age: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  expectedReturn: number;
  investmentYears: number;
  grade: Grade;
  variableCost: VariableCost;
  isStale: boolean;
  setProfile: (profile: {
    age: number;
    monthlyIncome: number;
    monthlyInvestment: number;
    monthlyFixedCost: number;
    expectedReturn: number;
    investmentYears: number;
    grade: Grade;
    variableCost: VariableCost;
  }) => void;
  recalculate: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  age: 0,
  monthlyIncome: 0,
  monthlyInvestment: 0,
  monthlyFixedCost: 0,
  expectedReturn: 5,
  investmentYears: 38,
  grade: 'RED' as Grade,
  variableCost: { monthly: 0, weekly: 0, daily: 0 },
  isStale: false,

  setProfile: (profile) => set(profile),

  recalculate: () => {
    const { monthlyIncome, monthlyInvestment, monthlyFixedCost } = get();
    const variableCost = calculateVariableCost(monthlyIncome, monthlyInvestment, monthlyFixedCost);
    const grade = calculateGrade(monthlyIncome, monthlyInvestment, variableCost.monthly);
    set({ variableCost, grade });
  },
}));
