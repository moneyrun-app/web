'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePacemakerToday, useTodayQuiz, useAnswerQuiz, useScrapQuiz, useUpdateQuizLevel, useMyBookOverview, useCourseGenerateStatus } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import GradeBadge from '@/components/common/GradeBadge';
import Markdown from '@/components/common/Markdown';
import { useFinanceStore } from '@/store/financeStore';
import { useRouter } from 'next/navigation';
import { Flame, Check, BookmarkPlus, BookmarkCheck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, AlertCircle, BookOpen, Loader2, Lightbulb, Users } from 'lucide-react';
import type { QuizAnswerResponse } from '@/types/book';
import type { TodayQuizData } from '@/types/quiz';

const QUIZ_STORAGE_KEY = 'moneyrun_today_quiz';

interface SavedQuiz {
  date: string;
  quizId: string;
  quizCode?: string;
  question: string;
  choices: string[];
  hint?: string | null;
  difficultyLevel: number;
  difficultyLabel?: string;
  totalAttempts?: number;
  correctRate?: number;
  result: QuizAnswerResponse;
  scrapped: boolean;
}

function loadSavedQuiz(): SavedQuiz | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const saved: SavedQuiz = JSON.parse(raw);
    if (saved.date !== new Date().toISOString().slice(0, 10)) {
      sessionStorage.removeItem(QUIZ_STORAGE_KEY);
      return null;
    }
    return saved;
  } catch { return null; }
}

function saveQuiz(quiz: TodayQuizData, result: QuizAnswerResponse) {
  const data: SavedQuiz = {
    date: new Date().toISOString().slice(0, 10),
    quizId: quiz.id,
    quizCode: quiz.quizCode,
    question: quiz.question,
    choices: quiz.choices,
    hint: quiz.hint,
    difficultyLevel: quiz.difficultyLevel,
    difficultyLabel: quiz.difficultyLabel,
    totalAttempts: quiz.totalAttempts,
    correctRate: quiz.correctRate,
    result,
    scrapped: false,
  };
  sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data));
}

function markScrapped() {
  try {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    const saved: SavedQuiz = JSON.parse(raw);
    saved.scrapped = true;
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(saved));
  } catch { /* noop */ }
}

export default function PacemakerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = usePacemakerToday();
  const { data: quizData, isLoading: quizLoading } = useTodayQuiz();
  const { data: overviewData } = useMyBookOverview();
  const generatingBook = overviewData?.purchasedBooks?.find((b) => b.status === 'generating');
  const { data: genStatus } = useCourseGenerateStatus(generatingBook?.purchaseId ?? null);
  const isGenerating = !!generatingBook;
  const currentGrade = useFinanceStore((s) => s.grade);
  const answerQuiz = useAnswerQuiz();
  const scrapQuiz = useScrapQuiz();
  const updateLevel = useUpdateQuizLevel();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizAnswerResponse | null>(null);
  const [answeredQuizId, setAnsweredQuizId] = useState<string | null>(null);
  const [savedQuiz, setSavedQuiz] = useState<SavedQuiz | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // 페이지 로드 시 sessionStorage에서 오늘 푼 퀴즈 복원
  useEffect(() => {
    const stored = loadSavedQuiz();
    if (stored) {
      setSavedQuiz(stored);
    }
  }, []);

  // 마이북 생성 완료 시 → 전체 새로고침
  useEffect(() => {
    if (genStatus?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['pacemaker-today'] });
      queryClient.invalidateQueries({ queryKey: ['my-book-overview'] });
      queryClient.invalidateQueries({ queryKey: ['active-course'] });
    }
  }, [genStatus?.status, queryClient]);

  if (isLoading || quizLoading) {
    return (
      <div className="space-y-4 animate-pulse" role="status" aria-label="로딩 중">
        <div className="h-8 w-40 bg-surface rounded-full" />
        <div className="h-32 bg-surface rounded-2xl" />
        <div className="h-48 bg-surface rounded-2xl" />
        <div className="h-24 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const todayQuiz = quizData?.quiz ?? null;
  const solvedToday = quizData?.solvedToday ?? false;
  const attendance = data.attendance ?? { checkedToday: false, currentStreak: 0, totalDays: 0 };
  const hasActiveCourse = !!data.activeCourse;
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !todayQuiz) return;
    const quizId = todayQuiz.id;
    const quizSnapshot = todayQuiz; // 캡처: invalidate 후 todayQuiz가 null이 될 수 있음
    answerQuiz.mutate({ quizId, answer: selectedAnswer }, {
      onSuccess: (result) => {
        setAnsweredQuizId(quizId);
        setQuizResult(result);
        saveQuiz(quizSnapshot, result);
        setSavedQuiz({
          date: new Date().toISOString().slice(0, 10),
          quizId,
          quizCode: quizSnapshot.quizCode,
          question: quizSnapshot.question,
          choices: quizSnapshot.choices,
          hint: quizSnapshot.hint,
          difficultyLevel: quizSnapshot.difficultyLevel,
          difficultyLabel: quizSnapshot.difficultyLabel,
          totalAttempts: quizSnapshot.totalAttempts,
          correctRate: quizSnapshot.correctRate,
          result,
          scrapped: false,
        });
        queryClient.invalidateQueries({ queryKey: ['pacemaker-today'] });
      },
    });
  };

  const handleScrap = () => {
    const qid = todayQuiz?.id ?? answeredQuizId ?? savedQuiz?.quizId;
    if (!qid) return;
    scrapQuiz.mutate({ quizId: qid }, {
      onSuccess: () => {
        markScrapped();
        setSavedQuiz(prev => prev ? { ...prev, scrapped: true } : null);
      },
    });
  };

  const handleLevelChange = (direction: 'up' | 'down') => {
    const currentLevel = todayQuiz?.difficultyLevel ?? savedQuiz?.difficultyLevel ?? quizData?.currentLevel;
    if (currentLevel == null) return;
    const newLevel = direction === 'up'
      ? Math.min(3, currentLevel + 1)
      : Math.max(1, currentLevel - 1);
    updateLevel.mutate(newLevel, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pacemaker-today'] });
        queryClient.invalidateQueries({ queryKey: ['today-quiz'] });
      },
    });
  };



  /* ─── 코스 미선택 유저 ─── */
  if (!hasActiveCourse) {
    /* 마이북 생성 중이면 → 생성 진행 화면 */
    if (isGenerating) {
      const progress = genStatus?.progress;
      return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <Loader2 size={40} className="text-accent" />
          </motion.div>

          <h1 className="text-xl font-bold text-foreground mb-2">
            {generatingBook?.bookTitle || '마이북 생성 중'}
          </h1>

          <motion.p
            key={progress?.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-sub mb-6"
          >
            {progress?.step || '마이북을 생성하고 있습니다...'}
          </motion.p>

          <div className="w-full max-w-xs">
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                animate={{ width: `${progress?.percent ?? 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            {progress && (
              <p className="text-3xs text-placeholder text-center mt-1.5">
                {progress.chaptersDone}/{progress.totalChapters} 챕터
              </p>
            )}
          </div>
        </div>
      );
    }

    /* 생성 중 아님 → 코스 선택 유도 */
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <BookOpen size={36} className="text-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl font-bold text-foreground mb-2"
        >
          나만의 코스를 시작해보세요
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-sub mb-8 max-w-xs leading-relaxed"
        >
          관심 분야를 골라 맞춤 코스를 시작하면<br />매일 퀴즈와 미션이 제공돼요
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs"
        >
          <button
            onClick={() => router.push('/course/select')}
            className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <BookOpen size={18} />
            코스 선택하러 가기
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── 일반 페이스메이커 화면 ─── */
  const aiCards = data.cards ?? [];
  const hasQuizCard = !!todayQuiz || !!savedQuiz || solvedToday;
  const totalCards = aiCards.length + (hasQuizCard ? 1 : 0);
  const quizCardIndex = aiCards.length; // AI 카드 뒤 (6번째)
  const isQuizCard = hasQuizCard && cardIndex === quizCardIndex;
  const aiCardIdx = cardIndex;

  return (
    <div className="space-y-4">
      {/* 출석 현황 */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-xs">
        <Flame size={14} className="text-orange-500" />
        <span className="font-semibold">{attendance.currentStreak}일 연속</span>
        <span className="text-sub">· 누적 {attendance.totalDays}일</span>
      </div>

      {/* 코스 진도 / 마이북 생성 중 */}
      {data.activeCourse && (
        isGenerating ? (
          <div className="w-full bg-accent/5 border-2 border-accent/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={16} className="text-accent animate-spin" />
              <span className="text-sm font-bold text-accent">{data.activeCourse.title}</span>
            </div>
            <motion.p
              key={genStatus?.progress?.step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-sub mb-2"
            >
              {genStatus?.progress?.step || '마이북을 생성하고 있습니다...'}
            </motion.p>
            <div className="h-1.5 bg-accent/20 rounded-full overflow-hidden mb-1">
              <motion.div
                className="h-full bg-accent rounded-full"
                animate={{ width: `${genStatus?.progress?.percent ?? 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            {genStatus?.progress && (
              <p className="text-3xs text-placeholder">{genStatus.progress.chaptersDone}/{genStatus.progress.totalChapters} 챕터</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push('/course/missions')}
            className="w-full text-left bg-background border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-accent" />
              <span className="text-sm font-bold text-foreground">{data.activeCourse.title}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${data.activeCourse.missionSummary.total > 0 ? (data.activeCourse.missionSummary.completed / data.activeCourse.missionSummary.total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-sub">
                {data.activeCourse.currentChapter}/{data.activeCourse.totalChapters}장 · 미션 {data.activeCourse.missionSummary.completed}/{data.activeCourse.missionSummary.total}개
              </span>
              <span className="text-xs font-medium text-accent">미션 보기 →</span>
            </div>
          </button>
        )
      )}

      {/* AI 카드 스와이프 */}
      {totalCards > 0 ? (
        <>
          {/* 카드 영역 */}
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm bg-background">
            {/* 상단 바: 등급 + 테마 + 카드 인디케이터 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                {isQuizCard ? (
                  <>
                    <Zap size={16} className="text-accent" />
                    <span className="text-xs font-bold">오늘의 퀴즈</span>
                  </>
                ) : (
                  <>
                    {currentGrade && <GradeBadge grade={currentGrade} size="sm" />}
                    {data.theme && <span className="text-xs text-sub">{data.theme}</span>}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isQuizCard && (todayQuiz?.difficultyLabel || savedQuiz?.difficultyLabel) && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {todayQuiz?.difficultyLabel || savedQuiz?.difficultyLabel}
                  </span>
                )}
                <span className="text-xs text-placeholder">{cardIndex + 1} / {totalCards}</span>
              </div>
            </div>

            {/* 카드 콘텐츠 */}
            <div className="px-5 pb-5">
              <AnimatePresence mode="wait" custom={swipeDir}>
                <motion.div
                  key={cardIndex}
                  custom={swipeDir}
                  initial={{ x: swipeDir > 0 ? 200 : -200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: swipeDir > 0 ? -200 : 200, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 && cardIndex < totalCards - 1) {
                      setSwipeDir(1);
                      setCardIndex(cardIndex + 1);
                    } else if (info.offset.x > 60 && cardIndex > 0) {
                      setSwipeDir(-1);
                      setCardIndex(cardIndex - 1);
                    }
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  {isQuizCard ? (
                    <div>
                      {/* 미풀이: 인터랙티브 퀴즈 */}
                      {todayQuiz && !solvedToday && !quizResult && !savedQuiz ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {todayQuiz.quizCode && (
                              <span className="text-3xs text-placeholder font-mono">{todayQuiz.quizCode}</span>
                            )}
                            {todayQuiz.totalAttempts > 0 && (
                              <span className="inline-flex items-center gap-1 text-3xs text-sub">
                                <Users size={10} />
                                {todayQuiz.totalAttempts}명 참여 · 정답률 {Math.round(todayQuiz.correctRate)}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground mb-3">{todayQuiz.question}</p>
                          {todayQuiz.hint && (
                            <div className="mb-3">
                              {!showHint ? (
                                <button
                                  onClick={() => setShowHint(true)}
                                  className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
                                >
                                  <Lightbulb size={12} />
                                  힌트 보기
                                </button>
                              ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Lightbulb size={12} className="text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">힌트</span>
                                  </div>
                                  <p className="text-xs text-yellow-800 dark:text-yellow-200">{todayQuiz.hint}</p>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="space-y-2 mb-3">
                            {todayQuiz.choices.map((choice, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedAnswer(i)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                                  selectedAnswer === i
                                    ? 'border-accent bg-accent/5 font-semibold'
                                    : 'border-border bg-surface hover:border-foreground/20'
                                }`}
                              >
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                                  selectedAnswer === i ? 'bg-accent text-white' : 'bg-foreground/10 text-foreground'
                                }`}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {choice}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null || answerQuiz.isPending}
                            className="w-full h-11 bg-foreground text-background text-sm font-bold rounded-xl disabled:opacity-20 transition-opacity"
                          >
                            {answerQuiz.isPending ? '채점 중...' : '제출하기'}
                          </button>
                        </div>
                      ) : (quizResult || savedQuiz) ? (
                        /* 풀이 완료: 결과 + 해설 */
                        (() => {
                          const qr = quizResult || savedQuiz?.result;
                          const qChoices = savedQuiz?.choices || todayQuiz?.choices;
                          const qQuestion = savedQuiz?.question || todayQuiz?.question;
                          const qLevel = savedQuiz?.difficultyLevel || todayQuiz?.difficultyLevel;
                          if (!qr) return null;
                          const isCorrect = qr.correct;
                          const isScrapped = savedQuiz?.scrapped || scrapQuiz.isSuccess;
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{isCorrect ? '🎉' : '🤔'}</span>
                                <h3 className="text-base font-bold text-foreground">
                                  {isCorrect ? '정답!' : '오답 — 다음엔 맞출 수 있어요'}
                                </h3>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-2">{qQuestion}</p>
                              {!isCorrect && qChoices && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-sub">정답:</span>
                                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {String.fromCharCode(65 + qr.correctAnswer)}. {qChoices[qr.correctAnswer]}
                                  </span>
                                </div>
                              )}
                              <div className="rounded-xl bg-surface p-3 mb-3">
                                <p className="text-xs font-semibold text-sub mb-1">{isCorrect ? '해설' : '정답 해설'}</p>
                                <div className="text-sm leading-relaxed text-foreground/80">
                                  <Markdown>{isCorrect ? qr.briefExplanation : qr.detailedExplanation}</Markdown>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isScrapped ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-accent bg-accent/10 text-accent">
                                    <BookmarkCheck size={14} />
                                    스크랩 완료
                                  </span>
                                ) : (
                                  <button
                                    onClick={handleScrap}
                                    disabled={scrapQuiz.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-surface transition-colors"
                                  >
                                    <BookmarkPlus size={14} />
                                    {scrapQuiz.isPending ? '저장 중...' : '스크랩'}
                                  </button>
                                )}
                                {!isCorrect && (
                                  <button
                                    onClick={() => router.push('/my-book/wrong-notes')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                                  >
                                    <AlertCircle size={14} />
                                    오답노트
                                  </button>
                                )}
                              </div>
                              {((isCorrect && qLevel != null && qLevel < 3) ||
                                (!isCorrect && qLevel != null && qLevel > 1)) && (
                                <div className="mt-3 bg-accent/5 rounded-xl p-3 border border-accent/20">
                                  <p className="text-xs text-sub mb-2">
                                    {isCorrect ? '난이도를 올려볼까요?' : '난이도를 낮춰볼까요?'}
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleLevelChange(isCorrect ? 'up' : 'down')}
                                      disabled={updateLevel.isPending || updateLevel.isSuccess}
                                      className="flex-1 h-9 flex items-center justify-center gap-1 text-xs font-bold rounded-lg bg-accent text-white disabled:opacity-50"
                                    >
                                      {updateLevel.isSuccess ? <Check size={14} /> : isCorrect ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                      {updateLevel.isSuccess ? '변경 완료' : updateLevel.isPending ? '변경 중...' : isCorrect ? '올리기' : '낮추기'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : todayQuiz ? (
                        /* 이미 풀었지만 결과 데이터 없음 — 문제 내용은 표시 */
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Check size={20} className="text-green-500" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">풀이 완료</span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-3">{todayQuiz.question}</p>
                          <div className="space-y-2">
                            {todayQuiz.choices.map((choice, i) => (
                              <div
                                key={i}
                                className="w-full text-left px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground/70"
                              >
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 bg-foreground/10 text-foreground">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {choice}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <Check size={28} className="text-green-500 mb-2" />
                          <p className="text-sm font-medium text-foreground">오늘의 퀴즈 완료!</p>
                        </div>
                      )}
                    </div>
                  ) : aiCardIdx >= 0 && aiCardIdx < aiCards.length ? (
                    /* AI 카드 */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{aiCards[aiCardIdx].emoji}</span>
                        <h3 className="text-base font-bold text-foreground">{aiCards[aiCardIdx].title}</h3>
                      </div>
                      <div className="text-sm leading-relaxed text-foreground/80">
                        <Markdown>{aiCards[aiCardIdx].content}</Markdown>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex items-center justify-between px-5 pb-5">
              <button
                onClick={() => { setSwipeDir(-1); setCardIndex(Math.max(0, cardIndex - 1)); }}
                disabled={cardIndex === 0}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface text-sub disabled:opacity-20 transition-opacity"
              >
                <ChevronLeft size={18} />
              </button>

              {/* 도트 인디케이터 */}
              <div className="flex gap-1.5">
                {Array.from({ length: totalCards }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSwipeDir(i > cardIndex ? 1 : -1); setCardIndex(i); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === cardIndex ? 'bg-accent w-4' : 'bg-border'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => { setSwipeDir(1); setCardIndex(Math.min(totalCards - 1, cardIndex + 1)); }}
                disabled={cardIndex === totalCards - 1}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface text-sub disabled:opacity-20 transition-opacity"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* 명언 */}
          {data.quote && (
            <blockquote className="border-l-2 border-accent pl-3 text-xs text-sub italic">
              {data.quote}
            </blockquote>
          )}
        </>
      ) : data.message ? (
        /* message 폴백 (cards가 아직 없을 때) */
        <div className="bg-background border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
          {data.grade && (
            <div className="flex items-center gap-2">
              <GradeBadge grade={data.grade} size="sm" />
              {data.theme && <span className="text-xs text-sub">{data.theme}</span>}
            </div>
          )}
          <div className="text-sm leading-relaxed">
            <Markdown>{data.message}</Markdown>
          </div>
          {data.quote && (
            <blockquote className="border-l-2 border-accent pl-3 text-xs text-sub italic">
              {data.quote}
            </blockquote>
          )}
        </div>
      ) : null}
    </div>
  );
}
