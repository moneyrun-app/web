'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { usePacemakerToday, useCompleteAction, useDailyChecks, useSubmitDailyCheck, useAnswerQuiz } from '@/hooks/useApi';
import { formatWonRaw } from '@/lib/format';
import GradeBadge from '@/components/common/GradeBadge';
import type { DailyCheckStatus, Quiz } from '@/types/book';

/** 7일씩 나누기: 1~7, 8~14, ..., 마지막 주는 남은 일수 */
function getMonthWeeks(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks: { start: number; end: number }[] = [];

  let day = 1;
  while (day <= lastDay) {
    const end = Math.min(day + 6, lastDay);
    weeks.push({ start: day, end });
    day = end + 1;
  }
  return { weeks, year, month, lastDay };
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
  const { variableCost } = useFinanceStore();
  const { data: pm, isLoading, error } = usePacemakerToday();
  const completeMutation = useCompleteAction();
  const answerQuiz = useAnswerQuiz();

  const [checkDate, setCheckDate] = useState<number | null>(null);
  const [checkStatus, setCheckStatus] = useState<DailyCheckStatus | null>(null);
  const [checkAmount, setCheckAmount] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const now = new Date();
  const today = now.getDate();
  const { weeks, year, month } = getMonthWeeks(now);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { data: dailyChecks } = useDailyChecks(monthStr);
  const submitCheck = useSubmitDailyCheck();

  const checkMap = new Map<string, { status: DailyCheckStatus; amount: number }>();
  (dailyChecks ?? []).forEach((c) => checkMap.set(c.date.slice(0, 10), { status: c.status, amount: c.amount }));

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
      {/* 페이스메이커 메시지 */}
      <div className="bg-grade-yellow-bg rounded-2xl p-5 md:p-7 space-y-3">
        <div className="flex items-center gap-2">
          {pm && <GradeBadge grade={pm.grade} />}
          <p className="text-caption font-semibold text-grade-yellow-text">페이스메이커</p>
        </div>
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

      {/* Track */}
      <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        {weeks.map((week, wi) => {
          const days = Array.from({ length: week.end - week.start + 1 }, (_, i) => week.start + i);
          const totalDays = days.length;
          const dailyBudget = Math.floor(variableCost.daily / 1000) * 1000;
          const weeklyBudget = Math.floor(variableCost.weekly / 1000) * 1000;
          const monthlyBudget = Math.floor(variableCost.monthly / 1000) * 1000;
          return (
            <div key={wi}>
              {wi > 0 && <div className="h-px bg-foreground/10 my-3" />}
              <div className="relative">
              {/* 툴팁 */}
              {hoverDay !== null && days.includes(hoverDay) && (() => {
                const idx = hoverDay - week.start;
                const check = checkMap.get(toDateStr(new Date(year, month, hoverDay)));
                const isToday = hoverDay === today;
                const leftPct = ((idx + 0.5) / 7) * 100;
                return (
                  <div
                    className="absolute -top-2 -translate-y-full -translate-x-1/2 px-3 py-2 bg-foreground text-white text-[10px] rounded-lg whitespace-nowrap z-20 space-y-0.5 pointer-events-none animate-[fadeIn_150ms_ease-out]"
                    style={{ left: `${Math.max(10, Math.min(90, leftPct))}%` }}
                  >
                    <p className="font-semibold text-xs">{month + 1}월 {hoverDay}일</p>
                    {check ? (
                      <p>{check.status === 'green' ? `${formatWonRaw(check.amount)} 절약 ✅` : check.status === 'red' ? `${formatWonRaw(check.amount)} 초과 🔴` : '예산 내 소비 🟡'}</p>
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
              {/* 트랙 바 */}
              <div className="h-7 bg-surface rounded-full overflow-hidden flex">
                {days.map((day) => {
                  const dateStr = toDateStr(new Date(year, month, day));
                  const check = checkMap.get(dateStr);
                  const isToday = day === today;
                  const isFuture = day > today;
                  const canTap = !isFuture;

                  const colorClass = check
                    ? check.status === 'green' ? 'bg-grade-green' : check.status === 'yellow' ? 'bg-grade-yellow' : 'bg-grade-red'
                    : isToday ? 'bg-foreground/30 animate-pulse' : isFuture ? 'bg-transparent' : 'bg-foreground/10';

                  return (
                    <button
                      key={day}
                      disabled={isFuture}
                      onClick={canTap ? () => setCheckDate(day) : undefined}
                      onMouseEnter={!isFuture ? () => setHoverDay(day) : undefined}
                      onMouseLeave={() => setHoverDay(null)}
                      className={`h-full ${colorClass} ${canTap && !check ? 'hover:bg-foreground/20' : ''} transition-colors border-r border-foreground/15 last:border-r-0`}
                      style={{ width: `${100 / 7}%` }}
                    />
                  );
                })}
              </div>
              </div>
              <div className="flex justify-between mt-0.5 px-0.5">
                <span className="text-[10px] text-placeholder/60">{week.start}일</span>
                <span className="text-[10px] text-placeholder/60">{week.end}일</span>
              </div>
            </div>
          );
        })}
      </div>


      {/* 오늘의 퀴즈 */}
      {pm && quizzes.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
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
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-[10px] text-placeholder mb-1">{currentQuiz.category} · {currentQuiz.source}</p>
                <p className="text-sm font-medium text-foreground leading-relaxed">{currentQuiz.question}</p>
              </div>

              {quizResult ? (
                <div className="space-y-3 animate-[fadeIn_300ms_ease-out]">
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${quizResult.correct ? 'bg-grade-green-bg' : 'bg-grade-red-bg'}`}>
                    <span className="text-base">{quizResult.correct ? '✅' : '❌'}</span>
                    <div>
                      <p className={`text-xs font-semibold ${quizResult.correct ? 'text-grade-green-text' : 'text-grade-red-text'}`}>
                        {quizResult.correct ? '정답!' : '오답!'}
                      </p>
                      <p className="text-xs text-sub mt-0.5">{quizResult.explanation}</p>
                    </div>
                  </div>
                  <button
                    onClick={nextQuiz}
                    className="w-full h-10 rounded-xl text-sm font-medium bg-foreground text-white hover:opacity-90 transition-opacity"
                  >
                    다음 문제
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleQuizAnswer(currentQuiz, true)}
                    disabled={answerQuiz.isPending}
                    className="flex-1 h-12 rounded-xl text-lg font-bold bg-grade-green-bg text-grade-green-text hover:bg-grade-green/20 transition-colors disabled:opacity-50"
                  >
                    O
                  </button>
                  <button
                    onClick={() => handleQuizAnswer(currentQuiz, false)}
                    disabled={answerQuiz.isPending}
                    className="flex-1 h-12 rounded-xl text-lg font-bold bg-grade-red-bg text-grade-red-text hover:bg-grade-red/20 transition-colors disabled:opacity-50"
                  >
                    X
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


      {/* 일별 체크 모달 */}
      {checkDate !== null && (() => {
        const dailyBudgetCheon = Math.floor(variableCost.daily / 1000);
        const currentCheon = parseInt(checkAmount) || 0;
        const dailyBudgetWon = Math.floor(variableCost.daily / 1000) * 1000;
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4">
            <div className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]" onClick={() => { setCheckDate(null); setCheckStatus(null); setCheckAmount(''); }} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 animate-[slideUp_300ms_ease-out] space-y-3">
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
                    readOnly
                    value={checkAmount && currentCheon > 0 ? formatCheonWon(currentCheon) : ''}
                    onKeyDown={(e) => {
                      if (e.key >= '0' && e.key <= '9') {
                        const next = parseInt((checkAmount || '') + e.key) || 0;
                        if (checkStatus === 'green' && next > dailyBudgetCheon) { setCheckAmount(String(dailyBudgetCheon)); return; }
                        if (checkStatus === 'red' && next > 10000) { setCheckAmount('10000'); return; }
                        setCheckAmount((p) => p + e.key);
                      } else if (e.key === 'Backspace') {
                        setCheckAmount((p) => p.slice(0, -1));
                      }
                    }}
                    placeholder={checkStatus === 'green' ? `최대 ${formatCheonWon(dailyBudgetCheon)}` : '금액 입력'}
                    autoFocus
                    className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-foreground text-center font-bold placeholder:text-placeholder/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 caret-transparent"
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
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-foreground hover:opacity-90 transition-opacity disabled:bg-disabled disabled:text-sub"
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
