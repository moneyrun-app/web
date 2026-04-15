'use client';

interface CourseProgressBarProps {
  current: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md';
}

export default function CourseProgressBar({ current, total, label, size = 'md' }: CourseProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const barHeight = size === 'sm' ? 'h-1' : 'h-1.5';

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-sub">{label}</span>
          <span className="text-xs font-medium text-foreground">{current}/{total}</span>
        </div>
      )}
      <div className={`${barHeight} bg-border rounded-full overflow-hidden`}>
        <div
          className={`${barHeight} bg-accent rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
