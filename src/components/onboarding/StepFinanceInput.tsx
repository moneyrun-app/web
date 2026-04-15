'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSubmitOnboardingStep3 } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import { formatWon } from '@/lib/format';
import type { CourseCategory } from '@/types/course';

const SIM_STORAGE_KEY = 'moneyrun_simulation';

// 코스별 추가 필드 정의
const EXTRA_FIELDS: Record<CourseCategory, Array<{
  key: string; label: string; type: 'number' | 'select'; unit?: string;
  options?: string[]; placeholder?: string;
}>> = {
  '연금': [
    { key: 'pensionType', label: '퇴직연금 유형', type: 'select', options: ['DB', 'DC', '모름'] },
    { key: 'nationalPensionYears', label: '국민연금 가입 기간', type: 'number', unit: '년' },
    { key: 'pensionBalance', label: '퇴직연금 적립금', type: 'number', unit: '원' },
  ],
  '주식': [
    { key: 'investmentExperience', label: '투자 경험', type: 'select', options: ['없음', '1년 미만', '1~3년', '3년 이상'] },
    { key: 'currentAssets', label: '현재 투자자산', type: 'number', unit: '원' },
  ],
  '부동산': [
    { key: 'housingType', label: '현재 주거 형태', type: 'select', options: ['월세', '전세', '자가', '기타'] },
    { key: 'targetAsset', label: '목표 자산', type: 'select', options: ['전세', '자가(아파트)', '자가(빌라)', '기타'] },
    { key: 'cheongyakScore', label: '청약 가점', type: 'number', unit: '점', placeholder: '0~84' },
  ],
  '세금_연말정산': [
    { key: 'annualIncome', label: '연 총소득', type: 'number', unit: '원' },
    { key: 'dependents', label: '부양가족 수', type: 'number', unit: '명' },
    { key: 'housingType', label: '주거 형태', type: 'select', options: ['월세', '전세', '자가'] },
    { key: 'creditCardUsage', label: '연 카드 사용액', type: 'number', unit: '원' },
  ],
  '소비_저축': [
    { key: 'targetSaving', label: '월 목표 저축액', type: 'number', unit: '원' },
    { key: 'hasEmergencyFund', label: '비상금 유무', type: 'select', options: ['있음', '없음'] },
    { key: 'subscriptionCount', label: '구독 서비스 수', type: 'number', unit: '개' },
  ],
};

interface StepFinanceInputProps {
  onComplete: () => void;
}

export default function StepFinanceInput({ onComplete }: StepFinanceInputProps) {
  const selectedCategory = useOnboardingStore((s) => s.selectedCategory);
  const submitStep3 = useSubmitOnboardingStep3();

  // 기본 필드
  const [form, setForm] = useState({
    nickname: '',
    age: 0,
    retirementAge: 0,
    pensionStartAge: 65,
    monthlyIncome: 0,
    monthlyInvestment: 0,
    monthlyFixedCost: 0,
    monthlyVariableCost: 0,
  });

  // 코스별 추가 데이터
  const [extraData, setExtraData] = useState<Record<string, string | number | boolean>>({});

  // 시뮬레이션 데이터로 프리필
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SIM_STORAGE_KEY);
      if (raw) {
        const sim = JSON.parse(raw);
        setForm((prev) => ({
          ...prev,
          nickname: sim.nickname || prev.nickname,
          age: sim.age || prev.age,
          retirementAge: sim.retirementAge || prev.retirementAge,
          pensionStartAge: sim.pensionStartAge || prev.pensionStartAge,
          monthlyIncome: sim.monthlyIncome || prev.monthlyIncome,
          monthlyInvestment: sim.monthlyInvestment || prev.monthlyInvestment,
          monthlyFixedCost: sim.monthlyFixedCost || prev.monthlyFixedCost,
          monthlyVariableCost: sim.monthlyVariableCost || prev.monthlyVariableCost,
        }));
      }
    } catch { /* noop */ }
  }, []);

  const extraFields = selectedCategory ? EXTRA_FIELDS[selectedCategory] : [];

  const updateField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateExtra = (key: string, value: string | number | boolean) => {
    setExtraData((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.nickname && form.age > 0 && form.monthlyIncome > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // select 필드의 '있음'/'없음'을 boolean으로 변환
    const processed: Record<string, unknown> = { ...extraData };
    if ('hasEmergencyFund' in processed) {
      processed.hasEmergencyFund = processed.hasEmergencyFund === '있음';
    }

    submitStep3.mutate({
      financeData: form,
      courseExtraData: Object.keys(processed).length > 0 ? processed : undefined,
    }, {
      onSuccess: () => {
        // 시뮬레이션 데이터 클리어
        sessionStorage.removeItem(SIM_STORAGE_KEY);
        onComplete();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">재무 정보 입력</h2>
        <p className="text-sm text-sub">맞춤 마이북을 만들기 위해 필요해요</p>
      </div>

      {/* 기본 필드 */}
      <div className="space-y-4">
        <InputField label="닉네임" value={form.nickname} onChange={(v) => updateField('nickname', v)} type="text" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="나이" value={form.age || ''} onChange={(v) => updateField('age', Number(v))} type="number" unit="세" />
          <InputField label="은퇴 나이" value={form.retirementAge || ''} onChange={(v) => updateField('retirementAge', Number(v))} type="number" unit="세" />
        </div>
        <InputField label="연금 수령 시작 나이" value={form.pensionStartAge || ''} onChange={(v) => updateField('pensionStartAge', Number(v))} type="number" unit="세" />
        <InputField label="월 실수령 소득" value={form.monthlyIncome || ''} onChange={(v) => updateField('monthlyIncome', Number(v))} type="number" unit="원" isMoney />
        <InputField label="월 투자액" value={form.monthlyInvestment || ''} onChange={(v) => updateField('monthlyInvestment', Number(v))} type="number" unit="원" isMoney />
        <InputField label="월 고정비" value={form.monthlyFixedCost || ''} onChange={(v) => updateField('monthlyFixedCost', Number(v))} type="number" unit="원" isMoney />
        <InputField label="월 변동비" value={form.monthlyVariableCost || ''} onChange={(v) => updateField('monthlyVariableCost', Number(v))} type="number" unit="원" isMoney />
      </div>

      {/* 코스별 추가 필드 */}
      {extraFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-sub font-medium">코스 맞춤 정보</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {extraFields.map((field) => (
            field.type === 'select' ? (
              <SelectField
                key={field.key}
                label={field.label}
                value={String(extraData[field.key] ?? '')}
                options={field.options ?? []}
                onChange={(v) => updateExtra(field.key, v)}
              />
            ) : (
              <InputField
                key={field.key}
                label={field.label}
                value={extraData[field.key] as number ?? ''}
                onChange={(v) => updateExtra(field.key, Number(v))}
                type="number"
                unit={field.unit}
                placeholder={field.placeholder}
                isMoney={field.unit === '원'}
              />
            )
          ))}
        </div>
      )}

      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit || submitStep3.isPending}
        whileTap={{ scale: 0.97 }}
        className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl disabled:opacity-20 transition-opacity"
      >
        {submitStep3.isPending ? '저장 중...' : '다음'}
      </motion.button>
    </div>
  );
}

// --- 내부 컴포넌트 ---

function InputField({ label, value, onChange, type, unit, isMoney, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type: 'text' | 'number'; unit?: string; isMoney?: boolean; placeholder?: string;
}) {
  const displayValue = isMoney && typeof value === 'number' && value > 0
    ? formatWon(value)
    : undefined;

  return (
    <div>
      <label className="text-xs font-medium text-sub mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (type === 'number' ? '0' : '')}
          className="flex-1 h-11 px-3 text-sm bg-surface border border-border rounded-xl outline-none focus:border-foreground transition-colors text-foreground"
        />
        {unit && <span className="text-xs text-sub shrink-0">{unit}</span>}
      </div>
      {displayValue && <p className="text-xs text-placeholder mt-1">{displayValue}</p>}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-sub mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 text-sm bg-surface border border-border rounded-xl outline-none focus:border-foreground transition-colors text-foreground"
      >
        <option value="">선택</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
