'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatWon } from '@/lib/format';

const COLORS = {
  border: 'var(--border, #E5E7EB)',
  muted: 'var(--sub-text, #9CA3AF)',
  surface: 'var(--surface, #F9FAFB)',
  disabled: 'var(--disabled, #D1D5DB)',
  red: 'var(--grade-red, #EF4444)',
};

interface Props {
  monthlySaving: number;
  annualRate: number;
  years: number;
  targetCorpus: number;
  gradeColor: string;
}

export default function TrajectoryChart({ monthlySaving, annualRate, years, targetCorpus, gradeColor }: Props) {
  const data = useMemo(() => {
    const points = [];
    const r = annualRate / 100 / 12;
    for (let y = 0; y <= years; y += Math.max(1, Math.floor(years / 20))) {
      const n = y * 12;
      const actual = r === 0
        ? monthlySaving * n
        : Math.round(monthlySaving * ((Math.pow(1 + r, n) - 1) / r));
      points.push({
        year: y,
        label: `${y}년`,
        actual,
        target: Math.round((targetCorpus / years) * y),
      });
    }
    // Ensure last point
    if (points[points.length - 1]?.year !== years) {
      const n = years * 12;
      const actual = r === 0
        ? monthlySaving * n
        : Math.round(monthlySaving * ((Math.pow(1 + r, n) - 1) / r));
      points.push({ year: years, label: `${years}년`, actual, target: targetCorpus });
    }
    return points;
  }, [monthlySaving, annualRate, years, targetCorpus]);

  const formatAxis = (v: number) => {
    if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
    if (v >= 10_000) return `${Math.round(v / 10_000)}만`;
    return String(v);
  };

  if (monthlySaving <= 0 || years <= 0) {
    return <p className="text-xs text-sub text-center py-8">입력값을 넣으면 차트가 표시됩니다</p>;
  }

  return (
    <div className="w-full" style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="99%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: COLORS.muted }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxis}
            tick={{ fontSize: 11, fill: COLORS.muted }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => [formatWon(Number(value)), name === 'actual' ? '내 궤도' : '목표']}
            labelFormatter={(label) => String(label)}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke={COLORS.disabled}
            fill={COLORS.surface}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke={gradeColor}
            fill={`${gradeColor}20`}
            strokeWidth={2}
          />
          <ReferenceLine y={targetCorpus} stroke={COLORS.red} strokeDasharray="3 3" strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
