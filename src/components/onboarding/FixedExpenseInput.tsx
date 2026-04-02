'use client';

import type { FixedExpenses } from '@/types/finance';

interface Props {
  value: FixedExpenses;
  onChange: (v: FixedExpenses) => void;
}

const fields: { key: keyof FixedExpenses; label: string }[] = [
  { key: 'rent', label: '월세' },
  { key: 'utilities', label: '관리비' },
  { key: 'phone', label: '통신비' },
];

export default function FixedExpenseInput({ value, onChange }: Props) {
  const update = (key: keyof FixedExpenses, amount: number) => {
    onChange({ ...value, [key]: amount });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">고정으로 나가는 돈은?</h2>
      <p className="text-sub text-sm mb-6">
        월세, 관리비, 통신비 등 매달 나가는 고정 지출
      </p>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center bg-card rounded-xl px-4 py-3.5">
            <span className="text-base flex-shrink-0 w-20">{f.label}</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={value[f.key] ? value[f.key].toLocaleString() : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                update(f.key, Number(raw) || 0);
              }}
              className="flex-1 text-right bg-transparent outline-none text-base"
            />
            <span className="text-sub ml-1">원</span>
          </div>
        ))}
      </div>
    </div>
  );
}
