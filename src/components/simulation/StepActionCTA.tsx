'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, DollarSign, ShieldAlert, BarChart3, ArrowRight, Lock } from 'lucide-react';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { SimulationInput, EnhancedSimulationResult } from '@/types/finance';
import LoginSheet from '@/components/common/LoginSheet';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

interface Props {
  input: SimulationInput;
  result: EnhancedSimulationResult;
}

export default function StepActionCTA({ input, result }: Props) {
  const gc = gradeConfig[result.grade];
  const [showLogin, setShowLogin] = useState(false);

  const fullScenario = result.investmentScenarios[0];

  // +20만원 더 투자 시나리오 (프론트 자체 계산)
  const extraMonthly = 200_000;
  const extraInvestment = Math.max(0, result.surplus) + extraMonthly;
  const r = 0.07 / 12;
  const n = result.investmentPeriod * 12;
  const extraAccumulated = n > 0 && r > 0
    ? Math.round(extraInvestment * ((Math.pow(1 + r, n) - 1) / r))
    : extraInvestment * n;
  const extraAfterVest = Math.round(extraAccumulated * Math.pow(1.07, result.vestingPeriod));
  const pensionMonths = result.pensionYears * 12;
  const extraPension = pensionMonths > 0 ? Math.round(extraAfterVest / pensionMonths) : 0;
  const extraPensionReal = Math.round(
    extraPension / Math.pow(1 + result.inflationRate, result.investmentPeriod + result.vestingPeriod),
  );

  const teaserCards = [
    {
      icon: <ShieldAlert size={20} className="text-grade-red" />,
      title: '미래 리스크 변수',
      description: '환율, 금리 변동, 결혼, 집 구매 등 미래 이벤트가 내 자산에 미치는 영향',
      badge: '리스크 분석',
      badgeColor: 'var(--grade-red-bg)',
      badgeText: 'var(--grade-red-text)',
    },
    {
      icon: <BarChart3 size={20} className="text-grade-yellow" />,
      title: '수익률 시나리오',
      description: '예적금 3%로 투자했다면? S&P500에 투자했다면? 수익률에 따른 미래 자산 변화',
      badge: '수익률 비교',
      badgeColor: 'var(--grade-yellow-bg)',
      badgeText: 'var(--grade-yellow-text)',
    },
    {
      icon: <DollarSign size={20} className="text-grade-green" />,
      title: '투자금 시나리오',
      items: [
        `월 ${formatWon(extraMonthly)} 더 투자하면?`,
        `실질 월 수령액: ${formatWon(extraPensionReal)}`,
        fullScenario
          ? `현재 대비 +${formatWon(extraPensionReal - fullScenario.realMonthlyPension)}/월`
          : '',
      ].filter(Boolean),
      badge: '투자금 변수',
      badgeColor: 'var(--grade-green-bg)',
      badgeText: 'var(--grade-green-text)',
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

      {/* 헤더 */}
      <motion.div variants={fadeUp} className="text-center py-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-surface">
          <Sparkles size={24} className="text-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-1">더 정확한 미래를 알고 싶다면?</h3>
        <p className="text-xs text-sub">AI가 분석한 맞춤형 상세 리포트를 무료로 받아보세요</p>
      </motion.div>

      {/* 티저 카드들 */}
      {teaserCards.map((card, i) => (
        <motion.div
          key={card.title}
          variants={fadeUp}
          className="bg-background border border-border rounded-2xl p-5 relative overflow-hidden"
        >
          {/* 블러 오버레이 (3번째 카드만 일부 공개) */}
          {i < 2 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-xs text-sub bg-white/80 px-3 py-1.5 rounded-full border border-border">
                <Lock size={12} />
                로그인 후 확인
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{card.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-sm font-bold">{card.title}</h4>
                <span
                  className="text-2xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: card.badgeColor, color: card.badgeText }}
                >
                  {card.badge}
                </span>
              </div>
              {card.description && (
                <p className="text-xs text-sub leading-relaxed">{card.description}</p>
              )}
              {card.items && (
                <ul className="space-y-1 mt-1">
                  {card.items.map((item, j) => (
                    <li key={j} className="text-xs text-sub flex items-center gap-1.5">
                      <TrendingUp size={10} className="text-grade-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* 머니런 가치 제안 */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-5 text-center bg-surface"
      >
        <h4 className="text-base font-bold mb-2 text-foreground">
          머니런이 도와줄 수 있는 것
        </h4>
        <div className="space-y-2 text-xs leading-relaxed text-sub">
          <p>매일 AI가 내 소비를 체크하고 잔소리해줘요</p>
          <p>나만의 금융 PT를 받을 수 있어요</p>
          <p>상세 시나리오 분석으로 미래를 준비할 수 있어요</p>
        </div>
      </motion.div>

      {/* CTA 버튼 */}
      <motion.div variants={fadeUp} className="space-y-3">
        <motion.button
          onClick={() => setShowLogin(true)}
          className="w-full h-14 text-background font-bold rounded-2xl flex items-center justify-center gap-2 text-base bg-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          무료로 AI 리포트 받기
          <ArrowRight size={18} />
        </motion.button>
        <p className="text-center text-2xs text-sub">카카오 로그인만으로 바로 시작</p>
      </motion.div>

      <LoginSheet
        open={showLogin}
        onClose={() => setShowLogin(false)}
        message="AI 상세 리포트를 무료로 받으려면 로그인이 필요해요."
      />
    </motion.div>
  );
}
