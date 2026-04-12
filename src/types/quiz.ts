// === Quiz Today ===

export interface TodayQuizResponse {
  quiz: {
    id: string;
    question: string;
    choices: string[];
    difficultyLevel: number;
  } | null;
  attendance: {
    checkedToday: boolean;
    currentStreak: number;
    totalDays: number;
  };
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
