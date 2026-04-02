import type { GoodSpending, FixedExpenses, Surplus } from '@/types/finance';

export function calculateSurplus(
  monthlyIncome: number,
  goodSpendings: GoodSpending[],
  fixedExpenses: FixedExpenses
): Surplus {
  const goodTotal = goodSpendings.reduce((sum, g) => sum + g.amount, 0);
  const fixedTotal = fixedExpenses.rent + fixedExpenses.utilities + fixedExpenses.phone;
  const monthly = monthlyIncome - goodTotal - fixedTotal;
  return {
    monthly,
    weekly: Math.floor(monthly / 4.3),
    daily: Math.floor(monthly / 30),
  };
}

export function getGoodSpendingTotal(goodSpendings: GoodSpending[]): number {
  return goodSpendings.reduce((sum, g) => sum + g.amount, 0);
}

export function getFixedExpenseTotal(fixedExpenses: FixedExpenses): number {
  return fixedExpenses.rent + fixedExpenses.utilities + fixedExpenses.phone;
}
