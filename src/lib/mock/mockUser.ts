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
  age: 27,
  monthlyIncome: 2_300_000,
  monthlyInvestment: 500_000,
  monthlyFixedCost: 700_000,
  expectedReturn: 5.0,
  investmentYears: 38,
  grade: 'YELLOW',
  variableCost: {
    monthly: 1_100_000,
    weekly: 255_813,
    daily: 36_666,
  },
  lastUpdated: '2026-04-02T00:00:00.000Z',
  isStale: false,
};
