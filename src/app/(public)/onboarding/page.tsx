'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { formatWon } from '@/lib/format';
import { usePreOnboarding } from '@/hooks/useApi';
import type { CourseCategory, PreOnboardingRequest } from '@/types/course';

const CATEGORIES: { label: string; value: CourseCategory }[] = [
  { label: '월급 관리가 안 돼요!', value: '소비_저축' },
  { label: '주식 등으로 자산을 불리고 싶어요', value: '주식' },
  { label: '내 집 마련의 꿈을 이루고 싶어요', value: '부동산' },
  { label: '세금과 환급금을 똑똑하게 챙기고 싶어요', value: '세금_연말정산' },
  { label: '미래의 나를 위해 연금을 준비할래요', value: '연금' },
];

const CATEGORY_LABELS: Record<string, string> = {
  '소비_저축': '소비·저축',
  '주식': '주식',
  '부동산': '부동산',
  '세금_연말정산': '세금·연말정산',
  '연금': '연금',
};

type Step = 'nickname' | 'category' | 'bridge' | 'finance';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function PreOnboardingPage() {
  const router = useRouter();
  const preOnboarding = usePreOnboarding();

  const [step, setStep] = useState<Step>('nickname');
  const [direction, setDirection] = useState(0);

  // Step 1 data
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [category, setCategory] = useState<CourseCategory | null>(null);

  // Step 2 data (finance)
  const [age, setAge] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [monthlyFixedCost, setMonthlyFixedCost] = useState('');
  const [monthlyVariableCost, setMonthlyVariableCost] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [pensionStartAge, setPensionStartAge] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goTo = useCallback((next: Step, dir: number = 1) => {
    setDirection(dir);
    setStep(next);
  }, []);

  const validateNickname = (): boolean => {
    if (!nickname) return false;
    if (!/^[가-힣a-zA-Z]+$/.test(nickname)) {
      setNicknameError('한글(완성형)과 영어만 사용할 수 있어요');
      return false;
    }
    if (nickname.length > 8) {
      setNicknameError('닉네임은 8자까지만 가능해요');
      return false;
    }
    setNicknameError('');
    return true;
  };

  const handleNicknameNext = () => {
    if (validateNickname()) goTo('category');
  };

  const handleCategorySelect = (cat: CourseCategory) => {
    setCategory(cat);
    // Save to localStorage immediately
    localStorage.setItem('preOnboarding', JSON.stringify({ nickname, category: cat }));
    goTo('bridge');
  };

  const handleBridgeNext = () => {
    goTo('finance');
  };

  const isFinanceValid = () => {
    return (
      parseInt(age) > 0 &&
      parseInt(monthlyIncome) > 0 &&
      parseInt(retirementAge) > 0 &&
      parseInt(pensionStartAge) > 0
    );
  };

  const handleFinanceSubmit = async () => {
    if (!isFinanceValid() || !category || submitting) return;
    setSubmitting(true);

    const data: PreOnboardingRequest = {
      nickname,
      category,
      age: parseInt(age),
      monthlyIncome: parseInt(monthlyIncome) * 10000,
      monthlyInvestment: parseInt(monthlyInvestment || '0') * 10000,
      monthlyFixedCost: parseInt(monthlyFixedCost || '0') * 10000,
      monthlyVariableCost: parseInt(monthlyVariableCost || '0') * 10000,
      retirementAge: parseInt(retirementAge),
      pensionStartAge: parseInt(pensionStartAge),
    };

    // Save full data to localStorage
    localStorage.setItem('preOnboarding', JSON.stringify(data));

    try {
      const preview = await preOnboarding.mutateAsync(data);
      // Store preview data for the preview page
      sessionStorage.setItem('preOnboardingPreview', JSON.stringify(preview));
      router.push('/onboarding/preview');
    } catch {
      setSubmitting(false);
    }
  };

  const catLabel = category ? CATEGORY_LABELS[category] : '';

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex-1 flex items-start justify-center px-5 pt-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ─── 닉네임 ─── */}
          {step === 'nickname' && (
            <motion.div
              key="nickname"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h2 className="text-h1 font-bold text-foreground mb-2">어떻게 불러드릴까요?</h2>
              <p className="text-sub text-body mb-8">닉네임을 입력해 주세요</p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length > 8) { setNicknameError('닉네임은 8자까지만 가능해요'); return; }
                  setNicknameError('');
                  setNickname(v);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNicknameNext(); }}
                placeholder="민수"
                autoFocus
                className="w-full text-3xl font-bold bg-transparent border-b-2 border-foreground/10 pb-3 outline-none focus:border-foreground transition-colors placeholder:text-gray-200"
              />
              {nicknameError && <p className="text-xs text-grade-red mt-2">{nicknameError}</p>}
              <button
                onClick={handleNicknameNext}
                disabled={!nickname}
                className="mt-8 w-full h-12 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-30"
              >
                다음 <ChevronRight size={16} />
              </button>

              {/* 기존 유저용 카카오 바로 로그인 */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-sub">이미 계정이 있나요?</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => signIn('kakao', { callbackUrl: '/pacemaker' })}
                className="mt-4 w-full h-12 bg-[#FEE500] text-[#391B1B] font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FDD835] active:scale-[0.98] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.63 5.18l-.93 3.44c-.08.29.25.52.5.35l4.12-2.74c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.26C17 3.79 13.42 1 9 1z" fill="currentColor"/>
                </svg>
                카카오로 로그인
              </button>
            </motion.div>
          )}

          {/* ─── 카테고리 선택 ─── */}
          {step === 'category' && (
            <motion.div
              key="category"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h2 className="text-h1 font-bold text-foreground mb-2">
                금융 공부를 시작하려는<br />가장 큰 이유는 무엇인가요?
              </h2>
              <p className="text-sub text-body mb-6">관심 분야를 선택해 주세요</p>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                      category === cat.value
                        ? 'border-foreground bg-foreground/5 font-semibold'
                        : 'border-border hover:border-foreground/30 hover:bg-surface'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goTo('nickname', -1)}
                className="mt-4 w-full h-10 text-sm text-sub hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} className="inline mr-1" />이전
              </button>
            </motion.div>
          )}

          {/* ─── 브릿지 메시지 ─── */}
          {step === 'bridge' && (
            <motion.div
              key="bridge"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full text-center pt-12"
            >
              <div className="bg-surface border border-border rounded-3xl p-8">
                <p className="text-body-lg text-foreground leading-relaxed">
                  좋은 선택이에요!<br />
                  <strong>{catLabel}</strong>는 사회초년생이 가장 어려워하지만,<br />
                  한 번 깨우치면 평생의 자산이 되는 분야죠.
                </p>
                <p className="text-body text-sub mt-4 leading-relaxed">
                  머니런에서는 {catLabel}에 대한<br />
                  기초, 심화, 마스터 과정을 운영하고 있어요.
                </p>
                <p className="text-body font-semibold text-foreground mt-6">
                  {nickname}님의 현재와 미래에 대한<br />
                  재테크 진단 리포트 발행을 위해, 확인이 필요합니다.
                </p>
              </div>
              <button
                onClick={handleBridgeNext}
                className="mt-6 w-full h-12 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-foreground/90 active:scale-[0.98] transition-all"
              >
                확인하기 <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ─── 재무 데이터 입력 ─── */}
          {step === 'finance' && (
            <motion.div
              key="finance"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full pb-8"
            >
              <h2 className="text-h1 font-bold text-foreground mb-2">재무 정보 입력</h2>
              <p className="text-sub text-body mb-6">{nickname}님의 현재 상태를 알려주세요</p>

              <div className="space-y-5">
                <FinanceField label="현재 나이" value={age} onChange={setAge} suffix="세" placeholder="30" inputMode="numeric" />
                <FinanceField label="월 실수령액 (세후)" value={monthlyIncome} onChange={setMonthlyIncome} suffix="만 원" placeholder="300" inputMode="numeric" />
                <FinanceField label="월 평균 투자금" value={monthlyInvestment} onChange={setMonthlyInvestment} suffix="만 원" placeholder="50" inputMode="numeric" />
                <FinanceField label="투자금을 포함한 월 평균 고정비" value={monthlyFixedCost} onChange={setMonthlyFixedCost} suffix="만 원" placeholder="150" inputMode="numeric" />
                <FinanceField label="월 평균 변동비" value={monthlyVariableCost} onChange={setMonthlyVariableCost} suffix="만 원" placeholder="100" inputMode="numeric" />
                <FinanceField label="은퇴 예정 나이" value={retirementAge} onChange={setRetirementAge} suffix="세" placeholder="55" inputMode="numeric" />
                <FinanceField label="은퇴자금 수령 예정 나이" value={pensionStartAge} onChange={setPensionStartAge} suffix="세" placeholder="65" inputMode="numeric" />
              </div>

              {/* 요약 */}
              {parseInt(monthlyIncome) > 0 && (
                <div className="mt-6 bg-surface border border-border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sub">월 총지출</span>
                    <span className="font-semibold">{formatWon((parseInt(monthlyFixedCost || '0') + parseInt(monthlyVariableCost || '0')) * 10000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sub">잉여자금</span>
                    <span className="font-semibold">
                      {formatWon((parseInt(monthlyIncome) - parseInt(monthlyFixedCost || '0') - parseInt(monthlyVariableCost || '0')) * 10000)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => goTo('bridge', -1)}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-sub hover:bg-surface transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleFinanceSubmit}
                  disabled={!isFinanceValid() || submitting}
                  className="flex-1 h-12 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-30"
                >
                  {submitting ? '분석 중...' : '재테크 진단 리포트 보기'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FinanceField({ label, value, onChange, suffix, placeholder, inputMode }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  placeholder: string;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="flex items-center gap-2 border-b border-foreground/10 pb-2 focus-within:border-foreground transition-colors">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-gray-300"
        />
        <span className="text-sm text-sub">{suffix}</span>
      </div>
    </div>
  );
}
