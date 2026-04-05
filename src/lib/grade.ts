import type { Grade } from '@/types/finance';

/**
 * 등급 판정: 총지출/소득 비율
 * 70% 이상 → RED, 50~70% → YELLOW, 50% 미만 → GREEN
 */
export function calculateGrade(monthlyIncome: number, monthlyExpense: number): Grade {
  if (monthlyIncome <= 0) return 'RED';
  const ratio = monthlyExpense / monthlyIncome;
  if (ratio >= 0.7) return 'RED';
  if (ratio >= 0.5) return 'YELLOW';
  return 'GREEN';
}

export const gradeConfig: Record<Grade, { label: string; main: string; light: string; dark: string }> = {
  RED:    { label: '위험', main: '#EF4444', light: '#FEF2F2', dark: '#991B1B' },
  YELLOW: { label: '주의', main: '#F59E0B', light: '#FFFBEB', dark: '#92400E' },
  GREEN:  { label: '양호', main: '#22C55E', light: '#F0FDF4', dark: '#166534' },
};
