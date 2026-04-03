'use client';

import { memo } from 'react';
import { ChevronRight, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PacemakerAction } from '@/types/book';

interface Props {
  action: PacemakerAction;
}

function ActionCard({ action }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
      <button
        onClick={() => router.push(`/book/${action.id}`)}
        className="w-full text-left flex items-start justify-between mb-3"
      >
        <div className="flex-1">
          <p className="text-xs font-medium text-accent-dark mb-1">{action.label}</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{action.title}</p>
        </div>
        <ChevronRight size={18} className="text-sub mt-0.5 flex-shrink-0" />
      </button>
      <div className="flex gap-2">
        <button className="flex-1 h-11 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2">
          <Check size={14} />
          완료
        </button>
        <button className="flex-1 h-11 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2">
          <Clock size={14} />
          다음에
        </button>
      </div>
    </div>
  );
}

export default memo(ActionCard);
