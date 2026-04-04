'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Download, Loader2 } from 'lucide-react';
import { useDetailedReport, useWeeklyReport, useLearnContent, useToggleLearnScrap } from '@/hooks/useApi';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const isDetailed = id.startsWith('dr-');
  const isWeekly = id.startsWith('wr-');
  const isLearn = !isDetailed && !isWeekly;

  const { data: detailed, isLoading: detailedLoading } = useDetailedReport(isDetailed ? id : '');
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyReport(isWeekly ? id : '');
  const { data: learn, isLoading: learnLoading } = useLearnContent(isLearn ? id : '');
  const toggleScrap = useToggleLearnScrap();

  const isLoading = (isDetailed && detailedLoading) || (isWeekly && weeklyLoading) || (isLearn && learnLoading);
  const data = isDetailed ? detailed : isWeekly ? weekly : learn;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse" />
        <div className="h-6 w-2/3 bg-surface rounded-lg animate-pulse" />
        <div className="space-y-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 bg-surface rounded animate-pulse" />)}
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

  const title = isDetailed
    ? (detailed!).title
    : isWeekly
      ? `${(weekly!).weekStart} ~ ${(weekly!).weekEnd}`
      : (learn!).title;

  const content = isDetailed
    ? (detailed!).content
    : isWeekly
      ? (weekly!).guide
      : (learn!).content;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {isDetailed && detailed?.pdfUrl && (
            <button
              onClick={() => window.open(`/api/proxy/book/detailed-reports/${id}/pdf`, '_blank')}
              className="inline-flex items-center gap-1 h-11 px-3 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors"
            >
              <Download size={12} />
              PDF
            </button>
          )}
          {isLearn && learn && (
            <button
              onClick={() => toggleScrap.mutate(id)}
              disabled={toggleScrap.isPending}
              aria-label={learn.isScrapped ? '스크랩 해제' : '스크랩'}
              aria-pressed={learn.isScrapped}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
            >
              {toggleScrap.isPending
                ? <Loader2 size={20} className="animate-spin text-sub" />
                : <Bookmark size={20} fill={learn.isScrapped ? 'currentColor' : 'none'} className={learn.isScrapped ? 'text-accent' : 'text-sub'} />
              }
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold mb-2">{title}</h1>

      {/* Weekly stats */}
      {isWeekly && weekly?.weeklyStats && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">예산 준수율</p>
            <p className="text-lg font-bold">{Math.round(weekly.weeklyStats.budgetComplianceRate * 100)}%</p>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">가장 큰 지출</p>
            <p className="text-sm font-semibold">{weekly.weeklyStats.biggestCategory === 'food' ? '식비' : weekly.weeklyStats.biggestCategory}</p>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">가장 절약</p>
            <p className="text-sm font-semibold">{weekly.weeklyStats.savedCategory === 'transport' ? '교통' : weekly.weeklyStats.savedCategory}</p>
          </div>
        </div>
      )}

      {/* Markdown Content */}
      <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 pb-8">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-6 mb-2">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-4 mb-1">{line.replace('### ', '')}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="text-sm ml-4 mb-1">{line.replace('- ', '')}</li>;
          if (line.trim() === '') return <br key={i} />;
          return <p key={i} className="text-sm leading-relaxed mb-2">{line}</p>;
        })}
      </div>
    </div>
  );
}
