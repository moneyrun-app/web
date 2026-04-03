export type Grade = 'RED' | 'YELLOW' | 'GREEN';

export interface VariableCost {
  monthly: number;
  weekly: number;
  daily: number;
}

export interface FinanceProfile {
  age: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  expectedReturn: number;
  investmentYears: number;
  grade: Grade;
  variableCost: VariableCost;
  lastUpdated: string;
  isStale: boolean;
}

export interface SimulationInput {
  age: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  expectedReturn: number;
  investmentYears: number;
}

export interface SimulationResult {
  variableCost: VariableCost;
  simulation: {
    futureAsset: number;
    monthlyPensionEstimate: number;
    minLivingCost: number;
    shortfall: number;
    meetsGoal: boolean;
  };
  grade: Grade;
}

export interface OnboardingRequest {
  age: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  expectedReturn: number;
  investmentYears: number;
}

export interface OnboardingResponse {
  grade: Grade;
  variableCost: VariableCost;
  firstReportId: string;
}

export interface FinanceProfileUpdateResponse {
  grade: Grade;
  variableCost: VariableCost;
  canGenerateFreeReport: boolean;
  reportPrice: number;
}
