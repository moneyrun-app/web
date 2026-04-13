// === Quiz Today ===

export interface TodayQuizData {
  id: string;
  question: string;
  choices: string[];
  difficultyLevel: number;
  source: string;
  category: string;
}

export interface TodayQuizResponse {
  quiz: TodayQuizData | null;
  currentLevel: number;
  solvedToday: boolean;
}

// === Quiz ===

export interface QuizScrapResponse {
  scrapped: boolean;
  scrapId: string | null;
}

export interface QuizLevelResponse {
  newLevel: number;
}

// === Attendance ===

export interface AttendanceBadge {
  code: string;
  name: string;
  icon: string;
  earnedAt: string;
}

export interface AttendanceStreak {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  thisMonthDays: number;
  badges: AttendanceBadge[];
}

export interface AttendanceRecord {
  date: string;
  isCorrect: boolean;
  quizLevel: number;
}

export interface AttendanceHistory {
  month: string;
  records: AttendanceRecord[];
}
