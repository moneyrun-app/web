// === Quiz Today ===

export interface TodayQuizData {
  id: string;
  question: string;
  choices: string[];
  difficultyLevel: number;
  source: string;
  category: string;
}

export interface TodayQuizSolvedResult {
  correct: boolean;
  correctAnswer: number;
  userAnswer: number;
  briefExplanation: string;
  detailedExplanation: string;
  scrapped: boolean;
}

export interface TodayQuizResponse {
  quiz: TodayQuizData | null;
  currentLevel: number;
  solvedToday: boolean;
  /** solvedToday === true 일 때 DB에서 가져온 결과 */
  result?: TodayQuizSolvedResult | null;
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
