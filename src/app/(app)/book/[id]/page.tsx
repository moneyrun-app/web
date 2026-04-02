'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { mockDetailedReport, mockWeeklyReport, mockLearnContent } from '@/lib/mock/mockBook';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isScrapped, setIsScrapped] = useState(false);

  // Mock: id 기반으로 콘텐츠 분기
  const isDetailed = id.startsWith('dr-');
  const isWeekly = id.startsWith('wr-');

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
    <div className="max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        {!isDetailed && !isWeekly && (
          <button onClick={() => setIsScrapped(!isScrapped)} className="p-2 -mr-2">
            <Bookmark size={24} fill={isScrapped ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-5 pb-4">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      {/* Markdown Content */}
      <div className="px-5 pb-12 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80">
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
