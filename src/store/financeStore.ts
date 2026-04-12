'use client';

import { create } from 'zustand';
import type { Grade, VariableCost, AvailableBudget } from '@/types/finance';

interface FinanceState {
  nickname: string;
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  grade: Grade;
  variableCost: VariableCost;
  availableBudget: AvailableBudget;
  setProfile: (profile: Partial<FinanceState>) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  nickname: '',
  age: 0,
  retirementAge: 0,
  pensionStartAge: 65,
  monthlyIncome: 0,
  monthlyInvestment: 0,
  monthlyFixedCost: 0,
  monthlyVariableCost: 0,
  monthlyExpense: 0,
  surplus: 0,
  investmentPeriod: 0,
  vestingPeriod: 0,
  grade: 'RED' as Grade,
  variableCost: { monthly: 0, weekly: 0, daily: 0, daysInMonth: 30 },
  availableBudget: { monthly: 0, weekly: 0, daily: 0 },

  setProfile: (profile) => set(profile),
}));
