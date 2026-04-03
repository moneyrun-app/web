import type { SimulationInput, SimulationResult } from '@/types/finance';
import { calculateVariableCost } from './variable-cost';
import { calculateGrade } from './grade';

const MIN_PENSION_GOAL = 1_300_000;

export function calculateSimulation(input: SimulationInput): SimulationResult {
  const variableCost = calculateVariableCost(input.monthlyIncome, input.monthlyInvestment, input.monthlyFixedCost);
  const grade = calculateGrade(input.monthlyIncome, input.monthlyInvestment, variableCost.monthly);

  // 투자금 기반으로 미래 자산 계산
  const monthlySaving = Math.max(0, input.monthlyInvestment);
  const futureAsset = calculateFutureValue(monthlySaving, input.expectedReturn, input.investmentYears);
  const requiredCorpus = MIN_PENSION_GOAL * 12 * 25;
  const monthlyPensionEstimate = Math.round(futureAsset / (25 * 12));
  const shortfall = Math.max(0, MIN_PENSION_GOAL - monthlyPensionEstimate);

  return {
    variableCost,
    simulation: {
      futureAsset,
      monthlyPensionEstimate,
      minLivingCost: MIN_PENSION_GOAL,
      shortfall,
      meetsGoal: futureAsset >= requiredCorpus,
    },
    grade,
  };
}

function calculateFutureValue(monthlySaving: number, annualRate: number, years: number): number {
  if (monthlySaving <= 0 || years <= 0) return 0;
  if (annualRate === 0) return monthlySaving * 12 * years;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return Math.round(monthlySaving * ((Math.pow(1 + r, n) - 1) / r));
}
