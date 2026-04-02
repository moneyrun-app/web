'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import CategoryTabs, { type BookTab } from '@/components/book/CategoryTabs';
import ContentListItem from '@/components/book/ContentListItem';
import {
  mockDetailedReports,
  mockWeeklyReports,
  mockLearnContents,
  mockScraps,
} from '@/lib/mock/mockBook';

export default function BookPage() {
  const [tab, setTab] = useState<BookTab>('detailed');

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-2">
        <BookOpen size={24} />
        <h1 className="text-xl font-bold">마이북</h1>
      </div>

      <div className="px-5">
        <CategoryTabs active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-5">
        {tab === 'detailed' &&
          mockDetailedReports.items.map((item) => (
            <ContentListItem
              key={item.id}
              id={item.id}
              date={item.createdAt}
              title={item.title}
              summary={item.summary}
            />
          ))}

        {tab === 'weekly' &&
          mockWeeklyReports.map((item) => (
            <ContentListItem
              key={item.id}
              id={item.id}
              date={item.createdAt}
              title={`${item.weekStart} ~ ${item.weekEnd}`}
              summary={item.summary}
            />
          ))}

        {tab === 'scrap' &&
          mockScraps.map((item) => (
            <ContentListItem
              key={item.id}
              id={item.id}
              date={item.scrappedAt}
              title={item.title}
              summary={`${item.grade} 등급 콘텐츠`}
            />
          ))}

        {tab === 'learn' &&
          mockLearnContents.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => (window.location.href = `/book/${item.id}`)}
                className={`w-full text-left rounded-2xl p-5 ${
                  item.isRead ? 'bg-card' : 'bg-white border border-card-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${item.isRead ? 'text-sub' : ''}`}>{item.title}</p>
                  <span className="text-xs text-sub ml-2">{item.readMinutes}분</span>
                </div>
              </button>
            </div>
          ))}

        {tab === 'detailed' && mockDetailedReports.items.length === 0 && (
          <p className="text-sub text-center py-12">아직 리포트가 없어요</p>
        )}
      </div>
    </div>
  );
}
