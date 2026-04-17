'use client';

import ThemeToggle from '@/components/common/ThemeToggle';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a href="#public-content" className="skip-nav">본문으로 건너뛰기</a>
      <header className="flex items-center justify-between px-4 md:px-10 h-14 md:h-16 border-b border-border">
        <span className="text-lg md:text-xl font-bold text-foreground">머니런</span>
        <ThemeToggle />
      </header>
      <div id="public-content">{children}</div>
    </div>
  );
}
