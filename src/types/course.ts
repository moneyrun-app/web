import type { Grade } from './finance';

// === 코스 카테고리 ===

export type CourseCategory = '연금' | '주식' | '부동산' | '세금_연말정산' | '소비_저축';
export type CourseLevel = '기초' | '심화' | '마스터';
export type MissionType = 'action' | 'read' | 'calculate';

// === 온보딩 v3 ===

export interface OnboardingStatus {
  currentStep: number;
  isComplete: boolean;
  step1: {
    selectedCategory: CourseCategory | null;
  };
  step2: {
    assignedLevel: CourseLevel | null;
    diagnosticScore: number | null;
  };
  step3: {
    financeDataSubmitted: boolean;
  };
  step4: {
    generationStatus: 'pending' | 'generating' | 'completed' | 'failed' | null;
    purchaseId: string | null;
  };
  step5: {
    pacemakerWelcomed: boolean;
  };
}

export interface OnboardingStep1Request {
  category: CourseCategory;
}

export interface OnboardingStep1Response {
  nextStep: 2;
  selectedCategory: CourseCategory;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  choices: string[];
}

export interface OnboardingStep2QuestionsResponse {
  category: string;
  questions: DiagnosticQuestion[];
}

export interface OnboardingStep2Request {
  answers: Array<{
    questionId: string;
    answer: number;
  }>;
}

export interface OnboardingStep2Response {
  nextStep: 3;
  assignedLevel: CourseLevel;
  courseTitle: string;
  scoreRatio: number;
  correctCount: number;
  totalCount: number;
}

export interface OnboardingStep3Request {
  financeData: {
    nickname: string;
    age: number;
    retirementAge: number;
    pensionStartAge?: number;
    monthlyIncome: number;
    monthlyInvestment: number;
    monthlyFixedCost: number;
    monthlyVariableCost: number;
  };
  courseExtraData?: Record<string, unknown>;
}

export interface OnboardingStep3Response {
  nextStep: 4;
  grade: Grade;
  availableBudget: {
    monthly: number;
    weekly: number;
    daily: number;
  };
}

export interface OnboardingStep4GenerateResponse {
  status: 'generating';
  purchaseId: string;
  estimatedSeconds: number;
}

export interface GenerationProgress {
  step: string;
  percent: number;
  chaptersDone: number;
  totalChapters: number;
  updatedAt: string;
}

export interface OnboardingStep4StatusResponse {
  status: 'generating' | 'completed' | 'failed';
  purchaseId: string | null;
  progress?: GenerationProgress;
}

export interface CourseGenerateStatusResponse {
  status: 'generating' | 'completed' | 'failed';
  purchaseId: string;
  progress?: GenerationProgress;
}

export interface OnboardingStep5Response {
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

// === 코스별 추가 데이터 타입 (프론트 전용) ===

export type PensionExtraData = {
  pensionType: string;
  nationalPensionYears: number;
  pensionBalance: number;
};

export type StockExtraData = {
  investmentExperience: string;
  currentAssets: number;
};

export type RealEstateExtraData = {
  housingType: string;
  targetAsset: string;
  cheongyakScore: number;
};

export type TaxExtraData = {
  annualIncome: number;
  dependents: number;
  housingType: string;
  creditCardUsage: number;
};

export type SavingExtraData = {
  targetSaving: number;
  hasEmergencyFund: boolean;
  subscriptionCount: number;
};

export type CourseExtraData =
  | PensionExtraData
  | StockExtraData
  | RealEstateExtraData
  | TaxExtraData
  | SavingExtraData;
