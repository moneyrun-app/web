'use client';

import { useState, memo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  message: string;
}

function TodayMessage({ message }: Props) {
  const [refreshCount, setRefreshCount] = useState(0);
  const maxRefresh = 2;

  const handleRefresh = () => {
    if (refreshCount < maxRefresh) {
      setRefreshCount((c) => c + 1);
    }
  };

  return (
    <div className="bg-accent-light rounded-2xl p-5 md:p-7">
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--grade-dark)' }}>오늘의 한마디</p>
      <p className="text-base leading-relaxed text-foreground mb-4">{message}</p>
      <button
        onClick={handleRefresh}
        disabled={refreshCount >= maxRefresh}
        aria-label="메시지 새로고침"
        className="inline-flex items-center gap-1.5 text-sm text-sub hover:text-foreground disabled:text-disabled disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 rounded"
      >
        <RefreshCw size={14} />
        새로고침 ({maxRefresh - refreshCount}회 남음)
      </button>
    </div>
  );
}

export default memo(TodayMessage);
