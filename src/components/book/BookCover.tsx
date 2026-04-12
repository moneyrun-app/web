'use client';

import { Check } from 'lucide-react';
import { getCategoryLabel } from '@/lib/category';

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; icon: string }> = {
  tax: { bg: 'from-blue-600 to-blue-800', accent: 'bg-blue-400/30', icon: '税' },
  pension: { bg: 'from-emerald-600 to-emerald-800', accent: 'bg-emerald-400/30', icon: '年' },
  retirement: { bg: 'from-emerald-600 to-emerald-800', accent: 'bg-emerald-400/30', icon: '年' },
  realestate: { bg: 'from-amber-600 to-amber-800', accent: 'bg-amber-400/30', icon: '宅' },
  real_estate: { bg: 'from-amber-600 to-amber-800', accent: 'bg-amber-400/30', icon: '宅' },
  stock: { bg: 'from-red-600 to-red-800', accent: 'bg-red-400/30', icon: '株' },
  insurance: { bg: 'from-purple-600 to-purple-800', accent: 'bg-purple-400/30', icon: '保' },
  savings: { bg: 'from-teal-600 to-teal-800', accent: 'bg-teal-400/30', icon: '貯' },
  saving: { bg: 'from-teal-600 to-teal-800', accent: 'bg-teal-400/30', icon: '貯' },
};

const DEFAULT_COLOR = { bg: 'from-gray-600 to-gray-800', accent: 'bg-gray-400/30', icon: '本' };

export function getCategoryStyle(category: string) {
  const key = category.toLowerCase().replace(/[\s-]/g, '_');
  return CATEGORY_COLORS[key] ?? DEFAULT_COLOR;
}

interface BookCoverProps {
  title: string;
  category: string;
  coverImageUrl?: string | null;
  description?: string;
  chapterCount?: number;
  isPurchased?: boolean;
  status?: 'generating' | 'completed' | 'failed';
  showLabel?: boolean;
  onClick?: () => void;
}

export default function BookCover({
  title, category, coverImageUrl, description,
  chapterCount, isPurchased, status,
  showLabel = true, onClick,
}: BookCoverProps) {
  const style = getCategoryStyle(category);
  const isGenerating = status === 'generating';
  const isFailed = status === 'failed';

  return (
    <button onClick={onClick} disabled={!onClick} className="group w-full text-left">
      <div className={`relative aspect-[3/4] rounded-sm overflow-hidden shadow-[4px_4px_12px_rgba(0,0,0,0.3)] group-hover:shadow-[6px_6px_18px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:-translate-y-1 ${isGenerating ? 'opacity-60' : ''}`}>
        {coverImageUrl ? (
          <>
            <img src={coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-lg">{title}</p>
              {chapterCount != null && <p className="text-white/70 text-[10px] mt-1">{chapterCount}챕터</p>}
            </div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${style.bg}`}>
            <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-black/20" />
            <div className={`absolute top-4 left-3 right-3 h-[1px] ${style.accent}`} />
            <div className={`absolute top-6 left-3 right-3 h-[1px] ${style.accent}`} />
            <div className="absolute top-8 left-0 right-0 flex justify-center">
              <span className="text-white/15 text-4xl font-serif">{style.icon}</span>
            </div>
            <div className="absolute inset-x-3 top-1/3 flex flex-col">
              <p className="text-white text-[11px] font-bold leading-snug line-clamp-3">{title}</p>
              <div className={`h-[1px] ${style.accent} mt-2`} />
              {description && <p className="text-white/60 text-[9px] mt-1.5 line-clamp-2">{description}</p>}
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {chapterCount != null && <span className="text-white/50 text-[9px]">{chapterCount}챕터</span>}
              <span className="text-white/40 text-[8px] tracking-wider ml-auto">MONEYRUN</span>
            </div>
            <div className={`absolute bottom-8 left-3 right-3 h-[1px] ${style.accent}`} />
          </div>
        )}
        {isPurchased && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
        )}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {isFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-[10px] font-medium">생성 실패</span>
          </div>
        )}
        <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      </div>
      {showLabel && <p className="text-[10px] text-sub mt-2 text-center truncate">{getCategoryLabel(category)}</p>}
    </button>
  );
}
