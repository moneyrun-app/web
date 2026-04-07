'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { usePacemakerToday, useDailyChecks, useSubmitDailyCheck, useAnswerQuiz, useMonthlyFinalizeStatus, useMonthlyFinalize, useCancelFinalize } from '@/hooks/useApi';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatWonRaw } from '@/lib/format';
import GradeBadge from '@/components/common/GradeBadge';
import type { DailyCheckStatus, Quiz } from '@/types/book';
import Markdown from '@/components/common/Markdown';
import { ChevronLeft, ChevronRight, Lock, Unlock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── TrackWeek (memo) ─── */

interface TrackWeekProps {
  week: { start: number; end: number };
  wi: number;
  month: number;
  year: number;
  today: number;
  isCurrentMonth: boolean;
  todayDate: number;
  hoverDay: number | null;
  checkMap: Map<string, { status: DailyCheckStatus; amount: number }>;
  variableCost: { daily: number; weekly: number; monthly: number };
  onCheckDate: (day: number) => void;
  onHoverDay: (day: number | null) => void;
}

const TrackWeek = memo(function TrackWeek({
  week, wi, month, year, today, isCurrentMonth, todayDate,
  hoverDay, checkMap, variableCost, onCheckDate, onHoverDay,
}: TrackWeekProps) {
  const days = Array.from({ length: week.end - week.start + 1 }, (_, i) => week.start + i);
  const dailyBudget = Math.floor(variableCost.daily / 1000) * 1000;
  const weeklyBudget = Math.floor(variableCost.weekly / 1000) * 1000;
  const monthlyBudget = Math.floor(variableCost.monthly / 1000) * 1000;

  return (
    <div>
      {wi > 0 && <div className="h-px bg-foreground/10 my-3" />}
      <div className="relative">
        {hoverDay !== null && days.includes(hoverDay) && (() => {
          const idx = hoverDay - week.start;
          const check = checkMap.get(toDateStr(new Date(year, month, hoverDay)));
          const isToday = hoverDay === today;
          const leftPct = ((idx + 0.5) / 7) * 100;
          return (
            <div
              className="absolute -top-2 -translate-y-full -translate-x-1/2 px-3 py-2 bg-foreground text-background text-3xs rounded-lg whitespace-nowrap z-20 space-y-0.5 pointer-events-none animate-[fadeIn_150ms_ease-out]"
              style={{ left: `${Math.max(10, Math.min(90, leftPct))}%` }}
            >
              <p className="font-semibold text-xs">{month + 1}월 {hoverDay}일</p>
              {check ? (
                <p>{check.status === 'green' ? `${formatWonRaw(check.amount)} 절약` : check.status === 'red' ? `${formatWonRaw(check.amount)} 초과` : '예산 내 소비'}</p>
              ) : (
                <p>{isToday ? '클릭해서 체크하기' : '미체크'}</p>
              )}
              <div className="border-t border-white/20 pt-0.5 mt-0.5">
                <p>하루 {formatWonRaw(dailyBudget)} · 주간 {formatWonRaw(weeklyBudget)} · 월 {formatWonRaw(monthlyBudget)}</p>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[4px] border-t-foreground" />
            </div>
          );
        })()}
        <div className="h-11 bg-surface rounded-full overflow-hidden flex" style={{ width: `${(days.length / 7) * 100}%` }}>
          {days.map((day) => {
            const dateStr = toDateStr(new Date(year, month, day));
            const check = checkMap.get(dateStr);
            const isToday = isCurrentMonth && day === todayDate;
            const isFuture = isCurrentMonth ? day > todayDate : false;
            const canTap = !isFuture;
            const colorClass = check
              ? check.status === 'green' ? 'bg-grade-green' : check.status === 'yellow' ? 'bg-grade-yellow' : 'bg-grade-red'
              : isToday ? 'bg-foreground/30 animate-pulse' : isFuture ? 'bg-transparent' : 'bg-foreground/10';
            return (
              <button
                key={day}
                disabled={isFuture}
                aria-label={`${month + 1}월 ${day}일 ${check ? (check.status === 'green' ? '절약' : check.status === 'red' ? '초과' : '예산 내') : isToday ? '오늘' : '미체크'}`}
                onClick={canTap ? () => onCheckDate(day) : undefined}
                onMouseEnter={!isFuture ? () => onHoverDay(day) : undefined}
                onMouseLeave={() => onHoverDay(null)}
                className={`h-full ${colorClass} ${canTap && !check ? 'hover:bg-foreground/20' : ''} transition-colors border-r border-foreground/15 last:border-r-0`}
                style={{ width: `${100 / days.length}%` }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-0.5 px-0.5" style={{ width: `${(days.length / 7) * 100}%` }}>
        <span className="text-3xs text-placeholder/60">{week.start}일</span>
        <span className="text-3xs text-placeholder/60">{week.end}일</span>
      </div>
    </div>
  );
});

// 트랙 시작 월 폴백 (유저 가입일 없을 때)
const TRACK_FALLBACK_YEAR = 2026;
const TRACK_FALLBACK_MONTH = 0; // 0-indexed: 0 = 1월

/** 7일씩 나누기: 1~7, 8~14, ..., 마지막 주는 남은 일수 */
function getMonthWeeks(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks: { start: number; end: number }[] = [];

  let day = 1;
  while (day <= lastDay) {
    const end = Math.min(day + 6, lastDay);
    weeks.push({ start: day, end });
    day = end + 1;
  }
  return { weeks, lastDay };
}

function formatCheonWon(n: number): string {
  const man = Math.floor(n / 10);
  const cheon = n % 10;
  if (man > 0 && cheon > 0) return `${man}만 ${cheon}천원`;
  if (man > 0) return `${man}만원`;
  return `${cheon}천원`;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HomePage() {
  const router = useRouter();
  const { variableCost } = useFinanceStore();
  const { data: pm, isLoading, error } = usePacemakerToday();
  const answerQuiz = useAnswerQuiz();
  const checkModalRef = useFocusTrap<HTMLDivElement>();

  const [checkDate, setCheckDate] = useState<number | null>(null);
  const [checkStatus, setCheckStatus] = useState<DailyCheckStatus | null>(null);
  const [checkAmount, setCheckAmount] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; correctAnswer: number; userAnswer: number; briefExplanation: string; detailedExplanation: string } | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [showDetail, setShowDetail] = useState(false);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [trackKey, setTrackKey] = useState(0);

  // 확정 관련
  const { data: finalizeStatus } = useMonthlyFinalizeStatus();
  const finalizeMut = useMonthlyFinalize();
  const cancelFinalizeMut = useCancelFinalize();
  const [showFinalizeModal, setShowFinalizeModal] = useState<'confirm' | 'warning' | 'cancel' | null>(null);

  const now = new Date();
  const todayDate = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 트랙 월 네비게이션
  const [trackYear, setTrackYear] = useState(currentYear);
  const [trackMonth, setTrackMonth] = useState(currentMonth);
  const isCurrentMonth = trackYear === currentYear && trackMonth === currentMonth;
  // 트랙 시작월: unfinalizedMonths의 가장 빠른 월 또는 currentMonth
  const earliestMonth = (finalizeStatus?.unfinalizedMonths ?? []).length > 0
    ? finalizeStatus!.unfinalizedMonths[0]
    : finalizeStatus?.currentMonth.month ?? `${TRACK_FALLBACK_YEAR}-${String(TRACK_FALLBACK_MONTH + 1).padStart(2, '0')}`;
  const [startY, startM] = earliestMonth.split('-').map(Number);
  const isStartMonth = trackYear === startY && trackMonth === startM - 1;

  const today = isCurrentMonth ? todayDate : 0; // 현재 월이 아니면 today 하이라이트 없음
  const { weeks } = getMonthWeeks(trackYear, trackMonth);
  const year = trackYear;
  const month = trackMonth;

  const goToPrevMonth = useCallback(() => {
    if (isStartMonth) return;
    setSlideDir('right');
    setTrackKey((k) => k + 1);
    setTrackMonth((m) => {
      if (m === 0) { setTrackYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, [isStartMonth]);

  const goToNextMonth = useCallback(() => {
    if (isCurrentMonth) return;
    setSlideDir('left');
    setTrackKey((k) => k + 1);
    setTrackMonth((m) => {
      if (m === 11) { setTrackYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, [isCurrentMonth]);

  // 스와이프 지원
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) goToNextMonth();
    else goToPrevMonth();
  };

  const monthStr = `${trackYear}-${String(trackMonth + 1).padStart(2, '0')}`;
  const { data: dailyChecks } = useDailyChecks(monthStr);
  const submitCheck = useSubmitDailyCheck();

  const checkMap = new Map<string, { status: DailyCheckStatus; amount: number }>();
  (dailyChecks?.days ?? []).forEach((c) => checkMap.set(c.date.slice(0, 10), { status: c.status, amount: c.amount }));

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
  const handleQuizAnswer = useCallback((quiz: Quiz, choiceIndex: number) => {
    if (answeredIds.has(quiz.id)) return;
    answerQuiz.mutate(
      { quizId: quiz.id, userAnswer: choiceIndex },
      {
        onSuccess: (res) => {
          setQuizResult({ correct: res.correct, correctAnswer: res.correctAnswer, userAnswer: res.userAnswer, briefExplanation: res.briefExplanation, detailedExplanation: res.detailedExplanation });
          setAnsweredIds((prev) => new Set(prev).add(quiz.id));
        },
      },
    );
  }, [answeredIds, answerQuiz]);

  const nextQuiz = useCallback(() => {
    setQuizResult(null);
    setShowDetail(false);
    setQuizIndex((i) => i + 1);
  }, []);

  // ESC로 일별 체크 모달 닫기
  useEffect(() => {
    if (checkDate === null) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCheckDate(null); setCheckStatus(null); setCheckAmount(''); }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [checkDate]);

  const quizzes = pm?.quizzes ?? [];
  const currentQuiz = quizzes[quizIndex];
  const allDone = quizIndex >= quizzes.length;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* 페이스메이커 메시지 — 최상단 */}
      <section aria-label="페이스메이커 메시지" className="bg-grade-yellow-bg rounded-2xl p-5 md:p-7 space-y-3">
        <div className="flex items-center gap-2">
          {pm && <GradeBadge grade={pm.grade} />}
          <p className="text-caption font-semibold text-grade-yellow-text">페이스메이커</p>
          {pm?.theme && (
            <span className="ml-auto text-3xs px-2 py-0.5 rounded-full bg-foreground/10 text-sub font-medium">
              {pm.theme}
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center gap-3 py-2">
            <div role="status" aria-label="메시지 로딩 중" className="w-5 h-5 border-2 border-grade-yellow border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-sm text-foreground animate-[fadeIn_300ms_ease-out]" key={loadingStep}>
              {loadingSteps[loadingStep]}
            </p>
          </div>
        ) : error || !pm ? (
          <button onClick={() => window.location.reload()} className="text-sm text-sub hover:text-foreground transition-colors">
            메시지를 불러오지 못했어요 · 다시 시도
          </button>
        ) : (
          <>
            <p className="text-body-lg md:text-base text-foreground leading-relaxed">{pm.message}</p>
            {pm.quote && (
              <p className="text-xs text-sub italic border-l-2 border-foreground/20 pl-3 mt-2">
                {pm.quote}
              </p>
            )}
          </>
        )}
      </section>

      {/* Track */}
      <section
        aria-label="월간 소비 트랙"
        className="bg-background border border-border rounded-2xl p-4 md:p-6 shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrevMonth}
            disabled={isStartMonth}
            aria-label="이전 달"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors disabled:opacity-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">
            {trackYear}년 {trackMonth + 1}월
          </p>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            aria-label="다음 달"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors disabled:opacity-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div
          key={trackKey}
          className="overflow-hidden"
          style={{
            animation: slideDir
              ? `${slideDir === 'left' ? 'slideInLeft' : 'slideInRight'} 250ms ease-out`
              : undefined,
          }}
        >
        {(() => {
          // 현재 보고 있는 트랙 월의 확정 상태 판단
          const viewingMonthStr = `${trackYear}-${String(trackMonth + 1).padStart(2, '0')}`;
          const isViewingCurrentMonth = finalizeStatus?.currentMonth.month === viewingMonthStr;
          const isViewingFinalized = isViewingCurrentMonth
            ? finalizeStatus?.currentMonth.finalized
            : !(finalizeStatus?.unfinalizedMonths ?? []).includes(viewingMonthStr);
          const isViewingReportCreated = isViewingCurrentMonth
            ? !!finalizeStatus?.currentMonth.reportId
            : false;
          // 과거 월이고 unfinalizedMonths에 없으면 확정된 것
          const isPastMonth = !isCurrentMonth;
          const isPastUnfinalized = isPastMonth && (finalizeStatus?.unfinalizedMonths ?? []).includes(viewingMonthStr);

          return weeks.map((week, wi) => (
            <TrackWeek
              key={wi}
              week={week}
              wi={wi}
              month={month}
              year={year}
              today={today}
              isCurrentMonth={isCurrentMonth}
              todayDate={todayDate}
              hoverDay={hoverDay}
              checkMap={checkMap}
              variableCost={variableCost}
              onCheckDate={(day) => {
                // 확정된 월은 tile 클릭 차단 (리포트 생성 전이면 취소 안내)
                if (isViewingFinalized && !isViewingReportCreated) {
                  setShowFinalizeModal('cancel');
                  return;
                }
                if (isViewingFinalized && isViewingReportCreated) {
                  return; // 리포트 생성 후 완전 차단
                }
                setCheckDate(day);
              }}
              onHoverDay={setHoverDay}
            />
          ));
        })()}

        {/* 확정 버튼 영역 */}
        {finalizeStatus && (() => {
          const viewingMonthStr = `${trackYear}-${String(trackMonth + 1).padStart(2, '0')}`;
          const isViewingCurrentMonth = finalizeStatus.currentMonth.month === viewingMonthStr;
          const currentFinalized = isViewingCurrentMonth && finalizeStatus.currentMonth.finalized;
          const currentReportCreated = isViewingCurrentMonth && !!finalizeStatus.currentMonth.reportId;
          const unfinalized = finalizeStatus.unfinalizedMonths ?? [];

          // 과거 월을 보고 있고 미확정이면 확정 가능
          const isPastMonth = !isCurrentMonth;
          const isPastUnfinalized = isPastMonth && unfinalized.includes(viewingMonthStr);
          // 과거 월을 보고 있고 확정됐으면 (unfinalizedMonths에 없음)
          const isPastFinalized = isPastMonth && !unfinalized.includes(viewingMonthStr);
          // 과거 확정 월의 리포트 상태: pendingReport와 매칭
          const isPastPendingReport = isPastFinalized && finalizeStatus.pendingReport?.month === viewingMonthStr;

          // 당월: 말일이고 미확정일 때만
          // 과거: 미확정이면 언제든 가능
          const canFinalize = (isViewingCurrentMonth && finalizeStatus.currentMonth.isLastDay && !currentFinalized) || isPastUnfinalized;
          // 당월 확정 취소
          const canCancelFinalize = (currentFinalized && !currentReportCreated) || isPastPendingReport;
          const pendingReport = finalizeStatus.pendingReport;

          return (
            <div className="mt-4 pt-3 border-t border-border">
              {/* 당월 뷰에서 과거 미확정 월 알림 */}
              {isViewingCurrentMonth && unfinalized.length > 0 && (
                <div className="bg-grade-yellow-bg rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-grade-yellow-text mb-1">미확정 월이 있어요</p>
                  <p className="text-xs text-sub">
                    {unfinalized.map((m) => {
                      const [, mm] = m.split('-');
                      return `${parseInt(mm)}월`;
                    }).join(', ')}의 소비가 아직 확정되지 않았어요.
                  </p>
                  <button
                    onClick={() => {
                      // 가장 오래된 미확정 월로 이동
                      const oldest = unfinalized[0];
                      const [y, m] = oldest.split('-').map(Number);
                      setTrackYear(y);
                      setTrackMonth(m - 1);
                    }}
                    className="text-xs text-accent font-medium mt-1.5 hover:underline"
                  >
                    확정하러 가기
                  </button>
                </div>
              )}

              {/* 확정됨 + 리포트 미생성 → 확정 취소 가능 */}
              {canCancelFinalize && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock size={14} className="text-accent" />
                    <span className="text-xs text-sub">확정됨 · 리포트 생성 대기 중</span>
                  </div>
                  <button
                    onClick={() => setShowFinalizeModal('cancel')}
                    className="text-xs text-accent hover:underline"
                  >
                    확정 취소
                  </button>
                </div>
              )}

              {/* 확정됨 + 리포트 생성 완료 */}
              {((currentFinalized && currentReportCreated) || (isPastFinalized && !isPastPendingReport)) && (
                <div className="flex items-center gap-1.5">
                  <Lock size={14} className="text-grade-green-text" />
                  <span className="text-xs text-sub">확정 완료{isPastFinalized && !isPastPendingReport ? '' : ' · 리포트 생성됨'}</span>
                </div>
              )}

              {/* 확정 버튼 */}
              {canFinalize && (
                <button
                  onClick={() => {
                    // 현재 확정하려는 월보다 이전인 미확정 월만 자동확정 대상
                    const priorUnfinalized = unfinalized.filter((m) => m < viewingMonthStr);
                    if (priorUnfinalized.length > 0 || pendingReport) {
                      setShowFinalizeModal('warning');
                    } else {
                      setShowFinalizeModal('confirm');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold border border-accent text-accent hover:bg-accent/5 transition-colors"
                >
                  <Lock size={12} />
                  {isCurrentMonth ? '이번 달 소비 확정' : `${trackMonth + 1}월 소비 확정`}
                </button>
              )}
            </div>
          );
        })()}
        </div>
      </section>

      {/* 오늘의 퀴즈 */}
      {pm && quizzes.length > 0 && (
        <section aria-label="오늘의 퀴즈" className="bg-background border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">오늘의 퀴즈</h2>
            <span className="text-3xs text-placeholder">{Math.min(quizIndex + 1, quizzes.length)} / {quizzes.length}</span>
          </div>

          <div aria-live="polite" aria-atomic="true">
          {allDone ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-medium text-foreground">오늘 퀴즈 완료!</p>
              <p className="text-xs text-sub mt-1">틀린 문제는 마이북 &gt; 오답노트에서 확인하세요</p>
            </div>
          ) : currentQuiz && (
            <div>
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-3xs text-placeholder mb-1">{currentQuiz.category} · {currentQuiz.source}</p>
                <p className="text-sm font-medium text-foreground leading-relaxed">{currentQuiz.question}</p>
              </div>

              {quizResult ? (
                <div className="space-y-3 animate-[fadeIn_300ms_ease-out]">
                  {/* 보기 결과 표시 */}
                  <div className="space-y-2">
                    {currentQuiz.choices.map((choice, i) => {
                      const idx = i + 1;
                      const isCorrect = idx === quizResult.correctAnswer;
                      const isUserPick = idx === quizResult.userAnswer;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm ${
                            isCorrect
                              ? 'border-grade-green bg-grade-green-bg'
                              : isUserPick
                                ? 'border-grade-red bg-grade-red-bg'
                                : 'border-border bg-background'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full text-3xs font-bold flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-grade-green text-white' : isUserPick ? 'bg-grade-red text-white' : 'bg-surface text-sub'
                          }`}>{idx}</span>
                          <span className={isCorrect ? 'font-semibold text-grade-green-text' : isUserPick ? 'text-grade-red-text' : 'text-sub'}>{choice}</span>
                        </div>

                      );
                    })}
                  </div>
                  {/* 설명 */}
                  <div className={`px-3 py-2.5 rounded-xl ${quizResult.correct ? 'bg-grade-green-bg' : 'bg-grade-red-bg'}`}>
                    <p className={`text-xs font-semibold ${quizResult.correct ? 'text-grade-green-text' : 'text-grade-red-text'}`}>
                      {quizResult.correct ? '정답!' : '오답!'}
                    </p>
                    <div className="text-xs text-sub mt-0.5 prose prose-sm max-w-none"><Markdown>{quizResult.briefExplanation}</Markdown></div>
                    {showDetail && (
                      <div className="text-xs text-sub mt-2 leading-relaxed prose prose-sm max-w-none">
                        <Markdown>{quizResult.detailedExplanation}</Markdown>
                      </div>
                    )}
                    <button onClick={() => setShowDetail(!showDetail)} className="text-xs text-accent mt-1.5 py-1.5 px-2 -ml-2 rounded-lg hover:bg-accent/5 transition-colors">
                      {showDetail ? '접기' : '자세히 보기'}
                    </button>
                  </div>
                  <button
                    onClick={nextQuiz}
                    className="w-full h-10 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                  >
                    다음 문제
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentQuiz.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(currentQuiz, i + 1)}
                      disabled={answerQuiz.isPending}
                      className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border bg-background text-left text-sm hover:border-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
                    >
                      <span className="w-5 h-5 rounded-full bg-surface text-3xs font-bold text-sub flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-foreground">{choice}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      )}

      {/* 확정 모달 */}
      {showFinalizeModal && finalizeStatus && (() => {
        const viewingMonthStr = `${trackYear}-${String(trackMonth + 1).padStart(2, '0')}`;
        const viewingLabel = `${trackMonth + 1}월`;
        // 현재 확정하려는 월보다 이전 미확정 월만 (자동확정 대상)
        const priorUnfinalized = (finalizeStatus.unfinalizedMonths ?? []).filter((m) => m < viewingMonthStr);
        const pending = finalizeStatus.pendingReport;

        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-4 pb-20 md:pb-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFinalizeModal(null)} />
            <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-sm p-5 animate-[slideUp_300ms_ease-out] space-y-4">

              {/* 확정 확인 */}
              {showFinalizeModal === 'confirm' && (
                <>
                  <h3 className="text-base font-bold">{viewingLabel} 소비 확정</h3>
                  <p className="text-sm text-sub">확정하면 {viewingLabel} 데일리 기록을 수정할 수 없어요. 월간 리포트를 생성할 수 있게 됩니다.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowFinalizeModal(null)} className="flex-1 h-11 rounded-xl text-sm font-medium bg-surface text-foreground">
                      취소
                    </button>
                    <button
                      onClick={() => {
                        finalizeMut.mutate({ month: viewingMonthStr }, {
                          onSuccess: () => setShowFinalizeModal(null),
                        });
                      }}
                      disabled={finalizeMut.isPending}
                      className="flex-1 h-11 rounded-xl text-sm font-semibold bg-accent text-white disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {finalizeMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                      확정하기
                    </button>
                  </div>
                </>
              )}

              {/* 경고: 미확정 월 + 미생성 리포트 */}
              {showFinalizeModal === 'warning' && (
                <>
                  <h3 className="text-base font-bold">확인이 필요해요</h3>

                  {priorUnfinalized.length > 0 && (
                    <div className="bg-grade-yellow-bg rounded-xl p-3">
                      <p className="text-sm font-medium text-grade-yellow-text mb-1">미확정 월 자동 확정</p>
                      <p className="text-xs text-sub">
                        {priorUnfinalized.map((m) => {
                          const mm = parseInt(m.split('-')[1]);
                          return `${mm}월`;
                        }).join(', ')}이 함께 확정됩니다.
                      </p>
                    </div>
                  )}

                  {pending && (
                    <div className="bg-grade-red-bg rounded-xl p-3">
                      <p className="text-sm font-medium text-grade-red-text mb-1">미생성 리포트 소멸</p>
                      <p className="text-xs text-sub">
                        {pending.month.split('-')[1]}월 리포트를 아직 생성하지 않았어요. 지금 확정하면 해당 리포트는 사라져요.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setShowFinalizeModal(null)} className="flex-1 h-11 rounded-xl text-sm font-medium bg-surface text-foreground">
                      취소
                    </button>
                    <button
                      onClick={() => {
                        finalizeMut.mutate({ month: viewingMonthStr }, {
                          onSuccess: () => setShowFinalizeModal(null),
                        });
                      }}
                      disabled={finalizeMut.isPending}
                      className="flex-1 h-11 rounded-xl text-sm font-semibold bg-accent text-white disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {finalizeMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                      확정하기
                    </button>
                  </div>
                  {pending && (
                    <button
                      onClick={() => {
                        setShowFinalizeModal(null);
                        router.push('/book');
                      }}
                      className="w-full text-xs text-sub text-center py-1 hover:text-foreground transition-colors"
                    >
                      {parseInt(pending.month.split('-')[1])}월 리포트 먼저 만들기
                    </button>
                  )}
                </>
              )}

              {/* 확정 취소 */}
              {showFinalizeModal === 'cancel' && (
                <>
                  <h3 className="text-base font-bold">확정 취소</h3>
                  <p className="text-sm text-sub">확정을 취소하면 데일리 기록을 다시 수정할 수 있어요. 수정 후 다시 확정해주세요.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowFinalizeModal(null)} className="flex-1 h-11 rounded-xl text-sm font-medium bg-surface text-foreground">
                      닫기
                    </button>
                    <button
                      onClick={() => {
                        const monthToCancel = finalizeStatus.currentMonth.finalized
                          ? finalizeStatus.currentMonth.month
                          : viewingMonthStr;
                        cancelFinalizeMut.mutate({ month: monthToCancel }, {
                          onSuccess: () => setShowFinalizeModal(null),
                        });
                      }}
                      disabled={cancelFinalizeMut.isPending}
                      className="flex-1 h-11 rounded-xl text-sm font-semibold bg-grade-red-text text-white disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {cancelFinalizeMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                      확정 취소
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* 일별 체크 모달 */}
      {checkDate !== null && (() => {
        const dailyBudgetCheon = Math.floor(variableCost.daily / 1000);
        const currentCheon = parseInt(checkAmount) || 0;
        const dailyBudgetWon = Math.floor(variableCost.daily / 1000) * 1000;
        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-4 pb-20 md:pb-4" role="dialog" aria-modal="true" aria-label={`${month + 1}월 ${checkDate}일 체크`} ref={checkModalRef}>
            <div className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]" onClick={() => { setCheckDate(null); setCheckStatus(null); setCheckAmount(''); }} />
            <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-sm p-4 animate-[slideUp_300ms_ease-out] space-y-3">
              {/* 헤더 한줄 */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{month + 1}월 {checkDate}일 어땠어요?</p>
                <p className="text-xs text-sub">하루 예산 {formatWonRaw(dailyBudgetWon)}</p>
              </div>

              {/* 상태 선택 */}
              <div className="flex gap-2">
                {([['green', '덜 썼어요', 'bg-grade-green'], ['yellow', '딱 맞았어요', 'bg-grade-yellow'], ['red', '더 썼어요', 'bg-grade-red']] as const).map(([status, label, bg]) => (
                  <button
                    key={status}
                    onClick={() => { setCheckStatus(status); setCheckAmount(''); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      checkStatus === status ? `${bg} text-white` : 'bg-surface text-sub hover:bg-surface/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 금액 입력 (덜/더 썼을 때만) */}
              {checkStatus && checkStatus !== 'yellow' && (
                <div className="animate-[fadeIn_200ms_ease-out]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={checkAmount && currentCheon > 0 ? formatCheonWon(currentCheon) : ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' || e.key === 'Escape') return;
                      e.preventDefault();
                      if (e.key >= '0' && e.key <= '9') {
                        const next = parseInt((checkAmount || '') + e.key) || 0;
                        if (checkStatus === 'green' && next > dailyBudgetCheon) { setCheckAmount(String(dailyBudgetCheon)); return; }
                        if (checkStatus === 'red' && next > 10000) { setCheckAmount('10000'); return; }
                        setCheckAmount((p) => p + e.key);
                      } else if (e.key === 'Backspace') {
                        setCheckAmount((p) => p.slice(0, -1));
                      }
                    }}
                    onChange={() => {}}
                    placeholder={checkStatus === 'green' ? `최대 ${formatCheonWon(dailyBudgetCheon)}` : '금액 입력'}
                    autoFocus
                    className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-foreground text-center font-bold placeholder:text-placeholder/40 focus:outline-none focus:ring-2 focus:ring-foreground/10"
                  />
                </div>
              )}

              {/* 기록하기 버튼 */}
              {checkStatus && (
                <button
                  onClick={() => {
                    const amountWon = checkStatus === 'yellow' ? 0 : (parseInt(checkAmount) || 0) * 1000;
                    submitCheck.mutate(
                      { date: toDateStr(new Date(year, month, checkDate)), status: checkStatus, amount: amountWon },
                      { onSuccess: () => { setCheckDate(null); setCheckStatus(null); setCheckAmount(''); } },
                    );
                  }}
                  disabled={submitCheck.isPending || (checkStatus !== 'yellow' && (!checkAmount || parseInt(checkAmount) <= 0))}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-background bg-foreground hover:opacity-90 transition-opacity disabled:bg-disabled disabled:text-sub"
                >
                  기록하기
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
