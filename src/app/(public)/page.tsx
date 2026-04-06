'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { calculateSimulation } from '@/lib/simulation';
import { gradeConfig } from '@/lib/grade';
import { formatWon } from '@/lib/format';
import LoginSheet from '@/components/common/LoginSheet';
import { Wallet, AlertTriangle } from 'lucide-react';

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

function TextField({ label, value, onChange, placeholder, id }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string;
}) {
  return (
    <label className="block">
      <span className="text-caption text-sub mb-1.5 block">{label}</span>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-foreground text-body-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow placeholder:text-placeholder"
      />
    </label>
  );
}

export default function LandingPage() {
  const { input, setInput, hasResult, setHasResult, loadFromSession } = useSimulationStore();
  const [showLogin, setShowLogin] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadFromSession(); }, [loadFromSession]);

  const result = useMemo(() => calculateSimulation(input), [input]);
  const gc = gradeConfig[result.grade];

  const monthlyExpense = input.monthlyFixedCost + input.monthlyVariableCost;
  const expenseRatio = input.monthlyIncome > 0 ? Math.round((monthlyExpense / input.monthlyIncome) * 100) : 0;
  const investmentPeriod = Math.max(0, input.retirementAge - input.age);
  const vestingPeriod = Math.max(0, input.pensionStartAge - input.retirementAge);

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
            <h2 className="text-lg md:text-xl font-bold mb-6">내 정보 입력</h2>
            <div className="space-y-5">
              <TextField label="닉네임" value={input.nickname} onChange={(v) => setInput({ nickname: v })} placeholder="예: 민수" />
              <IntField label="나이" value={input.age} onChange={(v) => setInput({ age: v })} suffix="세" placeholder="만 나이" />
              <IntField label="은퇴 예정 나이" value={input.retirementAge} onChange={(v) => setInput({ retirementAge: v })} suffix="세" placeholder="예: 55" />
              <IntField label="은퇴자금 수령 나이" value={input.pensionStartAge} onChange={(v) => setInput({ pensionStartAge: v })} suffix="세" placeholder="기본 65" />
              <IntField label="월 실수령액" value={input.monthlyIncome ? input.monthlyIncome / 10000 : 0} onChange={(v) => {
                const income = Math.round(v * 10000);
                const updates: Partial<typeof input> = { monthlyIncome: income };
                const total = input.monthlyFixedCost + input.monthlyVariableCost;
                if (total > income) {
                  const ratio = income > 0 ? income / total : 0;
                  updates.monthlyFixedCost = Math.floor(input.monthlyFixedCost * ratio);
                  updates.monthlyVariableCost = Math.floor(input.monthlyVariableCost * ratio);
                }
                setInput(updates);
              }} suffix="만 원" placeholder="예: 300" />
              <IntField label="월 고정비" value={input.monthlyFixedCost ? input.monthlyFixedCost / 10000 : 0} onChange={(v) => {
                const won = Math.round(v * 10000);
                const max = input.monthlyIncome - input.monthlyVariableCost;
                setInput({ monthlyFixedCost: Math.min(won, Math.max(0, max)) });
              }} suffix="만 원" placeholder="예: 150" />
              <IntField label="월 변동비 (쇼핑, 술, 커피 등)" value={input.monthlyVariableCost ? input.monthlyVariableCost / 10000 : 0} onChange={(v) => {
                const won = Math.round(v * 10000);
                const max = input.monthlyIncome - input.monthlyFixedCost;
                setInput({ monthlyVariableCost: Math.min(won, Math.max(0, max)) });
              }} suffix="만 원" placeholder="예: 100" />

              {/* 자동 계산 요약 */}
              {input.monthlyIncome > 0 && (
                <div className="bg-surface rounded-xl p-4 space-y-2">
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
                  {input.retirementAge > 0 && (
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
                </div>
              )}

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
                <span className="text-caption font-medium" style={{ color: gc.dark }}>
                  지출 비율 {expenseRatio}%
                </span>
              </div>

              {/* 하루 사용 가능 금액 */}
              <div className="bg-white/60 rounded-xl p-4 mb-4">
                <p className="text-xs text-sub mb-0.5">
                  <Wallet size={12} className="inline mr-1" />
                  하루 사용 가능 금액
                </p>
                <p className="text-xl font-bold">{formatWon(Math.max(0, result.variableCost.daily))}</p>
                <p className="text-2xs text-sub mt-1">
                  주간 {formatWon(result.variableCost.weekly)} · 월간 {formatWon(result.variableCost.monthly)}
                </p>
              </div>

              {/* 시뮬레이션 케이스 */}
              {result.simulation.cases.length > 0 && investmentPeriod > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    잉여자금 월 {formatWon(Math.max(0, result.surplus))} 투자 시 ({investmentPeriod}년 + 거치 {vestingPeriod}년)
                  </p>
                  {result.simulation.cases.map((c) => (
                    <div key={c.label} className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs text-sub">{c.label}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatWon(c.futureAsset)}</p>
                        <p className="text-2xs text-sub">월 연금 {formatWon(c.monthlyPension)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 인사이트 */}
            {input.monthlyIncome > 0 && (
              <div className="bg-white border border-border rounded-2xl p-4 md:p-5 space-y-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-grade-yellow" />
                  알아두세요
                </p>
                <ul className="space-y-2 text-caption text-sub leading-relaxed">
                  {expenseRatio >= 70 && (
                    <li>소득의 <strong className="text-grade-red">{expenseRatio}%</strong>를 지출하고 있어요. 변동비를 줄여보세요.</li>
                  )}
                  {expenseRatio >= 50 && expenseRatio < 70 && (
                    <li>소득의 <strong className="text-grade-yellow">{expenseRatio}%</strong> 지출 중. 50% 이하로 줄이면 여유가 생겨요.</li>
                  )}
                  {expenseRatio < 50 && (
                    <li>소득의 <strong className="text-grade-green">{expenseRatio}%</strong>만 지출 중! 잉여자금을 잘 활용하면 됩니다.</li>
                  )}
                  {result.surplus <= 0 && (
                    <li className="text-grade-red font-medium">소득보다 지출이 많습니다! 고정비와 변동비를 점검하세요.</li>
                  )}
                </ul>
              </div>
            )}

            {/* AI 리포트 CTA */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-base font-bold mb-1">AI 상세 리포트</p>
              <p className="text-caption text-sub mb-4">맞춤형 소비 분석과 절약 전략을 받아보세요</p>
              <button onClick={() => setShowLogin(true)} className="w-full h-11 text-caption font-semibold rounded-xl text-white transition-colors hover:opacity-90" style={{ backgroundColor: gc.main }}>
                무료로 받기 (로그인)
              </button>
            </div>

            {/* 값 수정 */}
            <div className="text-center">
              <button onClick={() => document.getElementById('sim-form')?.scrollIntoView({ behavior: 'smooth' })} className="md:hidden text-sm text-sub hover:text-foreground transition-colors mb-2">
                값 수정하기
              </button>
            </div>
          </div>
        </div>
      </section>

      <LoginSheet open={showLogin} onClose={() => setShowLogin(false)} message="AI 상세 리포트를 무료로 받으려면 로그인이 필요해요." />
    </>
  );
}
