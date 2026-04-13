'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePacemakerToday, useTodayQuiz, useAnswerQuiz, useScrapQuiz, useUpdateQuizLevel } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import GradeBadge from '@/components/common/GradeBadge';
import Markdown from '@/components/common/Markdown';
import { useFinanceStore } from '@/store/financeStore';
import { useRouter } from 'next/navigation';
import { Flame, Check, BookmarkPlus, BookmarkCheck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, AlertCircle } from 'lucide-react';
import type { QuizAnswerResponse } from '@/types/book';
import type { TodayQuizData } from '@/types/quiz';

const QUIZ_STORAGE_KEY = 'moneyrun_today_quiz';

interface SavedQuiz {
  date: string;
  quizId: string;
  question: string;
  choices: string[];
  difficultyLevel: number;
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
    question: quiz.question,
    choices: quiz.choices,
    difficultyLevel: quiz.difficultyLevel,
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
  const currentGrade = useFinanceStore((s) => s.grade);
  const answerQuiz = useAnswerQuiz();
  const scrapQuiz = useScrapQuiz();
  const updateLevel = useUpdateQuizLevel();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizAnswerResponse | null>(null);
  const [answeredQuizId, setAnsweredQuizId] = useState<string | null>(null);
  const [quizDismissed, setQuizDismissed] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState<SavedQuiz | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(0);

  // 페이지 로드 시 sessionStorage에서 오늘 푼 퀴즈 복원
  useEffect(() => {
    const stored = loadSavedQuiz();
    if (stored) {
      setSavedQuiz(stored);
      setQuizDismissed(true);
    }
  }, []);

  if (isLoading || quizLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin" />
        <p className="text-sm font-medium text-foreground">퀴즈를 생성하고 있어요...</p>
        <p className="text-xs text-sub">잠시만 기다려주세요</p>
      </div>
    );
  }

  if (!data) return null;

  const todayQuiz = quizData?.quiz ?? null;
  const solvedToday = quizData?.solvedToday ?? false;
  const attendance = data.attendance ?? { checkedToday: false, currentStreak: 0, totalDays: 0 };
  const showFullscreenQuiz = todayQuiz && !solvedToday && !quizResult && !quizDismissed;

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
          question: quizSnapshot.question,
          choices: quizSnapshot.choices,
          difficultyLevel: quizSnapshot.difficultyLevel,
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
      ? Math.min(5, currentLevel + 1)
      : Math.max(1, currentLevel - 1);
    updateLevel.mutate(newLevel, {
      onSuccess: () => {
        setQuizDismissed(true);
        queryClient.invalidateQueries({ queryKey: ['pacemaker-today'] });
        queryClient.invalidateQueries({ queryKey: ['today-quiz'] });
        if (quizResult && !quizResult.correct) {
          router.push('/my-book/wrong-notes');
        }
      },
    });
  };

  const dismissQuizResult = () => {
    setQuizDismissed(true);
    if (quizResult && !quizResult.correct) {
      router.push('/my-book/wrong-notes');
    }
  };


  /* ─── 전체화면 퀴즈 ─── */
  if (showFullscreenQuiz) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* 상단 */}
        <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] h-14 shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            <span className="text-sm font-bold">오늘의 퀴즈</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
              Lv.{todayQuiz.difficultyLevel}
            </span>
            <div className="flex items-center gap-1">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-semibold">{attendance.currentStreak}일</span>
            </div>
          </div>
        </div>

        {/* 문제 */}
        <div className="flex-1 flex flex-col justify-center px-5 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
              <Zap size={14} />
              Level {todayQuiz.difficultyLevel}
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground leading-snug mb-6">
              {todayQuiz.question}
            </p>

            <div className={`grid gap-3 ${
              todayQuiz.choices.length <= 2 ? 'grid-cols-1'
                : todayQuiz.choices.length <= 4 ? 'grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {todayQuiz.choices.map((choice, i) => {
                const isOddLast = todayQuiz.choices.length % 2 === 1 && i === 0 && todayQuiz.choices.length > 2;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
                    onClick={() => setSelectedAnswer(i)}
                    className={`relative flex flex-col items-center justify-center text-center p-5 rounded-2xl min-h-[120px] transition-all border-2 ${
                      isOddLast ? 'col-span-2 md:col-span-1' : ''
                    } ${
                      selectedAnswer === i
                        ? 'border-accent bg-accent/5 text-foreground font-semibold scale-[1.03] shadow-lg'
                        : 'border-border bg-surface text-foreground hover:border-foreground/20 hover:shadow-sm'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-2 ${
                      selectedAnswer === i ? 'bg-accent text-white' : 'bg-foreground/5 text-foreground'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm leading-snug">{choice}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 하단 제출 */}
        <div className="px-5 pb-6 pb-[max(24px,env(safe-area-inset-bottom))] max-w-2xl mx-auto w-full shrink-0">
          <motion.button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null || answerQuiz.isPending}
            whileTap={{ scale: 0.97 }}
            className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl disabled:opacity-20 transition-opacity"
          >
            {answerQuiz.isPending ? '채점 중...' : '제출하기'}
          </motion.button>
        </div>
      </div>
    );
  }

  /* ─── 전체화면 결과 ─── */
  if (quizResult && !quizDismissed) {
    const isCorrect = quizResult.correct;
    const resultLevel = savedQuiz?.difficultyLevel ?? todayQuiz?.difficultyLevel;
    const resultChoices = savedQuiz?.choices ?? todayQuiz?.choices;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto overflow-y-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 180 }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isCorrect ? 'bg-green-500' : 'bg-foreground/10'
            }`}>
              {isCorrect
                ? <Check size={32} className="text-white" />
                : <span className="text-2xl">🤔</span>
              }
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full"
          >
            {resultLevel != null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold mb-2">
                <Zap size={14} />
                Level {resultLevel}
              </div>
            )}
            <h2 className="text-xl font-bold mb-1 text-foreground">
              {isCorrect ? '정답!' : '다음엔 맞출 수 있어요'}
            </h2>

            {quizResult.attendanceChecked && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-xs font-medium mb-4">
                <Flame size={14} className="text-orange-500" />
                출석 완료 &middot; {quizResult.currentStreak}일 연속
              </div>
            )}

            {/* 오답일 때 정답 표시 */}
            {!isCorrect && resultChoices && (
              <div className="flex items-center gap-2 mb-3 mt-2">
                <span className="text-xs text-sub">정답:</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {String.fromCharCode(65 + quizResult.correctAnswer)}. {resultChoices[quizResult.correctAnswer]}
                </span>
              </div>
            )}

            <div className="rounded-2xl p-4 text-left mb-4 bg-surface">
              <p className="text-xs font-semibold text-sub mb-2">{isCorrect ? '해설' : '정답 해설'}</p>
              <div className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none prose-strong:text-foreground prose-p:text-foreground/80">
                <Markdown>{isCorrect ? quizResult.briefExplanation : quizResult.detailedExplanation}</Markdown>
              </div>
            </div>

            {!isCorrect && (
              <button
                onClick={() => { setQuizDismissed(true); router.push('/my-book/wrong-notes'); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mb-3"
              >
                <AlertCircle size={14} />
                오답노트 보러가기
              </button>
            )}

            <button
              onClick={handleScrap}
              disabled={scrapQuiz.isPending || scrapQuiz.isSuccess}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border transition-colors mb-5 ${
                scrapQuiz.isSuccess
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-background hover:bg-surface'
              }`}
            >
              {scrapQuiz.isSuccess ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
              {scrapQuiz.isPending ? '저장 중...' : scrapQuiz.isSuccess ? '스크랩 완료' : '스크랩'}
            </button>

            {/* 난이도 변경: Lv.1 오답이면 낮추기 불가, Lv.5 정답이면 올리기 불가 */}
            {((isCorrect && resultLevel != null && resultLevel < 5) ||
              (!isCorrect && resultLevel != null && resultLevel > 1)) ? (
              <div className="bg-accent/5 rounded-2xl p-5 border-2 border-accent/20 w-full">
                <p className="text-base font-bold text-foreground mb-1">
                  {isCorrect ? '잘하고 있어요!' : '괜찮아요!'}
                </p>
                <p className="text-sm text-sub mb-4">
                  {isCorrect ? '난이도를 올려볼까요?' : '난이도를 낮춰서 자신감부터 쌓아볼까요?'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLevelChange(isCorrect ? 'up' : 'down')}
                    disabled={updateLevel.isPending}
                    className="flex-1 h-12 flex items-center justify-center gap-1 text-sm font-bold rounded-xl bg-accent text-white"
                  >
                    {isCorrect ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isCorrect ? '올리기' : '낮추기'}
                  </button>
                  <button
                    onClick={dismissQuizResult}
                    className="flex-1 h-12 text-sm font-bold rounded-xl border-2 border-border bg-background hover:bg-surface"
                  >
                    지금은 유지
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={dismissQuizResult}
                className="w-full h-12 text-sm font-bold rounded-xl bg-foreground text-background"
              >
                확인
              </button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── 일반 페이스메이커 화면 (퀴즈 완료 후) ─── */
  const aiCards = data.cards ?? [];
  const quizForCard = savedQuiz; // sessionStorage 기반 — 새로고침해도 유지
  const hasQuizCard = !!quizForCard;
  const totalCards = aiCards.length + (hasQuizCard ? 1 : 0);
  const quizCardIndex = aiCards.length; // 마지막 카드
  const isQuizCard = hasQuizCard && cardIndex === quizCardIndex;
  const aiCardIdx = cardIndex; // AI 카드는 0부터 순서대로

  return (
    <div className="space-y-4">
      {/* 출석 현황 */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-xs">
        <Flame size={14} className="text-orange-500" />
        <span className="font-semibold">{attendance.currentStreak}일 연속</span>
        <span className="text-sub">· 누적 {attendance.totalDays}일</span>
      </div>

      {/* AI 카드 스와이프 */}
      {totalCards > 0 ? (
        <>
          {/* 카드 영역 */}
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm bg-background">
            {/* 상단 바: 등급 + 테마 + 카드 인디케이터 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                {isQuizCard ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/10 text-accent">오늘의 퀴즈</span>
                ) : (
                  <>
                    {currentGrade && <GradeBadge grade={currentGrade} size="sm" />}
                    {data.theme && <span className="text-xs text-sub">{data.theme}</span>}
                  </>
                )}
              </div>
              <span className="text-xs text-placeholder">{cardIndex + 1} / {totalCards}</span>
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
                  {isQuizCard && quizForCard ? (
                    /* 퀴즈 리캡 카드 (마지막 카드) */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{quizForCard.result.correct ? '🎉' : '🤔'}</span>
                        <h3 className="text-base font-bold text-foreground">
                          {quizForCard.result.correct ? '정답!' : '오답 — 다음엔 맞출 수 있어요'}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">{quizForCard.question}</p>
                      <div className="rounded-xl bg-surface p-3 mb-3">
                        <p className="text-xs font-semibold text-sub mb-1">해설</p>
                        <div className="text-sm leading-relaxed text-foreground/80">
                          <Markdown>{quizForCard.result.correct ? quizForCard.result.briefExplanation : quizForCard.result.detailedExplanation}</Markdown>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {quizForCard.scrapped || scrapQuiz.isSuccess ? (
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
                        {!quizForCard.result.correct && (
                          <button
                            onClick={() => router.push('/my-book/wrong-notes')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                          >
                            <AlertCircle size={14} />
                            오답노트
                          </button>
                        )}
                      </div>
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
