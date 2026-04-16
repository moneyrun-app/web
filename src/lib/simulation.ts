import type { SimulationInput, SimulationResult, EnhancedSimulationResult, InvestmentScenario } from '@/types/finance';
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
  const grade = calculateGrade(input.monthlyIncome, input.monthlyFixedCost, input.monthlyVariableCost, input.monthlyInvestment);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daily = Math.floor(Math.max(0, surplus) / daysInMonth / 1000) * 1000;
  const weekly = Math.floor(daily * 7 / 1000) * 1000;

  const pensionYears = 100 - input.pensionStartAge;
  const pensionMonths = pensionYears * 12;

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
        { label: '예적금 3%', ...calcFuture(surplus, 3, investmentPeriod, vestingPeriod, pensionMonths) },
        { label: 'KOSPI 7%', ...calcFuture(surplus, 7, investmentPeriod, vestingPeriod, pensionMonths) },
        { label: 'S&P500 10%', ...calcFuture(surplus, 10, investmentPeriod, vestingPeriod, pensionMonths) },
      ],
    },
  };
}

/**
 * 확장 시뮬레이션 — 투자비율 3단계 + 인플레 반영
 * 랜딩 3-step 결과 화면용
 */
export function calculateEnhancedSimulation(
  input: SimulationInput,
  inflationRate: number = 0.025,
): EnhancedSimulationResult {
  const base = calculateSimulation(input);
  const pensionYears = 100 - input.pensionStartAge;
  const pensionMonths = pensionYears * 12;
  const annualRate = 0.07; // 기본 수익률 7% (연평균)

  const ratios = [
    { label: '전액 투자', ratio: 1.0 },
    { label: '2/3 투자', ratio: 2 / 3 },
    { label: '1/3 투자', ratio: 1 / 3 },
  ];

  const investmentScenarios: InvestmentScenario[] = ratios.map(({ label, ratio }) => {
    const monthlyInvestment = Math.floor(Math.max(0, base.surplus) * ratio);
    const totalPrincipal = monthlyInvestment * 12 * base.investmentPeriod;
    const r = annualRate / 12;

    // 연도별 궤적 데이터
    const trajectory: { age: number; asset: number }[] = [];
    const totalYears = base.investmentPeriod + base.vestingPeriod;
    const step = Math.max(1, Math.floor(totalYears / 20));

    for (let y = 0; y <= totalYears; y += y === 0 ? 1 : step) {
      pushTrajectoryPoint(trajectory, y, input.age, base.investmentPeriod, monthlyInvestment, r, annualRate);
    }
    // 마지막 포인트 보장
    if (trajectory[trajectory.length - 1]?.age !== input.age + totalYears) {
      pushTrajectoryPoint(trajectory, totalYears, input.age, base.investmentPeriod, monthlyInvestment, r, annualRate);
    }

    const futureAsset = trajectory[trajectory.length - 1]?.asset ?? 0;
    const nominalMonthlyPension = pensionMonths > 0 ? Math.round(futureAsset / pensionMonths) : 0;
    const realMonthlyPension = Math.round(
      nominalMonthlyPension / Math.pow(1 + inflationRate, totalYears),
    );

    return { label, ratio, monthlyInvestment, totalPrincipal, futureAsset, nominalMonthlyPension, realMonthlyPension, trajectory };
  });

  return { ...base, investmentScenarios, pensionYears, inflationRate };
}

// --- helpers ---

function calcFuture(monthlySaving: number, annualRate: number, investYears: number, vestYears: number, pensionMonths: number) {
  if (monthlySaving <= 0 || investYears <= 0) return { futureAsset: 0, monthlyPension: 0 };
  const r = annualRate / 100 / 12;
  const n = investYears * 12;
  const accumulated = Math.round(monthlySaving * ((Math.pow(1 + r, n) - 1) / r));
  const afterVesting = Math.round(accumulated * Math.pow(1 + annualRate / 100, vestYears));
  const monthlyPension = pensionMonths > 0 ? Math.round(afterVesting / pensionMonths) : 0;
  return { futureAsset: afterVesting, monthlyPension };
}

function pushTrajectoryPoint(
  arr: { age: number; asset: number }[],
  y: number, startAge: number, investPeriod: number,
  monthlyInvestment: number, r: number, annualRate: number,
) {
  if (y <= investPeriod) {
    const n = y * 12;
    const asset = n > 0 && r > 0
      ? Math.round(monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r))
      : monthlyInvestment * n;
    arr.push({ age: startAge + y, asset });
  } else {
    // 거치 기간 — 복리로 성장
    const investN = investPeriod * 12;
    const accumulated = r > 0
      ? Math.round(monthlyInvestment * ((Math.pow(1 + r, investN) - 1) / r))
      : monthlyInvestment * investN;
    const vestYears = y - investPeriod;
    const asset = Math.round(accumulated * Math.pow(1 + annualRate, vestYears));
    arr.push({ age: startAge + y, asset });
  }
}
