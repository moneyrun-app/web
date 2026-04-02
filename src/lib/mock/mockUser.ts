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
  monthlyIncome: 2300000,
  grade: 'YELLOW',
  goodSpendings: [
    { id: 'gs-001', type: 'savings', label: '적금', amount: 300000 },
    { id: 'gs-002', type: 'pension_savings', label: '연금저축', amount: 100000 },
  ],
  goodSpendingTotal: 400000,
  fixedExpenses: {
    rent: 700000,
    utilities: 100000,
    phone: 55000,
  },
  fixedExpenseTotal: 855000,
  surplus: {
    monthly: 1045000,
    weekly: 243023,
    daily: 34833,
  },
};
