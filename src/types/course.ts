import type { Grade } from './finance';

// === 코스 카테고리 ===

export type CourseCategory = '연금' | '주식' | '부동산' | '세금_연말정산' | '소비_저축';
export type CourseLevel = '기초' | '심화' | '마스터';
export type MissionType = 'action' | 'read' | 'calculate';

// === 온보딩 v4 ===

export type OnboardingStep = 'select-level' | 'quiz' | 'generation' | 'complete';

export interface OnboardingStatus {
  currentStep: OnboardingStep;
  isComplete: boolean;
  selectedCategory: CourseCategory | null;
  levelChoice: 'beginner' | 'find-level' | null;
  assignedLevel: CourseLevel | null;
  generationStatus: 'generating' | 'completed' | 'failed' | null;
  purchaseId: string | null;
}

// --- 로그인 전 온보딩 ---

export interface PreOnboardingRequest {
  nickname: string;
  category: CourseCategory;
  age: number;
  monthlyIncome: number;
  monthlyInvestment: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  retirementAge: number;
  pensionStartAge: number;
}

export interface PreOnboardingResponse {
  nickname: string;
  category: string;
  grade: Grade;
  currentTab: {
    grade: string;
    gradeLabel: string;
    monthlyIncome: number;
    monthlyFixedCost: number;
    monthlyVariableCost: number;
    monthlyInvestment: number;
    surplus: number;
    availableBudget: {
      monthly: number;
      weekly: number;
      daily: number;
    };
    fixedCostRatio: number;
    expenseRatio: number;
  };
  futureTab: {
    yearsToRetirement: number;
    retirementAge: number;
    pensionStartAge: number;
    pensionGapYears: number;
    estimatedSavings: Array<{
      label: string;
      futureAsset: number;
      monthlyPension: number;
    }>;
  };
  actionTab: {
    gradeAction: string;
    ctaMessage: string;
    courseMessage: string;
  };
}

// --- 로그인 후 코스 온보딩 ---

export interface SelectLevelRequest {
  choice: 'beginner' | 'find-level';
}

export interface SelectLevelResponse {
  choice: 'beginner' | 'find-level';
  assignedLevel?: CourseLevel;
  courseTitle?: string;
  message: string;
  generationStarted?: true;
  nextStep?: 'quiz';
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  choices: string[];
  hint: string;
}

export interface DiagnosticQuizQuestionsResponse {
  category: string;
  questions: DiagnosticQuestion[];
}

export interface QuizSubmitRequest {
  answers: Array<{
    questionId: string;
    answer: number;
  }>;
}

export interface QuizSubmitResponse {
  assignedLevel: CourseLevel;
  courseTitle: string;
  correctCount: number;
  totalCount: number;
  message: string;
  wrongNoteMessage: string | null;
  generationStarted: true;
}

export interface GenerationProgress {
  step: string;
  percent: number;
  chaptersDone: number;
  totalChapters: number;
}

export interface GenerationStatusResponse {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  purchaseId: string | null;
  progress: GenerationProgress;
}

export interface CourseGenerateStatusResponse {
  status: 'generating' | 'completed' | 'failed';
  purchaseId: string;
  progress?: GenerationProgress;
}

export interface OnboardingCompleteResponse {
  complete: true;
  welcomeMessage: string;
  courseTitle: string;
}

// === 코스 ===

export interface ActiveCourse {
  userCourseId: string;
  courseId: string;
  category: string;
  level: string;
  title: string;
  currentChapter: number;
  totalChapters: number;
  purchaseId: string;
  status: 'active' | 'completed';
  missionSummary: {
    totalMissions: number;
    completedMissions: number;
  };
  startedAt: string;
}

export interface AvailableCourse {
  id: string;
  category: string;
  level: string;
  title: string;
  description: string;
  chapterCount: number;
  isCompleted: boolean;
}

export interface AvailableCoursesResponse {
  courses: AvailableCourse[];
}

export interface CourseDetail {
  id: string;
  category: string;
  level: string;
  title: string;
  description: string;
  chapterCount: number;
  missions: Array<{
    id: string;
    chapterNumber: number;
    missionOrder: number;
    type: MissionType;
    title: string;
    description: string;
  }>;
}

export interface StartCourseResponse {
  userCourseId: string;
  purchaseId: string;
  status: 'generating';
  estimatedSeconds: number;
}

export interface CompleteCourseResponse {
  completed: true;
  courseSummary: {
    title: string;
    completedMissions: number;
    totalMissions: number;
    daysSpent: number;
  };
  nextRecommendation: {
    courseId: string;
    title: string;
  } | null;
}

// === 미션 ===

export interface Mission {
  id: string;
  chapterNumber: number;
  missionOrder: number;
  type: MissionType;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  note: string | null;
}

export interface ActiveMissionsResponse {
  courseTitle: string;
  missions: Mission[];
  summary: {
    total: number;
    completed: number;
  };
}

export interface CompleteMissionRequest {
  note?: string;
}

export interface CompleteMissionResponse {
  completed: true;
  missionId: string;
  completedAt: string;
  totalCompleted: number;
  totalMissions: number;
}

// === 페이스메이커 코스 정보 (GET /pacemaker/today 내 신규 필드) ===

export interface PacemakerActiveCourse {
  courseId: string;
  title: string;
  category: string;
  level: string;
  currentChapter: number;
  totalChapters: number;
  missionSummary: {
    total: number;
    completed: number;
  };
}

// === 마이북 코스 북 (GET /my-book/overview 내 신규 필드) ===

export interface CourseBook {
  purchaseId: string;
  courseTitle: string;
  currentChapter: number;
  totalChapters: number;
  status: 'generating' | 'completed' | 'failed';
}

