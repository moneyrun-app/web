'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Users } from 'lucide-react';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { SimulationInput, EnhancedSimulationResult } from '@/types/finance';
import { usePeerStatistics } from '@/hooks/useApi';

// ─── Animation helpers ───

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    started.current = false;
    setValue(0);
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

// ─── Bar component ───

function CompareBar({ label, myValue, avgValue, color }: {
  label: string; myValue: number; avgValue: number; color: string;
}) {
  const max = Math.max(myValue, avgValue) || 1;
  const myPct = (myValue / max) * 100;
  const avgPct = (avgValue / max) * 100;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-2xs text-sub w-6 shrink-0">나</span>
          <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${myPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-semibold w-20 text-right">{formatWon(myValue)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-sub w-6 shrink-0">평균</span>
          <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-disabled"
              initial={{ width: 0 }}
              animate={{ width: `${avgPct}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-sub w-20 text-right">{formatWon(avgValue)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───

interface Props {
  input: SimulationInput;
  result: EnhancedSimulationResult;
}

export default function StepCurrentReport({ input, result }: Props) {
  const gc = gradeConfig[result.grade];
  const expenseRatio = input.monthlyIncome > 0
    ? Math.round((result.monthlyExpense / input.monthlyIncome) * 100)
    : 0;
  const savingsRate = input.monthlyIncome > 0
    ? Math.round((result.surplus / input.monthlyIncome) * 100)
    : 0;

  const fixedRatio = input.monthlyIncome > 0
    ? Math.round((input.monthlyFixedCost / input.monthlyIncome) * 100)
    : 0;
  const variableRatio = input.monthlyIncome > 0
    ? Math.round((input.monthlyVariableCost / input.monthlyIncome) * 100)
    : 0;

  // 또래 비교 데이터
  const { data: peers } = usePeerStatistics(input.age, input.monthlyIncome);

  const surplusCount = useCountUp(Math.max(0, result.surplus));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

      {/* 등급 카드 */}
      <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ backgroundColor: gc.light }}>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: gc.main }}
          >
            {result.grade === 'RED' ? '!' : result.grade === 'YELLOW' ? '~' : ''}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: gc.dark }}>{gc.label}</span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold border"
                style={{ backgroundColor: gc.light, color: gc.dark, borderColor: gc.main }}
              >
                {result.grade}
              </span>
            </div>
            <p className="text-xs text-sub mt-0.5">
              소득의 <strong style={{ color: gc.dark }}>{expenseRatio}%</strong>를 지출하고 있어요
            </p>
          </div>
        </div>

        {/* 등급 설명 */}
        <div className="bg-white/60 rounded-xl p-3.5 text-xs leading-relaxed" style={{ color: gc.dark }}>
          {result.grade === 'RED' && (
            <p>소득 대비 지출 비율이 <strong>70% 이상</strong>으로 위험 수준이에요. 고정비와 변동비를 점검하고, 불필요한 지출을 줄여야 합니다.</p>
          )}
          {result.grade === 'YELLOW' && (
            <p>소득 대비 지출 비율이 <strong>50~70%</strong>로 주의가 필요해요. 조금만 더 줄이면 여유 자금을 확보할 수 있습니다.</p>
          )}
          {result.grade === 'GREEN' && (
            <p>소득 대비 지출 비율이 <strong>50% 미만</strong>으로 건강한 수준이에요! 잉여자금을 잘 투자하면 미래가 밝습니다.</p>
          )}
        </div>
      </motion.div>

      {/* 소비 성적 */}
      <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">소비 분석</h3>

        <div className="space-y-3 mb-4">
          {/* 고정비 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-sub">고정비</span>
              <span className="font-semibold">{formatWon(input.monthlyFixedCost)} ({fixedRatio}%)</span>
            </div>
            <div className="h-3 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-expense-fixed"
                initial={{ width: 0 }}
                animate={{ width: `${fixedRatio}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* 변동비 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-sub">변동비</span>
              <span className="font-semibold">{formatWon(input.monthlyVariableCost)} ({variableRatio}%)</span>
            </div>
            <div className="h-3 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-expense-variable"
                initial={{ width: 0 }}
                animate={{ width: `${variableRatio}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* 잉여자금 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-sub">잉여자금</span>
              <span className="font-semibold text-grade-green">
                {formatWon(Math.max(0, result.surplus))} ({Math.max(0, savingsRate)}%)
              </span>
            </div>
            <div className="h-3 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-grade-green"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, savingsRate)}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* 전체 파이 시각화 */}
        <div className="bg-surface rounded-xl p-4 text-center">
          <div className="relative w-full h-6 bg-surface rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-expense-fixed"
              initial={{ width: 0 }}
              animate={{ width: `${fixedRatio}%` }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="h-full bg-expense-variable"
              initial={{ width: 0 }}
              animate={{ width: `${variableRatio}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
            <motion.div
              className="h-full bg-grade-green"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, savingsRate)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <div className="flex justify-center gap-4 mt-2.5 text-2xs text-sub">
            <span><span className="inline-block w-2 h-2 rounded-full bg-expense-fixed mr-1" />고정비</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-expense-variable mr-1" />변동비</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-grade-green mr-1" />잉여</span>
          </div>
        </div>
      </motion.div>

      {/* 잉여자금 진단 */}
      <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-3">잉여자금 수준</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span ref={surplusCount.ref} className="text-2xl font-bold text-grade-green">
            {formatWon(surplusCount.value)}
          </span>
          <span className="text-xs text-sub">/ 월</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {result.surplus > 0 ? (
            <>
              <TrendingUp size={14} className="text-grade-green" />
              <span className="text-grade-green-text">
                소득의 {savingsRate}%를 저축/투자할 수 있어요
              </span>
            </>
          ) : (
            <>
              <TrendingDown size={14} className="text-grade-red" />
              <span className="text-grade-red-text">
                지출이 소득을 초과합니다. 지출 점검이 시급해요!
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* 또래 비교 */}
      {peers && (
        <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <Users size={16} className="text-sub" />
            <h3 className="text-sm font-bold">또래 비교</h3>
            <span className="text-2xs text-sub">({peers.ageGroup.label} · {peers.incomeGroup.label})</span>
          </div>

          <div className="space-y-4">
            <CompareBar
              label="월 소득"
              myValue={input.monthlyIncome}
              avgValue={peers.peers.avgMonthlyIncome}
              color={gc.main}
            />
            <CompareBar
              label="고정비"
              myValue={input.monthlyFixedCost}
              avgValue={peers.peers.avgFixedCost}
              color="var(--color-expense-fixed)"
            />
            <CompareBar
              label="변동비"
              myValue={input.monthlyVariableCost}
              avgValue={peers.peers.avgVariableCost}
              color="var(--color-expense-variable)"
            />
            <CompareBar
              label="잉여자금"
              myValue={Math.max(0, result.surplus)}
              avgValue={peers.peers.avgSurplus}
              color={gradeConfig.GREEN.main}
            />
          </div>

          {/* 저축률 비교 */}
          <div className="mt-4 bg-surface rounded-xl p-3.5">
            <div className="flex justify-between text-xs">
              <span className="text-sub">나의 저축률</span>
              <span className="font-semibold text-grade-green-text">
                {Math.max(0, savingsRate)}%
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-sub">또래 평균 저축률</span>
              <span className="font-semibold text-sub">{peers.peers.avgSavingsRate.toFixed(1)}%</span>
            </div>
            <div className="mt-2 text-xs leading-relaxed text-foreground">
              {savingsRate >= peers.peers.avgSavingsRate ? (
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-grade-green" />
                  <span>또래 평균보다 <strong>{(savingsRate - peers.peers.avgSavingsRate).toFixed(1)}%p</strong> 높아요!</span>
                </div>
              ) : savingsRate >= peers.peers.avgSavingsRate - 5 ? (
                <div className="flex items-center gap-1">
                  <Minus size={12} className="text-grade-yellow" />
                  <span>또래 평균과 비슷한 수준이에요</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <TrendingDown size={12} className="text-grade-red" />
                  <span>또래 평균보다 <strong>{(peers.peers.avgSavingsRate - savingsRate).toFixed(1)}%p</strong> 낮아요</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
