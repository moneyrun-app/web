'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSimulationStore } from '@/store/simulationStore';
import { calculateSimulation } from '@/lib/simulation';
import { gradeConfig } from '@/lib/grade';
import { formatWon } from '@/lib/format';
import LoginSheet from '@/components/common/LoginSheet';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Wallet, PiggyBank, Flame } from 'lucide-react';

const TrajectoryChart = dynamic(() => import('@/components/simulation/TrajectoryChart'), { ssr: false });

// 평균 데이터 (constants에서 가져올 수도 있지만 시뮬레이션은 비로그인이라 하드코딩)
const AVG = {
  rent: 730_000,
  transport: 80_000,
  phone: 50_000,
  fixedTotal: 860_000, // 평균 고정비 합계
  inflationRate: 0.025,
  sp500Return: 10, // S&P500 장기 평균 수익률
  kospiReturn: 7, // KOSPI 장기 평균
  savingsRate: 3, // 예적금 평균
  minPension: 1_300_000,
};

function IntField({ label, value, onChange, suffix, placeholder, id }: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; placeholder?: string; id?: string;
}) {
  return (
    <label className="block">
      <span className="text-caption text-sub mb-1.5 block">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(parseInt(raw, 10) || 0);
          }}
          className="w-full h-12 px-4 pr-14 bg-surface border border-border rounded-xl text-foreground text-body-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow placeholder:text-placeholder"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sub text-caption">{suffix}</span>
      </div>
    </label>
  );
}

function DecimalField({ label, value, onChange, suffix, placeholder, id }: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; placeholder?: string; id?: string;
}) {
  return (
    <label className="block">
      <span className="text-caption text-sub mb-1.5 block">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            if ((raw.match(/\./g) || []).length > 1) return;
            const parts = raw.split('.');
            if (parts[1] && parts[1].length > 2) return;
            onChange(Number(raw) || 0);
          }}
          className="w-full h-12 px-4 pr-14 bg-surface border border-border rounded-xl text-foreground text-body-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow placeholder:text-placeholder"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sub text-caption">{suffix}</span>
      </div>
    </label>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof TrendingUp; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white/80 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={14} className={color || 'text-sub'} />
        <span className="text-xs text-sub">{label}</span>
      </div>
      <p className="text-base font-bold">{value}</p>
      {sub && <p className="text-2xs text-sub mt-0.5">{sub}</p>}
    </div>
  );
}

export default function LandingPage() {
  const { input, setInput, hasResult, setHasResult, loadFromSession } = useSimulationStore();
  const [showLogin, setShowLogin] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadFromSession(); }, [loadFromSession]);

  const result = useMemo(() => calculateSimulation(input), [input]);
  const gc = gradeConfig[result.grade];

  // 파생 데이터
  const investRatio = input.monthlyIncome > 0 ? Math.round((input.monthlyInvestment / input.monthlyIncome) * 100) : 0;
  const fixedRatio = input.monthlyIncome > 0 ? Math.round((input.monthlyFixedCost / input.monthlyIncome) * 100) : 0;
  const fixedDiff = input.monthlyFixedCost - AVG.fixedTotal;
  const endAge = input.age + input.investmentYears;
  const inflationAdjusted = result.simulation.futureAsset > 0
    ? Math.round(result.simulation.futureAsset / Math.pow(1 + AVG.inflationRate, input.investmentYears))
    : 0;
  const totalInvested = input.monthlyInvestment * 12 * input.investmentYears;
  const investGain = result.simulation.futureAsset - totalInvested;

  const handleSimulate = useCallback(() => {
    setHasResult(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [setHasResult]);

  return (
    <>
      {/* Hero */}
      <section className="px-4 md:px-10 pt-12 md:pt-20 pb-6 md:pb-6 text-center">
        <h1 className="text-display md:text-5xl font-bold leading-tight mb-3">
          <span className="md:hidden">65세에<br />거지 되지 마세요</span>
          <span className="hidden md:inline">65세에 거지 되지 마세요</span>
        </h1>
        <p className="text-sub text-body-lg md:text-lg mb-8">무료로 바로 시뮬레이션 해보세요</p>
        <a href="#sim-form" className="md:hidden inline-flex items-center justify-center h-12 px-8 bg-foreground text-white font-semibold rounded-xl hover:bg-foreground/90 transition-colors">
          무료로 시뮬레이션
        </a>
      </section>

      {/* Simulation */}
      <section id="sim-form" className="px-4 md:px-10 pb-16 max-w-5xl mx-auto">
        <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
          {/* Form */}
          <div className="bg-white border border-border rounded-2xl p-4 md:p-8 shadow-sm mb-6 md:mb-0">
            <h2 className="text-lg md:text-xl font-bold mb-6">시뮬레이션 입력</h2>
            <div className="space-y-5">
              <IntField label="나이" value={input.age} onChange={(v) => setInput({ age: v, investmentYears: v > 0 ? Math.max(1, 65 - v) : 0 })} suffix="세" placeholder="만 나이" />
              <IntField label="월평균 실수령액" value={input.monthlyIncome ? input.monthlyIncome / 10000 : 0} onChange={(v) => setInput({ monthlyIncome: Math.round(v * 10000) })} suffix="만 원" placeholder="예: 230" />
              <IntField label="월 정기 투자금" value={input.monthlyInvestment ? input.monthlyInvestment / 10000 : 0} onChange={(v) => setInput({ monthlyInvestment: Math.round(v * 10000) })} suffix="만 원" placeholder="예: 50" />
              <IntField label="월평균 고정비" value={input.monthlyFixedCost ? input.monthlyFixedCost / 10000 : 0} onChange={(v) => setInput({ monthlyFixedCost: Math.round(v * 10000) })} suffix="만 원" placeholder="예: 120" />
              <DecimalField label="연평균 수익률" value={input.expectedReturn} onChange={(v) => setInput({ expectedReturn: v })} suffix="%" placeholder="예: 5" />
              <IntField label="투자기간" value={input.investmentYears} onChange={(v) => setInput({ investmentYears: v })} suffix="년" placeholder="예: 30" />
              <button onClick={handleSimulate} className="w-full h-12 bg-foreground text-white font-semibold rounded-xl hover:bg-foreground/90 transition-colors">
                시뮬레이션 하기
              </button>
            </div>
          </div>

          {/* Result */}
          <div ref={resultRef} className={`${hasResult ? 'block' : 'hidden'} md:sticky md:top-8 space-y-4`}>

            {/* 등급 + 핵심 요약 */}
            <div className="rounded-2xl p-5 md:p-7" style={{ backgroundColor: gc.light }}>
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: gc.light, color: gc.dark, borderColor: gc.main }}>
                  {result.grade}
                </span>
                <span className="text-caption font-medium" style={{ color: gc.dark }}>{gc.label}</span>
              </div>

              {/* 타임라인 요약 */}
              <div className="mb-5">
                <p className="text-caption text-sub mb-1">
                  <Calendar size={12} className="inline mr-1" />
                  {input.age}세 → {endAge}세 ({input.investmentYears}년간)
                </p>
                <p className="text-caption text-sub">
                  매달 <strong className="text-foreground">{formatWon(input.monthlyInvestment)}</strong> 투자 시
                </p>
                <p className="text-amount-lg md:text-4xl font-bold mt-2" style={{ color: gc.dark }}>
                  {formatWon(result.simulation.futureAsset)}
                </p>
                <p className="text-xs text-sub mt-1">
                  원금 {formatWon(totalInvested)} + 수익 {formatWon(Math.max(0, investGain))}
                </p>
              </div>

              {/* 하루 사용 가능 */}
              <div className="bg-white/60 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-sub mb-0.5">
                      <Wallet size={12} className="inline mr-1" />
                      하루 사용 가능 금액
                    </p>
                    <p className="text-xl font-bold">{formatWon(Math.max(0, result.variableCost.daily))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-sub mb-0.5">투자 비율</p>
                    <p className={`text-xl font-bold ${investRatio >= 20 ? 'text-grade-green' : investRatio >= 10 ? 'text-grade-yellow' : 'text-grade-red'}`}>
                      {investRatio}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 65세 목표 대비 */}
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-xs text-sub mb-2">
                  <Target size={12} className="inline mr-1" />
                  65세 노후 최소 생활비 월 {formatWon(AVG.minPension)} 기준
                </p>
                <p className={`text-lg font-bold ${result.simulation.meetsGoal ? 'text-grade-green' : 'text-grade-red'}`}>
                  {result.simulation.meetsGoal
                    ? '달성 가능!'
                    : `월 ${formatWon(result.simulation.shortfall)} 부족`
                  }
                </p>
                {!result.simulation.meetsGoal && input.monthlyInvestment > 0 && (
                  <p className="text-2xs text-sub mt-1">
                    투자금을 월 {formatWon(Math.max(0, input.monthlyInvestment + result.simulation.shortfall * 300))}으로 올리면 달성 가능
                  </p>
                )}
              </div>
            </div>

            {/* 내 상황 분석 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 고정비 비교 */}
              <StatCard
                icon={fixedDiff > 0 ? TrendingUp : TrendingDown}
                label="고정비 vs 평균"
                value={fixedDiff > 0 ? `${formatWon(fixedDiff)} 많음` : fixedDiff < 0 ? `${formatWon(Math.abs(fixedDiff))} 적음` : '평균 수준'}
                sub={`평균 ${formatWon(AVG.fixedTotal)} (월세+교통+통신)`}
                color={fixedDiff > 100_000 ? 'text-grade-red' : 'text-grade-green'}
              />

              {/* 인플레이션 반영 */}
              <StatCard
                icon={Flame}
                label={`인플레이션 반영 (${(AVG.inflationRate * 100).toFixed(1)}%)`}
                value={formatWon(inflationAdjusted)}
                sub={`오늘 기준 실질 가치`}
                color="text-grade-yellow"
              />

              {/* 투자 비교: 예적금 vs 내 수익률 */}
              <StatCard
                icon={PiggyBank}
                label="예적금으로 했다면"
                value={formatWon(
                  input.monthlyInvestment > 0 && input.investmentYears > 0
                    ? Math.round(input.monthlyInvestment * ((Math.pow(1 + AVG.savingsRate / 100 / 12, input.investmentYears * 12) - 1) / (AVG.savingsRate / 100 / 12)))
                    : 0
                )}
                sub={`연 ${AVG.savingsRate}% 기준`}
              />

              {/* S&P500 비교 */}
              <StatCard
                icon={TrendingUp}
                label="S&P500 평균이라면"
                value={formatWon(
                  input.monthlyInvestment > 0 && input.investmentYears > 0
                    ? Math.round(input.monthlyInvestment * ((Math.pow(1 + AVG.sp500Return / 100 / 12, input.investmentYears * 12) - 1) / (AVG.sp500Return / 100 / 12)))
                    : 0
                )}
                sub={`연 ${AVG.sp500Return}% 장기 평균`}
                color="text-grade-green"
              />
            </div>

            {/* 핵심 인사이트 */}
            {input.monthlyIncome > 0 && (
              <div className="bg-white border border-border rounded-2xl p-4 md:p-5 space-y-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-grade-yellow" />
                  알아두세요
                </p>
                <ul className="space-y-2 text-caption text-sub leading-relaxed">
                  {investRatio < 10 && (
                    <li>소득의 <strong className="text-grade-red">{investRatio}%</strong>만 투자 중이에요. 최소 <strong>10%</strong> 이상 투자해야 노후가 안전합니다.</li>
                  )}
                  {investRatio >= 10 && investRatio < 20 && (
                    <li>소득의 <strong className="text-grade-yellow">{investRatio}%</strong> 투자 중. <strong>20%</strong> 이상이면 안정적인 노후가 가능해요.</li>
                  )}
                  {investRatio >= 20 && (
                    <li>소득의 <strong className="text-grade-green">{investRatio}%</strong> 투자 중! 훌륭해요. 이 속도 유지하면 됩니다.</li>
                  )}
                  {fixedDiff > 100_000 && (
                    <li>고정비가 평균보다 <strong className="text-grade-red">{formatWon(fixedDiff)}</strong> 많아요. 통신비, 구독 서비스를 점검해보세요.</li>
                  )}
                  {input.expectedReturn <= AVG.savingsRate && input.expectedReturn > 0 && (
                    <li>수익률 {input.expectedReturn}%는 예적금 수준이에요. 인덱스 펀드(연 7~10%)를 고려해보세요.</li>
                  )}
                  {inflationAdjusted > 0 && result.simulation.futureAsset > 0 && (
                    <li>{input.investmentYears}년 후 {formatWon(result.simulation.futureAsset)}은 오늘 가치로 <strong>{formatWon(inflationAdjusted)}</strong>입니다 (인플레이션 {(AVG.inflationRate * 100).toFixed(1)}%).</li>
                  )}
                  {result.variableCost.monthly < 0 && (
                    <li className="text-grade-red font-medium">소득보다 지출이 많습니다! 고정비 또는 투자금을 조정하세요.</li>
                  )}
                </ul>
              </div>
            )}

            {/* 자산 궤도 차트 */}
            <div className="bg-white border border-border rounded-2xl p-4 md:p-5">
              <p className="text-sm font-semibold mb-3">자산 궤도</p>
              <TrajectoryChart
                monthlySaving={Math.max(0, input.monthlyInvestment)}
                annualRate={input.expectedReturn}
                years={input.investmentYears}
                targetCorpus={AVG.minPension * 12 * 25}
                gradeColor={gc.main}
              />
            </div>

            {/* AI 리포트 CTA */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-base font-bold mb-1">AI 상세 리포트</p>
              <p className="text-caption text-sub mb-4">맞춤형 투자 전략과 상세 소비 분석을 받아보세요</p>
              <button onClick={() => setShowLogin(true)} className="w-full h-11 text-caption font-semibold rounded-xl text-white transition-colors hover:opacity-90" style={{ backgroundColor: gc.main }}>
                무료로 받기 (로그인)
              </button>
            </div>

            {/* 값 수정 + 면책 */}
            <div className="text-center">
              <button onClick={() => document.getElementById('sim-form')?.scrollIntoView({ behavior: 'smooth' })} className="md:hidden text-sm text-sub hover:text-foreground transition-colors mb-2">
                값 수정하기
              </button>
              <p className="text-2xs text-placeholder leading-relaxed">
                본 시뮬레이션은 참고용이며 실제 투자 수익을 보장하지 않습니다.<br />
                투자에는 원금 손실 위험이 있으니 신중히 판단하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LoginSheet open={showLogin} onClose={() => setShowLogin(false)} message="AI 상세 리포트를 무료로 받으려면 로그인이 필요해요." />
    </>
  );
}
