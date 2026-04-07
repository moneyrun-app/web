// === Monthly Report V2 ===

export type OverallFeeling = 'good' | 'okay' | 'tight' | 'bad';

// --- POST /book/monthly-reports 요청 ---

export interface ProposalCheck {
  proposalId: string;
  checked: boolean;
}

export interface CreateMonthlyReportRequest {
  overallFeeling: OverallFeeling;
  memo: string;
  proposalChecks: ProposalCheck[];
}

// --- GET /book/monthly-reports/proposals 응답 ---

export interface ProposalItem {
  id: string;
  title: string;
  source: string;
  checked: null;
}

// --- GET /book/monthly-reports/:id 응답 ---

// Section: spending
export interface SpendingSection {
  fixedCost: number;
  variableCost: number;
  surplus: number;
  fixedRatio: number;
  variableRatio: number;
  surplusRatio: number;
  totalSpent: number;
  daysTracked: number;
  daysUnder: number;
  daysOver: number;
  noSpendDays: number;
  bestStreak: number;
  currentStreak: number;
  dailyBudget: number;
  adjustedBudget: number;
  spentRate: number;
  // 첫 달이면 null
  prevTotalSpent: number | null;
  prevSavings: number | null;
  spendingChangeRate: number | null;
  savingsChangeRate: number | null;
  nextDailyBudget: number;
  nextGrade: string;
  peerAgeGroup: string;
  peerPercentile: number;
  peerAvgSurplusRatio: number;
  ai_narrative: string;
}

// Section: proposals
export interface ProposalResultItem {
  id: string;
  title: string;
  source: string;
  checked: boolean;
}

export interface ProposalsSection {
  items: ProposalResultItem[];
  completionRate: number;
  pacemakerActionTotal: number;
  pacemakerActionCompleted: number;
  pacemakerActionRate: number;
  ai_narrative: string;
}

// Section: goals
export interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: string;
}

export interface GoalsSection {
  challenge: string; // 마크다운
  badges: Badge[];
  ai_narrative: string;
}

// Section: learning
export interface QuizItem {
  quizId: string;
  question: string;
  category: string;
  choices: string[];
  correctAnswer: number;
  userAnswer: number;
  correct: boolean;
}

export interface WrongNoteItem {
  quizId: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  userAnswer: number;
  briefExplanation: string;
  detailedExplanation: string;
  category: string;
}

export interface LearningSection {
  fqScore: number;
  prevFqScore: number | null;
  fqChange: number | null;
  totalQuizzes: number;
  correctCount: number;
  correctRate: number;
  totalStudyMinutes: number;
  topCategories: string[];
  quizList: QuizItem[];
  wrongNotes: WrongNoteItem[];
  ai_narrative: string;
}

// Section: rewards
export interface LevelUpKit {
  available: boolean;
  wrongQuizCount: number;
}

export interface RewardsSection {
  earnedBadges: Badge[];
  levelUpKit: LevelUpKit;
  ai_narrative: string;
}

// Sections 통합
export interface MonthlyReportV2Sections {
  spending: SpendingSection;
  proposals: ProposalsSection;
  goals: GoalsSection;
  learning: LearningSection;
  rewards: RewardsSection;
}

// 상위 필드
export interface BadgeEarned {
  code: string;
  name: string;
  icon: string;
}

export interface MonthlyReportV2 {
  id: string;
  month: string;
  summary: string;
  sections: MonthlyReportV2Sections;
  badgesEarned: BadgeEarned[];
  proposalChecks: ProposalCheck[];
  userInput: {
    overallFeeling: OverallFeeling;
    memo: string;
  };
  createdAt: string;
}

// 목록 아이템 (기존 유지)
export interface MonthlyReportV2ListItem {
  id: string;
  month: string;
  summary: string;
  createdAt: string;
}
