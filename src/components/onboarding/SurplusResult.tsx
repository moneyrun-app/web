'use client';

import type { Grade, Surplus } from '@/types/finance';
import GradeBadge from '@/components/common/GradeBadge';
import { formatWon, formatWonRaw } from '@/lib/format';

interface Props {
  grade: Grade;
  surplus: Surplus;
  monthlyIncome: number;
  goodSpendingTotal: number;
  fixedExpenseTotal: number;
  onStart: () => void;
}

const gradeRingColor: Record<Grade, string> = {
  RED: 'border-grade-red',
  YELLOW: 'border-grade-yellow',
  GREEN: 'border-grade-green',
};

const gradeBgColor: Record<Grade, string> = {
  RED: 'bg-grade-red-bg',
  YELLOW: 'bg-grade-yellow-bg',
  GREEN: 'bg-grade-green-bg',
};

export default function SurplusResult({
  grade,
  surplus,
  monthlyIncome,
  goodSpendingTotal,
  fixedExpenseTotal,
  onStart,
}: Props) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6">
      {/* Grade Circle */}
      <div
        className={`w-52 h-52 rounded-full border-4 ${gradeRingColor[grade]} ${gradeBgColor[grade]} flex items-center justify-center mb-8`}
      >
        <GradeBadge grade={grade} size="lg" />
      </div>

      {/* Daily Amount */}
      <p className="text-sub text-sm mb-2">하루에 쓸 수 있는 돈</p>
      <p className="text-4xl font-bold mb-8">{formatWonRaw(surplus.daily)}</p>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-btn-dark text-white font-semibold text-lg"
      >
        시작하기
      </button>

      {/* Formula */}
      <p className="text-sub text-xs mt-4 text-center leading-relaxed">
        월 실수령 {formatWon(monthlyIncome)} - 좋은 소비 {formatWon(goodSpendingTotal)} - 고정 소비{' '}
        {formatWon(fixedExpenseTotal)}
        <br />= 잉여자금 월 {formatWon(surplus.monthly)}
      </p>
    </main>
  );
}
