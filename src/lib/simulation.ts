import type { SimulationInput, SimulationResult } from '@/types/finance';
import { calculateGrade } from './grade';

/**
 * 프론트 로컬 시뮬레이션 (비로그인 미리보기용)
 * 실제 시뮬레이션 결과는 POST /simulation/calculate 백엔드에서 받음
 */
export function calculateSimulation(input: SimulationInput): SimulationResult {
  const monthlyExpense = input.monthlyFixedCost + input.monthlyVariableCost;
  const surplus = input.monthlyIncome - monthlyExpense;
  const investmentPeriod = Math.max(0, input.retirementAge - input.age);
  const vestingPeriod = Math.max(0, input.pensionStartAge - input.retirementAge);
  const grade = calculateGrade(input.monthlyIncome, monthlyExpense);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daily = Math.floor(Math.max(0, surplus) / daysInMonth / 1000) * 1000;
  const weekly = Math.floor(daily * 7 / 1000) * 1000;

  return {
    grade,
    monthlyExpense,
    surplus,
    investmentPeriod,
    vestingPeriod,
    variableCost: {
      monthly: Math.max(0, surplus),
      weekly,
      daily,
      daysInMonth,
    },
    simulation: {
      cases: [
        { label: '예적금 3%', ...calcFuture(surplus, 3, investmentPeriod, vestingPeriod) },
        { label: 'KOSPI 7%', ...calcFuture(surplus, 7, investmentPeriod, vestingPeriod) },
        { label: 'S&P500 10%', ...calcFuture(surplus, 10, investmentPeriod, vestingPeriod) },
      ],
    },
  };
}

function calcFuture(monthlySaving: number, annualRate: number, investYears: number, vestYears: number) {
  if (monthlySaving <= 0 || investYears <= 0) return { futureAsset: 0, monthlyPension: 0 };
  const r = annualRate / 100 / 12;
  const n = investYears * 12;
  const accumulated = Math.round(monthlySaving * ((Math.pow(1 + r, n) - 1) / r));
  const afterVesting = Math.round(accumulated * Math.pow(1 + annualRate / 100, vestYears));
  const monthlyPension = Math.round(afterVesting / (25 * 12));
  return { futureAsset: afterVesting, monthlyPension };
}
