'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wallet, TrendingUp, Info } from 'lucide-react';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { SimulationInput, EnhancedSimulationResult } from '@/types/finance';
import dynamic from 'next/dynamic';

const InvestmentChart = dynamic(() => import('./InvestmentChart'), { ssr: false });

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function useCountUp(target: number, duration = 1200) {
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

interface Props {
  input: SimulationInput;
  result: EnhancedSimulationResult;
}

export default function StepFutureProjection({ input, result }: Props) {
  const gc = gradeConfig[result.grade];
  const sc = result.investmentScenarios;
  const fullScenario = sc[0]; // 전액 투자

  const nominalCount = useCountUp(fullScenario?.realMonthlyPension ?? 0);
  const inflPct = (result.inflationRate * 100).toFixed(1);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

      {/* 입력값 요약 */}
      <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-3">내가 입력한 값</h3>
        <div className="grid grid-cols-2 gap-3">
          <InfoBox icon={<Calendar size={14} />} label="현재 나이" value={`${input.age}세`} />
          <InfoBox icon={<Calendar size={14} />} label="은퇴 예정" value={`${input.retirementAge}세`} />
          <InfoBox icon={<Calendar size={14} />} label="연금 수령 시작" value={`${input.pensionStartAge}세`} />
          <InfoBox icon={<TrendingUp size={14} />} label="투자기간" value={`${result.investmentPeriod}년`} />
          <InfoBox icon={<Calendar size={14} />} label="거치기간" value={`${result.vestingPeriod}년`} />
          <InfoBox icon={<Wallet size={14} />} label="월 잉여자금" value={formatWon(Math.max(0, result.surplus))} />
        </div>
      </motion.div>

      {/* 투자 비율 시나리오 차트 */}
      <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">잉여자금 투자 비율에 따른 자산 변화</h3>
        <p className="text-2xs text-sub mb-4">연평균 수익률 7% 기준 · 100세까지 수령</p>

        <InvestmentChart
          scenarios={sc.map((s) => ({ label: s.label, trajectory: s.trajectory }))}
          currentAge={input.age}
          retirementAge={input.retirementAge}
          pensionStartAge={input.pensionStartAge}
        />
      </motion.div>

      {/* 시나리오별 월 수령액 */}
      <motion.div variants={fadeUp} className="bg-background border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">시나리오별 월 수령액</h3>
        <p className="text-2xs text-sub mb-4">{input.pensionStartAge}세부터 100세까지 · {result.pensionYears}년 수령</p>

        <div className="space-y-3">
          {sc.map((s, i) => (
            <motion.div
              key={s.label}
              className="bg-surface rounded-xl p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold">{s.label}</span>
                  <span className="text-2xs text-sub ml-1.5">월 {formatWon(s.monthlyInvestment)}</span>
                </div>
                <span
                  className="text-2xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: i === 0 ? gc.light : i === 1 ? 'var(--grade-yellow-bg)' : 'var(--surface)',
                    color: i === 0 ? gc.dark : i === 1 ? 'var(--grade-yellow-text)' : 'var(--sub-text)',
                  }}
                >
                  {Math.round(s.ratio * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xs text-sub mb-0.5">명목 월 수령액</p>
                  <p className="text-sm font-bold">{formatWon(s.nominalMonthlyPension)}</p>
                </div>
                <div>
                  <p className="text-2xs text-sub mb-0.5">실질 월 수령액</p>
                  <p ref={i === 0 ? nominalCount.ref : undefined} className="text-sm font-bold" style={{ color: gc.dark }}>
                    {i === 0 ? formatWon(nominalCount.value) : formatWon(s.realMonthlyPension)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 인플레 안내 */}
        <div className="flex items-start gap-1.5 mt-3 text-2xs text-sub">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>실질 수령액은 연 {inflPct}% 인플레이션을 반영한 현재 가치 기준이에요</span>
        </div>
      </motion.div>

      {/* 참고: 총 투자원금 & 미래자산 */}
      <motion.div variants={fadeUp} className="bg-surface rounded-2xl p-4">
        <p className="text-2xs text-sub mb-3 flex items-center gap-1">
          <Info size={11} />
          참고 — 전액 투자 시
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xs text-sub mb-0.5">총 투자 원금</p>
            <p className="text-sm font-semibold">{formatWon(fullScenario?.totalPrincipal ?? 0)}</p>
          </div>
          <div>
            <p className="text-2xs text-sub mb-0.5">미래 예상 자산</p>
            <p className="text-sm font-semibold" style={{ color: gc.dark }}>{formatWon(fullScenario?.futureAsset ?? 0)}</p>
          </div>
        </div>
        <p className="text-2xs text-sub mt-2 leading-relaxed">
          미래 자산은 복리 효과로 크게 보일 수 있지만, 꾸준한 투자 습관이 핵심이에요.
        </p>
      </motion.div>
    </motion.div>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1 text-sub mb-0.5">
        {icon}
        <span className="text-2xs">{label}</span>
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
