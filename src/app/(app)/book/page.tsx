'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Link2, X, Download, FileText, ExternalLink, Loader2 } from 'lucide-react';
import CategoryTabs, { type BookTab } from '@/components/book/CategoryTabs';
import { useDetailedReports, useWeeklyReports, useScraps, useLearnContents, useCreateScrap, useWrongNotes, useRetryWrongNote } from '@/hooks/useApi';

export default function BookPage() {
  const router = useRouter();
  const [tab, setTab] = useState<BookTab>('detailed');
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [scrapUrl, setScrapUrl] = useState('');

  const { data: reports, isLoading: reportsLoading } = useDetailedReports();
  const { data: weeklyReports, isLoading: weeklyLoading } = useWeeklyReports();
  const { data: wrongNotes, isLoading: wrongLoading } = useWrongNotes();
  const retryWrongNote = useRetryWrongNote();
  const { data: scraps, isLoading: scrapsLoading } = useScraps();
  const { data: learnContents, isLoading: learnLoading } = useLearnContents();
  const createScrap = useCreateScrap();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<{ id: string; correct: boolean; explanation: string } | null>(null);

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
        {/* AI Reports */}
        {tab === 'detailed' && (
          reportsLoading ? <Skeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(reports?.items ?? []).map((item) => (
                <div key={item.id} className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm">
                  <p className="text-xs text-placeholder mb-1.5">{item.createdAt.split('T')[0].replace(/-/g, '.')}</p>
                  <p className="text-sm font-semibold text-foreground mb-2">{item.title}</p>
                  <p className="text-caption text-sub leading-relaxed mb-3">{item.summary}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/book/${item.id}`)}
                      className="inline-flex items-center gap-1 h-11 px-3 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity"
                    >
                      <FileText size={12} />상세보기
                    </button>
                    <button
                      onClick={() => window.open(`/api/proxy/book/detailed-reports/${item.id}/pdf`, '_blank')}
                      className="inline-flex items-center gap-1 h-11 px-3 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors"
                    >
                      <Download size={12} />PDF
                    </button>
                  </div>
                </div>
              ))}
              {(reports?.items ?? []).length === 0 && (
                <p className="text-sub text-center py-12 col-span-full">아직 리포트가 없어요</p>
              )}
            </div>
          )
        )}

        {/* Weekly */}
        {tab === 'weekly' && (
          weeklyLoading ? <Skeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(weeklyReports ?? []).map((item) => (
                <button key={item.id} onClick={() => router.push(`/book/${item.id}`)} className="w-full text-left bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm hover:border-accent transition-colors">
                  <p className="text-xs text-placeholder mb-1.5">{item.weekStart} ~ {item.weekEnd}</p>
                  <p className="text-sm font-semibold text-foreground mb-1">{item.summary}</p>
                </button>
              ))}
              {(weeklyReports ?? []).length === 0 && (
                <p className="text-sub text-center py-12 col-span-full">다음 주부터 성과를 보여드릴게요</p>
              )}
            </div>
          )
        )}

        {/* Wrong Notes (오답노트) */}
        {tab === 'wrong' && (
          wrongLoading ? <Skeleton /> : (
            <div className="space-y-3">
              {(wrongNotes ?? []).filter((n) => !n.isResolved).length === 0 && (
                <p className="text-sub text-center py-12">틀린 문제가 없어요! 대단해요 👏</p>
              )}
              {(wrongNotes ?? []).filter((n) => !n.isResolved).map((note) => (
                <div key={note.id} className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm">
                  <p className="text-[10px] text-placeholder mb-1">{note.category} · {note.source}</p>
                  <p className="text-sm font-medium text-foreground mb-3">{note.question}</p>

                  {retryResult?.id === note.id ? (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${retryResult.correct ? 'bg-grade-green-bg' : 'bg-grade-red-bg'}`}>
                      <span>{retryResult.correct ? '✅' : '❌'}</span>
                      <div>
                        <p className={`text-xs font-semibold ${retryResult.correct ? 'text-grade-green-text' : 'text-grade-red-text'}`}>
                          {retryResult.correct ? '정답! 복습 완료' : '다시 한번 생각해보세요'}
                        </p>
                        <p className="text-xs text-sub mt-0.5">{retryResult.explanation}</p>
                      </div>
                    </div>
                  ) : retryingId === note.id ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          retryWrongNote.mutate({ id: note.id, userAnswer: true }, {
                            onSuccess: (res) => setRetryResult({ id: note.id, correct: res.correct, explanation: res.explanation }),
                          });
                        }}
                        disabled={retryWrongNote.isPending}
                        className="flex-1 h-11 rounded-xl text-sm font-bold bg-grade-green-bg text-grade-green-text hover:bg-grade-green/20 transition-colors"
                      >
                        ⭕ O
                      </button>
                      <button
                        onClick={() => {
                          retryWrongNote.mutate({ id: note.id, userAnswer: false }, {
                            onSuccess: (res) => setRetryResult({ id: note.id, correct: res.correct, explanation: res.explanation }),
                          });
                        }}
                        disabled={retryWrongNote.isPending}
                        className="flex-1 h-11 rounded-xl text-sm font-bold bg-grade-red-bg text-grade-red-text hover:bg-grade-red/20 transition-colors"
                      >
                        ❌ X
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-sub">정답: <span className="font-semibold">{note.correctAnswer ? 'O' : 'X'}</span></p>
                      <button
                        onClick={() => { setRetryingId(note.id); setRetryResult(null); }}
                        className="h-9 px-4 text-xs font-medium rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                      >
                        다시 풀기
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* 복습 완료된 문제 */}
              {(wrongNotes ?? []).filter((n) => n.isResolved).length > 0 && (
                <div className="pt-4">
                  <p className="text-xs text-placeholder mb-2">복습 완료</p>
                  {(wrongNotes ?? []).filter((n) => n.isResolved).map((note) => (
                    <div key={note.id} className="bg-surface rounded-xl p-3 mb-2">
                      <p className="text-xs text-sub line-through">{note.question}</p>
                    </div>
                  ))}
                </div>
              )}
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
                  <p className="text-sm font-semibold text-foreground mb-1.5">{item.title}</p>
                  <p className="text-caption text-sub leading-relaxed line-clamp-2">{item.aiSummary}</p>
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

        {/* Learn */}
        {tab === 'learn' && (
          learnLoading ? <Skeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(learnContents ?? []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/book/${item.id}`)}
                  className={`w-full text-left rounded-2xl p-4 md:p-5 border transition-colors ${
                    item.isRead ? 'bg-surface border-transparent' : 'bg-white border-border hover:border-accent shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm ${item.isRead ? 'text-sub' : 'text-foreground'}`}>{item.title}</p>
                    <span className="text-xs text-placeholder ml-2">{item.readMinutes}분</span>
                  </div>
                </button>
              ))}
              {(learnContents ?? []).length === 0 && (
                <p className="text-sub text-center py-12 col-span-full">아직 학습 콘텐츠가 없어요</p>
              )}
            </div>
          )
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowScrapModal(true)}
        aria-label="URL 스크랩 추가"
        className="fixed right-4 bottom-24 md:bottom-8 md:right-8 w-12 h-12 rounded-full bg-grade-yellow text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-30"
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
