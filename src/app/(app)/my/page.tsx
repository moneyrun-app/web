'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import { useFinanceProfile, useUpdateFinanceProfile } from '@/hooks/useApi';
import GradeBadge from '@/components/common/GradeBadge';
import { formatWon } from '@/lib/format';
import { User, Save, Loader2 } from 'lucide-react';

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

export default function MyPage() {
  const userNickname = useUserStore((s) => s.nickname);
  const storeFinance = useFinanceStore();
  const { data: profile } = useFinanceProfile();
  const updateProfile = useUpdateFinanceProfile();

  useEffect(() => {
    if (profile) {
      useFinanceStore.getState().setProfile(profile);
    }
  }, [profile]);

  const fin = profile ?? storeFinance;

  const [editNickname, setEditNickname] = useState(fin.nickname || userNickname || '');
  const [editAge, setEditAge] = useState(fin.age);
  const [editRetirementAge, setEditRetirementAge] = useState(fin.retirementAge);
  const [editPensionStartAge, setEditPensionStartAge] = useState(fin.pensionStartAge);
  const [editIncome, setEditIncome] = useState(fin.monthlyIncome);
  const [editFixed, setEditFixed] = useState(fin.monthlyFixedCost);
  const [editVariable, setEditVariable] = useState(fin.monthlyVariableCost);

  useEffect(() => {
    setEditNickname(fin.nickname || userNickname || '');
    setEditAge(fin.age);
    setEditRetirementAge(fin.retirementAge);
    setEditPensionStartAge(fin.pensionStartAge);
    setEditIncome(fin.monthlyIncome);
    setEditFixed(fin.monthlyFixedCost);
    setEditVariable(fin.monthlyVariableCost);
  }, [fin.nickname, fin.age, fin.retirementAge, fin.pensionStartAge, fin.monthlyIncome, fin.monthlyFixedCost, fin.monthlyVariableCost, userNickname]);

  const editExpense = editFixed + editVariable;
  const editSurplus = editIncome - editExpense;
  const editInvestmentPeriod = Math.max(0, editRetirementAge - editAge);
  const editVestingPeriod = Math.max(0, editPensionStartAge - editRetirementAge);

  const handleSave = () => {
    updateProfile.mutate({
      nickname: editNickname,
      age: editAge,
      retirementAge: editRetirementAge,
      pensionStartAge: editPensionStartAge,
      monthlyIncome: editIncome,
      monthlyFixedCost: editFixed,
      monthlyVariableCost: editVariable,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface flex items-center justify-center">
          <User size={20} className="text-sub" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold">{fin.nickname || userNickname || '유저'}</h1>
        <GradeBadge grade={fin.grade} />
      </div>

      {profile?.isStale && (
        <div className="bg-grade-yellow-bg border border-grade-yellow rounded-xl p-3 text-sm text-grade-yellow-text">
          정보가 오래됐어요. 업데이트해주세요!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 프로필 수정 */}
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">내 페이스</h2>
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-border">
            <div>
              <p className="text-xs text-sub mb-0.5">하루</p>
              <p className="text-lg font-bold">{formatWon(Math.floor(fin.variableCost.daily / 1000) * 1000)}</p>
            </div>
            <div>
              <p className="text-xs text-sub mb-0.5">주간</p>
              <p className="text-lg font-bold">{formatWon(Math.floor(fin.variableCost.weekly / 1000) * 1000)}</p>
            </div>
            <div>
              <p className="text-xs text-sub mb-0.5">잉여자금</p>
              <p className={`text-lg font-bold ${fin.surplus > 0 ? '' : 'text-grade-red'}`}>{formatWon(fin.surplus)}</p>
            </div>
          </div>

          <p className="text-xs text-placeholder font-medium mb-3">세팅값 수정</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-nickname" className="text-sm">닉네임</label>
              <input
                id="edit-nickname"
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="w-24 md:w-28 h-10 px-2 text-right text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <EditRow id="edit-age" label="나이" value={editAge} onChange={setEditAge} suffix="세" />
            <EditRow id="edit-retire" label="은퇴 나이" value={editRetirementAge} onChange={setEditRetirementAge} suffix="세" />
            <EditRow id="edit-pension" label="수령 나이" value={editPensionStartAge} onChange={setEditPensionStartAge} suffix="세" />
            <EditRow id="edit-income" label="월 실수령" value={editIncome ? editIncome / 10000 : 0} onChange={(v) => setEditIncome(Math.round(v * 10000))} suffix="만 원" />
            <EditRow id="edit-fixed" label="월 고정비" value={editFixed ? editFixed / 10000 : 0} onChange={(v) => setEditFixed(Math.round(v * 10000))} suffix="만 원" />
            <EditRow id="edit-variable" label="월 변동비" value={editVariable ? editVariable / 10000 : 0} onChange={(v) => setEditVariable(Math.round(v * 10000))} suffix="만 원" />
          </div>

          {/* 자동 계산 미리보기 */}
          {editIncome > 0 && (
            <div className="bg-surface rounded-xl p-3 mt-4 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-sub">총지출</span>
                <span className="font-medium">{formatWon(editExpense)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sub">잉여자금</span>
                <span className={`font-medium ${editSurplus > 0 ? 'text-grade-green' : 'text-grade-red'}`}>{formatWon(editSurplus)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sub">투자기간 / 거치기간</span>
                <span className="font-medium">{editInvestmentPeriod}년 / {editVestingPeriod}년</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full mt-5 h-11 flex items-center justify-center gap-1.5 bg-foreground text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            저장
          </button>
        </div>

        {/* 계정 */}
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">계정</h2>
          <div className="space-y-0.5">
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
  );
}
