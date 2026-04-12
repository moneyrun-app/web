'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Constants, AdminUsersResponse, AdminQuizzesResponse, AdminConstantUpdate,
  AdminBooksResponse, AdminBookDetailResponse,
  CreateBookRequest, UpdateBookRequest, UpdateChaptersRequest, AdminBook, AdminBookChapter,
} from '@/types/api';
import type { SimulationInput, SimulationResult, FinanceProfile, FinanceProfileUpdateResponse } from '@/types/finance';
import type {
  PacemakerToday,
  QuizAnswerResponse,
  WrongNote,
  DetailedReportsResponse,
  DetailedReport,
  ExternalScrap,
  FeedbackType,
} from '@/types/book';
import type { QuizScrapResponse, QuizLevelResponse, AttendanceStreak, AttendanceHistory } from '@/types/quiz';
import type { BooksResponse, BookDetail, PurchaseResponse } from '@/types/money-book';
import type { MyBookOverview, BookReader, Highlight, AddHighlightRequest, HighlightsResponse, GenerateFromScrapsResponse, MyBookScrapsResponse } from '@/types/my-book';

// === Constants (비로그인) ===

export function useConstants() {
  return useQuery({
    queryKey: ['constants'],
    queryFn: () => api.get<Constants>('/constants'),
    staleTime: 1000 * 60 * 60,
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

export function useSendFeedback() {
  return useMutation({
    mutationFn: (body: { messageId: string; type: FeedbackType; content: string }) =>
      api.post('/pacemaker/feedback', body),
  });
}

// === Quiz ===

export function useAnswerQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answer }: { quizId: string; answer: number }) =>
      api.post<QuizAnswerResponse>(`/quiz/${quizId}/answer`, { answer }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacemaker-today'] });
    },
  });
}

export function useScrapQuiz() {
  return useMutation({
    mutationFn: ({ quizId, note }: { quizId: string; note?: string }) =>
      api.post<QuizScrapResponse>(`/quiz/${quizId}/scrap`, { note }),
  });
}

export function useUpdateQuizLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (level: number) =>
      api.patch<QuizLevelResponse>('/quiz/level', { level }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacemaker-today'] });
    },
  });
}

// === Attendance ===

export function useAttendanceStreak() {
  return useQuery({
    queryKey: ['attendance-streak'],
    queryFn: () => api.get<AttendanceStreak>('/attendance/streak'),
  });
}

export function useAttendanceHistory(month: string) {
  return useQuery({
    queryKey: ['attendance-history', month],
    queryFn: () => api.get<AttendanceHistory>(`/attendance/history?month=${month}`),
    enabled: !!month,
  });
}

// === Wrong Notes ===

export function useWrongNotes(enabled = true) {
  return useQuery({
    queryKey: ['wrong-notes'],
    queryFn: () => api.get<{ wrongNotes: WrongNote[] }>('/my-book/wrong-notes'),
    enabled,
  });
}

// === Detailed Reports ===

export function useDetailedReportStatus() {
  return useQuery({
    queryKey: ['detailed-report-status'],
    queryFn: () => api.get<{ status: 'generating' | 'completed' | 'none'; reportId: string | null }>('/book/detailed-reports/status'),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'generating' ? 3000 : false;
    },
  });
}

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

// === External Scraps (URL) ===

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
      qc.invalidateQueries({ queryKey: ['my-book-scraps'] });
    },
  });
}

export function useDeleteScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/book/scraps/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraps'] });
      qc.invalidateQueries({ queryKey: ['my-book-scraps'] });
    },
  });
}

// === MoneyBook (서점) ===

export function useMoneyBooks(category?: string) {
  return useQuery({
    queryKey: ['money-books', category],
    queryFn: () => api.get<BooksResponse>(category ? `/money-book?category=${category}` : '/money-book'),
  });
}

export function useMoneyBook(id: string) {
  return useQuery({
    queryKey: ['money-book', id],
    queryFn: () => api.get<BookDetail>(`/money-book/${id}`),
    enabled: !!id,
  });
}

export function usePurchaseBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, extraData }: { bookId: string; extraData: Record<string, unknown> }) =>
      api.post<PurchaseResponse>(`/money-book/${bookId}/purchase`, { extraData }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['money-books'] });
      qc.invalidateQueries({ queryKey: ['my-book-overview'] });
    },
  });
}

// === MyBook (내 서재) ===

export function useMyBookOverview() {
  return useQuery({
    queryKey: ['my-book-overview'],
    queryFn: () => api.get<MyBookOverview>('/my-book/overview'),
  });
}

export function useBookReader(purchaseId: string) {
  return useQuery({
    queryKey: ['book-reader', purchaseId],
    queryFn: () => api.get<BookReader>(`/my-book/books/${purchaseId}`),
    enabled: !!purchaseId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useAddHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, ...body }: AddHighlightRequest & { purchaseId: string }) =>
      api.post<Highlight>(`/my-book/books/${purchaseId}/highlights`, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['book-reader', variables.purchaseId] });
      qc.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

export function useDeleteHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/my-book/highlights/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book-reader'] });
      qc.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

export function useHighlights(color?: string) {
  return useQuery({
    queryKey: ['highlights', color],
    queryFn: () => api.get<HighlightsResponse>(color ? `/my-book/highlights?color=${color}` : '/my-book/highlights'),
  });
}

export function useGenerateFromScraps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<GenerateFromScrapsResponse>('/my-book/generate-from-scraps'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-book-overview'] });
    },
  });
}

export function useMyBookScraps(type?: 'url' | 'quiz') {
  return useQuery({
    queryKey: ['my-book-scraps', type],
    queryFn: () => api.get<MyBookScrapsResponse>(type ? `/my-book/scraps?type=${type}` : '/my-book/scraps'),
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
    staleTime: 1000 * 60 * 10,
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

// === Admin MoneyBook ===

export function useAdminBooks() {
  return useQuery({
    queryKey: ['admin-books'],
    queryFn: () => api.get<BooksResponse>('/money-book'),
  });
}

export function useAdminBookDetail(id: string) {
  return useQuery({
    queryKey: ['admin-book', id],
    queryFn: () => api.get<AdminBookDetailResponse>(`/admin/money-book/${id}`),
    enabled: !!id,
  });
}

export function useCreateAdminBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookRequest) =>
      api.post<AdminBook>('/admin/money-book', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}

export function useUpdateAdminBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateBookRequest & { id: string }) =>
      api.put<AdminBook>(`/admin/money-book/${id}`, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
      qc.invalidateQueries({ queryKey: ['admin-book', variables.id] });
    },
  });
}

export function useDeleteAdminBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/money-book/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}

export function useUpdateAdminChapters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, chapters }: UpdateChaptersRequest & { bookId: string }) =>
      api.put<{ chapters: AdminBookChapter[] }>(`/admin/money-book/${bookId}/chapters`, { chapters }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-book', variables.bookId] });
      qc.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}
