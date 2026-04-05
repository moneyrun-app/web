export type Grade = 'RED' | 'YELLOW' | 'GREEN';

export interface VariableCost {
  monthly: number;
  weekly: number;
  daily: number;
  daysInMonth: number;
}

export interface FinanceProfile {
  nickname: string;
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  grade: Grade;
  variableCost: VariableCost;
  lastUpdated: string;
  isStale: boolean;
}

export interface SimulationInput {
  age: number;
  retirementAge: number;
  pensionStartAge: number;
  monthlyIncome: number;
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
  monthlyFixedCost: number;
  monthlyVariableCost: number;
}

export interface OnboardingResponse {
  grade: Grade;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  variableCost: VariableCost;
}

export interface FinanceProfileUpdateResponse {
  grade: Grade;
  monthlyExpense: number;
  surplus: number;
  investmentPeriod: number;
  vestingPeriod: number;
  variableCost: VariableCost;
}
