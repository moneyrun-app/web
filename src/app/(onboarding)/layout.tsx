'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthInit } from '@/hooks/useAuthInit';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const { isInitialized, hasCompletedOnboarding } = useAuthInit();

  // 미로그인이면 랜딩으로
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  // 온보딩 이미 완료했으면 홈으로
  useEffect(() => {
    if (isInitialized && hasCompletedOnboarding) {
      router.replace('/pacemaker');
    }
  }, [isInitialized, hasCompletedOnboarding, router]);

  const isReady = isInitialized && !hasCompletedOnboarding;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 h-14 border-b border-border">
        <span className="text-lg font-bold text-foreground">머니런</span>
        <ThemeToggle />
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {isReady ? children : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
            <p className="text-sm text-sub">준비 중이에요...</p>
          </div>
        )}
      </main>
    </div>
  );
}
