import type { ScrapChannel } from './book';
import type { CourseBook } from './course';

// === MyBook Overview ===

export interface MyBookOverview {
  courseBook?: CourseBook | null;

  detailedReport: {
    id: string;
    summary: string;
    grade: string;
    createdAt: string;
  } | null;

  purchasedBooks: PurchasedBook[];
  highlightCount: number;

  scrapCounts: {
    url: number;
    quiz: number;
    total: number;
  };
  canGenerateBook: boolean;
}

export interface PurchasedBook {
  purchaseId: string;
  bookId: string | null;
  bookTitle: string;
  category: string;
  coverImageUrl: string | null;
  source: 'store' | 'scrap' | 'course';
  status: 'generating' | 'completed' | 'failed';
  highlightCount: number;
  createdAt: string;
}

// === Book Reader ===

export interface Highlight {
  id: string;
  sentenceText: string;
  color: string;
  note: string | null;
  createdAt: string;
}

export interface BookChapter {
  index?: number;
  chapterIndex?: number;
  title: string;
  content: string;
  highlights: Highlight[];
}

export interface BookReader {
  purchaseId: string;
  bookId: string;
  bookTitle: string;
  category: string;
  status: 'generating' | 'completed' | 'failed';
  chapters: BookChapter[];
}

// === Highlights ===

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export interface AddHighlightRequest {
  chapterIndex: number;
  sentenceText: string;
  color: HighlightColor;
  note?: string;
}

export interface HighlightItem {
  id: string;
  bookTitle: string;
  chapterTitle?: string;
  chapterIndex: number;
  sentenceText: string;
  color: string;
  note: string | null;
  purchaseId: string;
  createdAt: string;
}

// 백엔드는 배열을 직접 반환
export type HighlightsResponse = HighlightItem[];

// === Generate from Scraps ===

export interface GenerateFromScrapsResponse {
  purchaseId: string;
  status: 'generating';
  estimatedSeconds: number;
  scrapCount: number;
}

// === Scraps (URL + Quiz 통합) ===

export interface UrlScrap {
  id: string;
  type: 'url';
  url: string;
  channel: ScrapChannel;
  creator: string | null;
  title: string;
  bodyText: string | null;
  ogImageUrl: string | null;
  aiSummary: string | null;
  scrapCount: number;
  createdAt: string;
}

export interface QuizScrap {
  id: string;
  type: 'quiz';
  quizId: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  briefExplanation: string;
  detailedExplanation: string;
  category: string;
  note: string | null;
  createdAt: string;
}

export interface HighlightScrap {
  id: string;
  type: 'highlight';
  purchaseId: string;
  bookTitle: string;
  chapterIndex: number;
  sentenceText: string;
  color: string;
  note: string | null;
  createdAt: string;
}

export interface MyBookScrapsResponse {
  urlScraps: UrlScrap[];
  quizScraps: QuizScrap[];
  highlightScraps: HighlightScrap[];
  totalCount: number;
}
