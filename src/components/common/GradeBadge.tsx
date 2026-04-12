import { memo } from 'react';
import type { Grade } from '@/types/finance';

const config: Record<Grade, { bg: string; text: string; border: string }> = {
  RED: { bg: 'bg-grade-red-bg', text: 'text-grade-red-text', border: 'border-grade-red' },
  YELLOW: { bg: 'bg-grade-yellow-bg', text: 'text-grade-yellow-text', border: 'border-grade-yellow' },
  GREEN: { bg: 'bg-grade-green-bg', text: 'text-grade-green-text', border: 'border-grade-green' },
};

function GradeBadge({ grade, size = 'md' }: { grade: Grade; size?: 'sm' | 'md' | 'lg' }) {
  const c = config[grade] ?? config.RED;
  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-sm px-4 py-1.5' :
    'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${c.bg} ${c.text} ${c.border} ${sizeClass}`}>
      {grade}
    </span>
  );
}

export default memo(GradeBadge);
