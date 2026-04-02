import type { Grade, Surplus } from './finance';

export interface PacemakerAction {
  type: 'learn_content' | 'detailed_report' | 'weekly_report';
  id: string;
  title: string;
  label: string;
}

export interface PacemakerToday {
  id: string;
  date: string;
  message: string;
  grade: Grade;
  dailySurplus: number;
  actions: PacemakerAction[];
  createdAt: string;
}

export interface PacemakerHistoryItem {
  id: string;
  date: string;
  message: string;
  grade: Grade;
}

export interface DetailedReportListItem {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export interface DetailedReportsResponse {
  canGenerate: boolean;
  nextAvailableDate: string | null;
  items: DetailedReportListItem[];
}

export interface DetailedReport {
  id: string;
  title: string;
  content: string;
  grade: Grade;
  surplus: Surplus;
  analysis: {
    wellDone: string;
    improvement: string;
    actionPlan: string;
  };
  createdAt: string;
}

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
  userInput: {
    overallFeeling: 'good' | 'okay' | 'tight' | 'bad';
    memo: string;
  };
  createdAt: string;
}

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

export interface ScrapItem {
  id: string;
  title: string;
  grade: Grade;
  type: string;
  scrappedAt: string;
}
