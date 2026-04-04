'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { formatWonRaw } from '@/lib/format';
import type { WeeklyReviewStatus } from '@/types/book';

interface WeeklyReviewModalProps {
  open: boolean;
  weekStart: Date;
  weekEnd: Date;
  weeklyBudget: number;
  dailyBudget: number;
  onSubmit: (status: WeeklyReviewStatus, amount: number) => void;
  onClose: () => void;
  isPending: boolean;
}

const statusOptions: { value: WeeklyReviewStatus; label: string; desc: string; color: string; bg: string; border: string }[] = [
  { value: 'under', label: '덜 썼어요', desc: '절약 성공!', color: 'text-grade-green-text', bg: 'bg-grade-green', border: 'border-grade-green' },
  { value: 'on', label: '딱 맞았어요', desc: '예산 안에서 잘 썼어요', color: 'text-grade-yellow-text', bg: 'bg-grade-yellow', border: 'border-grade-yellow' },
  { value: 'over', label: '더 썼어요', desc: '다음 주에 줄여봐요', color: 'text-grade-red-text', bg: 'bg-grade-red', border: 'border-grade-red' },
];

/** 천원 단위 숫자를 "1만 3천원" 형식으로 */
function formatCheonWon(n: number): string {
  const man = Math.floor(n / 10);
  const cheon = n % 10;
  if (man > 0 && cheon > 0) return `${man}만 ${cheon}천원`;
  if (man > 0) return `${man}만원`;
  return `${cheon}천원`;
}

function formatDateLabel(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function WeeklyReviewModal({ open, weekStart, weekEnd, weeklyBudget, dailyBudget, onSubmit, onClose, isPending }: WeeklyReviewModalProps) {
  const [selected, setSelected] = useState<WeeklyReviewStatus | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setSelected(null);
      setAmount('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!selected) return;
    const cheonWon = selected === 'on' ? 0 : parseInt(amount.replace(/,/g, ''), 10) || 0;
    onSubmit(selected, cheonWon * 1000); // 천원 → 원 변환
  };

  const canSubmit = selected === 'on' || (selected && parseInt(amount.replace(/,/g, ''), 10) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl shadow-xl animate-[slideUp_300ms_ease-out] pb-safe">
        {/* 헤더 */}
        <div className="p-5 pb-0">
          <p className="text-[10px] text-placeholder">{formatDateLabel(weekStart)} ~ {formatDateLabel(weekEnd)}</p>
          <h3 className="text-lg font-bold text-foreground mt-0.5">이번 주 어땠어요?</h3>
        </div>

        {/* 예산 요약 (천원 단위 내림) */}
        <div className="flex gap-3 px-5 mt-3">
          <div className="flex-1 bg-surface rounded-xl p-3 text-center">
            <p className="text-[10px] text-placeholder mb-0.5">하루 예산</p>
            <p className="text-sm font-bold">{formatWonRaw(Math.floor(dailyBudget / 1000) * 1000)}</p>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-3 text-center">
            <p className="text-[10px] text-placeholder mb-0.5">주간 예산</p>
            <p className="text-sm font-bold">{formatWonRaw(Math.floor(weeklyBudget / 1000) * 1000)}</p>
          </div>
        </div>

        {/* 상태 선택 */}
        <div className="flex gap-2 px-5 mt-4">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex-1 py-3 rounded-xl text-center transition-all ${
                selected === opt.value
                  ? `${opt.bg} text-white shadow-sm scale-[1.02]`
                  : 'bg-surface text-sub hover:bg-surface/80'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
            </button>
          ))}
        </div>

        {/* 금액 입력 (천원 단위) */}
        {selected && selected !== 'on' && (
          <div className="px-5 mt-4 animate-[fadeIn_200ms_ease-out]">
            <label className="text-xs text-sub block mb-1.5">
              {selected === 'under' ? '얼마나 아꼈어요?' : '얼마나 더 썼어요?'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              readOnly
              value={amount && parseInt(amount) > 0 ? formatCheonWon(parseInt(amount)) : ''}
              onKeyDown={(e) => {
                if (e.key >= '0' && e.key <= '9') {
                  setAmount((prev) => prev + e.key);
                } else if (e.key === 'Backspace') {
                  setAmount((prev) => prev.slice(0, -1));
                }
              }}
              placeholder="금액 입력"
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-foreground text-center text-lg font-bold placeholder:text-placeholder/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow caret-transparent"
            />
          </div>
        )}

        {/* 제출 */}
        <div className="p-5 mt-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="w-full h-12 rounded-xl font-semibold text-white bg-foreground disabled:bg-disabled disabled:text-sub transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
}
