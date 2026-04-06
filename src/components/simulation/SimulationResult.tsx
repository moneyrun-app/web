'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { SimulationInput, EnhancedSimulationResult } from '@/types/finance';
import StepCurrentReport from './StepCurrentReport';
import StepFutureProjection from './StepFutureProjection';
import StepActionCTA from './StepActionCTA';

const STEPS = [
  { title: '나의 돈 관리 성적표', tag: '현재' },
  { title: '이대로 가면 만나게 될 모습', tag: '미래' },
  { title: '지금 바로 시작하기', tag: '행동' },
] as const;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface Props {
  input: SimulationInput;
  result: EnhancedSimulationResult;
  onBack: () => void;
}

export default function SimulationResult({ input, result, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const prev = () => { if (step > 0) goTo(step - 1); };
  const next = () => { if (step < STEPS.length - 1) goTo(step + 1); };

  useEffect(() => {
    // 마운트 직후 Enter 이벤트가 전파되는 것 방지
    let ready = false;
    const timer = setTimeout(() => { ready = true; }, 200);
    const handleKey = (e: KeyboardEvent) => {
      if (!ready) return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKey); };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 바 */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-sub hover:text-foreground transition-colors">
              <RotateCcw size={14} />
              다시 입력
            </button>
            <span className="text-2xs text-sub">{step + 1} / {STEPS.length}</span>
          </div>

          {/* 스텝 인디케이터 */}
          <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="결과 진행 상황">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="flex-1 group"
              >
                <div className="flex items-center justify-center mb-1.5">
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      i <= step ? 'bg-foreground text-background' : 'bg-surface text-placeholder'
                    }`}
                  >
                    {s.tag}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-surface">
                  <motion.div
                    className="h-full rounded-full bg-foreground"
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 스텝 제목 */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-2xs font-semibold text-sub mb-0.5">[{STEPS[step].tag}]</p>
            <h2 className="text-lg font-bold">{STEPS[step].title}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 스텝 콘텐츠 */}
      <div className="max-w-lg mx-auto px-4 pb-32 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {step === 0 && <StepCurrentReport input={input} result={result} />}
            {step === 1 && <StepFutureProjection input={input} result={result} />}
            {step === 2 && <StepActionCTA input={input} result={result} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-sm border-t border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 0}
            aria-label="이전 단계"
            className="flex items-center gap-1 text-sm font-medium text-sub hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            이전
          </button>

          {/* 하단 도트 */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}단계로 이동`}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === step ? 'bg-foreground scale-125' : 'bg-disabled'
                }`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              aria-label="다음 단계"
              className="flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              다음
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="w-12" /> // spacer
          )}
        </div>
      </div>
    </div>
  );
}
