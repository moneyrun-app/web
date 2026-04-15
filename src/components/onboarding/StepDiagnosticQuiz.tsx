'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap } from 'lucide-react';
import { useOnboardingStep2Questions, useSubmitOnboardingStep2 } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { OnboardingStep2Response } from '@/types/course';

interface StepDiagnosticQuizProps {
  onComplete: (result: OnboardingStep2Response) => void;
}

export default function StepDiagnosticQuiz({ onComplete }: StepDiagnosticQuizProps) {
  const { data, isLoading } = useOnboardingStep2Questions();
  const submitStep2 = useSubmitOnboardingStep2();
  const setDiagnosticAnswers = useOnboardingStore((s) => s.setDiagnosticAnswers);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [direction, setDirection] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<OnboardingStep2Response | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-surface rounded-lg w-1/3" />
        <div className="h-24 bg-surface rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-surface rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const questions = data.questions;
  const totalQ = questions.length;
  const question = questions[currentQ];
  const selectedAnswer = answers.get(question.id);
  const allAnswered = answers.size === totalQ;

  const goNext = () => {
    if (currentQ < totalQ - 1) {
      setDirection(1);
      setCurrentQ(currentQ + 1);
    }
  };

  const goPrev = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(currentQ - 1);
    }
  };

  const selectAnswer = (answerIdx: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(question.id, answerIdx);
    setAnswers(newAnswers);

    // 자동 다음 문제 (마지막이 아닐 때)
    if (currentQ < totalQ - 1) {
      setTimeout(() => {
        setDirection(1);
        setCurrentQ(currentQ + 1);
      }, 300);
    }
  };

  const handleSubmit = () => {
    const answersArr = Array.from(answers.entries()).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    setDiagnosticAnswers(answersArr);
    submitStep2.mutate({ answers: answersArr }, {
      onSuccess: (res) => {
        setResult(res);
        setShowResult(true);
      },
    });
  };

  // 결과 화면
  if (showResult && result) {
    const stars = result.assignedLevel === '마스터' ? 5 : result.assignedLevel === '심화' ? 3 : 1;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center py-4"
      >
        <div>
          <div className="text-3xl mb-2">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {result.correctCount}/{result.totalCount}문제 정답!
          </h2>
          <p className="text-sm text-sub">
            진단 점수: {result.scoreRatio}점
          </p>
        </div>

        <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-5">
          <p className="text-sm text-sub mb-1">배정된 코스</p>
          <p className="text-lg font-bold text-accent">{result.courseTitle}</p>
          <p className="text-xs text-sub mt-2">
            오직 나만을 위한 마이북을 생성해드릴게요!
          </p>
        </div>

        <button
          onClick={() => onComplete(result)}
          className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl"
        >
          계속하기
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentQ === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface text-sub disabled:opacity-20"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-accent" />
          <span className="text-sm font-bold">{currentQ + 1} / {totalQ}</span>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* 진행률 바 */}
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQ}
          custom={direction}
          initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-lg font-bold text-foreground leading-snug mb-5">
            {question.question}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {question.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  selectedAnswer === i
                    ? 'border-accent bg-accent/5 font-semibold'
                    : 'border-border bg-background hover:border-foreground/20'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 ${
                  selectedAnswer === i ? 'bg-accent text-white' : 'bg-surface text-sub'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{choice}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 제출 (모든 문제 답변 시) */}
      {allAnswered && currentQ === totalQ - 1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          disabled={submitStep2.isPending}
          className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl disabled:opacity-40"
        >
          {submitStep2.isPending ? '채점 중...' : '결과 확인하기'}
        </motion.button>
      )}
    </div>
  );
}
