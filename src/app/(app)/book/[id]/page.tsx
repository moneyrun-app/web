'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { mockDetailedReport, mockWeeklyReport, mockLearnContent } from '@/lib/mock/mockBook';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isScrapped, setIsScrapped] = useState(false);

  const isDetailed = id.startsWith('dr-');
  const isWeekly = id.startsWith('wr-');
  const isLearn = !isDetailed && !isWeekly;

  const title = isDetailed
    ? mockDetailedReport.title
    : isWeekly
      ? `${mockWeeklyReport.weekStart} ~ ${mockWeeklyReport.weekEnd}`
      : mockLearnContent.title;

  const content = isDetailed
    ? mockDetailedReport.content
    : isWeekly
      ? mockWeeklyReport.guide
      : mockLearnContent.content;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {isDetailed && (
            <button className="inline-flex items-center gap-1 h-11 px-3 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors">
              <Download size={12} />
              PDF
            </button>
          )}
          {isLearn && (
            <button onClick={() => setIsScrapped(!isScrapped)} aria-label={isScrapped ? '스크랩 해제' : '스크랩'} aria-pressed={isScrapped} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <Bookmark size={20} fill={isScrapped ? 'currentColor' : 'none'} className={isScrapped ? 'text-accent' : 'text-sub'} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold mb-2">{title}</h1>

      {/* Weekly stats */}
      {isWeekly && mockWeeklyReport.weeklyStats && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">예산 준수율</p>
            <p className="text-lg font-bold">{Math.round(mockWeeklyReport.weeklyStats.budgetComplianceRate * 100)}%</p>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">가장 큰 지출</p>
            <p className="text-sm font-semibold">{mockWeeklyReport.weeklyStats.biggestCategory === 'food' ? '식비' : mockWeeklyReport.weeklyStats.biggestCategory}</p>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-3">
            <p className="text-xs text-sub mb-0.5">가장 절약</p>
            <p className="text-sm font-semibold">{mockWeeklyReport.weeklyStats.savedCategory === 'transport' ? '교통' : mockWeeklyReport.weeklyStats.savedCategory}</p>
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
