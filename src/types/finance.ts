export type Grade = 'RED' | 'YELLOW' | 'GREEN';

export type GoodSpendingType = 'savings' | 'investment' | 'pension_savings' | 'irp' | 'insurance';

export interface GoodSpending {
  id?: string;
  type: GoodSpendingType;
  label: string;
  amount: number;
}

export interface FixedExpenses {
  rent: number;
  utilities: number;
  phone: number;
}

export interface Surplus {
  monthly: number;
  weekly: number;
  daily: number;
}

export interface FinanceProfile {
  age: number;
  monthlyIncome: number;
  grade: Grade;
  goodSpendings: GoodSpending[];
  goodSpendingTotal: number;
  fixedExpenses: FixedExpenses;
  fixedExpenseTotal: number;
  surplus: Surplus;
}

export interface OnboardingRequest {
  age: number;
  monthlyIncome: number;
  goodSpendings: Omit<GoodSpending, 'id'>[];
  fixedExpenses: FixedExpenses;
}

export interface OnboardingResponse {
  grade: Grade;
  surplus: Surplus;
}
