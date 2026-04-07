import type { Grade } from './finance';

// === Section A: 재무 건강 진단 ===

export interface ScoreAxis {
  axis: string;
  score: number;
  max: number;
}

export interface SectionA {
  section: 'A';
  title: string;
  totalScore: number;
  maxScore: number;
  grade: Grade;
  scores: ScoreAxis[];
  peerComparison: {
    ageGroup: string;
    expenseRatio: { user: number; peer: number };
    surplusRatio: { user: number; peer: number };
    variableRatio: { user: number; peer: number };
  };
  chart: {
    type: string;
    labels: string[];
    data: number[];
  };
  ai_narrative: string;
}

// === Section B: 돈의 흐름 ===

export interface SectionB {
  section: 'B';
  title: string;
  breakdown: {
    income: number;
    fixedCost: number;
    variableCost: number;
    surplus: number;
  };
  ratios: {
    user: { fixed: number; variable: number; surplus: number };
    peer: { fixed: number; variable: number; surplus: number };
  };
  peerAgeGroup: string;
  charts: Record<string, unknown>;
  ai_narrative: string;
}

// === Section C: 통합 시뮬레이션 ===

export interface LifeEvent {
  name: string;
  cost: number;
  icon?: string;
}

export interface ScenarioData {
  name: string;
  rate: number;
  projections: Record<string, number>;
}

export interface SectionC {
  section: 'C';
  title: string;
  timeline: {
    currentAge: number;
    retirementAge: number;
    vestingPeriod: number;
    pensionStartAge: number;
    investmentPeriod: number;
  };
  scenarios: ScenarioData[];
  lifeEvents: LifeEvent[];
  totalEventCost: number;
  netAfterEvents: Record<string, number>;
  retirement: {
    monthlyShortfall: number;
    nationalPensionMonthly: number;
    gapFundMin: number;
    gapFundComfort: number;
  };
  charts: {
    assetGrowth: {
      type: string;
      xAxis: string[];
      series: Record<string, number[]>;
    };
    timeline: {
      type: string;
      periods: { from: number; to: number; color: string; label: string }[];
    };
    gapBar: {
      type: string;
      data: Record<string, number>;
      target: number;
    };
  };
  ai_narrative: string;
}

// === Section D: 한국의 현실 ===

export interface TopicChart {
  type: string;
  data: Record<string, number> | unknown[][];
  unit?: string;
  highlight?: string;
  columns?: string[];
  rows?: unknown[][];
}

export interface TopicItem {
  title: string;
  chart: TopicChart;
  insight: string;
}

export interface SectionD {
  section: 'D';
  title: string;
  topics: TopicItem[];
  userConnection: string;
  ai_narrative: string;
}

// === Section E: 등급별 로드맵 ===

export interface GradeInfo {
  grade: Grade;
  label?: string;
  description?: string;
  expenseRatio?: number;
  targetRatio?: number;
  requiredReduction?: number;
}

export interface RoadmapStep {
  phase: number;
  goal: string;
  period: string;
  targetReduction: number;
}

export interface SectionE {
  section: 'E';
  title: string;
  current: GradeInfo;
  next: GradeInfo;
  ultimate: GradeInfo;
  steps: RoadmapStep[];
  chart: Record<string, unknown>;
  ai_narrative: string;
}

// === Section F: 잉여자금 늘리기 ===

export interface CostTip {
  category: string;
  tip: string;
  potentialSaving: string;
  avgCost?: number;
}

export interface BoostSimulationItem {
  extra: number;
  newSurplus: number;
  in10y_invest: number;
  in10y_savings: number;
}

export interface SectionF {
  section: 'F';
  title: string;
  current: {
    surplus: number;
    fixedCost: number;
    variableCost: number;
  };
  fixedCostTips: CostTip[];
  variableCostTips: CostTip[];
  boostSimulation: BoostSimulationItem[];
  ai_narrative: string;
}

// === Section G: 금융 교육 ===

export interface EducationTopic {
  title: string;
  subtitle: string;
  content: string;
  keyPoints: string[];
  icon?: string;
}

export interface SectionG {
  section: 'G';
  title: string;
  userGrade: Grade;
  topics: EducationTopic[];
  productRates: Record<string, string>;
  disclaimer: string;
  ai_narrative: string;
}

// === Section H: 12개월 캘린더 ===

export interface MonthCard {
  month: number;
  title: string;
  events: string[];
  todo: string;
}

export interface SectionH {
  section: 'H';
  title: string;
  months: MonthCard[];
  ai_narrative: string;
}

// === Section I: 선물 (용어사전) ===

export interface TermItem {
  term: string;
  definition: string;
  example: string;
}

export interface SectionI {
  section: 'I';
  title: string;
  message: string;
  userGrade: Grade;
  terms: TermItem[];
  ai_narrative: string;
}

// === Union type for all sections ===

export type V6Section =
  | SectionA
  | SectionB
  | SectionC
  | SectionD
  | SectionE
  | SectionF
  | SectionG
  | SectionH
  | SectionI;

// === Top-level V6 Report ===

export interface V6Report {
  id: string;
  title: string;
  reportVersion: string;
  grade: Grade;
  summary: string;
  sections: V6Section[];
  userSnapshot?: Record<string, unknown>;
  disclaimer?: string;
  analyzedAt: string;
  createdAt: string;
}
