import type { Grade } from './finance';

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

export interface PacemakerToday {
  id: string;
  date: string;
  message: string;
  grade: Grade;
  dailyVariableCost: number;
  spendingStatus: SpendingStatus;
  actions: PacemakerAction[];
  disclaimer: string;
  canRefresh: boolean;
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
  pdfUrl: string;
  createdAt: string;
}

export interface DetailedReportsResponse {
  canGenerateFree: boolean;
  items: DetailedReportListItem[];
}

export interface DetailedReport {
  id: string;
  title: string;
  content: string;
  pdfUrl: string;
  createdAt: string;
}

// === Book: Weekly Reports ===

export type WeeklyFeeling = 'good' | 'okay' | 'tight' | 'bad';

export interface WeeklyReportListItem {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  guide: string;
  weeklyStats: {
    budgetComplianceRate: number;
    biggestCategory: string;
    savedCategory: string;
  };
  userInput: {
    overallFeeling: WeeklyFeeling;
    memo: string;
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
