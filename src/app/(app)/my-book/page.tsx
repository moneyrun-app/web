'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, BookOpen, AlertCircle, Loader2, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { useMyBookOverview, useDetailedReportStatus, useWrongNotes, useHighlights } from '@/hooks/useApi';
import Markdown from '@/components/common/Markdown';
import BookCover from '@/components/book/BookCover';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FFE566', green: '#8BE8A0', blue: '#85C4F0', pink: '#F0A0BE', orange: '#F0C080',
};

const TABS = ['머니레터', '스크랩', '오답노트'] as const;
type Tab = (typeof TABS)[number];

export default function MyBookPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('머니레터');
  const { data, isLoading } = useMyBookOverview();
  const { data: reportStatus } = useDetailedReportStatus();
  const { data: wrongNotesData, isLoading: wrongNotesLoading } = useWrongNotes(activeTab === '오답노트');
  const { data: highlightsData } = useHighlights();
  const [collapsedNotes, setCollapsedNotes] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface rounded-2xl" />
        <div className="h-12 bg-surface rounded-full w-3/4" />
        <div className="h-32 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Library size={22} className="text-foreground" />
        <h1 className="text-xl md:text-2xl font-bold">마이북</h1>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'bg-surface text-sub'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 머니레터 탭 */}
      {activeTab === '머니레터' && (
        <div className="space-y-3">
          {reportStatus?.status === 'generating' && (
            <div className="bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={16} className="text-accent animate-spin" />
                <span className="text-xs font-semibold text-accent">상세 리포트 생성 중</span>
              </div>
              <p className="text-sm text-sub">AI가 맞춤 리포트를 준비하고 있어요...</p>
            </div>
          )}
          {data.detailedReport && (
            <button
              onClick={() => router.push(`/my-book/report/${data.detailedReport!.id}`)}
              className="w-full text-left bg-background border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <span className="text-sm font-medium text-foreground">리포트</span>
              <span className="text-xs text-placeholder">{data.detailedReport.createdAt.split('T')[0].replace(/-/g, '.')}</span>
            </button>
          )}

          {data.purchasedBooks.length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-2xl">
              <BookOpen size={28} className="mx-auto text-sub mb-2" />
              <p className="text-sm text-sub">아직 구매한 책이 없어요</p>
              <button
                onClick={() => router.push('/money-book')}
                className="mt-3 h-9 px-4 text-xs font-medium rounded-lg bg-accent text-white"
              >
                머니북 둘러보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {data.purchasedBooks.map((book) => (
                <BookCover
                  key={book.purchaseId}
                  title={book.bookTitle}
                  category={book.category}
                  coverImageUrl={book.coverImageUrl}
                  status={book.status}
                  onClick={book.status === 'completed' ? () => router.push(`/my-book/books/${book.purchaseId}`) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 스크랩 탭 */}
      {activeTab === '스크랩' && (
        <div className="space-y-3">
          {/* 요약 */}
          <div className="bg-surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">총 스크랩</p>
              <p className="text-lg font-bold">{data.scraps?.totalCount ?? 0}개</p>
            </div>
            <div className="flex gap-3 text-[10px] text-sub">
              <span>URL {data.scraps?.urlScrapCount ?? 0}</span>
              <span>퀴즈 {data.scraps?.quizScrapCount ?? 0}</span>
              <span>하이라이트 {(highlightsData ?? []).length}</span>
            </div>
          </div>

          {/* 최근 하이라이트 미리보기 */}
          {(highlightsData ?? []).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
                <Bookmark size={12} /> 최근 하이라이트
              </h3>
              <div className="space-y-1.5">
                {(highlightsData ?? []).slice(0, 3).map((hl) => (
                  <div key={hl.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-background border border-border">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: HIGHLIGHT_COLORS[hl.color] ?? '#FFE566' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-1">{hl.sentenceText}</p>
                      <p className="text-[10px] text-placeholder">{hl.bookTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 전체보기 버튼 */}
          <button
            onClick={() => router.push('/my-book/scraps')}
            className="w-full h-11 bg-foreground text-background text-sm font-medium rounded-xl flex items-center justify-center gap-1"
          >
            <Bookmark size={14} /> 스크랩 전체보기
          </button>
        </div>
      )}

      {/* 오답노트 탭 */}
      {activeTab === '오답노트' && (
        <div className="space-y-3">
          {wrongNotesLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
            </div>
          ) : (wrongNotesData?.wrongNotes ?? []).length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-2xl">
              <AlertCircle size={28} className="mx-auto text-sub mb-2" />
              <p className="text-sm text-sub">틀린 문제가 없어요!</p>
            </div>
          ) : (
            (wrongNotesData?.wrongNotes ?? []).map((note) => {
              const expanded = !collapsedNotes.has(note.id);
              return (
                <div
                  key={note.id}
                  className="bg-background border border-border rounded-2xl p-4 shadow-sm"
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

                  {note.detailedExplanation && (
                    <>
                      {expanded && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-3xs font-semibold text-foreground mb-1.5">상세 설명</p>
                          <div className="text-xs text-sub leading-relaxed prose prose-sm max-w-none">
                            <Markdown>{note.detailedExplanation}</Markdown>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setCollapsedNotes((prev) => {
                          const next = new Set(prev);
                          if (next.has(note.id)) next.delete(note.id);
                          else next.add(note.id);
                          return next;
                        })}
                        className="flex items-center gap-1 text-3xs text-accent mt-2"
                      >
                        {expanded ? '접기' : '자세히 보기'}
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
