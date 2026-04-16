'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/common/BottomNav';
import SideNav from '@/components/common/SideNav';
import ThemeToggle from '@/components/common/ThemeToggle';
import GradeProvider from '@/components/common/GradeProvider';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useFinanceStore } from '@/store/financeStore';
import { useAuthInit } from '@/hooks/useAuthInit';

const ONBOARDING_ROUTES = ['/course/level-select', '/course/quiz', '/course/generating', '/course/welcome'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const grade = useFinanceStore((s) => s.grade);
  const { isInitialized, isAuthenticated, hasCompletedOnboarding, hasProfileDiff } = useAuthInit();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const isOnboardingRoute = ONBOARDING_ROUTES.some((r) => pathname.startsWith(r));

  // 미로그인이면 랜딩으로
  useEffect(() => {
    if (status === 'unauthenticated' && !isAuthenticated) {
      router.replace('/');
    }
  }, [status, isAuthenticated, router]);

  // 온보딩 미완료 → 코스 레벨 선택으로 리다이렉트 (온보딩 관련 경로 제외)
  useEffect(() => {
    if (isInitialized && !hasCompletedOnboarding && isAuthenticated && !isOnboardingRoute) {
      router.replace('/course/level-select');
    }
  }, [isInitialized, hasCompletedOnboarding, isAuthenticated, isOnboardingRoute, router]);

  // 시뮬레이션 데이터가 기존 프로필과 다르면 업데이트 제안
  useEffect(() => {
    if (hasProfileDiff) {
      setShowUpdateDialog(true);
    }
  }, [hasProfileDiff]);

  const isReady = isInitialized && (hasCompletedOnboarding || isOnboardingRoute);

  // 코스 온보딩 라우트: 네비 없이 미니멀 레이아웃
  if (isOnboardingRoute) {
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

  return (
    <GradeProvider grade={grade}>
      <a href="#main-content" className="skip-nav">본문으로 건너뛰기</a>
      <SideNav />
      {/* 모바일 헤더 */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-12 bg-background/90 backdrop-blur-sm border-b border-border">
        <span className="text-base font-bold text-foreground">머니런</span>
        <ThemeToggle />
      </header>
      <main className="md:pl-60">
        <div id="main-content" className="max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-20 md:pb-8">
          {isReady ? children : (
            <div className="space-y-4 animate-pulse" role="status" aria-label="페이지 로딩 중">
              <div className="h-8 w-32 bg-surface rounded-full" />
              <div className="h-24 bg-surface rounded-2xl" />
              <div className="h-64 bg-surface rounded-2xl" />
              <div className="h-4 w-2/3 bg-surface rounded-lg" />
            </div>
          )}
        </div>
      </main>
      <BottomNav />
      <ConfirmDialog
        open={showUpdateDialog}
        title="재무 정보가 달라졌어요"
        description="방금 입력한 내용이 기존에 저장된 정보와 달라요. 마이페이지에서 확인하고 업데이트하시겠어요?"
        confirmText="업데이트하러 가기"
        cancelText="괜찮아요"
        onConfirm={() => {
          setShowUpdateDialog(false);
          router.push('/my-page');
        }}
        onCancel={() => setShowUpdateDialog(false)}
      />
    </GradeProvider>
  );
}
