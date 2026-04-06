'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Link2, X, FileText, ExternalLink, Loader2 } from 'lucide-react';
import CategoryTabs, { type BookTab } from '@/components/book/CategoryTabs';
import { useDetailedReports, useMonthlyReports, useScraps, useCreateScrap, useWrongNotes } from '@/hooks/useApi';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { decodeHtml } from '@/lib/format';

/** CommonMark에서 )**한글 패턴이 bold 닫기로 인식 안 되는 문제 우회 */
function fixEmphasis(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export default function BookPage() {
  const router = useRouter();
  const [tab, setTab] = useState<BookTab>('detailed');
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [scrapUrl, setScrapUrl] = useState('');

  const { data: reports, isLoading: reportsLoading } = useDetailedReports();
  const { data: monthlyReports, isLoading: monthlyLoading } = useMonthlyReports();
  const { data: wrongNotes, isLoading: wrongLoading } = useWrongNotes();
  const { data: scraps, isLoading: scrapsLoading } = useScraps();
  const createScrap = useCreateScrap();
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const handleScrap = () => {
    if (!scrapUrl) return;
    createScrap.mutate(scrapUrl, {
      onSuccess: () => { setShowScrapModal(false); setScrapUrl(''); },
    });
  };

  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={22} className="text-foreground" />
        <h1 className="text-xl md:text-2xl font-bold">마이북</h1>
      </div>

      <CategoryTabs active={tab} onChange={setTab} />

      <div className="py-4 space-y-4">
        {/* 시뮬레이터 분석 리포트 */}
        {tab === 'detailed' && (
          <>
            {reportsLoading ? <Skeleton /> : (
              <div className="space-y-4">
                {(reports?.items ?? []).map((item) => (
                  <div key={item.id} className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm">
                    <p className="text-xs text-placeholder mb-1.5">{(item.analyzedAt || item.createdAt).split('T')[0].replace(/-/g, '.')} 분석</p>
                    <p className="text-sm font-semibold text-foreground mb-2">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-caption text-sub leading-relaxed truncate flex-1">{item.summary}</p>
                      <button
                        onClick={() => router.push(`/book/${item.id}?type=detailed`)}
                        className="inline-flex items-center gap-1 h-9 px-3 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity shrink-0"
                      >
                        <FileText size={12} />상세보기
                      </button>
                    </div>
                  </div>
                ))}
                {(reports?.items ?? []).length === 0 && (
                  <p className="text-sub text-center py-12">아직 리포트가 없어요</p>
                )}
              </div>
            )}

            {/* 구분선 + 월간 리포트 */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3">월간 리포트</p>
              {monthlyLoading ? <Skeleton /> : (
                <div className="space-y-3">
                  {(monthlyReports ?? []).map((item) => (
                    <button key={item.id} onClick={() => router.push(`/book/${item.id}?type=monthly`)} className="w-full text-left bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm hover:border-accent transition-colors">
                      <p className="text-xs text-placeholder mb-1.5">{item.month}</p>
                      <p className="text-sm font-semibold text-foreground mb-1">{item.summary}</p>
                    </button>
                  ))}
                  {(monthlyReports ?? []).length === 0 && (
                    <p className="text-sub text-center py-12">다음 달부터 월간 리포트를 보여드릴게요</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Wrong Notes (오답노트) */}
        {tab === 'wrong' && (
          wrongLoading ? <Skeleton /> : (
            <div className="space-y-3">
              {(wrongNotes ?? []).length === 0 && (
                <p className="text-sub text-center py-12">틀린 문제가 없어요!</p>
              )}
              {(wrongNotes ?? []).map((note) => (
                <div
                  key={note.id}
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  className="w-full text-left bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm cursor-pointer"
                >
                  <p className="text-[10px] text-placeholder mb-1">{note.category} · {note.source}</p>
                  <p className="text-sm font-medium text-foreground mb-2">{note.question}</p>

                  <div className="flex gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-grade-red-bg text-grade-red-text font-medium">
                      내 답: {note.choices?.[note.userAnswer - 1] ?? '—'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-grade-green-bg text-grade-green-text font-medium">
                      정답: {note.choices?.[note.correctAnswer - 1] ?? '—'}
                    </span>
                  </div>

                  <p className="text-xs text-sub">{note.briefExplanation}</p>

                  {expandedNote === note.id && note.detailedExplanation && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-semibold text-foreground mb-1.5">상세 설명</p>
                      <div className="text-xs text-sub leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{fixEmphasis(note.detailedExplanation)}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {note.detailedExplanation && (
                    <p className="text-[10px] text-accent mt-2">{expandedNote === note.id ? '접기' : '자세히 보기'}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Scraps */}
        {tab === 'scrap' && (
          scrapsLoading ? <Skeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(scraps ?? []).map((item) => (
                <div key={item.id} className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-placeholder bg-surface px-1.5 py-0.5 rounded">{item.channel}</span>
                    <span className="text-xs text-placeholder">{item.creator}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1.5">{decodeHtml(item.title)}</p>
                  <p className="text-caption text-sub leading-relaxed line-clamp-2">{decodeHtml(item.aiSummary)}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent mt-2 hover:underline">
                    <ExternalLink size={12} />원문 보기
                  </a>
                </div>
              ))}
              {(scraps ?? []).length === 0 && (
                <p className="text-sub text-center py-12 col-span-full">아직 스크랩이 없어요</p>
              )}
            </div>
          )
        )}

      </div>

      {/* FAB */}
      <button
        onClick={() => setShowScrapModal(true)}
        aria-label="URL 스크랩 추가"
        className="fixed right-4 bottom-24 md:bottom-8 md:right-8 w-12 h-12 rounded-full bg-foreground text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-30"
      >
        <Plus size={22} />
      </button>

      {/* Scrap Modal */}
      {showScrapModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[480px] rounded-t-2xl md:rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Link2 size={18} />
                <h3 className="text-lg font-bold">URL 스크랩</h3>
              </div>
              <button onClick={() => setShowScrapModal(false)} aria-label="닫기" className="text-sub hover:text-foreground p-1">
                <X size={20} />
              </button>
            </div>
            <label className="block mb-4">
              <span className="text-sm text-sub mb-1.5 block">URL을 붙여넣으세요</span>
              <input
                type="url"
                value={scrapUrl}
                onChange={(e) => setScrapUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-foreground placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
              />
            </label>
            <button
              onClick={handleScrap}
              disabled={!scrapUrl || createScrap.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white bg-accent disabled:bg-disabled disabled:text-sub transition-colors flex items-center justify-center gap-2"
            >
              {createScrap.isPending && <Loader2 size={16} className="animate-spin" />}
              스크랩하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
