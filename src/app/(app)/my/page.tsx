'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import { useFinanceProfile, useUpdateFinanceProfile, useConstants } from '@/hooks/useApi';
import GradeBadge from '@/components/common/GradeBadge';
import { formatWon, formatWonRaw } from '@/lib/format';
import { User, Save, ChevronRight, Loader2 } from 'lucide-react';

function EditRow({ label, value, onChange, suffix, id }: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; id?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm">{label}</label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(parseInt(raw, 10) || 0);
          }}
          className="w-24 md:w-28 h-10 px-2 text-right text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <span className="text-xs text-sub w-8 text-right">{suffix}</span>
      </div>
    </div>
  );
}

function DecimalRow({ label, value, onChange, suffix, id }: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; id?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm">{label}</label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            if ((raw.match(/\./g) || []).length > 1) return;
            const parts = raw.split('.');
            if (parts[1] && parts[1].length > 2) return;
            onChange(Number(raw) || 0);
          }}
          className="w-24 md:w-28 h-10 px-2 text-right text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <span className="text-xs text-sub w-8 text-right">{suffix}</span>
      </div>
    </div>
  );
}

export default function MyPage() {
  const nickname = useUserStore((s) => s.nickname);
  const storeFinance = useFinanceStore();
  const { data: profile } = useFinanceProfile();
  const { data: constants } = useConstants();
  const updateProfile = useUpdateFinanceProfile();

  // 서버 데이터로 스토어 동기화
  useEffect(() => {
    if (profile) {
      useFinanceStore.getState().setProfile({
        age: profile.age,
        monthlyIncome: profile.monthlyIncome,
        monthlyInvestment: profile.monthlyInvestment,
        monthlyFixedCost: profile.monthlyFixedCost,
        expectedReturn: profile.expectedReturn,
        investmentYears: profile.investmentYears,
        grade: profile.grade,
        variableCost: profile.variableCost,
      });
    }
  }, [profile]);

  const fin = profile ?? storeFinance;

  const [editAge, setEditAge] = useState(fin.age);
  const [editIncome, setEditIncome] = useState(fin.monthlyIncome);
  const [editInvestment, setEditInvestment] = useState(fin.monthlyInvestment);
  const [editFixed, setEditFixed] = useState(fin.monthlyFixedCost);
  const [editRate, setEditRate] = useState(fin.expectedReturn);
  const [editYears, setEditYears] = useState(fin.investmentYears);

  useEffect(() => {
    setEditAge(fin.age);
    setEditIncome(fin.monthlyIncome);
    setEditInvestment(fin.monthlyInvestment);
    setEditFixed(fin.monthlyFixedCost);
    setEditRate(fin.expectedReturn);
    setEditYears(fin.investmentYears);
  }, [fin.age, fin.monthlyIncome, fin.monthlyInvestment, fin.monthlyFixedCost, fin.expectedReturn, fin.investmentYears]);

  const handleSave = () => {
    updateProfile.mutate({
      age: editAge,
      monthlyIncome: editIncome,
      monthlyInvestment: editInvestment,
      monthlyFixedCost: editFixed,
      expectedReturn: editRate,
      investmentYears: editYears,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface flex items-center justify-center">
          <User size={20} className="text-sub" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold">{nickname || '유저'}</h1>
        <GradeBadge grade={fin.grade} />
      </div>

      {/* Stale banner */}
      {profile?.isStale && (
        <div className="bg-grade-yellow-bg border border-grade-yellow rounded-xl p-3 text-sm text-grade-yellow-text">
          정보가 오래됐어요. 업데이트해주세요!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">투자 체급</h2>
          <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-border">
            <div>
              <p className="text-xs text-sub mb-0.5">하루</p>
              <p className="text-lg md:text-xl font-bold">{formatWon(fin.variableCost.daily)}</p>
            </div>
            <div>
              <p className="text-xs text-sub mb-0.5">주간</p>
              <p className="text-lg md:text-xl font-bold">{formatWon(fin.variableCost.weekly)}</p>
            </div>
          </div>

          <p className="text-xs text-placeholder font-medium mb-3">세팅값 수정</p>
          <div className="space-y-2.5">
            <EditRow id="edit-age" label="나이" value={editAge} onChange={setEditAge} suffix="세" />
            <EditRow id="edit-income" label="월 실수령" value={editIncome ? editIncome / 10000 : 0} onChange={(v) => setEditIncome(Math.round(v * 10000))} suffix="만 원" />
            <EditRow id="edit-investment" label="월 투자금" value={editInvestment ? editInvestment / 10000 : 0} onChange={(v) => setEditInvestment(Math.round(v * 10000))} suffix="만 원" />
            <EditRow id="edit-fixed" label="월 고정비" value={editFixed ? editFixed / 10000 : 0} onChange={(v) => setEditFixed(Math.round(v * 10000))} suffix="만 원" />
            <DecimalRow id="edit-rate" label="수익률" value={editRate} onChange={setEditRate} suffix="%" />
            <EditRow id="edit-years" label="투자기간" value={editYears} onChange={setEditYears} suffix="년" />
          </div>

          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full mt-5 h-11 flex items-center justify-center gap-1.5 bg-accent text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            저장
          </button>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">환경 세팅 (참고)</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-caption text-sub">환율</span>
                <span className="text-caption font-medium">{(constants?.exchangeRate ?? 1350).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-caption text-sub">유가</span>
                <span className="text-caption font-medium">{constants?.oilPrice ?? 75.5}달러</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-caption text-sub">인플레이션</span>
                <span className="text-caption font-medium">{((constants?.inflationRate ?? 0.025) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-caption text-sub">목표 월 수입</span>
                <span className="text-caption font-medium">{formatWon(constants?.minPensionGoal ?? 1_300_000)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">계정</h2>
            <div className="space-y-0.5">
              <button className="w-full flex items-center justify-between h-11 text-caption text-foreground hover:text-accent transition-colors">
                <span>닉네임 수정</span>
                <ChevronRight size={16} className="text-sub" />
              </button>
              <div className="flex items-center justify-between h-10">
                <span className="text-caption">마케팅 수신</span>
                <button
                  role="switch"
                  aria-checked={false}
                  aria-label="마케팅 수신 동의"
                  className="w-10 h-[22px] rounded-full bg-disabled relative transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                >
                  <span className="absolute left-0.5 top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
              <button className="w-full text-left h-11 text-caption text-grade-red hover:text-grade-red-text transition-colors">
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
