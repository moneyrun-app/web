'use client';

import GradeBadge from '@/components/common/GradeBadge';
import { formatWonRaw } from '@/lib/format';
import type { Grade } from '@/types/finance';

interface Props {
  grade: Grade;
  dailySurplus: number;
}

export default function DailySurplus({ grade, dailySurplus }: Props) {
  return (
    <div className="text-center pt-2">
      <div className="flex items-center justify-between px-1 mb-6">
        <GradeBadge grade={grade} />
        <span className="text-sub text-sm">마이</span>
      </div>
      <p className="text-sub text-sm mb-1">하루에 쓸 수 있는 돈</p>
      <p className="text-3xl font-bold">{formatWonRaw(dailySurplus)}</p>
    </div>
  );
}
