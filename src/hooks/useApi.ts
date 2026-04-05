'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Constants } from '@/types/api';
import type { SimulationInput, SimulationResult, FinanceProfile, FinanceProfileUpdateResponse } from '@/types/finance';
import type {
  PacemakerToday,
  QuizAnswerResponse,
  WrongNote,
  WrongNoteRetryResponse,
  WeeklyReview,
  WeeklyReviewStatus,
  DetailedReportsResponse,
  DetailedReport,
  WeeklyReportListItem,
  WeeklyReport,
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
    mutationFn: (body: Partial<SimulationInput>) =>
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
    mutationFn: ({ quizId, userAnswer }: { quizId: string; userAnswer: boolean }) =>
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

// === Weekly Review ===

export function useWeeklyReviews() {
  return useQuery({
    queryKey: ['weekly-reviews'],
    queryFn: () => api.get<WeeklyReview[]>('/pacemaker/weekly-reviews'),
  });
}

// === Wrong Notes (오답노트) ===

export function useWrongNotes() {
  return useQuery({
    queryKey: ['wrong-notes'],
    queryFn: () => api.get<WrongNote[]>('/book/wrong-notes'),
  });
}

export function useRetryWrongNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userAnswer }: { id: string; userAnswer: boolean }) =>
      api.post<WrongNoteRetryResponse>(`/book/wrong-notes/${id}/retry`, { userAnswer }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wrong-notes'] });
    },
  });
}

export function useSubmitWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { weekStart: string; weekEnd: string; status: WeeklyReviewStatus; amount: number }) =>
      api.post<WeeklyReview>('/pacemaker/weekly-review', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-reviews'] });
    },
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

// === Book: Weekly Reports ===

export function useWeeklyReports() {
  return useQuery({
    queryKey: ['weekly-reports'],
    queryFn: () => api.get<WeeklyReportListItem[]>('/book/weekly-reports'),
  });
}

export function useWeeklyReport(id: string) {
  return useQuery({
    queryKey: ['weekly-report', id],
    queryFn: () => api.get<WeeklyReport>(`/book/weekly-reports/${id}`),
    enabled: !!id,
  });
}

export function useCreateWeeklyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { weekStatus: { overallFeeling: string; memo: string } }) =>
      api.post<WeeklyReport>('/book/weekly-reports', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-reports'] });
    },
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
