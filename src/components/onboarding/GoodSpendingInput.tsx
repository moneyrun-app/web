'use client';

import { Plus } from 'lucide-react';
import type { GoodSpending, GoodSpendingType } from '@/types/finance';

const SPENDING_OPTIONS: { type: GoodSpendingType; label: string }[] = [
  { type: 'savings', label: '적금' },
  { type: 'investment', label: '투자' },
  { type: 'pension_savings', label: '연금저축' },
  { type: 'irp', label: 'IRP' },
  { type: 'insurance', label: '보험' },
];

interface Props {
  items: GoodSpending[];
  onChange: (items: GoodSpending[]) => void;
}

export default function GoodSpendingInput({ items, onChange }: Props) {
  const addItem = () => {
    const used = new Set(items.map((i) => i.type));
    const next = SPENDING_OPTIONS.find((o) => !used.has(o.type));
    if (next) {
      onChange([...items, { type: next.type, label: next.label, amount: 0 }]);
    }
  };

  const updateAmount = (index: number, amount: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], amount };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 leading-tight">
        매달 꼬박꼬박 빠지는
        <br />
        좋은 소비 알려줘
      </h2>
      <p className="text-sub text-sm mb-6">
        적금, 연금저축, 보험 등 매달 자동으로 빠지는 저축/투자
      </p>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center bg-card rounded-xl px-4 py-3.5">
            <span className="text-base flex-shrink-0 w-20">{item.label}</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={item.amount ? item.amount.toLocaleString() : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                updateAmount(i, Number(raw) || 0);
              }}
              className="flex-1 text-right bg-transparent outline-none text-base"
            />
            <span className="text-sub ml-1">원</span>
          </div>
        ))}

        {items.length < SPENDING_OPTIONS.length && (
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-card-border text-sub"
          >
            <Plus size={16} />
            항목 추가
          </button>
        )}
      </div>
    </div>
  );
}
