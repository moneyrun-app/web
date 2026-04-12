export type Grade = 'RED' | 'YELLOW' | 'GREEN';

export interface VariableCost {
  monthly: number;
  weekly: number;
  daily: number;
  daysInMonth: number;
}

export interface AvailableBudget {
  monthly: number;
  weekly: number;
  daily: number;
}

export interface FinanceProfile {
  nickname: string;
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  grade: Grade;
  variableCost: VariableCost;
  availableBudget: AvailableBudget;
  lastUpdated: string;
  isStale: boolean;
}

export interface SimulationInput {
  nickname: string;
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
}

export interface SimulationCase {
  label: string;
  futureAsset: number;
  monthlyPension: number;
}

export interface SimulationResult {
  grade: Grade;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  variableCost: VariableCost;
  simulation: {
    cases: SimulationCase[];
  };
}

export interface OnboardingRequest {
  nickname: string;
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
}

export interface OnboardingResponse {
  grade: Grade;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  availableBudget: AvailableBudget;
  firstReportId: string;
}

export interface FinanceProfileUpdateResponse {
  grade: Grade;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  variableCost: VariableCost;
}

// === 또래 비교 통계 ===

export interface PeerStatistics {
  ageGroup: { label: string; range: [number, number] };
  incomeGroup: { label: string; range: [number, number] };
  peers: {
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    avgFixedCost: number;
    avgVariableCost: number;
    avgSavingsRate: number;
    avgSurplus: number;
  };
}

// === 투자 시나리오 (비율별) ===

export interface InvestmentScenario {
  label: string;
  ratio: number;
  monthlyInvestment: number;
  totalPrincipal: number;
  futureAsset: number;
  nominalMonthlyPension: number;
  realMonthlyPension: number;
  trajectory: { age: number; asset: number }[];
}

export interface EnhancedSimulationResult extends SimulationResult {
  investmentScenarios: InvestmentScenario[];
  pensionYears: number;
  inflationRate: number;
}
