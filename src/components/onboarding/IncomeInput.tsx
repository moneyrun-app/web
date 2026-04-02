'use client';

import { formatWon } from '@/lib/format';

interface IncomeInputProps {
  value: number;
  onChange: (v: number) => void;
}

export default function IncomeInput({ value, onChange }: IncomeInputProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">월 실수령이 얼마야?</h2>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value ? value.toLocaleString() : ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            onChange(Number(raw) || 0);
          }}
          className="w-full px-4 py-4 pr-12 rounded-xl bg-card text-lg outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sub">원</span>
      </div>
      {value > 0 && (
        <p className="text-primary text-sm mt-2 font-medium">{formatWon(value)}</p>
      )}
    </div>
  );
}
