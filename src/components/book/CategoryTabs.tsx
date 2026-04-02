'use client';

const tabs = [
  { key: 'detailed', label: '상세리포트' },
  { key: 'weekly', label: '주간' },
  { key: 'scrap', label: '스크랩' },
  { key: 'learn', label: '학습' },
] as const;

export type BookTab = (typeof tabs)[number]['key'];

interface Props {
  active: BookTab;
  onChange: (tab: BookTab) => void;
}

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex border-b border-card-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            active === tab.key
              ? 'text-foreground border-b-2 border-foreground'
              : 'text-sub'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
