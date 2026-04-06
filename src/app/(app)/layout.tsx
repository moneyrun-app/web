'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '@/components/common/BottomNav';
import SideNav from '@/components/common/SideNav';
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
          isLoggedIn: true,
        });

        // 3. 시뮬레이션 데이터 처리
        const simRaw = sessionStorage.getItem(SIM_STORAGE_KEY);

        if (!data.user.hasCompletedOnboarding && simRaw) {
          // 신규 유저: 시뮬레이션 데이터로 온보딩
          try {
            const input = JSON.parse(simRaw);
            const onboardRes = await api.post<{
              grade: 'RED' | 'YELLOW' | 'GREEN';
              monthlyExpense: number; surplus: number;
              investmentPeriod: number; vestingPeriod: number;
              variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
            }>('/auth/onboarding', {
              nickname: input.nickname || data.user.nickname || '',
              age: input.age || 0,
              retirementAge: input.retirementAge || 0,
              pensionStartAge: input.pensionStartAge || 65,
              monthlyIncome: input.monthlyIncome || 0,
              monthlyFixedCost: input.monthlyFixedCost || 0,
              monthlyVariableCost: input.monthlyVariableCost || 0,
            });

            useFinanceStore.getState().setProfile({
              nickname: input.nickname || data.user.nickname || '',
              age: input.age || 0,
              retirementAge: input.retirementAge || 0,
              pensionStartAge: input.pensionStartAge || 65,
              monthlyIncome: input.monthlyIncome || 0,
              monthlyFixedCost: input.monthlyFixedCost || 0,
              monthlyVariableCost: input.monthlyVariableCost || 0,
              monthlyExpense: onboardRes.monthlyExpense,
              surplus: onboardRes.surplus,
              investmentPeriod: onboardRes.investmentPeriod,
              vestingPeriod: onboardRes.vestingPeriod,
              grade: onboardRes.grade,
              variableCost: onboardRes.variableCost,
            });

            sessionStorage.removeItem(SIM_STORAGE_KEY);
          } catch {
            // 온보딩 실패 시 재시도 가능하도록 세션 유지
          }
        } else if (data.user.hasCompletedOnboarding) {
          // 기존 유저: DB 프로필 로드
          try {
            const profile = await api.get<{
              nickname: string; age: number; retirementAge: number; pensionStartAge: number;
              monthlyIncome: number; monthlyFixedCost: number; monthlyVariableCost: number;
              monthlyExpense: number; surplus: number; investmentPeriod: number; vestingPeriod: number;
              grade: 'RED' | 'YELLOW' | 'GREEN';
              variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
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

  if (status === 'loading' || (status === 'authenticated' && !isInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GradeProvider grade={grade}>
      <SideNav />
      <main className="md:pl-60">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-20 md:pb-8">
          {children}
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
          router.push('/my');
        }}
        onCancel={() => setShowUpdateDialog(false)}
      />
    </GradeProvider>
  );
}

// 저장된 JWT로 유저 정보 복원
function syncUser(jwt: string) {
  api.setToken(jwt);
  // 프로필 API로 정보 가져오기
  api.get<{
    nickname: string; age: number; retirementAge: number; pensionStartAge: number;
    monthlyIncome: number; monthlyFixedCost: number; monthlyVariableCost: number;
    monthlyExpense: number; surplus: number; investmentPeriod: number; vestingPeriod: number;
    grade: 'RED' | 'YELLOW' | 'GREEN';
    variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
  }>('/finance/profile').then((profile) => {
    useFinanceStore.getState().setProfile(profile);
  }).catch(() => {});

  api.get<{
    id: string; nickname: string; email: string; hasCompletedOnboarding: boolean; role?: string;
  }>('/users/me').then((user) => {
    useUserStore.getState().setUser({ ...user, role: (user.role as 'user' | 'admin') ?? 'user', isLoggedIn: true });
  }).catch(() => {});
}
