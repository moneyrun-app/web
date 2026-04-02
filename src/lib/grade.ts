import type { Grade } from '@/types/finance';

export function calculateGrade(monthlyIncome: number, goodSpendingTotal: number): Grade {
  if (goodSpendingTotal === 0) return 'RED';
  const ratio = goodSpendingTotal / monthlyIncome;
  if (ratio < 0.10) return 'RED';
  if (ratio < 0.20) return 'YELLOW';
  return 'GREEN';
}

export const gradeConfig: Record<Grade, { label: string; color: string; bg: string; border: string }> = {
  RED: { label: 'RED', color: '#EF4444', bg: '#FEF2F2', border: '#EF4444' },
  YELLOW: { label: 'YELLOW', color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B' },
  GREEN: { label: 'GREEN', color: '#22C55E', bg: '#F0FDF4', border: '#22C55E' },
};
