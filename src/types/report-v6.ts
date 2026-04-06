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
    myScore: number;
    peerAvg: number;
    ageGroup: string;
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
    user: { fixedCost: number; variableCost: number; surplus: number };
    peer: { fixedCost: number; variableCost: number; surplus: number };
  };
  peerAgeGroup: string;
  charts: {
    waterfall: { labels: string[]; values: number[] };
    comparison: { labels: string[]; user: number[]; peer: number[] };
  };
  ai_narrative: string;
}

// === Section C: 통합 시뮬레이션 ===

export interface LifeEvent {
  age: number;
  name: string;
  cost: number;
  icon?: string;
}

export interface ScenarioData {
  label: string;
  trajectory: { age: number; asset: number }[];
}

export interface SectionC {
  section: 'C';
  title: string;
  timeline: {
    accumulationStart: number;
    accumulationEnd: number;
    gapStart: number;
    gapEnd: number;
    pensionStart: number;
  };
  scenarios: ScenarioData[];
  lifeEvents: LifeEvent[];
  totalEventCost: number;
  netAfterEvents: number;
  retirement: {
    targetMonthly: number;
    projectedMonthly: number;
    gap: number;
  };
  charts: {
    assetGrowth: { scenarios: ScenarioData[] };
    timeline: { phases: { label: string; start: number; end: number; color: string }[] };
    gapBar: { target: number; projected: number };
  };
  ai_narrative: string;
}

// === Section D: 한국의 현실 ===

export interface TopicChart {
  type: string;
  labels: string[];
  values: number[];
  highlight?: string;
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
  label: string;
  description: string;
}

export interface RoadmapStep {
  phase: number;
  title: string;
  description: string;
  duration?: string;
}

export interface SectionE {
  section: 'E';
  title: string;
  current: GradeInfo;
  next: GradeInfo;
  ultimate: GradeInfo;
  steps: RoadmapStep[];
  chart: {
    type: string;
    gauge: { current: number; target: number; max: number };
  };
  ai_narrative: string;
}

// === Section F: 잉여자금 늘리기 ===

export interface CostTip {
  category: string;
  tip: string;
  potentialSaving: number;
}

export interface BoostSimulationItem {
  action: string;
  monthlySaving: number;
  yearlyEffect: number;
  tenYearEffect: number;
}

export interface SectionF {
  section: 'F';
  title: string;
  current: number;
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

export interface ProductRate {
  product: string;
  rate: string;
  note?: string;
}

export interface SectionG {
  section: 'G';
  title: string;
  userGrade: Grade;
  topics: EducationTopic[];
  productRates: ProductRate[];
  disclaimer: string;
  ai_narrative: string;
}

// === Section H: 12개월 캘린더 ===

export interface MonthEvent {
  label: string;
  type?: string;
}

export interface MonthCard {
  month: number;
  title: string;
  events: MonthEvent[];
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
