'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Wallet,
  Coins,
  Clock,
  Target,
  Rocket,
  PiggyBank,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { PreOnboardingResponse } from '@/types/course';
import type { Grade } from '@/types/finance';

const TABS = [
  { key: 'current', label: '현재', icon: Wallet },
  { key: 'future', label: '미래', icon: Rocket },
  { key: 'action', label: '행동', icon: Target },
] as const;

// ─── 애니메이션 훅 ───

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });
  const started = useRef(false);

  useEffect(() => {
    if (!inView) return;
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { value, ref };
}

// ─── 금액 포맷터 (대용량 축약) ───

function formatCompact(v: number): string {
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.round((abs % 100_000_000) / 10_000);
    return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만` : `${sign}${eok}억`;
  }
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000).toLocaleString()}만`;
  return `${sign}${abs.toLocaleString()}원`;
}

// ─── 페이지 ───

export default function PreOnboardingPreviewPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<PreOnboardingResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem('preOnboardingPreview');
    if (!raw) {
      router.replace('/onboarding');
      return;
    }
    try {
      setPreview(JSON.parse(raw));
    } catch {
      router.replace('/onboarding');
    }
  }, [router]);

  if (!preview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  const grade = preview.grade as Grade;
  const config = gradeConfig[grade];

  const handleSignUp = () => {
    sessionStorage.removeItem('preOnboardingPreview');
    signIn('kakao', { callbackUrl: '/pacemaker' });
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-28" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* ─── 히어로 ─── */}
      <HeroSection nickname={preview.nickname} grade={grade} config={config} gradeLabel={preview.currentTab.gradeLabel} expenseRatio={preview.currentTab.expenseRatio} />

      {/* ─── 탭 네비 ─── */}
      <div className="sticky top-2 z-10 bg-background/80 backdrop-blur-md rounded-2xl border border-border p-1 mb-5 shadow-sm">
        <div className="flex relative">
          <motion.div
            className="absolute top-0 bottom-0 rounded-xl"
            style={{ backgroundColor: config.main }}
            animate={{ left: `${(100 / TABS.length) * activeTab}%`, width: `${100 / TABS.length}%` }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const active = activeTab === i;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(i)}
                className={`relative flex-1 py-3 flex items-center justify-center gap-1.5 rounded-xl transition-colors duration-200 ${
                  active ? 'text-white font-bold' : 'text-sub font-medium'
                }`}
              >
                <Icon size={14} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 탭 내용 ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {activeTab === 0 && <CurrentTab data={preview.currentTab} config={config} grade={grade} />}
          {activeTab === 1 && <FutureTab data={preview.futureTab} nickname={preview.nickname} config={config} />}
          {activeTab === 2 && <ActionTab data={preview.actionTab} config={config} />}
        </motion.div>
      </AnimatePresence>

      {/* ─── 스티키 CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-4 pb-5 px-5">
        <div className="max-w-lg mx-auto">
          <motion.button
            onClick={handleSignUp}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative w-full h-14 bg-[#FEE500] text-[#391B1B] font-bold rounded-2xl flex items-center justify-center gap-2 overflow-hidden shadow-lg"
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 0.6 }}
              style={{ mixBlendMode: 'overlay' }}
            />
            <Sparkles size={16} />
            <span className="relative">무료로 진단 리포트 받기</span>
            <ChevronRight size={16} className="relative" />
          </motion.button>
          <p className="text-2xs text-sub text-center mt-2">카카오로 3초 · 신규가입 혜택 적용</p>
        </div>
      </div>
    </div>
  );
}

// ─── 히어로 ───

function HeroSection({
  nickname,
  grade,
  config,
  gradeLabel,
  expenseRatio,
}: {
  nickname: string;
  grade: Grade;
  config: { label: string; main: string; light: string; dark: string };
  gradeLabel: string;
  expenseRatio: number;
}) {
  const { value: ratio, ref: ratioRef } = useCountUp(expenseRatio, 1400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-3xl p-6 mb-5 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${config.light} 0%, ${config.main}15 100%)`,
        border: `1.5px solid ${config.main}40`,
      }}
    >
      {/* 배경 장식 */}
      <motion.div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: config.main }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-15 blur-2xl"
        style={{ backgroundColor: config.main }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative">
        <div className="flex items-center gap-1.5 mb-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={14} style={{ color: config.dark }} />
          </motion.div>
          <span className="text-2xs font-semibold tracking-wider" style={{ color: config.dark }}>
            AI 재테크 진단 리포트
          </span>
        </div>

        <h1 className="text-xl font-bold text-foreground leading-tight">
          <strong style={{ color: config.dark }}>{nickname}</strong>님만을 위한<br />
          맞춤 진단 결과예요
        </h1>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold text-white shadow-md"
                style={{ backgroundColor: config.main }}
              >
                {grade === 'RED' ? '!' : grade === 'YELLOW' ? '~' : ''}
              </span>
              <div>
                <p className="text-2xs text-sub">지출 등급</p>
                <p className="text-lg font-bold" style={{ color: config.dark }}>
                  {config.label} · <span className="text-sm">{gradeLabel}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xs text-sub">실질 지출 비율</p>
            <p className="text-3xl font-extrabold tabular-nums" style={{ color: config.dark }}>
              <span ref={ratioRef}>{ratio}</span>
              <span className="text-lg">%</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 현재 탭 ───

function CurrentTab({
  data,
  config,
  grade,
}: {
  data: PreOnboardingResponse['currentTab'];
  config: { label: string; main: string; light: string; dark: string };
  grade: Grade;
}) {
  const realExpense = Math.max(0, data.monthlyFixedCost - data.monthlyInvestment) + data.monthlyVariableCost;
  const fixedCoreRatio = data.monthlyIncome > 0 ? Math.round(((data.monthlyFixedCost - data.monthlyInvestment) / data.monthlyIncome) * 100) : 0;
  const variableRatio = data.monthlyIncome > 0 ? Math.round((data.monthlyVariableCost / data.monthlyIncome) * 100) : 0;
  const investRatio = data.monthlyIncome > 0 ? Math.round((data.monthlyInvestment / data.monthlyIncome) * 100) : 0;
  const surplusRatio = data.monthlyIncome > 0 ? Math.round((Math.max(0, data.surplus) / data.monthlyIncome) * 100) : 0;

  return (
    <>
      {/* 월 소득 + 도넛 차트 */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-2xs text-sub mb-0.5">월 소득</p>
            <AnimatedAmount value={data.monthlyIncome} className="text-2xl font-bold" />
          </div>
          <div className="text-right">
            <p className="text-2xs text-sub mb-0.5">월 잉여자금</p>
            <AnimatedAmount
              value={Math.max(0, data.surplus)}
              className="text-2xl font-bold"
              style={{ color: data.surplus >= 0 ? 'var(--grade-green-text)' : 'var(--grade-red-text)' }}
            />
          </div>
        </div>

        <DonutChart
          segments={[
            { label: '실질 고정비', value: Math.max(0, data.monthlyFixedCost - data.monthlyInvestment), color: 'var(--grade-yellow)' },
            { label: '변동비', value: data.monthlyVariableCost, color: 'var(--grade-red)' },
            { label: '투자금', value: data.monthlyInvestment, color: config.main },
            { label: '잉여자금', value: Math.max(0, data.surplus), color: 'var(--grade-green)' },
          ]}
          centerLabel="지출 구성"
          centerValue={formatCompact(realExpense)}
        />
      </Card>

      {/* 소득 대비 비율 */}
      <Card title="소득 대비 지출 구조" subtitle="한눈에 보는 소비 성적표">
        <div className="space-y-3.5">
          <RatioBar label="실질 고정비" ratio={fixedCoreRatio} amount={Math.max(0, data.monthlyFixedCost - data.monthlyInvestment)} color="var(--grade-yellow)" />
          <RatioBar label="변동비" ratio={variableRatio} amount={data.monthlyVariableCost} color="var(--grade-red)" />
          <RatioBar label="투자 (자산 이동)" ratio={investRatio} amount={data.monthlyInvestment} color={config.main} />
          <RatioBar label="잉여" ratio={surplusRatio} amount={Math.max(0, data.surplus)} color="var(--grade-green)" />
        </div>

        {/* 실질 지출 비율 게이지 */}
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-sub mb-2">실질 지출 비율 · 등급 기준</p>
          <GradeGauge value={data.expenseRatio} grade={grade} />
        </div>
      </Card>

      {/* 가용 예산 */}
      <Card title="오늘 쓸 수 있는 돈" subtitle="잉여자금을 쪼개서 계산했어요">
        <div className="grid grid-cols-3 gap-2.5">
          <BudgetCard icon={<Coins size={16} />} label="월" amount={data.availableBudget.monthly} color={config.main} delay={0} />
          <BudgetCard icon={<Calendar size={16} />} label="주" amount={data.availableBudget.weekly} color={config.main} delay={0.1} />
          <BudgetCard icon={<Clock size={16} />} label="일" amount={data.availableBudget.daily} color={config.main} delay={0.2} />
        </div>
        {data.surplus <= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 bg-grade-red-bg rounded-xl p-3 flex items-start gap-2"
          >
            <AlertTriangle size={14} className="text-grade-red mt-0.5 shrink-0" />
            <p className="text-xs text-grade-red-text leading-relaxed">
              지출이 소득을 넘어서고 있어요. 고정비부터 점검해 보세요.
            </p>
          </motion.div>
        )}
      </Card>
    </>
  );
}

// ─── 미래 탭 ───

function FutureTab({
  data,
  nickname,
  config,
}: {
  data: PreOnboardingResponse['futureTab'];
  nickname: string;
  config: { label: string; main: string; light: string; dark: string };
}) {
  const currentAge = data.retirementAge - data.yearsToRetirement;

  // 시나리오 중 최고 자산을 CTA 훅으로
  const bestScenario = useMemo(
    () => data.estimatedSavings.reduce((best, s) => (s.futureAsset > best.futureAsset ? s : best), data.estimatedSavings[0]),
    [data.estimatedSavings]
  );

  // 차트 데이터
  const chartData = data.estimatedSavings.map((s) => ({
    name: s.label,
    asset: s.futureAsset,
    pension: s.monthlyPension,
  }));

  const chartColors = ['var(--grade-green)', 'var(--grade-yellow)', 'var(--disabled)'];

  return (
    <>
      {/* 은퇴 타임라인 */}
      <Card title={`${nickname}님의 은퇴 로드맵`} subtitle="인생의 주요 이정표를 확인하세요">
        <RetirementTimeline
          currentAge={currentAge}
          retirementAge={data.retirementAge}
          pensionStartAge={data.pensionStartAge}
          gapYears={data.pensionGapYears}
          color={config.main}
        />

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <TimelineStatCard label="은퇴까지" value={`${data.yearsToRetirement}년`} color={config.main} />
          <TimelineStatCard label="은퇴 나이" value={`${data.retirementAge}세`} color={config.main} />
          <TimelineStatCard label="연금 시작" value={`${data.pensionStartAge}세`} color={config.main} />
        </div>

        {data.pensionGapYears > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 rounded-xl p-3.5 flex items-start gap-2"
            style={{ backgroundColor: 'var(--grade-red-bg)' }}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--grade-red)' }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--grade-red-text)' }}>
                소득 공백 {data.pensionGapYears}년
              </p>
              <p className="text-2xs mt-0.5 leading-relaxed" style={{ color: 'var(--grade-red-text)' }}>
                은퇴 후 연금 수령까지 {data.pensionGapYears}년간 소득 없이 버텨야 해요. 별도 대비가 필요합니다.
              </p>
            </div>
          </motion.div>
        )}
      </Card>

      {/* 시나리오 차트 */}
      <Card title="투자 시나리오별 예상 자산" subtitle="잉여자금을 얼마나 투자하느냐에 따른 미래">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="99%" height={220} minWidth={0}>
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
              <defs>
                {chartColors.map((c, i) => (
                  <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.5} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--sub-text)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis
                tickFormatter={(v) => {
                  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
                  if (v >= 10_000) return `${Math.round(v / 10_000)}만`;
                  return String(v);
                }}
                tick={{ fontSize: 10, fill: 'var(--sub-text)' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value) => [formatWon(Number(value)), '예상 자산']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)' }}
                cursor={{ fill: 'var(--surface)' }}
              />
              <Bar dataKey="asset" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`url(#bar-grad-${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 시나리오 카드 */}
        <div className="mt-4 space-y-2.5">
          {data.estimatedSavings.map((s, i) => (
            <ScenarioRow
              key={s.label}
              label={s.label}
              asset={s.futureAsset}
              pension={s.monthlyPension}
              color={chartColors[i] ?? 'var(--disabled)'}
              isBest={s.label === bestScenario?.label}
              delay={i * 0.1}
            />
          ))}
        </div>
      </Card>

      {/* 최고 시나리오 하이라이트 */}
      {bestScenario && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.light} 0%, ${config.main}22 100%)`,
            border: `1.5px solid ${config.main}55`,
          }}
        >
          <motion.div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: config.main, opacity: 0.25 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative">
            <p className="text-2xs font-semibold tracking-wider mb-1" style={{ color: config.dark }}>
              💡 최고 시나리오 · {bestScenario.label}
            </p>
            <p className="text-xs text-sub mb-2">
              {nickname}님, 이대로만 가면 은퇴 후
            </p>
            <AnimatedAmount
              value={bestScenario.futureAsset}
              className="text-3xl font-extrabold block mb-1.5"
              style={{ color: config.dark }}
            />
            <p className="text-xs text-foreground">
              평생 자산을 만들 수 있어요<br />
              <strong style={{ color: config.dark }}>월 {formatCompact(bestScenario.monthlyPension)}원</strong>씩 받을 수 있죠
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}

// ─── 행동 탭 ───

function ActionTab({
  data,
  config,
}: {
  data: PreOnboardingResponse['actionTab'];
  config: { label: string; main: string; light: string; dark: string };
}) {
  const actionSteps = splitIntoSteps(data.gradeAction);

  return (
    <>
      {/* 등급별 행동 가이드 */}
      <Card title="지금부터 시작할 것" subtitle="등급에 맞춘 맞춤 가이드">
        {actionSteps.length > 1 ? (
          <div className="space-y-2.5">
            {actionSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex gap-3 p-3 rounded-xl"
                style={{ backgroundColor: config.light }}
              >
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: config.main }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed pt-1">{step}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-body text-foreground leading-relaxed">{data.gradeAction}</p>
        )}
      </Card>

      {/* 코스 안내 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.main} 0%, ${config.dark} 100%)`,
        }}
      >
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <PiggyBank size={14} className="text-white" />
            <span className="text-2xs font-semibold tracking-wider text-white/90">머니런 코스 추천</span>
          </div>
          <p className="text-body text-white leading-relaxed whitespace-pre-line">{data.courseMessage}</p>
        </div>
      </motion.div>

      {/* CTA 메시지 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: 'spring' }}
        className="rounded-2xl p-5 border-2 text-center"
        style={{ borderColor: config.main, backgroundColor: 'var(--background)' }}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
          style={{ backgroundColor: config.light }}
        >
          <Rocket size={18} style={{ color: config.main }} />
        </motion.div>
        <p className="text-body font-bold text-foreground leading-snug">{data.ctaMessage}</p>
        <p className="text-2xs text-sub mt-2">아래 버튼으로 3초 만에 시작</p>
      </motion.div>
    </>
  );
}

// ─── 재사용 컴포넌트 ───

function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-background border border-border rounded-2xl p-5 shadow-sm"
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-2xs text-sub mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

function AnimatedAmount({
  value,
  className,
  style,
}: {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { value: v, ref } = useCountUp(value, 1400);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`} style={style}>
      {formatWon(v)}
    </span>
  );
}

function RatioBar({ label, ratio, amount, color }: { label: string; ratio: number; amount: number; color: string }) {
  const safeRatio = Math.max(0, Math.min(100, ratio));
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-xs text-sub">
          <span className="font-semibold text-foreground">{formatWon(amount)}</span>
          <span className="ml-1.5 tabular-nums">{ratio}%</span>
        </span>
      </div>
      <div className="h-2.5 bg-surface rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${safeRatio}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function GradeGauge({ value, grade }: { value: number; grade: Grade }) {
  const pos = Math.min(100, Math.max(0, value));
  const gradeColor = gradeConfig[grade].main;

  return (
    <div className="relative">
      <div className="h-4 rounded-full overflow-hidden flex">
        <div className="flex-1" style={{ backgroundColor: 'var(--grade-green)', opacity: 0.25 }} />
        <div className="flex-1" style={{ backgroundColor: 'var(--grade-yellow)', opacity: 0.25 }} />
        <div className="flex-1" style={{ backgroundColor: 'var(--grade-red)', opacity: 0.25 }} />
      </div>

      {/* 기준선 */}
      <div className="absolute top-0 bottom-0 w-px bg-border" style={{ left: '33.33%' }} />
      <div className="absolute top-0 bottom-0 w-px bg-border" style={{ left: '66.66%' }} />

      {/* 현재 위치 마커 */}
      <motion.div
        className="absolute top-[-4px] w-[6px] h-[22px] rounded-full shadow-md"
        style={{ backgroundColor: gradeColor, left: `${pos}%`, transform: 'translateX(-50%)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
      />

      {/* 라벨 */}
      <div className="flex justify-between mt-2 text-3xs text-sub">
        <span>양호 ~50%</span>
        <span>주의 50~70%</span>
        <span>위험 70%~</span>
      </div>
    </div>
  );
}

function BudgetCard({
  icon,
  label,
  amount,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  color: string;
  delay: number;
}) {
  const { value, ref } = useCountUp(Math.max(0, amount));
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260 }}
      className="bg-surface rounded-xl p-3 text-center"
    >
      <div
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg mb-1.5"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <p className="text-2xs text-sub mb-0.5">{label}</p>
      <span ref={ref} className="text-sm font-bold tabular-nums block">
        {formatCompact(value)}
      </span>
    </motion.div>
  );
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 62;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce<Array<{ label: string; value: number; color: string; length: number; offset: number; ratio: number }>>((acc, s) => {
    const ratio = total > 0 ? s.value / total : 0;
    const length = circumference * ratio;
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
    acc.push({ ...s, length, offset: prevOffset, ratio });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--surface)" strokeWidth={strokeWidth} />
          {arcs.map((a, i) => (
            <motion.circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${a.length} ${circumference}`}
              initial={{ strokeDashoffset: -circumference }}
              animate={{ strokeDashoffset: -a.offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-3xs text-sub">{centerLabel}</p>
          <p className="text-base font-bold tabular-nums">{centerValue}</p>
        </motion.div>
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        {arcs.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
            <span className="text-2xs text-sub flex-1 truncate">{a.label}</span>
            <span className="text-2xs font-semibold tabular-nums">{Math.round(a.ratio * 100)}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RetirementTimeline({
  currentAge,
  retirementAge,
  pensionStartAge,
  gapYears,
  color,
}: {
  currentAge: number;
  retirementAge: number;
  pensionStartAge: number;
  gapYears: number;
  color: string;
}) {
  const minAge = currentAge;
  const maxAge = Math.max(pensionStartAge, retirementAge) + 2;
  const span = maxAge - minAge || 1;

  const toPct = (age: number) => Math.min(100, Math.max(0, ((age - minAge) / span) * 100));
  const currentPct = toPct(currentAge);
  const retirePct = toPct(retirementAge);
  const pensionPct = toPct(pensionStartAge);

  return (
    <div className="relative pt-6 pb-8">
      {/* 트랙 */}
      <div className="relative h-2 bg-surface rounded-full">
        {/* 근로 기간 */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-full"
          style={{ left: `${currentPct}%`, backgroundColor: color, opacity: 0.5 }}
          initial={{ width: 0 }}
          animate={{ width: `${retirePct - currentPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
        {/* 공백 기간 */}
        {gapYears > 0 && (
          <motion.div
            className="absolute top-0 bottom-0"
            style={{ left: `${retirePct}%`, backgroundColor: 'var(--grade-red)', opacity: 0.5 }}
            initial={{ width: 0 }}
            animate={{ width: `${pensionPct - retirePct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}
          />
        )}
        {/* 연금 기간 */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-r-full"
          style={{ left: `${pensionPct}%`, right: 0, backgroundColor: 'var(--grade-green)', opacity: 0.4 }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${100 - pensionPct}%`, opacity: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 1.3 }}
        />
      </div>

      {/* 마커 */}
      <TimelineMarker pct={currentPct} label="현재" age={currentAge} color={color} delay={0.3} above />
      <TimelineMarker pct={retirePct} label="은퇴" age={retirementAge} color={gapYears > 0 ? 'var(--grade-red)' : color} delay={0.6} />
      <TimelineMarker pct={pensionPct} label="연금 시작" age={pensionStartAge} color="var(--grade-green)" delay={0.9} above />
    </div>
  );
}

function TimelineMarker({
  pct,
  label,
  age,
  color,
  delay,
  above,
}: {
  pct: number;
  label: string;
  age: number;
  color: string;
  delay: number;
  above?: boolean;
}) {
  return (
    <motion.div
      className="absolute top-[18px]"
      style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <motion.div
        className="w-3 h-3 rounded-full ring-[3px] ring-background shadow-md"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay }}
      />
      <div
        className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap ${above ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
      >
        <p className="text-3xs text-sub">{label}</p>
        <p className="text-2xs font-bold" style={{ color }}>{age}세</p>
      </div>
    </motion.div>
  );
}

function TimelineStatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface rounded-xl py-2.5">
      <p className="text-3xs text-sub mb-0.5">{label}</p>
      <p className="text-sm font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function ScenarioRow({
  label,
  asset,
  pension,
  color,
  isBest,
  delay,
}: {
  label: string;
  asset: number;
  pension: number;
  color: string;
  isBest: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 rounded-xl relative overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        border: isBest ? `1.5px solid ${color}` : '1px solid transparent',
      }}
    >
      {isBest && (
        <div
          className="absolute top-0 right-0 px-2 py-0.5 text-3xs font-bold text-white rounded-bl-lg"
          style={{ backgroundColor: color }}
        >
          BEST
        </div>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-3xs text-sub mt-0.5 flex items-center gap-1">
            <TrendingUp size={10} />
            월 {formatCompact(pension)}원 수령
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="text-2xs text-sub">예상 자산</p>
        <p className="text-sm font-bold tabular-nums">{formatCompact(asset)}</p>
      </div>
    </motion.div>
  );
}

// ─── 헬퍼 ───

function splitIntoSteps(text: string): string[] {
  if (!text) return [];
  // 문장부호 기준 분리: 마침표/느낌표/물음표 + 공백
  const sentences = text.split(/(?<=[.!?。！？])\s+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length >= 2 && sentences.length <= 5) return sentences;
  return [text];
}
