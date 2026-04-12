'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/simulationStore';
import { calculateSimulation, calculateEnhancedSimulation } from '@/lib/simulation';
import { formatWon } from '@/lib/format';
import SimulationResult from '@/components/simulation/SimulationResult';
import { User, Calendar, CalendarClock, Wallet, TrendingUp, PiggyBank, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';

/* ─── 스텝 정의 ─── */

const STEPS = [
  { key: 'nickname', icon: <User size={20} />, label: '닉네임', sub: '어떻게 불러드릴까요?' },
  { key: 'age', icon: <Calendar size={20} />, label: '현재 나이', sub: '만 나이를 입력해 주세요' },
  { key: 'retirement', icon: <CalendarClock size={20} />, label: '은퇴 예정 나이', sub: '몇 살까지 일할 계획인가요?' },
  { key: 'pension', icon: <CalendarClock size={20} />, label: '은퇴자금 수령 나이', sub: '국민연금 기준 보통 65세예요' },
  { key: 'income', icon: <Wallet size={20} />, label: '월 실수령액', sub: '세후 실제 통장에 들어오는 금액' },
  { key: 'investment', icon: <TrendingUp size={20} />, label: '월 투자액', sub: '현재 투자하고 있는 월 금액' },
  { key: 'fixed', icon: <PiggyBank size={20} />, label: '월 고정비', sub: '월세, 보험, 구독, 공과금 등' },
  { key: 'variable', icon: <ShoppingCart size={20} />, label: '월 변동비', sub: '쇼핑, 술, 커피, 외식 등' },
] as const;

/* ─── 슬라이드 애니메이션 ─── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

/* ─── 메인 ─── */

export default function LandingPage() {
  const { input, setInput, hasResult, setHasResult, loadFromSession } = useSimulationStore();
  const [step, setStep] = useState(-1); // -1 = hero
  const [direction, setDirection] = useState(0);
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => { loadFromSession(); }, [loadFromSession]);

  const result = useMemo(() => calculateSimulation(input), [input]);
  const enhancedResult = useMemo(() => calculateEnhancedSimulation(input), [input]);

  const monthlyExpense = input.monthlyFixedCost + input.monthlyVariableCost;
  const investmentPeriod = Math.max(0, input.retirementAge - input.age);
  const vestingPeriod = Math.max(0, input.pensionStartAge - input.retirementAge);

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const validateNickname = (): boolean => {
    const name = input.nickname;
    if (!name) return false;
    // 완성형 한글 + 영어만 허용
    if (!/^[가-힣a-zA-Z]+$/.test(name)) {
      setNicknameError('한글(완성형)과 영어만 사용할 수 있어요');
      return false;
    }
    if (name.length > 8) {
      setNicknameError('닉네임은 8자까지만 가능해요');
      return false;
    }
    setNicknameError('');
    return true;
  };

  const next = () => {
    if (step === 0 && !validateNickname()) return;
    if (step < STEPS.length - 1) goTo(step + 1);
  };
  const prev = () => {
    if (step > 0) goTo(step - 1);
    else if (step === 0) goTo(-1);
  };

  const handleSimulate = useCallback(() => {
    setHasResult(true);
  }, [setHasResult]);

  // 시뮬레이션 결과
  if (hasResult) {
    return (
      <SimulationResult
        input={input}
        result={enhancedResult}
        onBack={() => setHasResult(false)}
      />
    );
  }

  // Hero 화면
  if (step === -1) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: 'calc(100vh - 56px)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goTo(0); }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-display md:text-5xl font-bold leading-tight mb-3 text-foreground">
          <span className="md:hidden">65세에<br />거지 되지 마세요</span>
          <span className="hidden md:inline">65세에 거지 되지 마세요</span>
        </h1>
        <p className="text-sub text-body-lg mb-10">30초면 내 미래를 확인할 수 있어요</p>
        <button
          onClick={() => goTo(0)}
          className="inline-flex items-center gap-2 h-14 px-10 bg-foreground text-background text-base font-bold rounded-2xl hover:bg-foreground/90 active:scale-[0.97] transition-all"
        >
          무료로 시뮬레이션
          <ChevronRight size={18} />
        </button>
      </motion.div>
    );
  }

  // 현재 스텝 값 가져오기/설정하기
  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  function getCurrentValue(): string {
    switch (currentStep.key) {
      case 'nickname': return input.nickname;
      case 'age': return input.age ? String(input.age) : '';
      case 'retirement': return input.retirementAge ? String(input.retirementAge) : '';
      case 'pension': return input.pensionStartAge ? String(input.pensionStartAge) : '';
      case 'income': return input.monthlyIncome ? String(input.monthlyIncome / 10000) : '';
      case 'investment': return input.monthlyInvestment ? String(input.monthlyInvestment / 10000) : '';
      case 'fixed': return input.monthlyFixedCost ? String(input.monthlyFixedCost / 10000) : '';
      case 'variable': return input.monthlyVariableCost ? String(input.monthlyVariableCost / 10000) : '';
    }
  }

  function getSuffix(): string {
    switch (currentStep.key) {
      case 'age': case 'retirement': case 'pension': return '세';
      case 'income': case 'investment': case 'fixed': case 'variable': return '만 원';
      default: return '';
    }
  }

  function getPlaceholder(): string {
    switch (currentStep.key) {
      case 'nickname': return '민수';
      case 'age': return '30';
      case 'retirement': return '55';
      case 'pension': return '65';
      case 'income': return '300';
      case 'investment': return '50';
      case 'fixed': return '150';
      case 'variable': return '100';
    }
  }

  function handleChange(raw: string) {
    switch (currentStep.key) {
      case 'nickname': {
        if (raw.length > 8) {
          setNicknameError('닉네임은 8자까지만 가능해요');
          return;
        }
        setNicknameError('');
        setInput({ nickname: raw });
        break;
      }
      case 'age': {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, 2);
        setInput({ age: parseInt(digits, 10) || 0 });
        break;
      }
      case 'retirement': {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, 2);
        setInput({ retirementAge: parseInt(digits, 10) || 0 });
        break;
      }
      case 'pension': {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, 2);
        setInput({ pensionStartAge: parseInt(digits, 10) || 0 });
        break;
      }
      case 'income': {
        const v = parseInt(raw.replace(/[^0-9]/g, '').slice(0, 4), 10) || 0;
        const income = Math.round(v * 10000);
        const updates: Partial<typeof input> = { monthlyIncome: income };
        const total = input.monthlyInvestment + input.monthlyFixedCost + input.monthlyVariableCost;
        if (total > income) {
          const ratio = income > 0 ? income / total : 0;
          updates.monthlyInvestment = Math.floor(input.monthlyInvestment * ratio);
          updates.monthlyFixedCost = Math.floor(input.monthlyFixedCost * ratio);
          updates.monthlyVariableCost = Math.floor(input.monthlyVariableCost * ratio);
        }
        setInput(updates);
        break;
      }
      case 'investment': {
        const won = Math.round((parseInt(raw.replace(/[^0-9]/g, '').slice(0, 4), 10) || 0) * 10000);
        const max = input.monthlyIncome;
        setInput({ monthlyInvestment: Math.min(won, Math.max(0, max)) });
        break;
      }
      case 'fixed': {
        const won = Math.round((parseInt(raw.replace(/[^0-9]/g, '').slice(0, 4), 10) || 0) * 10000);
        const max = input.monthlyIncome - input.monthlyInvestment - input.monthlyVariableCost;
        setInput({ monthlyFixedCost: Math.min(won, Math.max(0, max)) });
        break;
      }
      case 'variable': {
        const won = Math.round((parseInt(raw.replace(/[^0-9]/g, '').slice(0, 4), 10) || 0) * 10000);
        const max = input.monthlyIncome - input.monthlyInvestment - input.monthlyFixedCost;
        setInput({ monthlyVariableCost: Math.min(won, Math.max(0, max)) });
        break;
      }
    }
  }

  const isNumeric = currentStep.key !== 'nickname';
  const hasValue = getCurrentValue().length > 0;

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* 프로그레스 바 */}
      <div className="px-5 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="진행 상황">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-surface">
              <motion.div
                className="h-full rounded-full bg-foreground"
                initial={false}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
        <p className="text-2xs text-sub mt-2">{step + 1} / {STEPS.length}</p>
      </div>

      {/* 카드 영역 */}
      <div className="flex-1 flex items-center justify-center px-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full"
          >
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              {/* 아이콘 + 라벨 */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground">
                  {currentStep.icon}
                </div>
                <h2 className="text-lg font-bold text-foreground">{currentStep.label}</h2>
              </div>
              <p className="text-sm text-sub mb-8">{currentStep.sub}</p>

              {/* 입력 */}
              <div className="relative border-b-2 border-foreground/10 pb-3 focus-within:border-foreground transition-colors">
                {/* 값 + suffix 표시 레이어 */}
                <div className="absolute inset-0 flex items-baseline pointer-events-none">
                  <span className="text-4xl font-bold text-transparent">{getCurrentValue() || getPlaceholder()}</span>
                  {getSuffix() && getCurrentValue() && (
                    <span className="text-2xl text-sub font-medium ml-1">{getSuffix()}</span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode={isNumeric ? 'numeric' : 'text'}
                  autoComplete="one-time-code"
                  name="sim-input"
                  data-form-type="other"
                  aria-label={currentStep.label}
                  value={getCurrentValue()}
                  placeholder={getPlaceholder()}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && hasValue) isLastStep ? handleSimulate() : next(); }}
                  autoFocus
                  className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-gray-200 caret-foreground appearance-none border-none shadow-none"
                />
              </div>
              {nicknameError && currentStep.key === 'nickname' && (
                <p className="text-xs text-grade-red mt-2">{nicknameError}</p>
              )}

              {/* 요약 (소득 입력 이후) */}
              {step >= 4 && input.monthlyIncome > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 bg-background rounded-xl p-4 space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-sub">월 총지출</span>
                    <span className="font-semibold">{formatWon(monthlyExpense)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sub">잉여자금</span>
                    <span className={`font-semibold ${result.surplus > 0 ? 'text-grade-green' : 'text-grade-red'}`}>
                      {formatWon(result.surplus)}
                    </span>
                  </div>
                  {investmentPeriod > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-sub">투자기간</span>
                      <span className="font-semibold">{investmentPeriod}년</span>
                    </div>
                  )}
                  {vestingPeriod > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-sub">거치기간</span>
                      <span className="font-semibold">{vestingPeriod}년</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 py-6 max-w-lg mx-auto w-full flex items-center gap-3">
        <button
          onClick={prev}
          aria-label="이전 단계"
          className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-sub hover:bg-surface transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={isLastStep ? handleSimulate : next}
          disabled={!hasValue}
          className="flex-1 h-12 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLastStep ? '시뮬레이션 하기' : '다음'}
          {!isLastStep && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
