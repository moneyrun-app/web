'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useDetailedReport, useMonthlyReport } from '@/hooks/useApi';
import {
  HeroCard, MarkdownSection, SectionDivider, SummaryTable, DonutChart,
  GaugeChart, ComparisonCard, StackedBar, SavingOpportunity, BarChartSection,
  ProgressCard, SimulationTable, TipCard, ActionChecklist, LineChartSection,
  ComparisonHighlight, CompoundEffect, WorldComparison, AgeRoadmap,
  MacroIndicators, InflationImpact, GoalTracker, TaxBenefit,
  InvestmentPyramid, PortfolioSuggestion, Disclaimer,
} from '@/components/book/ReportSections';
import V6ReportDetail from '@/components/book/V6ReportDetail';
import type { V6Report } from '@/types/report-v6';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SectionRenderer({ section }: { section: any }) {
  const s = section;
  switch (s.type) {
    case 'hero_card':          return <HeroCard data={s.data} />;
    case 'markdown':           return <MarkdownSection content={s.content} />;
    case 'section_divider':    return <SectionDivider title={s.title} subtitle={s.subtitle} />;
    case 'summary_table':      return <SummaryTable title={s.title} data={s.data} />;
    case 'donut_chart':        return <DonutChart title={s.title} data={s.data} />;
    case 'gauge_chart':        return <GaugeChart title={s.title} data={s.data} />;
    case 'comparison_card':    return <ComparisonCard title={s.title} data={s.data} />;
    case 'stacked_bar':        return <StackedBar title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'saving_opportunity': return <SavingOpportunity title={s.title} items={s.items} totalSaving={s.totalSaving} message={s.message} />;
    case 'bar_chart':          return <BarChartSection title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'progress_card':      return <ProgressCard title={s.title} data={s.data} />;
    case 'simulation_table':   return <SimulationTable title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'tip_card':           return <TipCard title={s.title} items={s.items} />;
    case 'action_checklist':   return <ActionChecklist title={s.title} items={s.items} />;
    case 'line_chart':         return <LineChartSection title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'comparison_highlight': return <ComparisonHighlight title={s.title} data={s.data} />;
    case 'compound_effect':    return <CompoundEffect title={s.title} data={s.data} message={s.message} />;
    case 'world_comparison':   return <WorldComparison title={s.title} data={s.data} />;
    case 'age_roadmap':        return <AgeRoadmap title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'macro_indicators':   return <MacroIndicators title={s.title} data={s.data} />;
    case 'inflation_impact':   return <InflationImpact title={s.title} subtitle={s.subtitle} data={s.data} message={s.message} />;
    case 'goal_tracker':       return <GoalTracker title={s.title} data={s.data} />;
    case 'tax_benefit':        return <TaxBenefit title={s.title} items={s.items} />;
    case 'investment_pyramid': return <InvestmentPyramid title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'portfolio_suggestion': return <PortfolioSuggestion title={s.title} subtitle={s.subtitle} data={s.data} />;
    case 'disclaimer':         return <Disclaimer text={s.text} />;
    default:                   return null;
  }
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? 'monthly';

  const isDetailed = type === 'detailed';
  const isMonthly = type === 'monthly';

  const { data: detailed, isLoading: detailedLoading } = useDetailedReport(isDetailed ? id : '');
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyReport(isMonthly ? id : '');

  const isLoading = (isDetailed && detailedLoading) || (isMonthly && monthlyLoading);
  const data = isDetailed ? detailed : monthly;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse" />
        <div className="h-6 w-2/3 bg-surface rounded-lg animate-pulse" />
        <div className="space-y-3 mt-6">
          <div className="h-40 bg-surface rounded-2xl animate-pulse" />
          <div className="h-32 bg-surface rounded-2xl animate-pulse" />
          <div className="h-32 bg-surface rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sub mb-4">콘텐츠를 불러오지 못했어요</p>
        <button onClick={() => router.back()} className="h-10 px-6 text-sm font-medium rounded-xl border border-border hover:bg-surface transition-colors">
          돌아가기
        </button>
      </div>
    );
  }

  // === Detailed Report ===
  if (isDetailed && detailed) {
    // v6 report detection: reportVersion === 'v6' and sections array with section field
    const isV6 = detailed.reportVersion === 'v6' && Array.isArray(detailed.sections) && detailed.sections.length > 0;

    if (isV6) {
      // Build V6Report object from DetailedReport
      const v6Report: V6Report = {
        id: detailed.id,
        title: detailed.title,
        reportVersion: detailed.reportVersion!,
        grade: (detailed.grade as V6Report['grade']) ?? 'RED',
        summary: detailed.summary ?? '',
        sections: detailed.sections!,
        userSnapshot: detailed.userSnapshot,
        disclaimer: detailed.disclaimer,
        analyzedAt: detailed.analyzedAt,
        createdAt: detailed.createdAt,
      };
      return <V6ReportDetail report={v6Report} onBack={() => router.back()} />;
    }

    // Legacy: 섹션 기반 or 마크다운 폴백
    const rawContent = detailed.content;
    const parsed = typeof rawContent === 'string'
      ? (() => { try { return JSON.parse(rawContent); } catch { return null; } })()
      : rawContent;
    const isLegacy = !parsed || !parsed.sections;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections: any[] = isLegacy ? [] : parsed.sections;

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>
        <p className="text-xs text-placeholder mb-1">
          {(detailed.analyzedAt || detailed.createdAt).split('T')[0].replace(/-/g, '.')} 분석
        </p>
        <h1 className="text-xl md:text-2xl font-bold mb-4">{detailed.title}</h1>

        {isLegacy ? (
          /* 백엔드가 아직 문자열로 내려줄 때 마크다운 폴백 */
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 pb-8">
            {(() => {
              const lines = String(rawContent).split('\n');
              const elements: React.ReactNode[] = [];
              let i = 0;
              while (i < lines.length) {
                const line = lines[i];
                if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-lg font-bold mt-6 mb-2">{line.replace('## ', '')}</h2>); i++; }
                else if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-1">{line.replace('### ', '')}</h3>); i++; }
                else if (line.startsWith('- ')) {
                  const items: React.ReactNode[] = [];
                  while (i < lines.length && lines[i].startsWith('- ')) {
                    items.push(<li key={i} className="text-sm mb-1">{lines[i].replace('- ', '')}</li>);
                    i++;
                  }
                  elements.push(<ul key={`ul-${i}`} className="list-disc ml-4 my-2">{items}</ul>);
                }
                else if (line.trim() === '') { elements.push(<br key={i} />); i++; }
                else { elements.push(<p key={i} className="text-sm leading-relaxed mb-2">{line}</p>); i++; }
              }
              return elements;
            })()}
          </div>
        ) : (
          /* 섹션 기반 렌더링 */
          <div className="space-y-4 pb-8">
            {sections.map((section, i) => (
              <SectionRenderer key={i} section={section} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // === Monthly Report (마크다운 기반) ===
  if (isMonthly && monthly) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-2">{monthly.month} 월간 리포트</h1>
        {monthly.monthlyStats && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-grade-green-bg rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-0.5">절약</p>
              <p className="text-lg font-bold text-grade-green-text">{monthly.monthlyStats.greenDays}일</p>
            </div>
            <div className="flex-1 bg-grade-yellow-bg rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-0.5">보통</p>
              <p className="text-lg font-bold text-grade-yellow-text">{monthly.monthlyStats.yellowDays}일</p>
            </div>
            <div className="flex-1 bg-grade-red-bg rounded-xl p-3 text-center">
              <p className="text-xs text-sub mb-0.5">과소비</p>
              <p className="text-lg font-bold text-grade-red-text">{monthly.monthlyStats.redDays}일</p>
            </div>
          </div>
        )}
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 pb-8">
          {(() => {
            const lines = monthly.guide.split('\n');
            const elements: React.ReactNode[] = [];
            let i = 0;
            while (i < lines.length) {
              const line = lines[i];
              if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-lg font-bold mt-6 mb-2">{line.replace('## ', '')}</h2>); i++; }
              else if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-1">{line.replace('### ', '')}</h3>); i++; }
              else if (line.startsWith('- ')) {
                const items: React.ReactNode[] = [];
                while (i < lines.length && lines[i].startsWith('- ')) {
                  items.push(<li key={i} className="text-sm mb-1">{lines[i].replace('- ', '')}</li>);
                  i++;
                }
                elements.push(<ul key={`ul-${i}`} className="list-disc ml-4 my-2">{items}</ul>);
              }
              else if (line.trim() === '') { elements.push(<br key={i} />); i++; }
              else { elements.push(<p key={i} className="text-sm leading-relaxed mb-2">{line}</p>); i++; }
            }
            return elements;
          })()}
        </div>
      </div>
    );
  }

  return null;
}
