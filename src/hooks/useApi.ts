'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Constants, AdminUsersResponse, AdminQuizzesResponse, AdminConstantUpdate } from '@/types/api';
import type { SimulationInput, SimulationResult, FinanceProfile, FinanceProfileUpdateResponse, OnboardingRequest, OnboardingResponse } from '@/types/finance';
import type {
  PacemakerToday,
  QuizAnswerResponse,
  WrongNote,
  DailyCheck,
  DailyCheckStatus,
  DailyChecksResponse,
  WeeklySummary,
  DetailedReportsResponse,
  DetailedReport,
  MonthlyReportListItem,
  MonthlyReport,
  ExternalScrap,
  LearnContentListItem,
  LearnContent,
  FeedbackType,
} from '@/types/book';
import type {
  ProposalItem,
  CreateMonthlyReportRequest,
  MonthlyReportV2,
  MonthlyReportV2ListItem,
  MonthlyFinalizeStatus,
  MonthlyFinalizeResponse,
} from '@/types/monthly-report-v2';

// === Constants (비로그인) ===

export function useConstants() {
  return useQuery({
    queryKey: ['constants'],
    queryFn: () => api.get<Constants>('/constants'),
    staleTime: 1000 * 60 * 60, // 1시간
  });
}

// === Simulation (비로그인) ===

export function useSimulation() {
  return useMutation({
    mutationFn: (input: SimulationInput) =>
      api.post<SimulationResult>('/simulation/calculate', input),
  });
}

// === Finance Profile ===

export function useFinanceProfile() {
  return useQuery({
    queryKey: ['finance-profile'],
    queryFn: () => api.get<FinanceProfile>('/finance/profile'),
  });
}

export function useUpdateFinanceProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SimulationInput> & { nickname?: string }) =>
      api.patch<FinanceProfileUpdateResponse>('/finance/profile', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance-profile'] });
    },
  });
}

// === Pacemaker ===

export function usePacemakerToday() {
  return useQuery({
    queryKey: ['pacemaker-today'],
    queryFn: () => api.get<PacemakerToday>('/pacemaker/today'),
  });
}

export function useAnswerQuiz() {
  return useMutation({
    mutationFn: ({ quizId, userAnswer }: { quizId: string; userAnswer: number }) =>
      api.post<QuizAnswerResponse>(`/pacemaker/quiz/${quizId}/answer`, { userAnswer }),
  });
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: (body: { messageId: string; type: FeedbackType; content: string }) =>
      api.post('/pacemaker/feedback', body),
  });
}

// === Daily Checks ===

export function useDailyChecks(month: string) {
  return useQuery({
    queryKey: ['daily-checks', month],
    queryFn: () => api.get<DailyChecksResponse>(`/pacemaker/daily-checks?month=${month}`),
  });
}

export function useWeeklySummary(date: string) {
  return useQuery({
    queryKey: ['weekly-summary', date],
    queryFn: () => api.get<WeeklySummary>(`/pacemaker/weekly-summary?date=${date}`),
    enabled: !!date,
  });
}

export function useSubmitDailyCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { date: string; status: DailyCheckStatus; amount: number }) =>
      api.post<DailyCheck>('/pacemaker/daily-check', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-checks'] });
    },
  });
}

// === Monthly Finalize (확정) ===

export function useMonthlyFinalizeStatus() {
  return useQuery({
    queryKey: ['monthly-finalize-status'],
    queryFn: () => api.get<MonthlyFinalizeStatus>('/pacemaker/monthly-finalize-status'),
  });
}

export function useMonthlyFinalize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { month: string }) =>
      api.post<MonthlyFinalizeResponse>('/pacemaker/monthly-finalize', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-finalize-status'] });
      qc.invalidateQueries({ queryKey: ['daily-checks'] });
      qc.invalidateQueries({ queryKey: ['monthly-reports'] });
    },
  });
}

export function useCancelFinalize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { month: string }) =>
      api.post('/pacemaker/monthly-finalize/cancel', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-finalize-status'] });
      qc.invalidateQueries({ queryKey: ['daily-checks'] });
    },
  });
}

// === Wrong Notes (오답노트) ===

export function useWrongNotes(enabled = true) {
  return useQuery({
    queryKey: ['wrong-notes'],
    queryFn: () => api.get<WrongNote[]>('/book/wrong-notes'),
    enabled,
  });
}


// === Book: Detailed Reports ===

export function useDetailedReports(enabled = true) {
  return useQuery({
    queryKey: ['detailed-reports'],
    queryFn: () => api.get<DetailedReportsResponse>('/book/detailed-reports'),
    enabled,
  });
}

export function useDetailedReport(id: string) {
  return useQuery({
    queryKey: ['detailed-report', id],
    queryFn: () => api.get<DetailedReport>(`/book/detailed-reports/${id}`),
    enabled: !!id,
  });
}

// === Book: Monthly Reports ===

export function useMonthlyReports(enabled = true) {
  return useQuery({
    queryKey: ['monthly-reports'],
    queryFn: () => api.get<MonthlyReportV2ListItem[]>('/book/monthly-reports'),
    enabled,
  });
}

export function useMonthlyReport(id: string) {
  return useQuery({
    queryKey: ['monthly-report', id],
    queryFn: () => api.get<MonthlyReportV2 | MonthlyReport>(`/book/monthly-reports/${id}`),
    enabled: !!id,
  });
}

export function useMonthlyReportProposals() {
  return useQuery({
    queryKey: ['monthly-report-proposals'],
    queryFn: () => api.get<ProposalItem[]>('/book/monthly-reports/proposals'),
  });
}

export function useCreateMonthlyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMonthlyReportRequest) =>
      api.post<MonthlyReportV2>('/book/monthly-reports', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-reports'] });
    },
  });
}

// === Book: Scraps ===

export function useScraps(enabled = true) {
  return useQuery({
    queryKey: ['scraps'],
    queryFn: () => api.get<ExternalScrap[]>('/book/scraps'),
    enabled,
  });
}

export function useCreateScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      api.post<ExternalScrap>('/book/scraps', { url }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraps'] });
    },
  });
}

export function useDeleteScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/book/scraps/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraps'] });
    },
  });
}

// === Book: Learn ===

export function useLearnContents(grade?: string) {
  return useQuery({
    queryKey: ['learn-contents', grade],
    queryFn: () => api.get<LearnContentListItem[]>(grade ? `/book/learn?grade=${grade}` : '/book/learn'),
  });
}

export function useLearnContent(id: string) {
  return useQuery({
    queryKey: ['learn-content', id],
    queryFn: () => api.get<LearnContent>(`/book/learn/${id}`),
    enabled: !!id,
  });
}

export function useToggleLearnScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/book/learn/${id}/scrap`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learn-contents'] });
    },
  });
}

// === Statistics (비로그인) ===

export function usePeerStatistics(age: number, monthlyIncome: number) {
  return useQuery({
    queryKey: ['peer-statistics', age, monthlyIncome],
    queryFn: () => api.get<import('@/types/finance').PeerStatistics>(
      `/statistics/peers?age=${age}&monthlyIncome=${monthlyIncome}`,
    ),
    enabled: age > 0 && monthlyIncome > 0,
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// === Admin ===

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-users', page, limit],
    queryFn: () => api.get<AdminUsersResponse>(`/admin/users?page=${page}&limit=${limit}`),
  });
}

export function useAdminQuizzes() {
  return useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: () => api.get<AdminQuizzesResponse>('/admin/quizzes'),
  });
}

export function useUpdateAdminConstant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch<AdminConstantUpdate>(`/admin/constants/${key}`, { value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['constants'] });
    },
  });
}
