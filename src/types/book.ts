import type { Grade } from './finance';

// === Pacemaker ===

export interface TodayQuiz {
  id: string;
  question: string;
  choices: string[];
  difficultyLevel: number; // 1~5
}

export interface Attendance {
  checkedToday: boolean;
  currentStreak: number;
  totalDays: number;
}

export interface PacemakerCard {
  cardNumber: number;
  emoji: string;
  title: string;
  content: string;
}

export interface PacemakerToday {
  id: string | null;
  date: string;
  cards?: PacemakerCard[];
  message?: string | null;
  grade: Grade | null;
  theme: string | null;
  quote: string | null;
  todayQuiz: TodayQuiz | null;
  attendance: Attendance;
  createdAt: string | null;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correctAnswer: number;
  briefExplanation: string;
  detailedExplanation: string;
  attendanceChecked: boolean;
  currentStreak: number;
  suggestLevelChange: 'up' | 'down' | null;
}

export interface WrongNote {
  id: string;
  quizId: string;
  question: string;
  choices: string[];
  userAnswer: number;
  correctAnswer: number;
  detailedExplanation: string;
  createdAt: string;
}

export type FeedbackType = 'inaccurate' | 'offensive' | 'other';

// === Book: Detailed Reports ===

export interface DetailedReportListItem {
  id: string;
  title: string;
  summary: string;
  analyzedAt: string;
  createdAt: string;
}

export interface DetailedReportsResponse {
  items: DetailedReportListItem[];
}

// === Report Section Types ===

export interface HeroCardData {
  grade: string;
  title: string;
  subtitle: string;
  dailyBudget: number;
  monthlyBudget: number;
}

export interface SummaryTableData {
  income: number;
  fixedCost: number;
  variableCost: number;
  totalExpense: number;
  surplus: number;
  expenseRatio: number;
  daysInMonth: number;
}

export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

export interface ComparisonCardItem {
  label: string;
  mine: number;
  average: number;
  diff: number;
}

export interface BarChartItem {
  label: string;
  current: number;
  target: number;
}

export interface ProgressCardData {
  current: string;
  next: string;
  currentRatio: number;
  targetRatio: number;
  amountToSave: number;
  message: string;
}

export interface SimulationCase {
  label: string;
  rate: number;
  asset55: number;
  asset65: number;
  monthlyPension: number;
}

export interface SimulationTableData {
  investmentPeriod: number;
  vestingPeriod: number;
  monthlySaving: number;
  cases: SimulationCase[];
}

export interface TipItem {
  emoji: string;
  text: string;
}

export interface ActionChecklistItem {
  id: string;
  text: string;
  category: string;
  savingEstimate: number;
}

export type ReportSection =
  | { type: 'hero_card'; data: HeroCardData }
  | { type: 'summary_table'; title: string; data: SummaryTableData }
  | { type: 'donut_chart'; title: string; data: DonutChartItem[] }
  | { type: 'comparison_card'; title: string; data: ComparisonCardItem[] }
  | { type: 'bar_chart'; title: string; subtitle: string; data: BarChartItem[] }
  | { type: 'progress_card'; title: string; data: ProgressCardData }
  | { type: 'simulation_table'; title: string; subtitle: string; data: SimulationTableData }
  | { type: 'tip_card'; title: string; items: TipItem[] }
  | { type: 'action_checklist'; title: string; items: ActionChecklistItem[] }
  | { type: 'disclaimer'; text: string };

export interface DetailedReportContent {
  sections: ReportSection[];
}

export interface DetailedReport {
  id: string;
  title: string;
  reportVersion?: string;
  grade?: string;
  summary?: string;
  sections?: import('./report-v6').V6Section[];
  content?: DetailedReportContent | string;
  userSnapshot?: Record<string, unknown>;
  disclaimer?: string;
  analyzedAt: string;
  createdAt: string;
}

// === Book: External Scraps ===

export type ScrapChannel = 'youtube' | 'threads' | 'instagram' | 'other';

export interface ExternalScrap {
  id: string;
  url: string;
  channel: ScrapChannel;
  creator: string | null;
  title: string;
  aiSummary: string;
  createdAt: string;
}
