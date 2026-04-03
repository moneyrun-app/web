import type { Grade } from '@/types/finance';

export function calculateGrade(
  monthlyIncome: number,
  monthlyInvestment: number,
  monthlyVariableCost: number,
): Grade {
  if (monthlyIncome <= 0) return 'RED';
  if (monthlyVariableCost < 0) return 'RED'; // 소득 초과 지출

  const investRatio = monthlyInvestment / monthlyIncome;
  if (investRatio >= 0.20) return 'GREEN';
  if (investRatio >= 0.10) return 'YELLOW';
  return 'RED';
}

export const gradeConfig: Record<Grade, { label: string; main: string; light: string; dark: string }> = {
  RED:    { label: '위험', main: '#EF4444', light: '#FEF2F2', dark: '#991B1B' },
  YELLOW: { label: '주의', main: '#F59E0B', light: '#FFFBEB', dark: '#92400E' },
  GREEN:  { label: '양호', main: '#22C55E', light: '#F0FDF4', dark: '#166534' },
};
