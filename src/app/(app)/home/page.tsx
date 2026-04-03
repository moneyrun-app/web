'use client';

import { useFinanceStore } from '@/store/financeStore';
import { usePacemakerToday, useRefreshPacemaker, useCompleteAction } from '@/hooks/useApi';
import { formatWonRaw } from '@/lib/format';
import GradeBadge from '@/components/common/GradeBadge';
import { RefreshCw, MessageCircle, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { variableCost, grade } = useFinanceStore();
  const { data: pm, isLoading, error } = usePacemakerToday();
  const refreshMutation = useRefreshPacemaker();
  const completeMutation = useCompleteAction();

  const statusConfig = {
    green: { dot: 'bg-grade-green', text: 'text-grade-green-text', bg: 'bg-grade-green-bg', label: '여유 있어요' },
    yellow: { dot: 'bg-grade-yellow', text: 'text-grade-yellow-text', bg: 'bg-grade-yellow-bg', label: '조금 조심' },
    red: { dot: 'bg-grade-red', text: 'text-grade-red-text', bg: 'bg-grade-red-bg', label: '위험해요' },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-surface rounded-2xl animate-pulse" />
          <div className="h-40 bg-surface rounded-2xl animate-pulse" />
        </div>
        <div className="h-32 bg-grade-yellow-bg rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !pm) {
    return (
      <div className="text-center py-20">
        <p className="text-sub mb-4">메시지를 불러오지 못했어요</p>
        <button onClick={() => window.location.reload()} className="h-10 px-6 text-sm font-medium rounded-xl border border-border hover:bg-surface transition-colors">
          다시 시도
        </button>
      </div>
    );
  }

  const sc = statusConfig[pm.spendingStatus.level];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GradeBadge grade={pm.grade} />
          <span className="text-caption text-sub">{pm.date}</span>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traffic Light */}
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3.5">지출 신호등</h3>
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <div>
              <p className="text-xs text-sub mb-1">오늘 잔여</p>
              <p className="text-xl md:text-2xl font-bold">{formatWonRaw(pm.spendingStatus.todayRemaining)}</p>
            </div>
            <div>
              <p className="text-xs text-sub mb-1">이번주 잔여</p>
              <p className="text-xl md:text-2xl font-bold">{formatWonRaw(pm.spendingStatus.weeklyRemaining)}</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg}`}>
            <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
            <span className={`text-xs font-medium ${sc.text}`}>{sc.label}</span>
          </div>
        </div>

        {/* Investment Tier */}
        <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3.5">투자 체급</h3>
          <div className="space-y-3">
            {[
              { label: '하루', amount: variableCost.daily },
              { label: '주간', amount: variableCost.weekly },
              { label: '월간', amount: variableCost.monthly },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-baseline">
                <span className="text-xs text-sub">{item.label}</span>
                <span className="text-lg md:text-xl font-bold">{formatWonRaw(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today Message */}
      <div className="bg-grade-yellow-bg rounded-2xl p-5 md:p-7 space-y-3">
        <p className="text-caption font-semibold text-grade-yellow-text">오늘의 한마디</p>
        <p className="text-body-lg md:text-base text-foreground leading-relaxed">{pm.message}</p>
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={!pm.canRefresh || refreshMutation.isPending}
          aria-label="메시지 새로고침"
          className="inline-flex items-center gap-1 text-xs text-sub hover:text-foreground disabled:text-disabled disabled:cursor-not-allowed transition-colors"
        >
          {refreshMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          <span>{pm.canRefresh ? '새로고침' : '새로고침 소진'}</span>
        </button>
      </div>

      {/* Actions */}
      {pm.actions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">추천 행동</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pm.actions.map((action) => (
              <div key={action.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-foreground mb-3">{action.title}</p>
                <div className="flex gap-2">
                  {action.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => completeMutation.mutate(action.id)}
                        disabled={completeMutation.isPending}
                        className="h-11 px-3 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity"
                      >
                        {action.label}
                      </button>
                      <button className="h-11 px-3 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors">
                        다음에
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-grade-green font-medium">완료!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-2xs text-placeholder">{pm.disclaimer}</p>
        <button aria-label="피드백 보내기" className="inline-flex items-center gap-1 text-2xs text-sub hover:text-foreground transition-colors">
          <MessageCircle size={12} />
          피드백
        </button>
      </div>
    </div>
  );
}
