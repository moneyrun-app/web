'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
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
};

const ICON_MAP: Record<string, string> = {
  wedding: '💒', home: '🏠', child: '👶', car: '🚗',
  shield: '🛡️', piggybank: '🐷', wallet: '💳', parking: '🅿️',
  education: '📚', health: '🏥', travel: '✈️', insurance: '🔒',
};

const COUNTRY_MAP: Record<string, string> = {
  KR: '한국', US: '미국', JP: '일본', CN: '중국',
  DE: '독일', GB: '영국', AU: '호주', CA: '캐나다',
  NL: '네덜란드', IT: '이탈리아', FR: '프랑스',
};

const PRODUCT_LABEL: Record<string, string> = {
  savings: '적금', cma: 'CMA', parking: '파킹통장',
  pensionFund: '연금저축펀드', youthAccount: '청년도약계좌',
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

  const hasLineBreaks = /\n/.test(text);
  let paragraphs: string[];

  if (hasLineBreaks) {
    paragraphs = text.split(/\n+/).filter((p) => p.trim());
  } else {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    paragraphs = [];
    for (let i = 0; i < sentences.length; i += 3) {
      paragraphs.push(sentences.slice(i, i + 3).join(' '));
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-5 mt-4">
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-[1.8]">{p}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Shared: Grade Badge ───

function GradeBadge({ grade, size = 'md' }: { grade: Grade; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = gradeConfig[grade];
  const sizeClasses = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${sizeClasses[size]}`} style={{ backgroundColor: cfg.light, color: cfg.dark }}>
      {cfg.label}
    </span>
  );
}

// ─── Shared: Section Title / Card ───

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-bold mb-3">{title}</h3>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-background rounded-2xl p-4 border border-border ${className}`}>{children}</div>;
}

function resolveIcon(icon?: string): string {
  if (!icon) return '📌';
  if (ICON_MAP[icon]) return ICON_MAP[icon];
  // 이미 이모지면 그대로
  if (/\p{Emoji}/u.test(icon)) return icon;
  return '📌';
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
            <circle cx="60" cy="60" r="52" fill="none" stroke={cfg.main} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
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
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.score / s.max) * 100}%`, backgroundColor: cfg.main }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Peer comparison */}
      {data.peerComparison && (() => {
        const pc = data.peerComparison;
        const items = [
          { label: '지출 비율', user: pc.expenseRatio?.user, peer: pc.expenseRatio?.peer, lowerBetter: true },
          { label: '변동지출', user: pc.variableRatio?.user, peer: pc.variableRatio?.peer, lowerBetter: true },
          { label: '잉여자금', user: pc.surplusRatio?.user, peer: pc.surplusRatio?.peer, lowerBetter: false },
        ].filter((i) => i.user != null && i.peer != null);

        if (items.length === 0) return null;

        return (
          <Card>
            <p className="text-sm font-semibold mb-4">또래 비교 ({pc.ageGroup})</p>
            <div className="space-y-4">
              {items.map((item) => {
                const diff = item.user - item.peer;
                const isGood = item.lowerBetter ? diff <= 0 : diff >= 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={`text-xs font-bold ${isGood ? 'text-grade-green-text' : 'text-grade-red-text'}`}>
                        {diff > 0 ? `+${diff}%p` : `${diff}%p`}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-2xs text-sub w-6 text-right">나</span>
                      <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(item.user, 100)}%`, backgroundColor: cfg.main }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs font-bold">{item.user}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-2xs text-sub w-6 text-right">또래</span>
                      <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-700 bg-disabled" style={{ width: `${Math.min(item.peer, 100)}%` }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs font-bold text-sub">{item.peer}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

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

  const comparisonData = data.ratios ? [
    { name: '고정지출', 나: data.ratios.user.fixed, 또래: data.ratios.peer.fixed },
    { name: '변동지출', 나: data.ratios.user.variable, 또래: data.ratios.peer.variable },
    { name: '잉여자금', 나: data.ratios.user.surplus, 또래: data.ratios.peer.surplus },
  ] : [];

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-base font-bold">{item.sign}{formatWon(item.value)}</span>
          </Card>
        ))}
      </div>

      {comparisonData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">비율 비교 (나 vs {data.peerAgeGroup || '또래'})</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--sub-text)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--sub-text)" tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => [`${value}%`, '']} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
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
  const scenarioColors = [gradeConfig.RED.main, gradeConfig.YELLOW.main, gradeConfig.GREEN.main];

  // 시나리오 테이블 데이터
  const xAxis = data.charts?.assetGrowth?.xAxis ?? [];
  const series = data.charts?.assetGrowth?.series ?? {};
  const scenarioNames = Object.keys(series);

  // 시나리오 바 차트 데이터 (recharts용)
  const barData = xAxis.map((label, idx) => {
    const row: Record<string, string | number> = { name: label };
    scenarioNames.forEach((name) => { row[name] = series[name]?.[idx] ?? 0; });
    return row;
  });

  // Timeline periods
  const periods = data.charts?.timeline?.periods ?? [];
  const phaseColors: Record<string, string> = { green: 'var(--grade-green)', red: 'var(--grade-red)', blue: 'var(--foreground)' };

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {/* Scenario chart */}
      {barData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">시나리오별 자산 성장</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--sub-text)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--sub-text)" tickFormatter={(v) => formatWon(v)} width={70} />
              <Tooltip formatter={(value) => [formatWon(Number(value)), '']} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              {scenarioNames.map((name, i) => (
                <Bar key={name} dataKey={name} fill={scenarioColors[i % scenarioColors.length]} radius={[4, 4, 0, 0]} />
              ))}
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Timeline bar */}
      {periods.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">인생 타임라인</p>
          <div className="flex h-8 rounded-full overflow-hidden">
            {periods.map((p, i) => {
              const totalSpan = periods.reduce((s, ph) => s + (ph.to - ph.from), 0);
              const w = ((p.to - p.from) / totalSpan) * 100;
              return (
                <div key={i} className="flex items-center justify-center text-2xs font-medium text-white"
                  style={{ width: `${w}%`, backgroundColor: phaseColors[p.color] || 'var(--disabled)' }}>
                  {p.label}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            {periods.map((p, i) => <span key={i} className="text-2xs text-sub">{p.from}세</span>)}
            <span className="text-2xs text-sub">{periods[periods.length - 1]?.to}세</span>
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
                  <span className="text-lg">{resolveIcon(ev.icon)}</span>
                  <p className="text-sm font-medium">{ev.name}</p>
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
            <div className="flex items-center justify-between bg-surface rounded-xl p-3">
              <span className="text-sm">국민연금 예상 수령액</span>
              <span className="text-sm font-bold">{formatWon(data.retirement.nationalPensionMonthly)}/월</span>
            </div>
            <div className="flex items-center justify-between bg-surface rounded-xl p-3">
              <span className="text-sm">월 부족분</span>
              <span className="text-sm font-bold text-grade-red-text">-{formatWon(data.retirement.monthlyShortfall)}/월</span>
            </div>
            <div className="flex items-center justify-between bg-surface rounded-xl p-3">
              <span className="text-sm">공백기 필요 자금 (최소)</span>
              <span className="text-sm font-bold">{formatWon(data.retirement.gapFundMin)}</span>
            </div>
            <div className="flex items-center justify-between bg-surface rounded-xl p-3">
              <span className="text-sm">공백기 필요 자금 (적정)</span>
              <span className="text-sm font-bold">{formatWon(data.retirement.gapFundComfort)}</span>
            </div>
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

      {data.topics?.map((topic, i) => {
        const chart = topic.chart;
        const isTable = chart?.type === 'table';
        const isBar = chart?.type === 'horizontal_bar';

        // horizontal_bar: data는 { KR: 35.5, US: 4.6 } 형태
        let barItems: { label: string; value: number; isHighlight: boolean }[] = [];
        if (isBar && chart.data && typeof chart.data === 'object' && !Array.isArray(chart.data)) {
          barItems = Object.entries(chart.data as Record<string, number>)
            .map(([code, value]) => ({
              label: COUNTRY_MAP[code] || code,
              value,
              isHighlight: chart.highlight === code,
            }))
            .sort((a, b) => b.value - a.value);
        }

        // table: rows, columns
        const tableColumns = (chart as unknown as Record<string, unknown>)?.columns as string[] | undefined;
        const tableRows = (chart as unknown as Record<string, unknown>)?.rows as unknown[][] | undefined;

        return (
          <Card key={i}>
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between">
              <span className="text-sm font-semibold text-left">{topic.title}</span>
              {expanded === i ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
            </button>
            {expanded === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="mt-3">
                {isBar && barItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {barItems.map((item, j) => {
                      const maxVal = Math.max(...barItems.map((b) => b.value));
                      return (
                        <div key={j}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs ${item.isHighlight ? 'font-bold' : 'text-sub'}`}>{item.label}</span>
                            <span className={`text-xs ${item.isHighlight ? 'font-bold' : 'text-sub'}`}>{item.value}{chart.unit || ''}</span>
                          </div>
                          <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.isHighlight ? 'var(--grade-red)' : 'var(--disabled)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {isTable && tableColumns && tableRows && (
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {tableColumns.map((col, j) => (
                            <th key={j} className="text-left py-2 px-2 text-sub font-medium">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row, j) => (
                          <tr key={j} className="border-b border-border/50">
                            {(row as (string | number)[]).map((cell, k) => {
                              const cellStr = String(cell);
                              const isKR = cellStr === 'KR';
                              const displayVal = COUNTRY_MAP[cellStr] || cellStr;
                              return (
                                <td key={k} className={`py-2 px-2 ${isKR ? 'font-bold' : ''}`}>{displayVal}</td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {topic.insight && <p className="text-sm text-sub leading-relaxed">{topic.insight}</p>}
              </motion.div>
            )}
          </Card>
        );
      })}

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
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: GRADE_COLORS[g.grade] }}>
                  {gradeConfig[g.grade]?.label || g.grade}
                </div>
                <span className="text-2xs text-sub mt-1">{i === 0 ? '현재' : i === 1 ? '다음' : '최종'}</span>
              </div>
              {i < grades.length - 1 && <ChevronRight size={20} className="text-sub mb-4" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Next grade target */}
      {data.next?.requiredReduction && (
        <Card className="bg-surface border-none text-center">
          <p className="text-sm text-sub mb-1">다음 등급까지</p>
          <p className="text-lg font-bold">월 {formatWon(data.next.requiredReduction)} 절약</p>
          {data.next.targetRatio && <p className="text-xs text-sub mt-1">지출 비율 {data.current?.expenseRatio}% → {data.next.targetRatio}%</p>}
        </Card>
      )}

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
                <div className="pb-2 flex-1">
                  <p className="text-sm font-semibold">{step.goal}</p>
                  <p className="text-xs text-sub mb-1">{step.period}</p>
                  <p className="text-sm text-grade-green-text font-medium">
                    월 {formatWon(step.targetReduction)} 절약 목표
                  </p>
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
  const surplusAmount = typeof data.current === 'object' ? data.current.surplus : data.current;

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      {surplusAmount > 0 && (
        <Card className="text-center">
          <p className="text-xs text-sub mb-1">현재 잉여자금</p>
          <p className="text-2xl font-black">{formatWon(surplusAmount)}</p>
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
                  {tip.potentialSaving}
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
                  {tip.potentialSaving}
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
                  <th className="text-left py-2 px-2 text-sub font-medium">추가 절약</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">새 잉여</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">10년 (적금)</th>
                  <th className="text-right py-2 px-2 text-sub font-medium">10년 (투자)</th>
                </tr>
              </thead>
              <tbody>
                {data.boostSimulation.map((item, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium">+{formatWon(item.extra)}</td>
                    <td className="py-2 px-2 text-right">{formatWon(item.newSurplus)}</td>
                    <td className="py-2 px-2 text-right">{formatWon(item.in10y_savings)}</td>
                    <td className="py-2 px-2 text-right font-bold text-grade-green-text">{formatWon(item.in10y_invest)}</td>
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
  // productRates: object → array
  const rateEntries = data.productRates && typeof data.productRates === 'object' && !Array.isArray(data.productRates)
    ? Object.entries(data.productRates).map(([key, rate]) => ({ product: PRODUCT_LABEL[key] || key, rate: `연 ${rate}%` }))
    : [];

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
            <span className="text-2xl mt-0.5">{resolveIcon(topic.icon)}</span>
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

      {/* Product rates */}
      {rateEntries.length > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-3">추천 상품 금리</p>
          <div className="space-y-2">
            {rateEntries.map((pr, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded-xl p-3">
                <p className="text-sm font-medium">{pr.product}</p>
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
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-month="${currentMonth}"]`) as HTMLElement | null;
      if (el) {
        // scrollIntoView 대신 컨테이너 내 가로 스크롤만 수행 (페이지 세로 스크롤 방지)
        const container = scrollRef.current;
        const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentMonth]);

  return (
    <div className="space-y-4">
      <SectionTitle title={data.title} />

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {data.months?.map((m) => {
          const isCurrent = m.month === currentMonth;
          // events는 string[] 형태
          const eventLabels: string[] = Array.isArray(m.events)
            ? m.events.map((e) => (typeof e === 'string' ? e : (e as { label: string }).label))
            : [];

          return (
            <div key={m.month} data-month={m.month}
              className={`snap-center flex-shrink-0 w-56 rounded-2xl p-4 border ${isCurrent ? 'border-foreground bg-foreground text-background' : 'border-border bg-background'}`}>
              <p className={`text-2xs font-bold mb-1 ${isCurrent ? 'text-background/70' : 'text-sub'}`}>{m.month}월</p>
              <p className={`text-sm font-bold mb-2 ${isCurrent ? '' : 'text-foreground'}`}>{m.title}</p>
              {eventLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {eventLabels.map((label, j) => (
                    <span key={j} className={`text-2xs px-2 py-0.5 rounded-full ${isCurrent ? 'bg-background/20 text-background' : 'bg-surface text-sub'}`}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <p className={`text-xs leading-relaxed ${isCurrent ? 'text-background/80' : 'text-sub'}`}>{m.todo}</p>
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

      <Card className="text-center bg-surface border-none">
        <Gift size={32} className="mx-auto mb-2 text-grade-green" />
        <p className="text-sm leading-relaxed whitespace-pre-line">{data.message}</p>
      </Card>

      {data.terms?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">금융 용어사전</p>
          {data.terms.map((t, i) => (
            <Card key={i}>
              <button onClick={() => setOpenTerm(openTerm === i ? null : i)} className="w-full flex items-center justify-between">
                <span className="text-sm font-medium">{t.term}</span>
                {openTerm === i ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
              </button>
              {openTerm === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="mt-2 pt-2 border-t border-border">
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

  // 스텝 변경 시 최상단으로 스크롤
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [step]);

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
              <ArrowLeft size={14} /> 돌아가기
            </button>
            <span className="text-2xs text-sub">{step + 1} / {STEPS.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => goTo(i)} className="flex-1 group">
                <div className="flex items-center justify-center mb-1.5">
                  <span className={`text-2xs font-semibold px-2 py-0.5 rounded transition-colors ${i <= step ? 'bg-foreground text-background' : 'bg-surface text-placeholder'}`}>
                    {s.tag}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-surface">
                  <motion.div className="h-full rounded-full bg-foreground" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step title */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
            <p className="text-2xs font-semibold text-sub mb-0.5">[{STEPS[step].tag}]</p>
            <h2 className="text-lg font-bold">{STEPS[step].title}</h2>
            {step === 0 && report.summary && <p className="text-sm text-sub mt-1">{report.summary}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 pb-32 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
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
          <button onClick={prev} disabled={step === 0} aria-label="이전 단계"
            className="flex items-center gap-1 text-sm font-medium text-sub hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={18} /> 이전
          </button>
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`${i + 1}단계로 이동`}
                className={`w-3 h-3 rounded-full transition-all ${i === step ? 'bg-foreground scale-125' : 'bg-disabled'}`} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={next} aria-label="다음 단계"
              className="flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity">
              다음 <ChevronRight size={18} />
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      {report.disclaimer && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <p className="text-2xs text-placeholder text-center">{report.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
