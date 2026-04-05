import type { User } from '@/types/api';
import type { FinanceProfile } from '@/types/finance';

export const mockUser: User = {
  id: 'user-001',
  nickname: '김민수',
  email: 'user@email.com',
  marketingConsent: false,
  hasCompletedOnboarding: true,
  createdAt: '2026-04-02T00:00:00.000Z',
};

export const mockFinanceProfile: FinanceProfile = {
  nickname: '민수',
  age: 27,
  retirementAge: 55,
  pensionStartAge: 65,
  monthlyIncome: 3_000_000,
  monthlyFixedCost: 1_500_000,
  monthlyVariableCost: 1_000_000,
  monthlyExpense: 2_500_000,
  surplus: 500_000,
  investmentPeriod: 28,
  vestingPeriod: 10,
  grade: 'YELLOW',
  variableCost: {
    monthly: 500_000,
    weekly: 116_000,
    daily: 16_000,
    daysInMonth: 30,
  },
  lastUpdated: '2026-04-02T00:00:00.000Z',
  isStale: false,
};
