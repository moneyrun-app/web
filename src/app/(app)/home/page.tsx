'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { usePacemakerToday, useCompleteAction, useWeeklyReviews, useSubmitWeeklyReview, useAnswerQuiz } from '@/hooks/useApi';
import { formatWonRaw } from '@/lib/format';
import GradeBadge from '@/components/common/GradeBadge';
import WeeklyReviewModal from '@/components/pacemaker/WeeklyReviewModal';
import { MessageCircle } from 'lucide-react';
import type { WeeklyReviewStatus, Quiz } from '@/types/book';

/** 월~일 기준 주차 계산 (마지막 주 ≤3일이면 이전 주에 합침) */
function getMonthWeeks(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const dow = firstOfMonth.getDay();
  const daysBack = dow === 0 ? 6 : dow - 1;
  const firstMonday = new Date(year, month, 1 - daysBack);

  const weeks: { start: Date; end: Date }[] = [];
  const cursor = new Date(firstMonday);

  while (cursor <= lastOfMonth) {
    const sunday = new Date(cursor);
    sunday.setDate(sunday.getDate() + 6);
    weeks.push({ start: new Date(cursor), end: new Date(sunday) });
    cursor.setDate(cursor.getDate() + 7);
  }

  if (weeks.length > 1) {
    const last = weeks[weeks.length - 1];
    const startInMonth = last.start < firstOfMonth ? firstOfMonth : last.start;
    const endInMonth = last.end > lastOfMonth ? lastOfMonth : last.end;
    const daysInMonth = Math.round((endInMonth.getTime() - startInMonth.getTime()) / 86400000) + 1;
    if (daysInMonth <= 3) {
      weeks[weeks.length - 2].end = last.end;
      weeks.pop();
    }
  }

  return weeks;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const trackColors: Record<WeeklyReviewStatus, { bg: string; fill: string }> = {
  under: { bg: 'bg-grade-green/20', fill: 'bg-grade-green/30' },
  on: { bg: 'bg-grade-yellow/20', fill: 'bg-grade-yellow/30' },
  over: { bg: 'bg-grade-red/20', fill: 'bg-grade-red/30' },
};

export default function HomePage() {
  const { variableCost } = useFinanceStore();
  const { data: pm, isLoading, error } = usePacemakerToday();
  const { data: reviews } = useWeeklyReviews();
  const completeMutation = useCompleteAction();
  const submitReview = useSubmitWeeklyReview();
  const answerQuiz = useAnswerQuiz();

  const [reviewWeek, setReviewWeek] = useState<{ start: Date; end: Date } | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isSunday = now.getDay() === 0;
  const weeks = getMonthWeeks(now);

  const reviewMap = new Map<string, { status: WeeklyReviewStatus; amount: number }>();
  (reviews ?? []).forEach((r) => {
    const key = r.weekStart.slice(0, 10);
    reviewMap.set(key, { status: r.status, amount: r.amount });
  });

  // 로딩 단계별 문구
  const loadingSteps = [
    '오늘의 메시지 준비 중...',
    'AI가 너한테 맞는 메시지 고르는 중...',
    '거의 다 됐어...',
    '조금만 기다려줘...',
    '열심히 고르고 있어...',
  ];
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isLoading) { setLoadingStep(0); return; }
    const timers = [
      setTimeout(() => setLoadingStep(1), 3000),
      setTimeout(() => setLoadingStep(2), 8000),
      setTimeout(() => setLoadingStep(3), 20000),
      setTimeout(() => setLoadingStep(4), 40000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // 퀴즈 답변 처리
  const handleQuizAnswer = (quiz: Quiz, userAnswer: boolean) => {
    if (answeredIds.has(quiz.id)) return;
    answerQuiz.mutate(
      { quizId: quiz.id, userAnswer },
      {
        onSuccess: (res) => {
          setQuizResult({ correct: res.correct, explanation: res.explanation });
          setAnsweredIds((prev) => new Set(prev).add(quiz.id));
        },
      },
    );
  };

  const nextQuiz = () => {
    setQuizResult(null);
    setQuizIndex((i) => i + 1);
  };

  const quizzes = pm?.quizzes ?? [];
  const currentQuiz = quizzes[quizIndex];
  const allDone = quizIndex >= quizzes.length;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      {pm && (
        <div className="flex items-center gap-2">
          <GradeBadge grade={pm.grade} />
        </div>
      )}

      {/* Track */}
      <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        {weeks.map((week, i) => {
          const totalDays = Math.round((week.end.getTime() - week.start.getTime()) / 86400000) + 1;
          const isCurrent = todayDate >= week.start && todayDate <= week.end;
          const isPast = todayDate > week.end;
          const daysSinceStart = Math.round((todayDate.getTime() - week.start.getTime()) / 86400000);
          const progress = isCurrent
            ? ((daysSinceStart + 1) / totalDays) * 100
            : isPast ? 100 : 0;

          const weekKey = toDateStr(week.start);
          const review = reviewMap.get(weekKey);
          const canReview = isCurrent && isSunday && !review;

          const startLabel = `${week.start.getMonth() + 1}/${week.start.getDate()}`;
          const endLabel = `${week.end.getMonth() + 1}/${week.end.getDate()}`;

          const trackBg = review
            ? trackColors[review.status].fill
            : isPast ? 'bg-foreground/5' : isCurrent ? 'bg-grade-main/10' : '';

          return (
            <div key={i}>
              {i > 0 && <div className="h-px bg-foreground/10 my-3" />}
              <div
                className={`relative h-7 bg-surface rounded-full overflow-hidden ${canReview ? 'cursor-pointer' : ''}`}
                onClick={canReview ? () => setReviewWeek(week) : undefined}
              >
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${trackBg}`}
                  style={{ width: review ? '100%' : `${progress}%` }}
                />
                {Array.from({ length: totalDays - 1 }, (_, d) => (
                  <div
                    key={d}
                    className="absolute inset-y-0 w-px bg-foreground/15"
                    style={{ left: `${((d + 1) / totalDays) * 100}%` }}
                  />
                ))}
                {isCurrent && !review && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-base leading-none drop-shadow-sm transition-all duration-500"
                    style={{ left: `${progress}%` }}
                  >
                    🏃‍➡️
                  </div>
                )}
                {canReview && (
                  <div
                    className="absolute inset-y-0 rounded-r-full animate-pulse bg-grade-yellow/40"
                    style={{
                      left: `${((totalDays - 1) / totalDays) * 100}%`,
                      width: `${(1 / totalDays) * 100}%`,
                    }}
                  />
                )}
                {isPast && !review && (
                  <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="var(--grade-green)" opacity="0.2" />
                      <path d="M4 7l2 2 4-4" stroke="var(--grade-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-0.5 px-0.5">
                <span className="text-[10px] text-placeholder/60">{startLabel}</span>
                <span className="text-[10px] text-placeholder/60">{endLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 내 페이스 */}
      <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3.5">내 페이스</h3>
        <div className="flex gap-4">
          {[
            { label: '하루', amount: variableCost.daily },
            { label: '주간', amount: variableCost.weekly },
            { label: '월간', amount: variableCost.monthly },
          ].map((item) => (
            <div key={item.label} className="flex-1 bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-1">{item.label}</p>
              <p className="text-sm md:text-base font-bold">{formatWonRaw(Math.floor(item.amount / 1000) * 1000)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 페이스메이커 메시지 */}
      <div className="bg-grade-yellow-bg rounded-2xl p-5 md:p-7 space-y-3">
        <p className="text-caption font-semibold text-grade-yellow-text">오늘의 한마디</p>
        {isLoading ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-grade-yellow border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-sm text-foreground animate-[fadeIn_300ms_ease-out]" key={loadingStep}>
              {loadingSteps[loadingStep]}
            </p>
          </div>
        ) : error || !pm ? (
          <button onClick={() => window.location.reload()} className="text-sm text-sub hover:text-foreground transition-colors">
            메시지를 불러오지 못했어요 · 다시 시도
          </button>
        ) : (
          <p className="text-body-lg md:text-base text-foreground leading-relaxed">{pm.message}</p>
        )}
      </div>

      {/* 오늘의 퀴즈 */}
      {pm && quizzes.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">오늘의 퀴즈</h3>
            <span className="text-[10px] text-placeholder">{Math.min(quizIndex + 1, quizzes.length)} / {quizzes.length}</span>
          </div>

          {allDone ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-medium text-foreground">오늘 퀴즈 완료!</p>
              <p className="text-xs text-sub mt-1">틀린 문제는 마이북 &gt; 오답노트에서 확인하세요</p>
            </div>
          ) : currentQuiz && (
            <div>
              {/* 문제 */}
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-xs text-placeholder mb-1">{currentQuiz.category} · {currentQuiz.source}</p>
                <p className="text-sm font-medium text-foreground leading-relaxed">{currentQuiz.question}</p>
              </div>

              {/* 결과 표시 */}
              {quizResult ? (
                <div className="space-y-3 animate-[fadeIn_300ms_ease-out]">
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${quizResult.correct ? 'bg-grade-green-bg' : 'bg-grade-red-bg'}`}>
                    <span className="text-lg">{quizResult.correct ? '✅' : '❌'}</span>
                    <div>
                      <p className={`text-sm font-semibold ${quizResult.correct ? 'text-grade-green-text' : 'text-grade-red-text'}`}>
                        {quizResult.correct ? '정답!' : '오답!'}
                      </p>
                      <p className="text-xs text-sub mt-0.5">{quizResult.explanation}</p>
                    </div>
                  </div>
                  <button
                    onClick={nextQuiz}
                    className="w-full h-11 rounded-xl text-sm font-medium bg-foreground text-white hover:opacity-90 transition-opacity"
                  >
                    다음 문제
                  </button>
                </div>
              ) : (
                /* O / X 버튼 */
                <div className="flex gap-3">
                  <button
                    onClick={() => handleQuizAnswer(currentQuiz, true)}
                    disabled={answerQuiz.isPending}
                    className="flex-1 h-14 rounded-xl text-xl font-bold bg-grade-green-bg text-grade-green-text hover:bg-grade-green/20 transition-colors disabled:opacity-50"
                  >
                    ⭕ O
                  </button>
                  <button
                    onClick={() => handleQuizAnswer(currentQuiz, false)}
                    disabled={answerQuiz.isPending}
                    className="flex-1 h-14 rounded-xl text-xl font-bold bg-grade-red-bg text-grade-red-text hover:bg-grade-red/20 transition-colors disabled:opacity-50"
                  >
                    ❌ X
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 추천 행동 */}
      {pm && (pm.actions ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">추천 행동</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(pm.actions ?? []).map((action) => (
              <div key={action.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-foreground mb-3">{action.title}</p>
                <div className="flex gap-2">
                  {action.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => completeMutation.mutate(action.id)}
                        disabled={completeMutation.isPending}
                        className="h-11 px-3 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity"
                      >
                        {action.label}
                      </button>
                      <button className="h-11 px-3 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors">
                        다음에
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-grade-green font-medium">완료!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-2xs text-placeholder">{pm?.disclaimer}</p>
        <button aria-label="피드백 보내기" className="inline-flex items-center gap-1 text-2xs text-sub hover:text-foreground transition-colors">
          <MessageCircle size={12} />
          피드백
        </button>
      </div>

      {/* 주간 리뷰 모달 */}
      <WeeklyReviewModal
        open={!!reviewWeek}
        weekStart={reviewWeek?.start ?? new Date()}
        weekEnd={reviewWeek?.end ?? new Date()}
        weeklyBudget={variableCost.weekly}
        dailyBudget={variableCost.daily}
        isPending={submitReview.isPending}
        onClose={() => setReviewWeek(null)}
        onSubmit={(status, amount) => {
          if (!reviewWeek) return;
          submitReview.mutate(
            {
              weekStart: toDateStr(reviewWeek.start),
              weekEnd: toDateStr(reviewWeek.end),
              status,
              amount,
            },
            { onSuccess: () => setReviewWeek(null) },
          );
        }}
      />
    </div>
  );
}
