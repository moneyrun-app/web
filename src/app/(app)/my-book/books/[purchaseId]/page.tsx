'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Bookmark, X } from 'lucide-react';
import { useBookReader, useAddHighlight, useDeleteHighlight } from '@/hooks/useApi';
import Markdown from '@/components/common/Markdown';
import type { HighlightColor } from '@/types/my-book';

const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: '#FFE566', label: '노랑' },
  { color: 'green', bg: '#8BE8A0', label: '초록' },
  { color: 'blue', bg: '#85C4F0', label: '파랑' },
  { color: 'pink', bg: '#F0A0BE', label: '분홍' },
  { color: 'orange', bg: '#F0C080', label: '주황' },
];

export default function BookReaderPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const router = useRouter();
  const { data: book, isLoading } = useBookReader(purchaseId);
  const addHighlight = useAddHighlight();
  const deleteHighlight = useDeleteHighlight();
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedSentence, setSelectedSentence] = useState<{ text: string; rect: DOMRect } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalChapters = book?.chapters.length ?? 0;

  const goTo = useCallback((dir: 'prev' | 'next') => {
    setActiveChapter((cur) => {
      if (dir === 'prev') return cur > 0 ? cur - 1 : cur;
      return cur < totalChapters - 1 ? cur + 1 : cur;
    });
  }, [totalChapters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo('prev');
      if (e.key === 'ArrowRight') goTo('next');
      if (e.key === 'Escape') setSelectedSentence(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goTo]);

  // 챕터 바뀌면 선택 초기화
  useEffect(() => {
    setSelectedSentence(null);
  }, [activeChapter]);

  // 콘텐츠 클릭 → 문장 선택
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-highlight-popup]')) return;
    const target = e.target as HTMLElement;
    const block = target.closest('p, li, blockquote, h1, h2, h3, h4, h5, h6');
    if (!block || !contentRef.current?.contains(block)) return;
    const text = block.textContent?.trim();
    if (!text || text.length < 2) return;
    if (selectedSentence?.text === text) {
      setSelectedSentence(null);
      return;
    }
    const rect = block.getBoundingClientRect();
    setSelectedSentence({ text, rect });
  }, [selectedSentence]);

  const chapter = book?.chapters[activeChapter] ?? null;
  const highlights = chapter?.highlights ?? [];
  const highlightMap = new Map(highlights.map((hl) => [hl.sentenceText, hl]));

  // 렌더링 후 DOM에서 하이라이트 적용
  const applyHighlights = useCallback(() => {
    if (!contentRef.current || !chapter) return;
    const blocks = contentRef.current.querySelectorAll('p, li, blockquote, h1, h2, h3, h4, h5, h6');
    blocks.forEach((block) => {
      const text = block.textContent?.trim();
      if (!text) return;
      const hl = highlightMap.get(text);
      if (hl) {
        const colorBg = HIGHLIGHT_COLORS.find((c) => c.color === hl.color)?.bg ?? '#FFE566';
        (block as HTMLElement).style.backgroundColor = colorBg;
        (block as HTMLElement).style.borderRadius = '4px';
        (block as HTMLElement).style.padding = '2px 4px';
        (block as HTMLElement).style.margin = '2px 0';
      } else {
        (block as HTMLElement).style.backgroundColor = '';
        (block as HTMLElement).style.borderRadius = '';
        (block as HTMLElement).style.padding = '';
        (block as HTMLElement).style.margin = '';
      }
    });
  }, [chapter, highlightMap]);

  useEffect(() => {
    const timer = setTimeout(applyHighlights, 50);
    return () => clearTimeout(timer);
  }, [applyHighlights, activeChapter]);

  // --- early returns (모든 hooks 아래) ---

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface rounded-lg" />
        <div className="h-10 bg-surface rounded-lg" />
        <div className="h-64 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-sub mb-4">책을 불러오지 못했어요</p>
        <button onClick={() => router.back()} className="h-10 px-6 text-sm font-medium rounded-xl border border-border hover:bg-surface transition-colors">
          돌아가기
        </button>
      </div>
    );
  }

  if (book.status === 'generating') {
    return (
      <div className="text-center py-20">
        <Loader2 size={32} className="mx-auto text-accent animate-spin mb-3" />
        <p className="text-sm font-semibold">AI가 맞춤 콘텐츠를 생성하고 있어요</p>
        <p className="text-xs text-sub mt-1">잠시만 기다려주세요...</p>
      </div>
    );
  }

  if (book.status === 'failed') {
    return (
      <div className="text-center py-20">
        <p className="text-sub mb-4">콘텐츠 생성에 실패했어요</p>
        <button onClick={() => router.push('/my-book')} className="h-10 px-6 text-sm font-medium rounded-xl border border-border hover:bg-surface transition-colors">
          마이북으로 돌아가기
        </button>
      </div>
    );
  }

  const handleHighlight = (text: string, color: HighlightColor) => {
    if (highlightMap.has(text) || addHighlight.isPending) return;
    addHighlight.mutate({
      purchaseId,
      chapterIndex: chapter!.chapterIndex ?? chapter!.index ?? activeChapter,
      sentenceText: text,
      color,
    });
    setSelectedSentence(null);
  };

  const handleDeleteHighlight = (highlightId: string) => {
    deleteHighlight.mutate(highlightId);
    setSelectedSentence(null);
  };

  // 팝업 위치 계산
  const getPopupPosition = () => {
    if (!selectedSentence || !contentRef.current) return { top: 0, left: 0 };
    const containerRect = contentRef.current.getBoundingClientRect();
    return {
      top: selectedSentence.rect.top - containerRect.top - 44,
      left: Math.min(
        Math.max(selectedSentence.rect.left + selectedSentence.rect.width / 2 - containerRect.left, 80),
        containerRect.width - 80,
      ),
    };
  };

  const existingHighlight = selectedSentence ? highlightMap.get(selectedSentence.text) : null;
  const popupPos = getPopupPosition();

  return (
    <div>
      <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 mb-2 rounded-lg hover:bg-surface transition-colors">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-lg font-bold mb-3">{book.bookTitle}</h1>

      {/* 챕터 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {book.chapters.map((ch, i) => {
          const chNum = ch.chapterIndex ?? ch.index ?? i;
          const hasHighlights = ch.highlights.length > 0;
          return (
            <button
              key={chNum}
              onClick={() => setActiveChapter(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                i === activeChapter
                  ? 'bg-foreground text-background'
                  : 'bg-surface text-sub'
              }`}
            >
              Ch.{chNum + 1}
              {hasHighlights && <Bookmark size={10} className="fill-current" />}
            </button>
          );
        })}
      </div>

      {/* 챕터 콘텐츠 */}
      {chapter && (
        <div>
          <h2 className="text-base font-semibold mb-3">{chapter.title}</h2>

          <div ref={contentRef} className="relative" onClick={handleContentClick}>
            {/* 콘텐츠 — 각 문장 클릭 가능 */}
            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 leading-relaxed [&_p]:cursor-pointer [&_p]:rounded-lg [&_p]:transition-colors [&_p:hover]:bg-surface/60 [&_p]:-mx-2 [&_p]:px-2 [&_p]:py-1 [&_li]:cursor-pointer [&_li]:rounded-lg [&_li]:transition-colors [&_li:hover]:bg-surface/60 [&_li]:px-1">
              {chapter && <Markdown>{chapter.content}</Markdown>}
            </div>

            {/* 선택한 문장 → 스크랩 툴바 */}
            {selectedSentence && (
              <div
                data-highlight-popup
                className="absolute z-50 animate-[fadeIn_150ms_ease-out]"
                style={{ top: popupPos.top, left: popupPos.left, transform: 'translateX(-50%)' }}
              >
                <div className="flex items-center gap-1.5 bg-foreground rounded-xl px-2.5 py-2 shadow-xl">
                  {existingHighlight ? (
                    <>
                      <span className="text-[10px] text-background/70 mr-0.5">스크랩됨</span>
                      <button
                        onClick={() => handleDeleteHighlight(existingHighlight.id)}
                        className="text-[10px] text-red-300 hover:text-red-200 px-1.5 py-0.5 rounded-md hover:bg-white/10"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <Bookmark size={12} className="text-background/70" />
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.color}
                          onClick={() => handleHighlight(selectedSentence.text, c.color)}
                          disabled={addHighlight.isPending}
                          className="w-6 h-6 rounded-full border-2 border-white/30 hover:scale-110 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                          style={{ backgroundColor: c.bg }}
                          title={c.label}
                        />
                      ))}
                    </>
                  )}
                  <div className="w-px h-4 bg-background/20 mx-0.5" />
                  <button
                    onClick={() => setSelectedSentence(null)}
                    className="text-background/40 hover:text-background p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
                {/* 말풍선 꼬리 */}
                <div className="flex justify-center">
                  <div className="w-2.5 h-2.5 bg-foreground rotate-45 -mt-[5px]" />
                </div>
              </div>
            )}
          </div>

          {/* 하이라이트 목록 */}
          {chapter.highlights.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-sub mb-2 flex items-center gap-1">
                <Bookmark size={12} /> 스크랩 {chapter.highlights.length}개
              </h3>
              <div className="space-y-2">
                {chapter.highlights.map((hl) => {
                  const colorBg = HIGHLIGHT_COLORS.find((c) => c.color === hl.color)?.bg ?? '#FFF3B0';
                  return (
                    <div key={hl.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-surface">
                      <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: colorBg }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground line-clamp-2">{hl.sentenceText}</p>
                        {hl.note && <p className="text-3xs text-sub mt-0.5">{hl.note}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteHighlight(hl.id)}
                        className="text-3xs text-placeholder hover:text-red-500 shrink-0"
                      >
                        삭제
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
