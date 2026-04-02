'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { useUserStore } from '@/store/userStore';
import { calculateSurplus, getGoodSpendingTotal } from '@/lib/surplus';
import { calculateGrade } from '@/lib/grade';
import type { GoodSpending, FixedExpenses } from '@/types/finance';
import AgeInput from '@/components/onboarding/AgeInput';
import IncomeInput from '@/components/onboarding/IncomeInput';
import GoodSpendingInput from '@/components/onboarding/GoodSpendingInput';
import FixedExpenseInput from '@/components/onboarding/FixedExpenseInput';
import SurplusResult from '@/components/onboarding/SurplusResult';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useFinanceStore((s) => s.setProfile);
  const setUser = useUserStore((s) => s.setUser);

  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [goodSpendings, setGoodSpendings] = useState<GoodSpending[]>([
    { type: 'savings', label: '적금', amount: 0 },
  ]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenses>({
    rent: 0,
    utilities: 0,
    phone: 0,
  });

  const showResult = step === 5;

  const surplus = calculateSurplus(monthlyIncome, goodSpendings, fixedExpenses);
  const goodTotal = getGoodSpendingTotal(goodSpendings);
  const grade = calculateGrade(monthlyIncome, goodTotal);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setStep(5); // 결과 화면
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStart = () => {
    const fixedTotal = fixedExpenses.rent + fixedExpenses.utilities + fixedExpenses.phone;
    setProfile({
      age,
      monthlyIncome,
      goodSpendings,
      fixedExpenses,
      grade,
      surplus,
    });
    setUser({ hasCompletedOnboarding: true });
    router.push('/home');
  };

  if (showResult) {
    return (
      <SurplusResult
        grade={grade}
        surplus={surplus}
        monthlyIncome={monthlyIncome}
        goodSpendingTotal={goodTotal}
        fixedExpenseTotal={fixedExpenses.rent + fixedExpenses.utilities + fixedExpenses.phone}
        onStart={handleStart}
      />
    );
  }

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <div className="px-4 pt-4">
        <button onClick={step === 1 ? () => router.back() : handlePrev} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 px-4 mt-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? 'bg-foreground' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8">
        {step === 1 && <AgeInput value={age} onChange={setAge} />}
        {step === 2 && <IncomeInput value={monthlyIncome} onChange={setMonthlyIncome} />}
        {step === 3 && <GoodSpendingInput items={goodSpendings} onChange={setGoodSpendings} />}
        {step === 4 && <FixedExpenseInput value={fixedExpenses} onChange={setFixedExpenses} />}
      </div>

      {/* Buttons */}
      <div className="px-6 pb-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-4 rounded-xl border border-card-border text-foreground font-semibold"
          >
            이전
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-4 rounded-xl bg-btn-dark text-white font-semibold"
        >
          {step === 4 ? '완료' : '다음'}
        </button>
      </div>
    </main>
  );
}
