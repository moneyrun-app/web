'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, BookOpen, AlertCircle, Loader2, Plus, Link, X, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { useMyBookOverview, useDetailedReportStatus, useCreateScrap, useWrongNotes, useHighlights, useDeleteHighlight } from '@/hooks/useApi';
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
  const createScrap = useCreateScrap();
  const { data: wrongNotesData, isLoading: wrongNotesLoading } = useWrongNotes(activeTab === '오답노트');
  const { data: highlightsData, isLoading: highlightsLoading } = useHighlights();
  const deleteHighlightMut = useDeleteHighlight();
  const [collapsedNotes, setCollapsedNotes] = useState<Set<string>>(new Set());
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleCreateScrap = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    createScrap.mutate(trimmed, {
      onSuccess: () => {
        setUrlInput('');
        setShowUrlInput(false);
      },
    });
  };

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
        <div className="space-y-4">
          {/* 책 하이라이트 */}
          <div>
            <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
              <Bookmark size={12} /> 책 스크랩
            </h3>
            {highlightsLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2].map((i) => <div key={i} className="h-16 bg-surface rounded-xl" />)}
              </div>
            ) : (highlightsData ?? []).length === 0 ? (
              <div className="text-center py-6 bg-surface rounded-xl">
                <p className="text-xs text-sub">책에서 스크랩한 문장이 없어요</p>
                <p className="text-[10px] text-placeholder mt-0.5">책을 읽으면서 문장을 클릭해 스크랩해보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(highlightsData ?? []).map((hl) => (
                  <div key={hl.id} className="flex items-start gap-2 p-3 rounded-xl bg-background border border-border">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: HIGHLIGHT_COLORS[hl.color] ?? '#FFE566' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-2">{hl.sentenceText}</p>
                      <p className="text-[10px] text-placeholder mt-1">{hl.bookTitle}{hl.chapterTitle ? ` · ${hl.chapterTitle}` : ` · Ch.${hl.chapterIndex + 1}`}</p>
                    </div>
                    <button
                      onClick={() => deleteHighlightMut.mutate(hl.id)}
                      className="text-[10px] text-placeholder hover:text-red-500 shrink-0"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* URL 스크랩 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-sub flex items-center gap-1">
                <Link size={12} /> URL 스크랩
              </h3>
              <button
                onClick={() => setShowUrlInput(true)}
                className="text-[10px] text-accent flex items-center gap-0.5 hover:underline"
              >
                <Plus size={10} /> 추가
              </button>
            </div>
            {(data.scraps?.totalCount ?? 0) === 0 ? (
              <div className="text-center py-6 bg-surface rounded-xl">
                <p className="text-xs text-sub">스크랩한 URL이 없어요</p>
              </div>
            ) : (
              <button
                onClick={() => router.push('/my-book/scraps')}
                className="w-full text-left bg-background border border-border rounded-xl p-3 hover:shadow-sm transition-shadow"
              >
                <p className="text-sm font-medium text-foreground">URL 스크랩 {data.scraps?.totalCount ?? 0}개 보기</p>
              </button>
            )}
          </div>

          {/* URL 입력 모달 */}
          {showUrlInput && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-5" onClick={() => setShowUrlInput(false)}>
              <div className="w-full max-w-lg bg-background rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">URL 스크랩 추가</h3>
                  <button onClick={() => setShowUrlInput(false)} className="p-1 rounded-lg hover:bg-surface">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-surface focus-within:border-accent transition-colors">
                    <Link size={16} className="text-sub shrink-0" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateScrap()}
                      placeholder="https://..."
                      autoFocus
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-placeholder"
                    />
                  </div>
                  <button
                    onClick={handleCreateScrap}
                    disabled={!urlInput.trim() || createScrap.isPending}
                    className="h-11 px-4 text-sm font-medium rounded-xl bg-accent text-white disabled:opacity-40 transition-opacity shrink-0"
                  >
                    {createScrap.isPending ? <Loader2 size={16} className="animate-spin" /> : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
