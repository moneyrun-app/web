'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Library, BookOpen, AlertCircle, Loader2, ChevronDown, ChevronUp, Bookmark, Link, HelpCircle, ExternalLink, Plus, X } from 'lucide-react';
import { useMyBookOverview, useDetailedReportStatus, useWrongNotes, useHighlights, useMyBookScraps, useDeleteHighlight, useDeleteScrap, useScrapQuiz, useCreateScrap, useActiveCourse, useCourseGenerateStatus } from '@/hooks/useApi';
import { decodeHtml } from '@/lib/format';
import { getCategoryLabel } from '@/lib/category';
import Markdown from '@/components/common/Markdown';
import BookCover from '@/components/book/BookCover';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FFE566', green: '#8BE8A0', blue: '#85C4F0', pink: '#F0A0BE', orange: '#F0C080',
};

const TABS = ['머니레터', '스크랩', '오답노트'] as const;
type Tab = (typeof TABS)[number];

export default function MyBookPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('머니레터');
  const { data, isLoading } = useMyBookOverview();
  const { data: activeCourse } = useActiveCourse();
  const generatingBook = data?.purchasedBooks?.find((b) => b.status === 'generating');
  const { data: genStatus } = useCourseGenerateStatus(generatingBook?.purchaseId ?? null);
  const { data: reportStatus } = useDetailedReportStatus();
  const { data: wrongNotesData, isLoading: wrongNotesLoading } = useWrongNotes(activeTab === '오답노트');
  const { data: highlightsData } = useHighlights();
  const { data: scrapsData } = useMyBookScraps();
  const deleteHighlightMut = useDeleteHighlight();
  const deleteScrapMut = useDeleteScrap();
  const toggleQuizScrap = useScrapQuiz();
  const createScrap = useCreateScrap();
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // 마이북 생성 완료 시 새로고침
  useEffect(() => {
    if (genStatus?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['my-book-overview'] });
      queryClient.invalidateQueries({ queryKey: ['active-course'] });
    }
  }, [genStatus?.status, queryClient]);

  const handleCreateScrap = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    createScrap.mutate(trimmed, {
      onSuccess: () => { setUrlInput(''); setShowUrlInput(false); },
    });
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
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

      {/* 마이북 생성 중 프로그레스 */}
      {generatingBook && (
        <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 size={16} className="text-accent animate-spin" />
            <span className="text-sm font-bold text-accent">{generatingBook.bookTitle}</span>
          </div>
          <motion.p
            key={genStatus?.progress?.step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-sub mb-2"
          >
            {genStatus?.progress?.step || '마이북을 생성하고 있습니다...'}
          </motion.p>
          <div className="h-1.5 bg-accent/20 rounded-full overflow-hidden mb-1">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${genStatus?.progress?.percent ?? 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {genStatus?.progress && (
            <p className="text-3xs text-placeholder">{genStatus.progress.chaptersDone}/{genStatus.progress.totalChapters} 챕터</p>
          )}
        </div>
      )}

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
              {data.purchasedBooks.map((book) => {
                const isCompletedCourse = book.source === 'course' && book.status === 'completed' && book.purchaseId !== activeCourse?.purchaseId;
                return (
                  <div key={book.purchaseId} className="relative">
                    <BookCover
                      title={book.bookTitle}
                      category={book.category}
                      coverImageUrl={book.coverImageUrl}
                      status={book.status}
                      onClick={book.status === 'completed' ? () => router.push(`/my-book/books/${book.purchaseId}`) : undefined}
                    />
                    {isCompletedCourse && (
                      <span className="absolute -top-1 -right-1 z-10 text-3xs font-bold px-1.5 py-0.5 rounded-full bg-accent text-white shadow">완료</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 스크랩 탭 */}
      {activeTab === '스크랩' && (() => {
        const highlights = highlightsData ?? [];
        const urlScraps = scrapsData?.urlScraps ?? [];
        const quizScraps = scrapsData?.quizScraps ?? [];
        const hlShowAll = expandedSections.has('highlight');
        const urlShowAll = expandedSections.has('url');
        const quizShowAll = expandedSections.has('quiz');

        return (
          <div className="space-y-5">
            {/* 하이라이트 — 클릭 시 책으로 이동 */}
            <div>
              <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
                <Bookmark size={12} /> 하이라이트 <span className="text-placeholder">{highlights.length}</span>
              </h3>
              {highlights.length === 0 ? (
                <p className="text-xs text-placeholder py-4 text-center bg-surface rounded-xl">책에서 문장을 클릭해 스크랩해보세요</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {highlights.slice(0, hlShowAll ? undefined : 5).map((hl) => (
                      <button
                        key={hl.id}
                        onClick={() => router.push(`/my-book/books/${hl.purchaseId}`)}
                        className="w-full text-left flex items-start gap-2 p-2.5 rounded-xl bg-background border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: HIGHLIGHT_COLORS[hl.color] ?? '#FFE566' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground line-clamp-2">{hl.sentenceText}</p>
                          <p className="text-[10px] text-placeholder mt-0.5">{hl.bookTitle}</p>
                        </div>
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); deleteHighlightMut.mutate(hl.id); }}
                          className="text-[10px] text-placeholder hover:text-red-500 shrink-0"
                        >삭제</span>
                      </button>
                    ))}
                  </div>
                  {highlights.length > 5 && (
                    <button onClick={() => toggleSection('highlight')} className="w-full text-center text-xs text-sub mt-2 py-1.5 hover:text-foreground flex items-center justify-center gap-0.5">
                      {hlShowAll ? '접기' : `더보기 (${highlights.length - 5}개)`}
                      {hlShowAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* URL 스크랩 — 클릭 시 아코디언 펼침 */}
            <div>
              <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
                <Link size={12} /> URL 스크랩 <span className="text-placeholder">{urlScraps.length}</span>
              </h3>
              {urlScraps.length === 0 ? (
                <p className="text-xs text-placeholder py-4 text-center bg-surface rounded-xl">스크랩한 URL이 없어요</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {urlScraps.slice(0, urlShowAll ? undefined : 5).map((item) => {
                      const isOpen = expandedSections.has(`url-${item.id}`);
                      const displayText = item.aiSummary || item.bodyText;
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleSection(`url-${item.id}`)}
                          className="w-full text-left bg-background border border-border rounded-xl p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-placeholder">{item.channel}{item.creator ? ` · ${item.creator}` : ''}</span>
                          </div>
                          {item.ogImageUrl && isOpen && (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-2 bg-surface">
                              <img src={item.ogImageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="text-xs font-medium text-foreground">{decodeHtml(item.title)}</p>
                          {displayText && (
                            <p className={`text-[10px] text-sub mt-0.5 ${isOpen ? '' : 'line-clamp-1'}`}>{decodeHtml(displayText)}</p>
                          )}
                          {isOpen && (
                            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-accent font-medium hover:underline"
                              >
                                <ExternalLink size={10} />원문 보기
                              </a>
                              <span
                                role="button"
                                onClick={(e) => { e.stopPropagation(); deleteScrapMut.mutate(item.id); }}
                                className="text-[10px] text-placeholder hover:text-red-500"
                              >삭제</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {urlScraps.length > 5 && (
                    <button onClick={() => toggleSection('url')} className="w-full text-center text-xs text-sub mt-2 py-1.5 hover:text-foreground flex items-center justify-center gap-0.5">
                      {urlShowAll ? '접기' : `더보기 (${urlScraps.length - 5}개)`}
                      {urlShowAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 퀴즈 스크랩 — 클릭 시 아코디언 펼침 */}
            <div>
              <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
                <HelpCircle size={12} /> 퀴즈 스크랩 <span className="text-placeholder">{quizScraps.length}</span>
              </h3>
              {quizScraps.length === 0 ? (
                <p className="text-xs text-placeholder py-4 text-center bg-surface rounded-xl">퀴즈 풀고 스크랩 버튼을 눌러보세요</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {quizScraps.slice(0, quizShowAll ? undefined : 5).map((quiz) => {
                      const isOpen = expandedSections.has(`quiz-${quiz.id}`);
                      return (
                        <button
                          key={quiz.id}
                          onClick={() => toggleSection(`quiz-${quiz.id}`)}
                          className="w-full text-left bg-background border border-border rounded-xl p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {quiz.category && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface text-sub">{getCategoryLabel(quiz.category)}</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground">{quiz.question}</p>
                          <p className="text-[10px] text-sub mt-0.5 line-clamp-1">{quiz.briefExplanation}</p>
                          {isOpen && (
                            <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                              {quiz.choices?.map((choice: string, i: number) => (
                                <div key={i} className={`text-[11px] px-2 py-1 rounded-lg ${i === quiz.correctAnswer ? 'bg-grade-green-bg text-grade-green-text font-medium' : 'text-sub'}`}>
                                  {String.fromCharCode(65 + i)}. {choice}
                                </div>
                              ))}
                              {quiz.detailedExplanation && (
                                <p className="text-[10px] text-sub bg-surface rounded-lg p-2">{quiz.detailedExplanation}</p>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-end mt-1.5">
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); toggleQuizScrap.mutate({ quizId: quiz.quizId }); }}
                              className="text-[10px] text-placeholder hover:text-red-500"
                            >해제</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {quizScraps.length > 5 && (
                    <button onClick={() => toggleSection('quiz')} className="w-full text-center text-xs text-sub mt-2 py-1.5 hover:text-foreground flex items-center justify-center gap-0.5">
                      {quizShowAll ? '접기' : `더보기 (${quizScraps.length - 5}개)`}
                      {quizShowAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </>
              )}
            </div>
            {/* URL 스크랩 추가 플로팅 버튼 */}
            <button
              onClick={() => setShowUrlInput(true)}
              className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
              aria-label="URL 스크랩 추가"
            >
              <Plus size={20} />
            </button>

            {/* URL 입력 모달 */}
            {showUrlInput && (
              <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-5" onClick={() => setShowUrlInput(false)}>
                <div className="w-full max-w-lg bg-background rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">URL 스크랩 추가</h3>
                    <button onClick={() => setShowUrlInput(false)} className="p-1 rounded-lg hover:bg-surface"><X size={18} /></button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-surface focus-within:border-foreground transition-colors">
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
                      className="h-11 px-4 text-sm font-medium rounded-xl bg-foreground text-background disabled:opacity-40 shrink-0"
                    >
                      {createScrap.isPending ? <Loader2 size={16} className="animate-spin" /> : '추가'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 오답노트 탭 */}
      {activeTab === '오답노트' && (
        <div className="space-y-3">
          {wrongNotesLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
            </div>
          ) : (wrongNotesData ?? []).length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-2xl">
              <AlertCircle size={28} className="mx-auto text-sub mb-2" />
              <p className="text-sm text-sub">틀린 문제가 없어요!</p>
            </div>
          ) : (
            (wrongNotesData ?? []).map((note) => {
              const expanded = expandedNotes.has(note.id);
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
                      정답: {note.choices?.[note.correctAnswer - 1] ?? '—'}
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
                        onClick={() => setExpandedNotes((prev) => {
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
