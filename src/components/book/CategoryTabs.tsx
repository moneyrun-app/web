'use client';

const tabs = [
  { key: 'detailed', label: 'AI리포트' },
  { key: 'weekly', label: '주간' },
  { key: 'wrong', label: '오답노트' },
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
    <div role="tablist" className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 px-1 text-sm font-medium transition-colors text-center ${
            active === tab.key
              ? 'text-accent-dark border-b-2 border-accent'
              : 'text-sub hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
