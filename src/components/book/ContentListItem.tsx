'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';

interface Props {
  id: string;
  date: string;
  title: string;
  summary: string;
  showDownload?: boolean;
}

function ContentListItem({ id, date, title, summary, showDownload }: Props) {
  const router = useRouter();

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm">
      <p className="text-xs text-sub mb-2">{formatDate(date)}</p>
      <button
        onClick={() => router.push(`/book/${id}`)}
        className="w-full text-left"
      >
        <p className="font-semibold text-sm mb-1 text-foreground">{title}</p>
        <p className="text-sub text-xs leading-relaxed">{summary}</p>
      </button>
      {showDownload !== false && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => router.push(`/book/${id}`)}
            className="flex-1 h-10 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2"
          >
            보기
          </button>
          <button className="flex-1 h-10 text-xs font-medium rounded-lg border border-border text-sub hover:bg-surface transition-colors flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2">
            <Download size={12} />
            다운로드
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(ContentListItem);
