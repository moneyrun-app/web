'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Highlighter } from 'lucide-react';
import { useHighlights } from '@/hooks/useApi';
import type { HighlightColor } from '@/types/my-book';

const COLOR_FILTERS: { color: HighlightColor | ''; bg: string; label: string }[] = [
  { color: '', bg: '', label: '전체' },
  { color: 'yellow', bg: '#FFF3B0', label: '노랑' },
  { color: 'green', bg: '#C8F7C5', label: '초록' },
  { color: 'blue', bg: '#B5D8F7', label: '파랑' },
  { color: 'pink', bg: '#F7C5D8', label: '분홍' },
  { color: 'orange', bg: '#F7D8B5', label: '주황' },
];

export default function HighlightsPage() {
  const router = useRouter();
  const [colorFilter, setColorFilter] = useState<HighlightColor | ''>('');
  const { data, isLoading } = useHighlights(colorFilter || undefined);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Highlighter size={20} className="text-yellow-500" />
        <h1 className="text-lg font-bold">하이라이트 모아보기</h1>
      </div>

      {/* 색상 필터 */}
      <div className="flex gap-2 mb-4">
        {COLOR_FILTERS.map((f) => (
          <button
            key={f.color}
            onClick={() => setColorFilter(f.color)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              colorFilter === f.color
                ? 'bg-foreground text-background'
                : 'bg-surface text-sub'
            }`}
          >
            {f.bg && <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: f.bg }} />}
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((hl) => {
            const colorBg = COLOR_FILTERS.find((c) => c.color === hl.color)?.bg ?? '#FFF3B0';
            return (
              <button
                key={hl.id}
                onClick={() => router.push(`/my-book/books/${hl.purchaseId}`)}
                className="w-full text-left bg-background border border-border rounded-2xl p-4 shadow-sm"
              >
                <p className="text-3xs text-sub mb-1">{hl.bookTitle}{hl.chapterTitle ? ` · ${hl.chapterTitle}` : ` · Ch.${hl.chapterIndex + 1}`}</p>
                <p className="text-sm leading-relaxed px-1 py-0.5 rounded" style={{ backgroundColor: colorBg }}>
                  {hl.sentenceText}
                </p>
                {hl.note && <p className="text-xs text-sub mt-1.5">{hl.note}</p>}
              </button>
            );
          })}
          {(data ?? []).length === 0 && (
            <p className="text-sub text-center py-12">아직 하이라이트가 없어요</p>
          )}
        </div>
      )}
    </div>
  );
}
