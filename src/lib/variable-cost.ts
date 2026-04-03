import type { VariableCost } from '@/types/finance';

export function calculateVariableCost(
  monthlyIncome: number,
  monthlyInvestment: number,
  monthlyFixedCost: number,
): VariableCost {
  const monthly = monthlyIncome - monthlyInvestment - monthlyFixedCost;
  return {
    monthly,
    weekly: Math.floor(monthly / 4.3),
    daily: Math.floor(monthly / 30),
  };
}
