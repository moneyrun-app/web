import type { Grade } from './finance';

// === Daily Check ===

export type DailyCheckStatus = 'green' | 'yellow' | 'red';

export interface DailyCheck {
  id: string;
  date: string;
  status: DailyCheckStatus;
  amount: number;
}

// === Pacemaker ===

export type SpendingLevel = 'green' | 'yellow' | 'red';

export interface SpendingStatus {
  todayRemaining: number;
  weeklyRemaining: number;
  weeklyUsed: number;
  level: SpendingLevel;
}

export interface PacemakerAction {
  id: string;
  type: 'learn_content' | 'detailed_report' | 'weekly_report';
  contentId: string;
  title: string;
  label: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Quiz {
  id: string;
  question: string;
  answer: boolean;
  explanation: string;
  source: string;
  category: string;
}

export interface PacemakerToday {
  id: string;
  date: string;
  message: string;
  grade: Grade;
  dailyVariableCost: number;
  spendingStatus: SpendingStatus;
  quizzes: Quiz[];
  quizCount: number;
  actions: PacemakerAction[];
  disclaimer: string;
  createdAt: string;
}

export interface QuizAnswerResponse {
  correct: boolean;
  explanation: string;
  wrongNoteId?: string;
}

export interface WrongNote {
  id: string;
  quizId: string;
  question: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  explanation: string;
  detailedExplanation?: string;
  source: string;
  category: string;
  createdAt: string;
}

export interface PacemakerHistoryItem {
  id: string;
  date: string;
  message: string;
  grade: Grade;
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
  content: DetailedReportContent | string;
  analyzedAt: string;
  createdAt: string;
}

// === Book: Monthly Reports ===

export type WeeklyFeeling = 'good' | 'okay' | 'tight' | 'bad';

export interface MonthlyReportListItem {
  id: string;
  month: string;
  summary: string;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  summary: string;
  guide: string;
  monthlyStats: {
    greenDays: number;
    yellowDays: number;
    redDays: number;
    totalCheckedDays: number;
  };
  createdAt: string;
}

// === Book: External Scraps ===

export type ScrapChannel = 'youtube' | 'threads' | 'instagram' | 'other';

export interface ExternalScrap {
  id: string;
  url: string;
  channel: ScrapChannel;
  creator: string;
  contentDate: string;
  title: string;
  aiSummary: string;
  scrapCount: number;
  createdAt: string;
}

// === Book: Learn ===

export interface LearnContentListItem {
  id: string;
  title: string;
  grade: Grade;
  isRead: boolean;
  isScrapped: boolean;
  readMinutes: number;
}

export interface LearnContent {
  id: string;
  title: string;
  content: string;
  grade: Grade;
  isRead: boolean;
  isScrapped: boolean;
}
