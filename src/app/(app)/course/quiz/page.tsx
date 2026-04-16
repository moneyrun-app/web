'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { useDiagnosticQuiz, useSubmitQuiz, useCompleteOnboarding } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';
import type { QuizSubmitResponse } from '@/types/course';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function DiagnosticQuizPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { data, isLoading } = useDiagnosticQuiz(true);
  const submitQuiz = useSubmitQuiz();
  const completeOnboarding = useCompleteOnboarding();

  const questions = data?.questions ?? [];
  const totalCount = questions.length;

  const [currentQ, setCurrentQ] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [hintsOpen, setHintsOpen] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 이전 답변 복원
  const quizAnswers = store.quizAnswers;
  useEffect(() => {
    if (quizAnswers.length > 0) {
      setAnswers(() => {
        const map = new Map<string, number>();
        quizAnswers.forEach((a) => map.set(a.questionId, a.answer));
        return map;
      });
    }
  }, [quizAnswers]);

  const goToQ = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setCurrentQ(next);
  }, []);

  const handleAnswer = (questionId: string, answerIdx: number) => {
    const next = new Map(answers);
    next.set(questionId, answerIdx);
    setAnswers(next);

    // 자동 저장
    const arr = Array.from(next.entries()).map(([questionId, answer]) => ({ questionId, answer }));
    store.setQuizAnswers(arr);

    // 자동 다음 문제 (마지막 아니면)
    if (currentQ < totalCount - 1) {
      setTimeout(() => goToQ(currentQ + 1, 1), 300);
    }
  };

  const toggleHint = (questionId: string) => {
    setHintsOpen((prev) => new Set(prev).add(questionId));
  };

  const handleSubmit = async () => {
    if (submitting || answers.size < totalCount) return;
    setSubmitting(true);

    const payload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        answer: answers.get(q.id) ?? 0,
      })),
    };

    try {
      const res = await submitQuiz.mutateAsync(payload);
      store.setLevel(res.assignedLevel, res.courseTitle);
      setResult(res);
    } catch {
      setSubmitting(false);
    }
  };

  // 로딩
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  // 결과 화면
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <div className="text-5xl mb-4">
          {result.assignedLevel === '마스터' ? '🏆' : result.assignedLevel === '심화' ? '🌟' : '📚'}
        </div>
        <p className="text-h2 font-bold text-foreground mb-2">
          {result.correctCount}/{result.totalCount} 정답
        </p>
        <p className="text-body-lg text-foreground leading-relaxed whitespace-pre-line mb-4">
          {result.message}
        </p>
        {result.wrongNoteMessage && (
          <p className="text-body text-sub bg-surface border border-border rounded-xl px-4 py-3 mb-4">
            {result.wrongNoteMessage}
          </p>
        )}
        <button
          onClick={async () => {
            try {
              await completeOnboarding.mutateAsync();
            } catch { /* 이미 완료된 경우 무시 */ }
            useUserStore.getState().setUser({ hasCompletedOnboarding: true, onboardingVersion: 4 });
            useOnboardingStore.getState().clear();
            router.replace('/pacemaker');
          }}
          disabled={completeOnboarding.isPending}
          className="w-full max-w-xs h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {completeOnboarding.isPending ? '준비 중...' : '시작하기'}
        </button>
      </motion.div>
    );
  }

  if (totalCount === 0) {
    return <div className="text-center py-20 text-sub">퀴즈를 불러올 수 없습니다.</div>;
  }

  const q = questions[currentQ];
  const selectedAnswer = answers.get(q.id);
  const allAnswered = answers.size >= totalCount;
  const isLast = currentQ === totalCount - 1;

  return (
    <div className="max-w-lg mx-auto px-5 py-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* 프로그레스 */}
      <div className="mb-6">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-surface">
              <motion.div
                className="h-full rounded-full bg-foreground"
                initial={false}
                animate={{ width: i <= currentQ ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-sub mt-2">{currentQ + 1} / {totalCount}</p>
      </div>

      {/* 질문 + 선택지 */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQ}
          custom={direction}
          variants={slideVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-6">
            Q{currentQ + 1}. {q.question}
          </h2>

          <div className="space-y-3">
            {q.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(q.id, i)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                  selectedAnswer === i
                    ? 'border-foreground bg-foreground/5 font-semibold'
                    : 'border-border hover:border-foreground/30 hover:bg-surface'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>

          {/* 힌트 */}
          <div className="mt-4">
            {hintsOpen.has(q.id) ? (
              <div className="bg-grade-yellow-bg border border-grade-yellow/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={14} className="text-grade-yellow" />
                  <span className="text-xs font-semibold text-grade-yellow-text">힌트</span>
                </div>
                <p className="text-sm text-foreground">{q.hint}</p>
              </div>
            ) : (
              <button
                onClick={() => toggleHint(q.id)}
                className="flex items-center gap-1.5 text-sm text-sub hover:text-foreground transition-colors"
              >
                <Lightbulb size={14} />
                힌트 보기
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 하단 네비 */}
      <div className="flex items-center gap-3 mt-8">
        {currentQ > 0 && (
          <button
            onClick={() => goToQ(currentQ - 1, -1)}
            className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-sub hover:bg-surface transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {isLast && allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '결과 확인하기'}
          </button>
        )}
      </div>
    </div>
  );
}
