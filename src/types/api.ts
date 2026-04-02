export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  marketingConsent: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
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
  seoulAverageRent: number;
  categoryAverages: {
    food: number;
    transport: number;
    subscription: number;
    shopping: number;
    leisure: number;
    etc: number;
  };
  inflationRate: number;
  updatedAt: string;
}
