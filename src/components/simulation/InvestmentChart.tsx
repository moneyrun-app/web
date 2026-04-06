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
  Legend,
} from 'recharts';

import { gradeConfig } from '@/lib/grade';

const COLORS = {
  full: gradeConfig.GREEN.main,
  twoThirds: gradeConfig.YELLOW.main,
  oneThird: 'var(--placeholder, #9CA3AF)',
  border: 'var(--border, #E5E7EB)',
  muted: 'var(--sub-text, #9CA3AF)',
};

interface TrajectoryPoint {
  age: number;
  asset: number;
}

interface Props {
  scenarios: {
    label: string;
    trajectory: TrajectoryPoint[];
  }[];
  currentAge: number;
  retirementAge: number;
  pensionStartAge: number;
}

export default function InvestmentChart({ scenarios, currentAge, retirementAge, pensionStartAge }: Props) {
  const data = useMemo(() => {
    if (!scenarios.length || !scenarios[0].trajectory.length) return [];

    // 모든 시나리오의 age를 합쳐서 통합 데이터 생성
    const ages = scenarios[0].trajectory.map((p) => p.age);
    return ages.map((age) => {
      const point: Record<string, number> = { age };
      scenarios.forEach((s, i) => {
        const found = s.trajectory.find((p) => p.age === age);
        point[`s${i}`] = found?.asset ?? 0;
      });
      return point;
    });
  }, [scenarios]);

  const formatAxis = (v: number) => {
    if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
    if (v >= 10_000) return `${Math.round(v / 10_000)}만`;
    return String(v);
  };

  const formatTooltip = (v: number) => {
    if (v >= 100_000_000) {
      const eok = Math.floor(v / 100_000_000);
      const man = Math.round((v % 100_000_000) / 10_000);
      return man > 0 ? `${eok}억 ${man}만 원` : `${eok}억 원`;
    }
    if (v >= 10_000) return `${Math.round(v / 10_000)}만 원`;
    return `${v.toLocaleString()}원`;
  };

  const colorKeys = [COLORS.full, COLORS.twoThirds, COLORS.oneThird];

  if (!data.length) return null;

  return (
    <div className="w-full" style={{ height: 'clamp(180px, 28vw, 240px)' }} role="img" aria-label={`투자 비율별 자산 변화 차트: ${scenarios.map((s) => s.label).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {colorKeys.map((color, i) => (
              <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: COLORS.muted }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
            tickFormatter={(v) => `${v}세`}
          />
          <YAxis
            tickFormatter={formatAxis}
            tick={{ fontSize: 11, fill: COLORS.muted }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value, name) => {
              const idx = parseInt(String(name).replace('s', ''));
              return [formatTooltip(Number(value)), scenarios[idx]?.label ?? String(name)];
            }}
            labelFormatter={(label) => `${label}세`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}
          />
          <Legend
            formatter={(value: string) => {
              const idx = parseInt(value.replace('s', ''));
              return scenarios[idx]?.label ?? value;
            }}
            wrapperStyle={{ fontSize: 11 }}
          />
          {scenarios.map((_, i) => (
            <Area
              key={i}
              type="monotone"
              dataKey={`s${i}`}
              stroke={colorKeys[i]}
              fill={`url(#grad-${i})`}
              strokeWidth={2}
              dot={false}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
