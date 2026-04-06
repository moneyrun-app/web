'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Constants } from '@/types/api';
import type { SimulationInput, SimulationResult, FinanceProfile, FinanceProfileUpdateResponse, OnboardingRequest, OnboardingResponse } from '@/types/finance';
import type {
  PacemakerToday,
  QuizAnswerResponse,
  WrongNote,
  DailyCheck,
  DailyCheckStatus,
  DetailedReportsResponse,
  DetailedReport,
  MonthlyReportListItem,
  MonthlyReport,
  ExternalScrap,
  LearnContentListItem,
  LearnContent,
  FeedbackType,
} from '@/types/book';

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

export function useCompleteAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) =>
      api.post(`/pacemaker/actions/${actionId}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacemaker-today'] });
    },
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
    queryFn: () => api.get<DailyCheck[]>(`/pacemaker/daily-checks?month=${month}`),
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

// === Wrong Notes (오답노트) ===

export function useWrongNotes() {
  return useQuery({
    queryKey: ['wrong-notes'],
    queryFn: () => api.get<WrongNote[]>('/book/wrong-notes'),
  });
}


// === Book: Detailed Reports ===

export function useDetailedReports() {
  return useQuery({
    queryKey: ['detailed-reports'],
    queryFn: () => api.get<DetailedReportsResponse>('/book/detailed-reports'),
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

export function useMonthlyReports() {
  return useQuery({
    queryKey: ['monthly-reports'],
    queryFn: () => api.get<MonthlyReportListItem[]>('/book/monthly-reports'),
  });
}

export function useMonthlyReport(id: string) {
  return useQuery({
    queryKey: ['monthly-report', id],
    queryFn: () => api.get<MonthlyReport>(`/book/monthly-reports/${id}`),
    enabled: !!id,
  });
}

// === Book: Scraps ===

export function useScraps() {
  return useQuery({
    queryKey: ['scraps'],
    queryFn: () => api.get<ExternalScrap[]>('/book/scraps'),
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
