import { memo } from 'react';
import { formatWonRaw } from '@/lib/format';

type Status = 'safe' | 'caution' | 'danger';

interface Props {
  dailyRemaining: number;
  weeklyRemaining: number;
}

function getStatus(dailyRemaining: number, dailyBudget: number): { status: Status; label: string } {
  const ratio = dailyRemaining / dailyBudget;
  if (ratio >= 0.5) return { status: 'safe', label: '여유 있어요' };
  if (ratio >= 0.2) return { status: 'caution', label: '조금 조심' };
  return { status: 'danger', label: '위험해요' };
}

const statusConfig: Record<Status, { dot: string; text: string; bg: string }> = {
  safe:    { dot: 'bg-grade-green', text: 'text-grade-green-text', bg: 'bg-grade-green-bg' },
  caution: { dot: 'bg-grade-yellow', text: 'text-grade-yellow-text', bg: 'bg-grade-yellow-bg' },
  danger:  { dot: 'bg-grade-red', text: 'text-grade-red-text', bg: 'bg-grade-red-bg' },
};

function TrafficLight({ dailyRemaining, weeklyRemaining }: Props) {
  const { status, label } = getStatus(dailyRemaining, dailyRemaining);
  const sc = statusConfig[status];

  return (
    <div className="bg-background border border-border rounded-2xl p-4 md:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">지출 신호등</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-sub mb-1">오늘 잔여</p>
          <p className="text-xl md:text-2xl font-bold">{formatWonRaw(dailyRemaining)}</p>
        </div>
        <div>
          <p className="text-xs text-sub mb-1">이번주 잔여</p>
          <p className="text-xl md:text-2xl font-bold">{formatWonRaw(weeklyRemaining)}</p>
        </div>
      </div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg}`}>
        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
        <span className={`text-xs font-medium ${sc.text}`}>{label}</span>
      </div>
    </div>
  );
}

export default memo(TrafficLight);
