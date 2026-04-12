'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useMoneyBooks } from '@/hooks/useApi';
import { getCategoryLabel } from '@/lib/category';
import BookCover from '@/components/book/BookCover';

const CATEGORIES = [
  { key: '', label: '전체' },
  { key: 'tax', label: '세금' },
  { key: 'retirement', label: '퇴직연금' },
  { key: 'real_estate', label: '부동산' },
  { key: 'stock', label: '주식' },
  { key: 'insurance', label: '보험' },
  { key: 'saving', label: '저축' },
];

export default function MoneyBookPage() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const { data, isLoading, error } = useMoneyBooks(category || undefined);

  const books = data?.items ?? [];
  // 3개씩 한 줄(선반)로 묶기
  const shelves: typeof books[] = [];
  for (let i = 0; i < books.length; i += 3) {
    shelves.push(books.slice(i, i + 3));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={22} className="text-foreground" />
        <h1 className="text-xl md:text-2xl font-bold">머니북</h1>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat.key
                ? 'bg-foreground text-background'
                : 'bg-surface text-sub hover:bg-surface/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 책장 */}
      {error ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-disabled mx-auto mb-3" />
          <p className="text-sub mb-1">책 목록을 불러올 수 ��어요</p>
          <p className="text-xs text-placeholder">{(error as Error).message}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((row) => (
            <div key={row}>
              <div className="grid grid-cols-3 gap-3 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-surface rounded-sm animate-pulse" />
                ))}
              </div>
              <div className="h-[3px] bg-foreground/20 rounded-sm mt-2" />
            </div>
          ))}
        </div>
      ) : shelves.length > 0 ? (
        <div className="relative">
          {shelves.map((shelf, idx) => (
            <div key={idx}>
              {/* 책 한 줄 */}
              <div className="grid grid-cols-3 gap-3 px-3 pt-3 pb-2">
                {[0, 1, 2].map((col) => {
                  const book = shelf[col];
                  const showLine = col < 2 && shelf[col + 1];
                  return (
                    <div key={col} className="relative">
                      {book ? (
                        <BookCover
                          title={book.title}
                          category={book.category}
                          coverImageUrl={book.coverImageUrl}
                          description={book.description}
                          chapterCount={book.chapterCount}
                          isPurchased={book.isPurchased}
                          onClick={() => router.push(`/money-book/${book.id}`)}
                        />
                      ) : null}
                      {showLine && (
                        <div className="absolute right-[-7px] bottom-[4px] h-[35%] w-px bg-foreground z-10" />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* 선반 (가로줄) */}
              <div className="h-[3px] bg-foreground" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-disabled mx-auto mb-3" />
          <p className="text-sub">아직 등록된 책이 없어요</p>
        </div>
      )}
    </div>
  );
}
