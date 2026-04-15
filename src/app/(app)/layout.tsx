'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/common/BottomNav';
import SideNav from '@/components/common/SideNav';
import ThemeToggle from '@/components/common/ThemeToggle';
import GradeProvider from '@/components/common/GradeProvider';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useFinanceStore } from '@/store/financeStore';
import { useAuthInit } from '@/hooks/useAuthInit';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const grade = useFinanceStore((s) => s.grade);
  const { isInitialized, isAuthenticated, hasCompletedOnboarding, hasProfileDiff } = useAuthInit();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // 미로그인이면 랜딩으로
  useEffect(() => {
    if (status === 'unauthenticated' && !isAuthenticated) {
      router.replace('/');
    }
  }, [status, isAuthenticated, router]);

  // 온보딩 미완료 → v3 온보딩으로 리다이렉트
  useEffect(() => {
    if (isInitialized && !hasCompletedOnboarding && isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [isInitialized, hasCompletedOnboarding, isAuthenticated, router]);

  // 시뮬레이션 데이터가 기존 프로필과 다르면 업데이트 제안
  useEffect(() => {
    if (hasProfileDiff) {
      setShowUpdateDialog(true);
    }
  }, [hasProfileDiff]);

  const isReady = isInitialized && hasCompletedOnboarding;

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
            <div className="space-y-5" role="status" aria-label="페이지 로딩 중">
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
                <p className="text-sm text-sub">AI가 맞춤 분석 준비 중이에요...</p>
              </div>
              <div className="space-y-4 animate-pulse">
                <div className="h-28 bg-surface rounded-2xl" />
                <div className="h-40 bg-surface rounded-2xl" />
                <div className="h-32 bg-surface rounded-2xl" />
              </div>
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
