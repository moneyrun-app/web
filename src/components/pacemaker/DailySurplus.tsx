'use client';

import { memo } from 'react';
import GradeBadge from '@/components/common/GradeBadge';
import type { Grade } from '@/types/finance';

interface Props {
  grade: Grade;
  date: string;
}

function DailySurplus({ grade, date }: Props) {
  const d = new Date(date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formatted = `${d.getMonth() + 1}/${d.getDate()} ${days[d.getDay()]}요일`;

  return (
    <div className="flex items-center justify-between">
      <GradeBadge grade={grade} size="lg" />
      <span className="text-sm text-sub">{formatted}</span>
    </div>
  );
}

export default memo(DailySurplus);
