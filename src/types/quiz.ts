// === Quiz Today ===

export interface TodayQuizData {
  id: string;
  quizCode: string;                // "Q00001"
  question: string;
  choices: string[];
  hint: string | null;
  difficultyLevel: number;         // 1=초급, 2=심화, 3=마스터
  difficultyLabel: string;         // "초급" | "심화" | "마스터"
  source: string;
  category: string;
  totalAttempts: number;
  correctCount: number;
  correctRate: number;             // 0~100
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
  currentLevel: number;            // 1~3
  currentLevelLabel: string;       // "초급" | "심화" | "마스터"
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
  newLevelLabel: string;           // "초급" | "심화" | "마스터"
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
  quizLevelLabel: string;          // "초급" | "심화" | "마스터"
}

export interface AttendanceHistory {
  month: string;
  records: AttendanceRecord[];
}
