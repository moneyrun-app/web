'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useWrongNotes } from '@/hooks/useApi';
import Markdown from '@/components/common/Markdown';

export default function WrongNotesPage() {
  const router = useRouter();
  const { data, isLoading } = useWrongNotes();
  const [collapsedNotes, setCollapsedNotes] = useState<Set<string>>(new Set());

  const wrongNotes = data?.wrongNotes ?? [];

  const toggleNote = (id: string) => {
    setCollapsedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isExpanded = (id: string) => !collapsedNotes.has(id);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <AlertCircle size={20} className="text-red-500" />
        <h1 className="text-lg font-bold">오답 노트</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {wrongNotes.length === 0 && (
            <p className="text-sub text-center py-12">틀린 문제가 없어요!</p>
          )}
          {wrongNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => toggleNote(note.id)}
              aria-expanded={isExpanded(note.id)}
              className="w-full text-left bg-background border border-border rounded-2xl p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-foreground mb-2">{note.question}</p>

              <div className="flex gap-2 mb-2">
                <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-full bg-grade-red-bg text-grade-red-text font-medium">
                  내 답: {note.choices?.[note.userAnswer] ?? '—'}
                </span>
                <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-full bg-grade-green-bg text-grade-green-text font-medium">
                  정답: {note.choices?.[note.correctAnswer] ?? '—'}
                </span>
              </div>

              {isExpanded(note.id) && note.detailedExplanation && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-3xs font-semibold text-foreground mb-1.5">상세 설명</p>
                  <div className="text-xs text-sub leading-relaxed prose prose-sm max-w-none">
                    <Markdown>{note.detailedExplanation}</Markdown>
                  </div>
                </div>
              )}

              {note.detailedExplanation && (
                <p className="text-3xs text-accent mt-2">{isExpanded(note.id) ? '접기' : '자세히 보기'}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
