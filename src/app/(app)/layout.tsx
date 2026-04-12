'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '@/components/common/BottomNav';
import SideNav from '@/components/common/SideNav';
import ThemeToggle from '@/components/common/ThemeToggle';
import GradeProvider from '@/components/common/GradeProvider';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useFinanceStore } from '@/store/financeStore';
import { useUserStore } from '@/store/userStore';
import { api } from '@/lib/api';

const API_URL = '/api/proxy';
const SIM_STORAGE_KEY = 'moneyrun_simulation';
const JWT_STORAGE_KEY = 'moneyrun_jwt';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const grade = useFinanceStore((s) => s.grade);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const initDone = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // 미로그인이면 랜딩으로
  useEffect(() => {
    if (status === 'unauthenticated' && !isLoggedIn) {
      router.replace('/');
    }
  }, [status, isLoggedIn, router]);

  // 로그인 후 초기화: 카카오 토큰 → 백엔드 JWT → 온보딩 데이터 이관
  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || initDone.current) return;
    initDone.current = true;

    const init = async () => {
      try {
        // 1. 이미 저장된 백엔드 JWT가 있으면 그걸 쓰기
        const savedJwt = sessionStorage.getItem(JWT_STORAGE_KEY);
        if (savedJwt) {
          api.setToken(savedJwt);
          syncUser(savedJwt);
          setIsInitialized(true);
          return;
        }

        // 2. 카카오 토큰 → 백엔드 JWT 교환
        const kakaoToken = session.accessToken;
        const authRes = await fetch(`${API_URL}/auth/kakao`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: kakaoToken }),
        });

        if (!authRes.ok) {
          setIsInitialized(true);
          return;
        }

        const { data } = await authRes.json();
        const backendJwt = data.accessToken;

        // JWT 저장
        api.setToken(backendJwt);
        sessionStorage.setItem(JWT_STORAGE_KEY, backendJwt);

        // 유저 정보 동기화
        useUserStore.getState().setUser({
          id: data.user.id,
          nickname: data.user.nickname,
          email: data.user.email ?? '',
          hasCompletedOnboarding: data.user.hasCompletedOnboarding,
          role: data.user.role ?? 'user',
          createdAt: data.user.createdAt ?? '',
          isLoggedIn: true,
        });

        // 3. 시뮬레이션 데이터 처리
        const simRaw = sessionStorage.getItem(SIM_STORAGE_KEY);

        console.log('[init] hasCompletedOnboarding:', data.user.hasCompletedOnboarding, 'simRaw:', !!simRaw);

        if (!data.user.hasCompletedOnboarding && simRaw) {
          // 신규 유저: 온보딩 (재무 프로필만 저장, ~1초)
          try {
            const input = JSON.parse(simRaw);
            console.log('[onboarding] simRaw parsed:', { nickname: input.nickname, age: input.age, keys: Object.keys(input) });
            const onboardRes = await api.post<{
              grade: 'RED' | 'YELLOW' | 'GREEN';
              monthlyExpense: number; surplus: number;
              investmentPeriod: number; vestingPeriod: number;
              availableBudget: { monthly: number; weekly: number; daily: number };
            }>('/auth/onboarding', {
              nickname: input.nickname || data.user.nickname || '',
              age: input.age || 0,
              retirementAge: input.retirementAge || 0,
              pensionStartAge: input.pensionStartAge || 65,
              monthlyIncome: input.monthlyIncome || 0,
              monthlyInvestment: input.monthlyInvestment || 0,
              monthlyFixedCost: input.monthlyFixedCost || 0,
              monthlyVariableCost: input.monthlyVariableCost || 0,
            });

            useFinanceStore.getState().setProfile({
              nickname: input.nickname || data.user.nickname || '',
              age: input.age || 0,
              retirementAge: input.retirementAge || 0,
              pensionStartAge: input.pensionStartAge || 65,
              monthlyIncome: input.monthlyIncome || 0,
              monthlyInvestment: input.monthlyInvestment || 0,
              monthlyFixedCost: input.monthlyFixedCost || 0,
              monthlyVariableCost: input.monthlyVariableCost || 0,
              monthlyExpense: onboardRes.monthlyExpense,
              surplus: onboardRes.surplus,
              investmentPeriod: onboardRes.investmentPeriod,
              vestingPeriod: onboardRes.vestingPeriod,
              grade: onboardRes.grade,
              availableBudget: onboardRes.availableBudget,
            });

            sessionStorage.removeItem(SIM_STORAGE_KEY);

            // 리포트 생성은 백그라운드 (즉시 응답, 마이북에서 폴링)
            api.post('/book/detailed-reports/generate').catch(() => {});
          } catch (e) {
            console.error('[onboarding] 실패:', e);
          }
        } else if (data.user.hasCompletedOnboarding) {
          // 기존 유저: DB 프로필 로드
          try {
            const profile = await api.get<{
              nickname: string; age: number; retirementAge: number; pensionStartAge: number;
              monthlyIncome: number; monthlyInvestment: number; monthlyFixedCost: number; monthlyVariableCost: number;
              monthlyExpense: number; surplus: number; investmentPeriod: number; vestingPeriod: number;
              grade: 'RED' | 'YELLOW' | 'GREEN';
              variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
              availableBudget: { monthly: number; weekly: number; daily: number };
            }>('/finance/profile');

            useFinanceStore.getState().setProfile(profile);

            // 시뮬레이션 데이터가 있고 기존 DB 값과 다르면 업데이트 제안
            if (simRaw) {
              const input = JSON.parse(simRaw);
              const isDifferent =
                profile.monthlyIncome !== (input.monthlyIncome || 0) ||
                profile.monthlyFixedCost !== (input.monthlyFixedCost || 0) ||
                profile.monthlyVariableCost !== (input.monthlyVariableCost || 0) ||
                profile.retirementAge !== (input.retirementAge || 0);

              sessionStorage.removeItem(SIM_STORAGE_KEY);

              if (isDifferent) {
                setShowUpdateDialog(true);
              }
            }
          } catch {
            // 프로필 로드 실패
          }
        }
      } catch {
        // 인증 초기화 실패 — 다음 접속 시 재시도
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [status, session?.accessToken]);

  const isReady = status !== 'loading' && (status !== 'authenticated' || isInitialized);

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

// 저장된 JWT로 유저 정보 복원
function syncUser(jwt: string) {
  api.setToken(jwt);
  api.get<{
    nickname: string; age: number; retirementAge: number; pensionStartAge: number;
    monthlyIncome: number; monthlyInvestment: number; monthlyFixedCost: number; monthlyVariableCost: number;
    monthlyExpense: number; surplus: number; investmentPeriod: number; vestingPeriod: number;
    grade: 'RED' | 'YELLOW' | 'GREEN';
    variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
    availableBudget: { monthly: number; weekly: number; daily: number };
  }>('/finance/profile').then((profile) => {
    useFinanceStore.getState().setProfile(profile);
  }).catch(() => {});

  api.get<{
    id: string; nickname: string; email: string; hasCompletedOnboarding: boolean; role?: string; createdAt?: string;
  }>('/users/me').then((user) => {
    useUserStore.getState().setUser({ ...user, role: (user.role as 'user' | 'admin') ?? 'user', createdAt: user.createdAt ?? '', isLoggedIn: true });
  }).catch(() => {});
}
