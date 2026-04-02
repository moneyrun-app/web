'use client';

import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PacemakerAction } from '@/types/book';

interface Props {
  action: PacemakerAction;
}

export default function ActionCard({ action }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/book/${action.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-card rounded-2xl p-5 flex items-start justify-between"
    >
      <div className="flex-1">
        <p className="font-semibold text-sm mb-1">{action.label}</p>
        <p className="text-sub text-sm leading-relaxed whitespace-pre-line">{action.title}</p>
      </div>
      <ChevronRight size={20} className="text-sub mt-1 flex-shrink-0" />
    </button>
  );
}
