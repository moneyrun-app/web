'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // 로그인 버튼은 항상 온보딩으로 — 카카오 로그인은 온보딩 완료 후에만 가능
  const handleLogin = () => router.push('/onboarding');

  return (
    <div className="min-h-screen bg-background">
      <a href="#public-content" className="skip-nav">본문으로 건너뛰기</a>
      <header className="flex items-center justify-between px-4 md:px-10 h-14 md:h-16 border-b border-border">
        <span className="text-lg md:text-xl font-bold text-foreground">머니런</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogin}
            className="px-4 h-9 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-surface transition-colors"
          >
            로그인
          </button>
        </div>
      </header>
      <div id="public-content">{children}</div>
    </div>
  );
}
