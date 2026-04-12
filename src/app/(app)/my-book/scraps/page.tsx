'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, ExternalLink, Loader2, Plus, Link, X } from 'lucide-react';
import { useMyBookScraps, useDeleteScrap, useScrapQuiz, useGenerateFromScraps, useMyBookOverview, useCreateScrap } from '@/hooks/useApi';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { decodeHtml } from '@/lib/format';

type ScrapTab = 'all' | 'url' | 'quiz';

const CHANNEL_ICONS: Record<string, string> = {
  youtube: 'YT',
  threads: 'TH',
  instagram: 'IG',
  other: '',
};

export default function ScrapsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<ScrapTab>('all');
  const { data: overview } = useMyBookOverview();
  const { data, isLoading } = useMyBookScraps(tab === 'all' ? undefined : tab);
  const deleteScrap = useDeleteScrap();
  const toggleQuizScrap = useScrapQuiz();
  const createScrap = useCreateScrap();
  const generateFromScraps = useGenerateFromScraps();
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const scrapsInfo = overview?.scraps;
  const canGenerate = scrapsInfo?.canGenerateBook ?? false;
  const totalCount = scrapsInfo?.totalCount ?? 0;

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
        <Bookmark size={20} className="text-blue-500" />
        <h1 className="text-lg font-bold">스크랩 모아보기</h1>
      </div>

      {/* 스크랩 책 생성 영역 */}
      <div className="bg-surface rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">총 스크랩: {totalCount}개</p>
          {canGenerate && (
            <button
              onClick={() => setShowGenerateConfirm(true)}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-accent text-white"
            >
              나만의 스크랩 책 만들기
            </button>
          )}
        </div>
        {!canGenerate && totalCount > 0 && (
          <div>
            <div className="w-full bg-border rounded-full h-1.5 mb-1">
              <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (totalCount / 100) * 100)}%` }} />
            </div>
            <p className="text-3xs text-sub">{100 - totalCount}개 더 모으면 나만의 책을 만들 수 있어요</p>
          </div>
        )}
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-2 mb-4">
        {([['all', '전체'], ['url', 'URL 스크랩'], ['quiz', '퀴즈 스크랩']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === key ? 'bg-foreground text-background' : 'bg-surface text-sub'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {/* URL 스크랩 */}
          {(tab === 'all' || tab === 'url') && (data?.urlScraps ?? []).map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                {CHANNEL_ICONS[item.channel] && (
                  <span className="text-3xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                    {CHANNEL_ICONS[item.channel]}
                  </span>
                )}
                <span className="text-xs text-sub">{item.channel}</span>
                {item.creator && <span className="text-xs text-placeholder">&middot; {item.creator}</span>}
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{decodeHtml(item.title)}</p>
              <p className="text-xs text-sub line-clamp-2 leading-relaxed">{decodeHtml(item.aiSummary)}</p>
              {item.channel === 'youtube' && (
                <p className="text-3xs text-placeholder mt-1 italic">* 유튜브 자막 기반 AI 요약</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <ExternalLink size={12} />원문 보기
                </a>
                <button
                  onClick={() => deleteScrap.mutate(item.id)}
                  disabled={deleteScrap.isPending}
                  className="text-3xs text-placeholder hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {/* 퀴즈 스크랩 */}
          {(tab === 'all' || tab === 'quiz') && (data?.quizScraps ?? []).map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent">Lv.{item.difficultyLevel}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{item.question}</p>
              {item.note && <p className="text-xs text-sub italic mb-1">{item.note}</p>}
              <p className="text-xs text-sub">{item.briefExplanation}</p>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => toggleQuizScrap.mutate({ quizId: item.quizId })}
                  disabled={toggleQuizScrap.isPending}
                  className="text-3xs text-placeholder hover:text-red-500"
                >
                  스크랩 해제
                </button>
              </div>
            </div>
          ))}

          {(data?.urlScraps ?? []).length === 0 && (data?.quizScraps ?? []).length === 0 && (
            <p className="text-sub text-center py-12">아직 스크랩이 없어요</p>
          )}
        </div>
      )}

      {/* URL 스크랩 추가 모달 */}
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

      {/* 플로팅 스크랩 추가 버튼 */}
      {!showUrlInput && (
        <button
          onClick={() => setShowUrlInput(true)}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
          aria-label="URL 스크랩 추가"
        >
          <Plus size={24} />
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
