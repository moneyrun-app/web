'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
  CartesianGrid, Legend,
} from 'recharts';
import { formatWon } from '@/lib/format';
import { gradeConfig } from '@/lib/grade';
import type { Grade } from '@/types/finance';
import type {
  V6Report, V6Section,
  SectionA, SectionB, SectionC, SectionD,
  SectionE, SectionF, SectionG, SectionH, SectionI,
} from '@/types/report-v6';

// ─── Constants ───

const STEPS = [
  { title: '나의 재무 건강 성적표', tag: '성적표', sections: ['A', 'B'] },
  { title: '이대로 가면 만나게 될 미래', tag: '미래', sections: ['C'] },
  { title: '등급 업그레이드 로드맵', tag: '로드맵', sections: ['D', 'E', 'F', 'G', 'H'] },
  { title: '머니런이 준비한 선물', tag: '선물', sections: ['I'] },
] as const;

const GRADE_COLORS: Record<Grade, string> = {
  RED: 'var(--grade-red)',
  YELLOW: 'var(--grade-yellow)',
  GREEN: 'var(--grade-green)',
};

const CHART_COLORS = {
  fixed: 'var(--grade-yellow)',
  variable: 'var(--grade-red)',
  surplus: 'var(--grade-green)',
  foreground: 'var(--foreground)',
  sub: 'var(--sub-text)',
};

// ─── Slide variants ───

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

// ─── Shared: AI Narrative ───

function AiNarrative({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-surface rounded-2xl p-4 mt-4">
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}

// ─── Shared: Grade Badge ───

function GradeBadge({ grade, size = 'md' }: { grade: Grade; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = gradeConfig[grade];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: cfg.light, color: cfg.dark }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Shared: Section Title ───

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-bold mb-3">{title}</h3>;
}

// ─── Shared: Card ───

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-background rounded-2xl p-4 border border-border ${className}`}>
      {children}
    </div>
  );
}

// ─── Section A: 재무 건강 진단 ───

function RenderSectionA({ data }: { data: SectionA }) {
  const cfg = gradeConfig[data.grade];
  const pct = Math.round((data.totalScore / data.maxScore) * 100);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Big circle score */}
      <Card className="flex flex-col items-center py-6">
        <div className="relative w-32 h-32 mb-3">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={cfg.main}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black" style={{ color: cfg.main }}>{data.totalScore}</span>
            <span className="text-xs text-sub">/ {data.maxScore}</span>
          </div>
        </div>
        <GradeBadge grade={data.grade} size="lg" />
      </Card>

      {/* Score bars */}
      <Card>
        <p className="text-sm font-semibold mb-3">영역별 점수</p>
        <div className="space-y-3">
          {data.scores.map((s) => (
            <div key={s.axis}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{s.axis}</span>
                <span className="text-sm font-bold">{s.score}/{s.max}</span>
              </div>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(s.score / s.max) * 100}%`,
                    backgroundColor: cfg.main,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Peer comparison */}
      {data.peerComparison && (
        <Card>
          <p className="text-sm font-semibold mb-2">또래 비교 ({data.peerComparison.ageGroup})</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-1">나</p>
              <p className="text-xl font-black" style={{ color: cfg.main }}>{data.peerComparison.myScore}</p>
            </div>
            <div className="flex-1 bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-1">또래 평균</p>
              <p className="text-xl font-black text-sub">{data.peerComparison.peerAvg}</p>
            </div>
          </div>
        </Card>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section B: 돈의 흐름 ───

function RenderSectionB({ data }: { data: SectionB }) {
  const { breakdown } = data;
  const items = [
    { label: '수입', value: breakdown.income, color: 'var(--foreground)', sign: '' },
    { label: '고정지출', value: breakdown.fixedCost, color: CHART_COLORS.fixed, sign: '-' },
    { label: '변동지출', value: breakdown.variableCost, color: CHART_COLORS.variable, sign: '-' },
    { label: '잉여자금', value: breakdown.surplus, color: CHART_COLORS.surplus, sign: '=' },
  ];

  // Comparison chart data
  const comparisonData = data.ratios ? [
    { name: '고정지출', 나: data.ratios.user.fixedCost, 또래: data.ratios.peer.fixedCost },
    { name: '변동지출', 나: data.ratios.user.variableCost, 또래: data.ratios.peer.variableCost },
    { name: '잉여자금', 나: data.ratios.user.surplus, 또래: data.ratios.peer.surplus },
  ] : [];

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Waterfall-style vertical cards */}
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-base font-bold">
              {item.sign}{formatWon(item.value)}
            </span>
          </Card>
        ))}
      </div>

      {/* Ratio comparison chart */}
      {comparisonData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">비율 비교 (나 vs {data.peerAgeGroup || '또래'})</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--sub-text)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--sub-text)" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value) => [`${value}%`, '']}
                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="나" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="또래" fill="var(--disabled)" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section C: 통합 시뮬레이션 ───

function RenderSectionC({ data }: { data: SectionC }) {
  const scenarioColors = [
    gradeConfig.RED.main,
    gradeConfig.YELLOW.main,
    gradeConfig.GREEN.main,
  ];

  // Line chart data: merge all scenarios by age
  const ageSet = new Set<number>();
  data.scenarios?.forEach((s) => s.trajectory?.forEach((p) => ageSet.add(p.age)));
  const ages = Array.from(ageSet).sort((a, b) => a - b);

  const lineData = ages.map((age) => {
    const row: Record<string, number> = { age };
    data.scenarios?.forEach((s) => {
      const pt = s.trajectory?.find((p) => p.age === age);
      row[s.label] = pt?.asset ?? 0;
    });
    return row;
  });

  // Timeline phases
  const phases = data.charts?.timeline?.phases ?? [];
  const phaseColors: Record<string, string> = {
    green: 'var(--grade-green)',
    red: 'var(--grade-red)',
    foreground: 'var(--foreground)',
  };

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Scenario line chart */}
      {lineData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">시나리오별 자산 성장</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="var(--sub-text)" tickFormatter={(v) => `${v}세`} />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--sub-text)" tickFormatter={(v) => formatWon(v)} width={70} />
              <Tooltip
                formatter={(value, name) => [formatWon(Number(value)), String(name)]}
                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
              />
              {data.scenarios?.map((s, i) => (
                <Line
                  key={s.label}
                  type="monotone"
                  dataKey={s.label}
                  stroke={scenarioColors[i % scenarioColors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Timeline bar */}
      {phases.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">인생 타임라인</p>
          <div className="flex h-8 rounded-full overflow-hidden">
            {phases.map((p, i) => {
              const totalSpan = phases.reduce((s, ph) => s + (ph.end - ph.start), 0);
              const w = ((p.end - p.start) / totalSpan) * 100;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center text-2xs font-medium text-white"
                  style={{
                    width: `${w}%`,
                    backgroundColor: phaseColors[p.color] || 'var(--disabled)',
                  }}
                >
                  {p.label}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            {phases.map((p, i) => (
              <span key={i} className="text-2xs text-sub">{p.start}세</span>
            ))}
            <span className="text-2xs text-sub">{phases[phases.length - 1]?.end}세</span>
          </div>
        </Card>
      )}

      {/* Life events */}
      {data.lifeEvents?.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">예상 라이프 이벤트</p>
          <div className="space-y-2">
            {data.lifeEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ev.icon || '📌'}</span>
                  <div>
                    <p className="text-sm font-medium">{ev.name}</p>
                    <p className="text-xs text-sub">{ev.age}세</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-grade-red-text">{formatWon(ev.cost)}</span>
              </div>
            ))}
          </div>
          {data.totalEventCost > 0 && (
            <div className="flex justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm text-sub">총 이벤트 비용</span>
              <span className="text-sm font-bold">{formatWon(data.totalEventCost)}</span>
            </div>
          )}
        </Card>
      )}

      {/* Retirement gap */}
      {data.retirement && (
        <Card>
          <p className="text-sm font-semibold mb-3">은퇴 후 월수령액 갭</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-sub">목표</span>
                <span className="text-xs font-bold">{formatWon(data.retirement.targetMonthly)}</span>
              </div>
              <div className="h-4 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-grade-green" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-sub">예상</span>
                <span className="text-xs font-bold">{formatWon(data.retirement.projectedMonthly)}</span>
              </div>
              <div className="h-4 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((data.retirement.projectedMonthly / data.retirement.targetMonthly) * 100, 100)}%`,
                    backgroundColor: data.retirement.gap > 0 ? 'var(--grade-red)' : 'var(--grade-green)',
                  }}
                />
              </div>
            </div>
            {data.retirement.gap > 0 && (
              <p className="text-sm text-grade-red-text font-medium text-center">
                월 {formatWon(data.retirement.gap)} 부족
              </p>
            )}
          </div>
        </Card>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section D: 한국의 현실 ───

function RenderSectionD({ data }: { data: SectionD }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {data.topics?.map((topic, i) => (
        <Card key={i}>
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-left">{topic.title}</span>
            {expanded === i ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
          </button>
          {expanded === i && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              {/* Horizontal bar chart for country comparison */}
              {topic.chart?.labels && topic.chart.values && (
                <div className="space-y-2 mb-3">
                  {topic.chart.labels.map((label, j) => {
                    const maxVal = Math.max(...topic.chart.values);
                    const isHighlight = topic.chart.highlight === label || label === '한국';
                    return (
                      <div key={j}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs ${isHighlight ? 'font-bold' : 'text-sub'}`}>{label}</span>
                          <span className={`text-xs ${isHighlight ? 'font-bold' : 'text-sub'}`}>{topic.chart.values[j]}</span>
                        </div>
                        <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(topic.chart.values[j] / maxVal) * 100}%`,
                              backgroundColor: isHighlight ? 'var(--grade-red)' : 'var(--disabled)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-sub leading-relaxed">{topic.insight}</p>
            </motion.div>
          )}
        </Card>
      ))}

      {data.userConnection && (
        <Card className="bg-surface border-none">
          <p className="text-sm text-foreground leading-relaxed">{data.userConnection}</p>
        </Card>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section E: 등급별 로드맵 ───

function RenderSectionE({ data }: { data: SectionE }) {
  const grades = [data.current, data.next, data.ultimate].filter(Boolean);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Grade progression */}
      <Card>
        <div className="flex items-center justify-center gap-2">
          {grades.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: GRADE_COLORS[g.grade] }}
                >
                  {g.label}
                </div>
                <span className="text-2xs text-sub mt-1">{i === 0 ? '현재' : i === 1 ? '다음' : '최종'}</span>
              </div>
              {i < grades.length - 1 && (
                <ChevronRight size={20} className="text-sub mb-4" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Steps timeline */}
      {data.steps?.length > 0 && (
        <div className="space-y-3">
          {data.steps.map((step) => (
            <Card key={step.phase}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    {step.phase}
                  </div>
                  <div className="w-0.5 flex-1 bg-border mt-1" />
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold">{step.title}</p>
                  {step.duration && <p className="text-xs text-sub mb-1">{step.duration}</p>}
                  <p className="text-sm text-sub leading-relaxed">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section F: 잉여자금 늘리기 ───

function RenderSectionF({ data }: { data: SectionF }) {
  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {data.current > 0 && (
        <Card className="text-center">
          <p className="text-xs text-sub mb-1">현재 잉여자금</p>
          <p className="text-2xl font-black">{formatWon(data.current)}</p>
        </Card>
      )}

      {/* Fixed cost tips */}
      {data.fixedCostTips?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-expense-fixed inline-block" />
            고정지출 절약
          </p>
          <div className="space-y-2">
            {data.fixedCostTips.map((tip, i) => (
              <Card key={i} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-sub">{tip.category}</p>
                  <p className="text-sm">{tip.tip}</p>
                </div>
                <span className="text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-grade-green-bg text-grade-green-text">
                  {formatWon(tip.potentialSaving)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Variable cost tips */}
      {data.variableCostTips?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-expense-variable inline-block" />
            변동지출 절약
          </p>
          <div className="space-y-2">
            {data.variableCostTips.map((tip, i) => (
              <Card key={i} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-sub">{tip.category}</p>
                  <p className="text-sm">{tip.tip}</p>
                </div>
                <span className="text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-grade-green-bg text-grade-green-text">
                  {formatWon(tip.potentialSaving)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Boost simulation table */}
      {data.boostSimulation?.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">절약 시뮬레이션</p>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-sub font-medium">절약 항목</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">월</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">연</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">10년</th>
                </tr>
              </thead>
              <tbody>
                {data.boostSimulation.map((item, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium">{item.action}</td>
                    <td className="py-2 px-2 text-right">{formatWon(item.monthlySaving)}</td>
                    <td className="py-2 px-2 text-right">{formatWon(item.yearlyEffect)}</td>
                    <td className="py-2 px-2 text-right font-bold text-grade-green-text">{formatWon(item.tenYearEffect)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section G: 금융 교육 ───

function RenderSectionG({ data }: { data: SectionG }) {
  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {data.userGrade && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-sub">등급 맞춤 교육:</span>
          <GradeBadge grade={data.userGrade} size="sm" />
        </div>
      )}

      {data.topics?.map((topic, i) => (
        <Card key={i}>
          <div className="flex items-start gap-3">
            {topic.icon && <span className="text-2xl mt-0.5">{topic.icon}</span>}
            <div className="flex-1">
              <p className="text-sm font-bold">{topic.title}</p>
              {topic.subtitle && <p className="text-xs text-sub mb-2">{topic.subtitle}</p>}
              {topic.content && <p className="text-sm text-sub leading-relaxed mb-2">{topic.content}</p>}
              {topic.keyPoints?.length > 0 && (
                <ul className="space-y-1">
                  {topic.keyPoints.map((kp, j) => (
                    <li key={j} className="text-sm flex items-start gap-1.5">
                      <span className="text-grade-green mt-0.5">&#8226;</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Product rates table */}
      {data.productRates?.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">추천 상품 금리</p>
          <div className="space-y-2">
            {data.productRates.map((pr, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium">{pr.product}</p>
                  {pr.note && <p className="text-xs text-sub">{pr.note}</p>}
                </div>
                <span className="text-sm font-bold">{pr.rate}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.disclaimer && (
        <p className="text-2xs text-placeholder text-center">{data.disclaimer}</p>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section H: 12개월 캘린더 ───

function RenderSectionH({ data }: { data: SectionH }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    // Auto scroll to current month
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-month="${currentMonth}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentMonth]);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {data.months?.map((m) => {
          const isCurrent = m.month === currentMonth;
          return (
            <div
              key={m.month}
              data-month={m.month}
              className={`snap-center flex-shrink-0 w-56 rounded-2xl p-4 border ${
                isCurrent
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background'
              }`}
            >
              <p className={`text-2xs font-bold mb-1 ${isCurrent ? 'text-background/70' : 'text-sub'}`}>
                {m.month}월
              </p>
              <p className={`text-sm font-bold mb-2 ${isCurrent ? '' : 'text-foreground'}`}>{m.title}</p>
              {m.events?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {m.events.map((ev, j) => (
                    <span
                      key={j}
                      className={`text-2xs px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? 'bg-background/20 text-background'
                          : 'bg-surface text-sub'
                      }`}
                    >
                      {ev.label}
                    </span>
                  ))}
                </div>
              )}
              <p className={`text-xs leading-relaxed ${isCurrent ? 'text-background/80' : 'text-sub'}`}>
                {m.todo}
              </p>
            </div>
          );
        })}
      </div>

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section I: 선물 (용어사전) ───

function RenderSectionI({ data }: { data: SectionI }) {
  const [openTerm, setOpenTerm] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Gift message */}
      <Card className="text-center bg-surface border-none">
        <Gift size={32} className="mx-auto mb-2 text-grade-green" />
        <p className="text-sm leading-relaxed whitespace-pre-line">{data.message}</p>
      </Card>

      {/* Term list */}
      {data.terms?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">금융 용어사전</p>
          {data.terms.map((t, i) => (
            <Card key={i}>
              <button
                onClick={() => setOpenTerm(openTerm === i ? null : i)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-sm font-medium">{t.term}</span>
                {openTerm === i ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
              </button>
              {openTerm === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 pt-2 border-t border-border"
                >
                  <p className="text-sm text-sub leading-relaxed mb-2">{t.definition}</p>
                  {t.example && (
                    <div className="bg-surface rounded-xl p-3">
                      <p className="text-xs text-sub mb-0.5">예시</p>
                      <p className="text-sm">{t.example}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          ))}
        </div>
      )}

      <AiNarrative text={data.ai_narrative} />
    </div>
  );
}

// ─── Section Router ───

function V6SectionRenderer({ section }: { section: V6Section }) {
  switch (section.section) {
    case 'A': return <RenderSectionA data={section} />;
    case 'B': return <RenderSectionB data={section} />;
    case 'C': return <RenderSectionC data={section} />;
    case 'D': return <RenderSectionD data={section} />;
    case 'E': return <RenderSectionE data={section} />;
    case 'F': return <RenderSectionF data={section} />;
    case 'G': return <RenderSectionG data={section} />;
    case 'H': return <RenderSectionH data={section} />;
    case 'I': return <RenderSectionI data={section} />;
    default: return null;
  }
}

// ─── Main Component ───

interface Props {
  report: V6Report;
  onBack: () => void;
}

export default function V6ReportDetail({ report, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const prev = () => { if (step > 0) goTo(step - 1); };
  const next = () => { if (step < STEPS.length - 1) goTo(step + 1); };

  useEffect(() => {
    let ready = false;
    const timer = setTimeout(() => { ready = true; }, 200);
    const handleKey = (e: KeyboardEvent) => {
      if (!ready) return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKey); };
  });

  const currentStepSections = STEPS[step].sections as readonly string[];
  const sectionsForStep = report.sections.filter((s) =>
    currentStepSections.includes(s.section)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-sub hover:text-foreground transition-colors">
              <ArrowLeft size={14} />
              돌아가기
            </button>
            <span className="text-2xs text-sub">{step + 1} / {STEPS.length}</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="flex-1 group"
              >
                <div className="flex items-center justify-center mb-1.5">
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      i <= step ? 'bg-foreground text-background' : 'bg-surface text-placeholder'
                    }`}
                  >
                    {s.tag}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-surface">
                  <motion.div
                    className="h-full rounded-full bg-foreground"
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step title */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-2xs font-semibold text-sub mb-0.5">[{STEPS[step].tag}]</p>
            <h2 className="text-lg font-bold">{STEPS[step].title}</h2>
            {step === 0 && report.summary && (
              <p className="text-sm text-sub mt-1">{report.summary}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 pb-32 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="space-y-6 mt-4">
              {sectionsForStep.map((section, i) => (
                <V6SectionRenderer key={`${section.section}-${i}`} section={section} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 0}
            aria-label="이전 단계"
            className="flex items-center gap-1 text-sm font-medium text-sub hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            이전
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}단계로 이동`}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === step ? 'bg-foreground scale-125' : 'bg-disabled'
                }`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              aria-label="다음 단계"
              className="flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              다음
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      {/* Disclaimer */}
      {report.disclaimer && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <p className="text-2xs text-placeholder text-center">{report.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
