'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, ExternalLink, Loader2, Plus, Link, X, HelpCircle } from 'lucide-react';
import { useMyBookScraps, useDeleteScrap, useScrapQuiz, useGenerateFromScraps, useMyBookOverview, useCreateScrap, useDeleteHighlight } from '@/hooks/useApi';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { decodeHtml } from '@/lib/format';
import { getCategoryLabel } from '@/lib/category';

type ScrapTab = 'all' | 'url' | 'quiz' | 'highlight';

const TABS: { key: ScrapTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'url', label: 'URL 스크랩' },
  { key: 'quiz', label: '퀴즈 스크랩' },
  { key: 'highlight', label: '하이라이트' },
];

const CHANNEL_ICONS: Record<string, string> = {
  youtube: 'YT',
  threads: 'TH',
  instagram: 'IG',
  other: '',
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FFE566', green: '#8BE8A0', blue: '#85C4F0', pink: '#F0A0BE', orange: '#F0C080',
};

export default function ScrapsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<ScrapTab>('all');
  const { data: overview } = useMyBookOverview();
  const queryType = tab === 'all' ? undefined : tab;
  const { data, isLoading } = useMyBookScraps(queryType);
  const deleteScrap = useDeleteScrap();
  const toggleQuizScrap = useScrapQuiz();
  const deleteHighlight = useDeleteHighlight();
  const createScrap = useCreateScrap();
  const generateFromScraps = useGenerateFromScraps();
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canGenerate = overview?.canGenerateBook ?? false;
  const totalCount = data?.totalCount ?? (overview?.scrapCounts?.total ?? 0);

  const urlScraps = data?.urlScraps ?? [];
  const quizScraps = data?.quizScraps ?? [];
  const highlightScraps = data?.highlightScraps ?? [];

  const showUrl = tab === 'all' || tab === 'url';
  const showQuiz = tab === 'all' || tab === 'quiz';
  const showHighlight = tab === 'all' || tab === 'highlight';

  const isEmpty = (showUrl ? urlScraps.length : 0) + (showQuiz ? quizScraps.length : 0) + (showHighlight ? highlightScraps.length : 0) === 0;

  const handleGenerate = () => {
    generateFromScraps.mutate(undefined, {
      onSuccess: (res) => {
        setShowGenerateConfirm(false);
        router.push(`/my-book/books/${res.purchaseId}`);
      },
    });
  };

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

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Bookmark size={20} className="text-foreground" />
        <h1 className="text-lg font-bold">스크랩 모아보기</h1>
      </div>

      {/* 스크랩 책 생성 영역 */}
      <div className="bg-surface rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">총 스크랩: {totalCount}개</p>
          {canGenerate && (
            <button
              onClick={() => setShowGenerateConfirm(true)}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-foreground text-background"
            >
              나만의 스크랩 책 만들기
            </button>
          )}
        </div>
        {!canGenerate && (
          <div>
            <div className="w-full bg-border rounded-full h-1.5 mb-1">
              <div className="bg-foreground h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (totalCount / 100) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-sub">{100 - totalCount}개 더 모으면 나만의 책을 만들 수 있어요</p>
          </div>
        )}
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t.key ? 'bg-foreground text-background' : 'bg-surface text-sub'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
        </div>
      ) : isEmpty && !isLoading ? (
        <div className="text-center py-12">
          <Bookmark size={32} className="text-disabled mx-auto mb-2" />
          <p className="text-sub text-sm">아직 스크랩이 없어요</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* URL 스크랩 */}
          {showUrl && urlScraps.map((item) => {
            const isExpanded = expandedId === `url-${item.id}`;
            const displayText = item.aiSummary || item.bodyText;
            return (
              <button
                key={`url-${item.id}`}
                onClick={() => setExpandedId(isExpanded ? null : `url-${item.id}`)}
                className="w-full text-left bg-background border border-border rounded-xl p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Link size={12} className="text-sub" />
                  {CHANNEL_ICONS[item.channel] && (
                    <span className="text-[10px] font-bold text-white bg-red-500 px-1 py-0.5 rounded text-center leading-none">
                      {CHANNEL_ICONS[item.channel]}
                    </span>
                  )}
                  <span className="text-[10px] text-sub">{item.channel}</span>
                  {item.creator && <span className="text-[10px] text-placeholder">· {item.creator}</span>}
                </div>
                {item.ogImageUrl && isExpanded && (
                  <div className="w-full h-36 rounded-lg overflow-hidden mb-2 bg-surface">
                    <img src={item.ogImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm font-medium text-foreground mb-1">{decodeHtml(item.title)}</p>
                {displayText && (
                  <p className={`text-xs text-sub ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {decodeHtml(displayText)}
                  </p>
                )}

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-accent font-medium hover:underline"
                    >
                      <ExternalLink size={12} />원문 보기
                    </a>
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); deleteScrap.mutate(item.id); }}
                      className="text-[10px] text-placeholder hover:text-red-500"
                    >
                      삭제
                    </span>
                  </div>
                )}

                {!isExpanded && (
                  <div className="flex items-center justify-end mt-2">
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); deleteScrap.mutate(item.id); }}
                      className="text-[10px] text-placeholder hover:text-red-500"
                    >
                      삭제
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* 퀴즈 스크랩 */}
          {showQuiz && quizScraps.map((item) => {
            const isExpanded = expandedId === `quiz-${item.id}`;
            return (
              <button
                key={`quiz-${item.id}`}
                onClick={() => setExpandedId(isExpanded ? null : `quiz-${item.id}`)}
                className="w-full text-left bg-background border border-border rounded-xl p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <HelpCircle size={12} className="text-sub" />
                  {item.category && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface text-sub">{getCategoryLabel(item.category)}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{item.question}</p>
                <p className="text-xs text-sub line-clamp-2">{item.briefExplanation}</p>
                {item.note && <p className="text-[10px] text-placeholder mt-1 italic">메모: {item.note}</p>}

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="space-y-1">
                      {item.choices?.map((choice: string, i: number) => (
                        <div key={i} className={`text-xs px-2.5 py-1.5 rounded-lg ${i === item.correctAnswer ? 'bg-green-50 text-green-700 font-medium dark:bg-green-900/20 dark:text-green-400' : 'text-sub'}`}>
                          {String.fromCharCode(65 + i)}. {choice}
                        </div>
                      ))}
                    </div>
                    {item.detailedExplanation && (
                      <p className="text-xs text-sub bg-surface rounded-lg p-2.5">{item.detailedExplanation}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end mt-2">
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); toggleQuizScrap.mutate({ quizId: item.quizId }); }}
                    className="text-[10px] text-placeholder hover:text-red-500"
                  >
                    스크랩 해제
                  </span>
                </div>
              </button>
            );
          })}

          {/* 하이라이트 */}
          {showHighlight && highlightScraps.map((item) => (
            <button
              key={`hl-${item.id}`}
              onClick={() => router.push(`/my-book/books/${item.purchaseId}`)}
              className="w-full text-left bg-background border border-border rounded-xl p-3.5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: HIGHLIGHT_COLORS[item.color] ?? '#FFE566' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground line-clamp-2">{item.sentenceText}</p>
                  <p className="text-[10px] text-placeholder mt-1">{item.bookTitle} · Ch.{item.chapterIndex + 1}</p>
                  {item.note && <p className="text-[10px] text-placeholder italic mt-0.5">메모: {item.note}</p>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteHighlight.mutate(item.id); }}
                  className="text-[10px] text-placeholder hover:text-red-500 shrink-0"
                >
                  삭제
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* URL 스크랩 추가 모달 */}
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

      {/* 플로팅 추가 버튼 */}
      {!showUrlInput && (
        <button
          onClick={() => setShowUrlInput(true)}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
          aria-label="URL 스크랩 추가"
        >
          <Plus size={20} />
        </button>
      )}

      <ConfirmDialog
        open={showGenerateConfirm}
        title="나만의 책 만들기"
        description={`스크랩 ${totalCount}개를 바탕으로 나만의 책을 만드시겠습니까?`}
        confirmText="만들기"
        cancelText="취소"
        onConfirm={handleGenerate}
        onCancel={() => setShowGenerateConfirm(false)}
      />
    </div>
  );
}
