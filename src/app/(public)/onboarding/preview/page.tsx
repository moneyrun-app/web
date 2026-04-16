'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { PreOnboardingResponse } from '@/types/course';
import type { Grade } from '@/types/finance';

const TABS = ['현재', '미래', '행동'] as const;

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
      const parsed = JSON.parse(raw);
      setPreview(parsed);
    } catch {
      router.replace('/onboarding');
    }
  }, [router]);

  if (!preview) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" /></div>;
  }

  const grade = preview.grade as Grade;
  const config = gradeConfig[grade];

  const handleSignUp = () => {
    sessionStorage.removeItem('preOnboardingPreview');
    signIn('kakao', { callbackUrl: '/pacemaker' });
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-6" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* 브릿지 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-body-lg text-foreground">
          <strong>{preview.nickname}</strong>님께서 입력한 값까지 고려한,<br />
          오직 <strong>{preview.nickname}</strong>님만을 위한<br />
          재테크 진단 리포트가 발행되었어요.
        </p>
      </motion.div>

      {/* 등급 뱃지 */}
      <div className="flex justify-center mb-6">
        <span
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{ backgroundColor: config.light, color: config.dark }}
        >
          {config.label} · {preview.currentTab.gradeLabel}
        </span>
      </div>

      {/* 탭 네비 */}
      <div className="flex bg-surface rounded-xl p-1 mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === i ? 'bg-background shadow-sm text-foreground' : 'text-sub'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <CurrentTab data={preview.currentTab} />
          </motion.div>
        )}
        {activeTab === 1 && (
          <motion.div key="future" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <FutureTab data={preview.futureTab} nickname={preview.nickname} />
          </motion.div>
        )}
        {activeTab === 2 && (
          <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <ActionTab data={preview.actionTab} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <button
        onClick={handleSignUp}
        className="mt-8 w-full h-14 bg-[#FEE500] text-[#391B1B] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FDD835] active:scale-[0.98] transition-all"
      >
        무료로 재테크 진단 리포트 발행
      </button>
      <p className="text-xs text-sub text-center mt-2">카카오로 3초 만에 시작</p>
    </div>
  );
}

function CurrentTab({ data }: { data: PreOnboardingResponse['currentTab'] }) {
  return (
    <>
      <Card title="월 수입/지출 분석">
        <Row label="월 수입" value={formatWon(data.monthlyIncome)} />
        <Row label="월 고정비" value={formatWon(data.monthlyFixedCost)} />
        <Row label="월 변동비" value={formatWon(data.monthlyVariableCost)} />
        <Row label="월 투자금" value={formatWon(data.monthlyInvestment)} />
        <div className="border-t border-border pt-2 mt-2">
          <Row label="잉여자금" value={formatWon(data.surplus)} bold />
        </div>
      </Card>
      <Card title="가용 예산">
        <Row label="월" value={formatWon(data.availableBudget.monthly)} />
        <Row label="주" value={formatWon(data.availableBudget.weekly)} />
        <Row label="일" value={formatWon(data.availableBudget.daily)} />
      </Card>
      <Card title="지출 비율">
        <Row label="고정비 비율" value={`${data.fixedCostRatio}%`} />
        <Row label="실질 지출 비율 (투자 제외)" value={`${data.expenseRatio}%`} bold />
      </Card>
    </>
  );
}

function FutureTab({ data, nickname }: { data: PreOnboardingResponse['futureTab']; nickname: string }) {
  return (
    <>
      <Card title={`${nickname}님의 은퇴 시나리오`}>
        <Row label="은퇴까지" value={`${data.yearsToRetirement}년`} />
        <Row label="은퇴 나이" value={`${data.retirementAge}세`} />
        <Row label="연금 수령 시작" value={`${data.pensionStartAge}세`} />
        {data.pensionGapYears > 0 && (
          <Row label="소득 공백 기간" value={`${data.pensionGapYears}년`} bold />
        )}
      </Card>
      <Card title="투자 시나리오별 예상 자산">
        {data.estimatedSavings.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-sub">{s.label}</span>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatWon(s.futureAsset)}</p>
              <p className="text-xs text-sub">월 {formatWon(s.monthlyPension)}</p>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

function ActionTab({ data }: { data: PreOnboardingResponse['actionTab'] }) {
  return (
    <>
      <Card title="등급별 행동 가이드">
        <p className="text-body text-foreground leading-relaxed">{data.gradeAction}</p>
      </Card>
      <Card title="머니런 코스 안내">
        <p className="text-body text-foreground leading-relaxed">{data.courseMessage}</p>
      </Card>
      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="text-body font-semibold text-foreground">{data.ctaMessage}</p>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-sub">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-foreground' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
