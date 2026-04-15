'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, TrendingUp, Home, Receipt, PiggyBank } from 'lucide-react';
import { useSubmitOnboardingStep1 } from '@/hooks/useApi';
import type { CourseCategory } from '@/types/course';

const CATEGORIES: { id: CourseCategory; label: string; icon: typeof Landmark; example: string }[] = [
  { id: '연금', label: '연금', icon: Landmark, example: '노후를 위해 월 150만원 연금 세팅하기' },
  { id: '주식', label: '주식', icon: TrendingUp, example: '월급의 20%를 안정적으로 투자하기' },
  { id: '부동산', label: '부동산', icon: Home, example: '3년 안에 전세 보증금 5,000만원 모으기' },
  { id: '세금_연말정산', label: '세금/연말정산', icon: Receipt, example: '연말정산으로 50만원 더 환급받기' },
  { id: '소비_저축', label: '소비/저축', icon: PiggyBank, example: '월 100만원 저축 습관 만들기' },
];

interface StepCategorySelectProps {
  onComplete: () => void;
}

export default function StepCategorySelect({ onComplete }: StepCategorySelectProps) {
  const [selected, setSelected] = useState<CourseCategory | null>(null);
  const submitStep1 = useSubmitOnboardingStep1();

  const handleSubmit = () => {
    if (!selected) return;
    submitStep1.mutate({ category: selected }, {
      onSuccess: () => onComplete(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">어떤 금융 주제가 궁금하세요?</h2>
        <p className="text-sm text-sub">가장 먼저 해결하고 싶은 금융 숙제를 선택해주세요</p>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isSelected = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(cat.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-background hover:border-foreground/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-accent/10 text-accent' : 'bg-surface text-sub'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{cat.label}</p>
                  <p className="text-xs text-sub mt-0.5">{cat.example}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!selected || submitStep1.isPending}
        whileTap={{ scale: 0.97 }}
        className="w-full h-14 bg-foreground text-background text-base font-bold rounded-2xl disabled:opacity-20 transition-opacity"
      >
        {submitStep1.isPending ? '저장 중...' : '다음'}
      </motion.button>
    </div>
  );
}
