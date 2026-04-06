'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatWon } from '@/lib/format';

// ─── CountUp ───

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

function CountUpWon({ amount, className }: { amount: number; className?: string }) {
  const { value, ref } = useCountUp(amount);
  return <span ref={ref} className={className}>{formatWon(value)}</span>;
}

// ─── Helpers ───

const gradeConfig: Record<string, { bg: string; text: string; label: string }> = {
  RED: { bg: 'bg-grade-red-bg', text: 'text-grade-red-text', label: 'RED' },
  YELLOW: { bg: 'bg-grade-yellow-bg', text: 'text-grade-yellow-text', label: 'YELLOW' },
  GREEN: { bg: 'bg-grade-green-bg', text: 'text-grade-green-text', label: 'GREEN' },
};

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-background border border-border rounded-2xl p-4 md:p-5 ${className}`}>{children}</div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <h3 className="text-sm font-bold text-foreground mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-sub mb-3">{subtitle}</p>}
    </>
  );
}

// ─── Markdown Renderer ───

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const headers = line.split('|').filter(Boolean).map(s => s.trim());
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(s => s.trim()));
        i++;
      }
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>{headers.map((h, j) => <th key={j} className="text-left p-2 bg-surface font-semibold text-foreground border-b border-border">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50">
                  {row.map((cell, ci) => <td key={ci} className="p-2 text-sub">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-base font-bold text-foreground mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1.5">{line.slice(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.slice(5)}</h4>);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-3 border-accent pl-3 my-2 text-sm text-sub italic">{inlineFormat(line.slice(2))}</blockquote>
      );
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="text-sm text-foreground/80 ml-4 mb-0.5 list-disc">{inlineFormat(line.slice(2))}</li>);
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(<li key={i} className="text-sm text-foreground/80 ml-4 mb-0.5 list-decimal">{inlineFormat(line.replace(/^\d+\.\s/, ''))}</li>);
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="my-4 border-border" />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="text-sm text-foreground/80 leading-relaxed mb-1.5">{inlineFormat(line)}</p>);
    }
    i++;
  }
  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ═══════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════

// 1. hero_card
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HeroCard({ data }: { data: any }) {
  const grade = gradeConfig[data.grade] ?? gradeConfig.RED;
  return (
    <FadeIn>
      <div className={`${grade.bg} rounded-2xl p-5 md:p-6`}>
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${grade.text} bg-white/60 mb-3`}>{grade.label}</span>
        <h2 className={`text-lg md:text-xl font-bold ${grade.text} mb-1`}>{data.title}</h2>
        <p className="text-sm text-sub mb-4">{data.subtitle}</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/70 rounded-xl p-3 text-center">
            <p className="text-3xs text-sub mb-0.5">하루 예산</p>
            <CountUpWon amount={data.dailyBudget} className={`text-lg font-bold ${grade.text}`} />
          </div>
          <div className="flex-1 bg-white/70 rounded-xl p-3 text-center">
            <p className="text-3xs text-sub mb-0.5">월 잉여자금</p>
            <CountUpWon amount={data.monthlyBudget} className={`text-lg font-bold ${grade.text}`} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// 2. markdown
export function MarkdownSection({ content }: { content: string }) {
  return (
    <FadeIn>
      <div className="px-0.5">{renderMarkdown(content)}</div>
    </FadeIn>
  );
}

// 3. section_divider
export function SectionDivider({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <FadeIn>
      <div className="pt-6 pb-2">
        <div className="h-px bg-border mb-5" />
        <h2 className="text-base md:text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-sub mt-1">{subtitle}</p>}
      </div>
    </FadeIn>
  );
}

// 4. summary_table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SummaryTable({ title, data }: { title: string; data: any }) {
  const rows = [
    { label: '월 수입', value: data.income, bold: true },
    { label: '고정비', value: -data.fixedCost },
    { label: '변동비', value: -data.variableCost },
    { label: '총 지출', value: -data.totalExpense, bold: true },
    { label: '잉여자금', value: data.surplus, highlight: true },
  ];
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-2 mt-3">
        {rows.map(r => (
          <div key={r.label} className={`flex justify-between items-center py-1.5 ${r.highlight ? 'border-t border-border pt-2.5 mt-1' : ''}`}>
            <span className={`text-sm ${r.bold || r.highlight ? 'font-semibold text-foreground' : 'text-sub'}`}>{r.label}</span>
            <span className={`text-sm font-medium ${r.highlight ? 'text-accent font-bold' : r.bold ? 'text-foreground' : 'text-sub'}`}>
              {r.value < 0 ? `-${formatWon(Math.abs(r.value))}` : formatWon(r.value)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-3xs text-placeholder mt-3">지출 비율 {data.expenseRatio}% · {data.daysInMonth}일 기준</p>
    </Card></FadeIn>
  );
}

// 5. donut_chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DonutChart({ title, data }: { title: string; data: any[] }) {
  const total = data.reduce((s: number, d: { value: number }) => s + d.value, 0);
  const surplus = data.find((d: { label: string }) => d.label === '잉여자금');
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="flex items-center gap-4 mt-3">
        <div className="relative w-36 h-36 shrink-0">
          <PieChart width={144} height={144}>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0}>
              {data.map((e: { color: string }, i: number) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
          {surplus && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xs text-sub">잉여</p>
              <p className="text-xs font-bold text-foreground">{formatWon(surplus.value)}</p>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item: { label: string; value: number; color: string }) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-sub">{item.label}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{formatWon(item.value)} <span className="text-placeholder">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </Card></FadeIn>
  );
}

// 6. gauge_chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GaugeChart({ title, data }: { title: string; data: any }) {
  const pct = (data.score / data.maxScore) * 100;
  const color = pct < 40 ? 'bg-grade-red' : pct < 70 ? 'bg-grade-yellow' : 'bg-grade-green';
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="flex items-center gap-4 mt-3 mb-3">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
            <motion.circle cx="18" cy="18" r="15" fill="none" stroke={pct < 40 ? 'var(--grade-red)' : pct < 70 ? 'var(--grade-yellow)' : 'var(--grade-green)'}
              strokeWidth="3" strokeDasharray={`${pct * 0.94} 100`} strokeLinecap="round"
              initial={{ strokeDasharray: '0 100' }} whileInView={{ strokeDasharray: `${pct * 0.94} 100` }}
              viewport={{ once: true }} transition={{ duration: 1 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{data.score}</span>
            <span className="text-4xs text-sub">/ {data.maxScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${color} text-white mb-2`}>{data.label}</span>
          {data.breakdown?.map((b: { item: string; score: number; max: number; detail: string }, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <span className="text-3xs text-sub w-16 shrink-0">{b.item}</span>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${(b.score / b.max) * 100}%` }} />
              </div>
              <span className="text-3xs text-placeholder w-10 text-right">{b.score}/{b.max}</span>
            </div>
          ))}
        </div>
      </div>
    </Card></FadeIn>
  );
}

// 7. comparison_card
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComparisonCard({ title, data }: { title: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-4 mt-3">
        {data.map((item: { label: string; mine: number; average: number; diff: number; unit?: string }) => {
          const isPercent = item.unit === '%';
          const max = Math.max(item.mine, item.average);
          const minePct = max > 0 ? (item.mine / max) * 100 : 0;
          const avgPct = max > 0 ? (item.average / max) * 100 : 0;
          const isOver = item.diff > 0;
          const fmtVal = (v: number) => isPercent ? `${v}%` : formatWon(v);
          return (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.label}</span>
                <span className={`text-3xs font-semibold ${isOver ? 'text-grade-red-text' : 'text-grade-green-text'}`}>
                  {isOver ? '+' : ''}{isPercent ? `${item.diff}%p` : formatWon(item.diff)}
                </span>
              </div>
              <div className="space-y-1">
                {[{ label: '나', val: item.mine, pct: minePct }, { label: '평균', val: item.average, pct: avgPct }].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="text-3xs text-sub w-6 shrink-0">{r.label}</span>
                    <div className="flex-1 h-4 bg-surface rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${r.label === '나' ? (isOver ? 'bg-grade-red' : 'bg-accent') : 'bg-disabled'}`}
                        initial={{ width: 0 }} whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }} transition={{ duration: 0.8, delay: r.label === '평균' ? 0.1 : 0 }} />
                    </div>
                    <span className="text-3xs text-sub w-16 text-right shrink-0">{fmtVal(r.val)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card></FadeIn>
  );
}

// 8. stacked_bar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StackedBar({ title, subtitle, data }: { title: string; subtitle?: string; data: any[] }) {
  const total = data.reduce((s: number, d: { value: number }) => s + d.value, 0);
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="h-6 rounded-full overflow-hidden flex mt-3 mb-3">
        {data.map((d: { label: string; value: number; color: string }, i: number) => (
          <motion.div key={i} className="h-full" style={{ backgroundColor: d.color }}
            initial={{ width: 0 }} whileInView={{ width: `${(d.value / total) * 100}%` }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05 }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((d: { label: string; value: number; ratio: number; color: string }) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-3xs text-sub truncate">{d.label}</span>
            <span className="text-3xs font-medium text-foreground ml-auto">{formatWon(d.value)}</span>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 9. saving_opportunity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SavingOpportunity({ title, items, totalSaving, message }: { title: string; items: any[]; totalSaving: number; message: string }) {
  const difficultyLabel: Record<string, string> = { easy: '쉬움', medium: '보통', hard: '어려움' };
  const difficultyColor: Record<string, string> = { easy: 'text-grade-green-text bg-grade-green-bg', medium: 'text-grade-yellow-text bg-grade-yellow-bg', hard: 'text-grade-red-text bg-grade-red-bg' };
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-2 mt-3">
        {items.map((item: { category: string; current: number; optimized: number; saving: number; method: string; difficulty: string }, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2.5 bg-surface rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{item.category}</p>
              <p className="text-3xs text-sub">{item.method}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xs text-sub line-through">{formatWon(item.current)}</p>
              <p className="text-xs font-bold text-grade-green-text">{formatWon(item.optimized)}</p>
            </div>
            <span className={`text-4xs font-medium px-1.5 py-0.5 rounded ${difficultyColor[item.difficulty] ?? ''}`}>
              {difficultyLabel[item.difficulty] ?? item.difficulty}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 bg-grade-green-bg rounded-xl">
        <p className="text-xs font-bold text-grade-green-text">월 {formatWon(totalSaving)} 절약 가능</p>
        <p className="text-3xs text-sub mt-0.5">{message}</p>
      </div>
    </Card></FadeIn>
  );
}

// 10. bar_chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BarChartSection({ title, subtitle, data }: { title: string; subtitle?: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="space-y-3 mt-3">
        {data.map((item: { label: string; current: number; target: number }) => {
          const max = Math.max(item.current, item.target);
          return (
            <div key={item.label}>
              <p className="text-xs font-medium text-foreground mb-1">{item.label}</p>
              {[{ l: '현재', v: item.current, c: 'bg-grade-red' }, { l: '목표', v: item.target, c: 'bg-grade-green' }].map(r => (
                <div key={r.l} className="flex items-center gap-2 mb-0.5">
                  <span className="text-3xs text-sub w-8 shrink-0">{r.l}</span>
                  <div className="flex-1 h-4 bg-surface rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${r.c}`} initial={{ width: 0 }}
                      whileInView={{ width: `${max > 0 ? (r.v / max) * 100 : 0}%` }}
                      viewport={{ once: true }} transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-3xs text-sub w-14 text-right shrink-0">{formatWon(r.v)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card></FadeIn>
  );
}

// 11. progress_card
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProgressCard({ title, data }: { title: string; data: any }) {
  const cur = gradeConfig[data.current] ?? gradeConfig.RED;
  const nxt = gradeConfig[data.next] ?? gradeConfig.YELLOW;
  const targetRatio = data.targetRatio ?? data.yellowTarget ?? 70;
  const amountToSave = data.amountToSave ?? data.amountToYellow ?? 0;
  const message = data.message ?? data.messageYellow ?? '';
  const pct = targetRatio > 0 ? Math.min(((100 - data.currentRatio) / (100 - targetRatio)) * 100, 100) : 0;
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="flex items-center gap-3 my-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cur.bg} ${cur.text}`}>{cur.label}</span>
        <span className="text-sub text-xs">→</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nxt.bg} ${nxt.text}`}>{nxt.label}</span>
      </div>
      <div className="h-3 bg-surface rounded-full overflow-hidden mb-2">
        <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
      </div>
      {amountToSave > 0 && <p className="text-xs text-sub mb-1">남은 금액: <span className="font-semibold text-foreground">{formatWon(amountToSave)}</span></p>}
      <p className="text-xs text-sub">{message}</p>
    </Card></FadeIn>
  );
}

// 12. simulation_table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SimulationTable({ title, subtitle, data }: { title: string; subtitle: string; data: any }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-3 mt-3">
        {data.cases.map((c: { label: string; rate: number; asset55: number; asset65: number; monthlyPension: number }) => (
          <div key={c.label} className="bg-surface rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{c.label}</span>
              <span className="text-3xs text-placeholder">연 {c.rate}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-3xs text-sub mb-0.5">55세 자산</p><CountUpWon amount={c.asset55} className="text-xs font-bold text-foreground" /></div>
              <div><p className="text-3xs text-sub mb-0.5">65세 자산</p><CountUpWon amount={c.asset65} className="text-xs font-bold text-foreground" /></div>
              <div><p className="text-3xs text-sub mb-0.5">월 연금</p><CountUpWon amount={c.monthlyPension} className="text-xs font-bold text-accent" /></div>
            </div>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 13. tip_card
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TipCard({ title, items }: { title: string; items: any[] }) {
  return (
    <FadeIn>
      <div className="bg-grade-yellow-bg rounded-2xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
        <div className="space-y-3">
          {items.map((item: { emoji: string; title?: string; text: string }, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-base shrink-0">{item.emoji}</span>
              <div>
                {item.title && <p className="text-xs font-semibold text-foreground mb-0.5">{item.title}</p>}
                <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// 14. action_checklist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ActionChecklist({ title, items }: { title: string; items: any[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setChecked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-2 mt-3">
        {items.map((item: { id: string; text: string; category: string; savingEstimate: number }) => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${checked.has(item.id) ? 'bg-grade-green-bg' : 'bg-surface hover:bg-surface/80'}`}>
            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${checked.has(item.id) ? 'bg-grade-green border-grade-green text-white' : 'border-border'}`}>
              {checked.has(item.id) && <span className="text-xs">✓</span>}
            </span>
            <p className={`flex-1 text-sm ${checked.has(item.id) ? 'line-through text-sub' : 'text-foreground'}`}>{item.text}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-3xs text-placeholder bg-background px-1.5 py-0.5 rounded">{item.category}</span>
              {item.savingEstimate > 0 && <span className="text-3xs text-grade-green-text font-medium">-{formatWon(item.savingEstimate)}</span>}
            </div>
          </button>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 15. line_chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LineChartSection({ title, subtitle, data }: { title: string; subtitle?: string; data: any }) {
  const chartData = data.labels.map((label: string, i: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const point: any = { name: label };
    data.datasets.forEach((ds: { label: string; values: number[] }) => { point[ds.label] = ds.values[i]; });
    return point;
  });
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="mt-3" style={{ width: '100%', height: 220 }}>
        <LineChart width={320} height={220} data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${Math.round(v / 10000)}만`} width={40} />
          <Tooltip formatter={(v) => formatWon(Number(v))} labelStyle={{ fontSize: 11 }} />
          {data.datasets.map((ds: { label: string; color: string }) => (
            <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={ds.color} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </div>
    </Card></FadeIn>
  );
}

// 16. comparison_highlight
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComparisonHighlight({ title, data }: { title: string; data: any }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        {[data.before, data.after].map((side: { label: string; monthly: number; asset55: number; pension: number }) => (
          <div key={side.label} className={`rounded-xl p-3 text-center ${side === data.after ? 'bg-grade-green-bg' : 'bg-surface'}`}>
            <p className="text-3xs text-sub mb-2">{side.label}</p>
            <p className="text-xs font-bold text-foreground mb-1">월 {formatWon(side.monthly)}</p>
            <p className="text-3xs text-sub">55세: {formatWon(side.asset55)}</p>
            <p className="text-3xs text-sub">연금: {formatWon(side.pension)}/월</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-accent font-medium mt-3 text-center">{data.diff?.message}</p>
    </Card></FadeIn>
  );
}

// 17. compound_effect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CompoundEffect({ title, data, message }: { title: string; data: any[]; message: string }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-3 mt-3">
        {data.map((d: { label: string; years: number; total_invested: number; result_7pct: number; profit: number }, i: number) => (
          <div key={i} className={`p-3 rounded-xl ${i === 0 ? 'bg-grade-green-bg' : 'bg-surface'}`}>
            <p className="text-xs font-semibold text-foreground mb-1">{d.label}</p>
            <div className="flex justify-between text-3xs text-sub">
              <span>투자원금: {formatWon(d.total_invested)}</span>
              <span>결과(7%): <span className="font-bold text-foreground">{formatWon(d.result_7pct)}</span></span>
              <span>수익: <span className="font-bold text-grade-green-text">{formatWon(d.profit)}</span></span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-accent font-medium mt-3">{message}</p>
    </Card></FadeIn>
  );
}

// 18. world_comparison
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WorldComparison({ title, data }: { title: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-3 mt-3">
        {data.map((d: { country: string; flag: string; savingRate: number; investRate: number; mainInvest: string; tip: string }) => (
          <div key={d.country} className="p-3 bg-surface rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{d.flag}</span>
              <span className="text-xs font-semibold text-foreground">{d.country}</span>
              <span className="text-3xs text-sub ml-auto">저축률 {d.savingRate}%</span>
            </div>
            <p className="text-3xs text-sub mb-0.5">투자율 {d.investRate}% · {d.mainInvest}</p>
            <p className="text-3xs text-accent">{d.tip}</p>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 19. age_roadmap
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AgeRoadmap({ title, subtitle, data }: { title: string; subtitle?: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="mt-3 space-y-0">
        {data.map((d: { age: string; status: string; title: string; target: string; actions: string[] }, i: number) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full shrink-0 ${d.status === 'current' ? 'bg-accent' : d.status === 'past' ? 'bg-disabled' : 'bg-border'}`} />
              {i < data.length - 1 && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={`pb-4 flex-1 ${d.status === 'current' ? '' : 'opacity-60'}`}>
              <p className={`text-xs font-bold ${d.status === 'current' ? 'text-accent' : 'text-foreground'}`}>{d.age}</p>
              <p className="text-xs font-semibold text-foreground">{d.title}</p>
              <p className="text-3xs text-sub mb-1">{d.target}</p>
              {d.actions.map((a: string, j: number) => <p key={j} className="text-3xs text-sub">· {a}</p>)}
            </div>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 20. macro_indicators
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MacroIndicators({ title, data }: { title: string; data: any[] }) {
  const trendIcon: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
  const trendColor: Record<string, string> = { up: 'text-grade-red-text', down: 'text-grade-green-text', stable: 'text-sub' };
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-2 mt-3">
        {data.map((d: { label: string; value: string; trend: string; impact: string }) => (
          <div key={d.label} className="p-2.5 bg-surface rounded-xl">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium text-foreground">{d.label}</span>
              <span className={`text-xs font-bold ${trendColor[d.trend] ?? 'text-sub'}`}>{d.value} {trendIcon[d.trend] ?? ''}</span>
            </div>
            <p className="text-3xs text-sub">{d.impact}</p>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 21. inflation_impact
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InflationImpact({ title, subtitle, data, message }: { title: string; subtitle?: string; data: any[]; message: string }) {
  const maxVal = data[0]?.real_value ?? 1;
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="space-y-2 mt-3">
        {data.map((d: { year: string; purchasing_power: number; real_value: number }) => (
          <div key={d.year} className="flex items-center gap-2">
            <span className="text-3xs text-sub w-14 shrink-0">{d.year}</span>
            <div className="flex-1 h-4 bg-surface rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-grade-red" style={{ width: `${(d.real_value / maxVal) * 100}%` }} />
            </div>
            <span className="text-3xs font-medium text-foreground w-14 text-right">{formatWon(d.real_value)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-grade-red-text font-medium mt-3">{message}</p>
    </Card></FadeIn>
  );
}

// 22. goal_tracker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GoalTracker({ title, data }: { title: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-3 mt-3">
        {data.map((d: { goal: string; target: number; current: number; unit?: string; deadline: string }) => {
          const pct = d.target > 0 ? Math.min((d.current / d.target) * 100, 100) : 0;
          return (
            <div key={d.goal}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-foreground">{d.goal}</span>
                <span className="text-3xs text-placeholder">{d.deadline}</span>
              </div>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card></FadeIn>
  );
}

// 23. tax_benefit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TaxBenefit({ title, items }: { title: string; items: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} />
      <div className="space-y-2 mt-3">
        {items.map((d: { product: string; benefit: string; condition: string; recommended: boolean }, i: number) => (
          <div key={i} className={`p-3 rounded-xl ${d.recommended ? 'bg-accent/5 border border-accent/20' : 'bg-surface'}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-foreground">{d.product}</span>
              {d.recommended && <span className="text-4xs text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded">추천</span>}
            </div>
            <p className="text-3xs text-foreground/80">{d.benefit}</p>
            <p className="text-3xs text-sub">{d.condition}</p>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 24. investment_pyramid
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InvestmentPyramid({ title, subtitle, data }: { title: string; subtitle?: string; data: any[] }) {
  const sorted = [...data].sort((a: { level: number }, b: { level: number }) => a.level - b.level);
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="space-y-2 mt-3">
        {sorted.map((d: { level: number; title: string; target: string; product: string; amount: string }) => (
          <div key={d.level} className="p-3 bg-surface rounded-xl" style={{ marginLeft: `${(d.level - 1) * 8}px` }}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-3xs font-bold text-white bg-accent w-5 h-5 rounded-full flex items-center justify-center">{d.level}</span>
              <span className="text-xs font-semibold text-foreground">{d.title}</span>
            </div>
            <p className="text-3xs text-sub ml-7">{d.product} · {d.amount}</p>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 25. portfolio_suggestion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PortfolioSuggestion({ title, subtitle, data }: { title: string; subtitle?: string; data: any[] }) {
  return (
    <FadeIn><Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="h-5 rounded-full overflow-hidden flex mt-3 mb-3">
        {data.map((d: { asset: string; ratio: number; color: string }, i: number) => (
          <div key={i} className="h-full" style={{ backgroundColor: d.color, width: `${d.ratio}%` }} />
        ))}
      </div>
      <div className="space-y-2">
        {data.map((d: { asset: string; ratio: number; amount: number; color: string; reason: string }) => (
          <div key={d.asset} className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: d.color }} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{d.asset} ({d.ratio}%)</span>
                <span className="text-xs text-sub">{formatWon(d.amount)}</span>
              </div>
              <p className="text-3xs text-sub">{d.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card></FadeIn>
  );
}

// 26. disclaimer
export function Disclaimer({ text }: { text: string }) {
  return <FadeIn><p className="text-3xs text-placeholder leading-relaxed px-1">{text}</p></FadeIn>;
}
