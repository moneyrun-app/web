import type { Grade } from '@/types/finance';

/**
 * 등급 판정: 실질지출/소득 비율
 * 고정비에 투자금이 포함되어 있으므로, 투자금은 차감 (자산 이동이지 지출이 아님)
 * 실질지출 = (고정비 - 투자금) + 변동비
 * 70% 이상 → RED, 50~70% → YELLOW, 50% 미만 → GREEN
 */
export function calculateGrade(
  monthlyIncome: number,
  monthlyFixedCost: number,
  monthlyVariableCost: number,
  monthlyInvestment: number,
): Grade {
  if (monthlyIncome <= 0) return 'RED';
  const realExpense = (monthlyFixedCost - monthlyInvestment) + monthlyVariableCost;
  const ratio = realExpense / monthlyIncome;
  if (ratio >= 0.7) return 'RED';
  if (ratio >= 0.5) return 'YELLOW';
  return 'GREEN';
}

export const gradeConfig: Record<Grade, { label: string; main: string; light: string; dark: string }> = {
  RED:    { label: '위험', main: '#EF4444', light: '#FEF2F2', dark: '#991B1B' },
  YELLOW: { label: '주의', main: '#F59E0B', light: '#FFFBEB', dark: '#92400E' },
  GREEN:  { label: '양호', main: '#22C55E', light: '#F0FDF4', dark: '#166534' },
};
