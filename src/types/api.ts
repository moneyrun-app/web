export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'PAYMENT_REQUIRED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  nickname: string;
  email: string;
  marketingConsent: boolean;
  hasCompletedOnboarding: boolean;
  role: UserRole;
  createdAt: string;
}

// === Admin ===

export interface AdminUser {
  id: string;
  nickname: string;
  email: string;
  role: UserRole;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminQuiz {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  briefExplanation: string;
  detailedExplanation: string;
  source: string;
  category: string;
  createdAt: string;
}

export interface AdminQuizzesResponse {
  quizzes: AdminQuiz[];
  total: number;
}

export interface AdminConstantUpdate {
  key: string;
  value: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    nickname: string;
    email: string;
    isNewUser: boolean;
    hasCompletedOnboarding: boolean;
  };
}

export interface Constants {
  exchangeRate: number;
  oilPrice: number;
  inflationRate: number;
  minPensionGoal: number;
  seoulAverageRent: number;
  categoryAverages: {
    food: number;
    transport: number;
    subscription: number;
    shopping: number;
    leisure: number;
    etc: number;
  };
  updatedAt: string;
}
