'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import { api } from '@/lib/api';

const API_URL = '/api/proxy';
const JWT_STORAGE_KEY = 'moneyrun_jwt';

interface AuthInitResult {
  isInitialized: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  onboardingVersion: number;
  /** 시뮬레이션 데이터가 있고 기존 DB 값과 다를 때 true */
  hasProfileDiff: boolean;
}

export function useAuthInit(): AuthInitResult {
  const { data: session, status } = useSession();
  const initDone = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasProfileDiff, setHasProfileDiff] = useState(false);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const onboardingVersion = useUserStore((s) => s.onboardingVersion);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || initDone.current) return;
    initDone.current = true;

    const init = async () => {
      try {
        // 1. 이미 저장된 백엔드 JWT가 있으면 그걸 쓰기
        const savedJwt = sessionStorage.getItem(JWT_STORAGE_KEY);
        if (savedJwt) {
          api.setToken(savedJwt);
          await syncUser(savedJwt);
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
          onboardingVersion: data.user.onboardingVersion ?? 2,
          role: data.user.role ?? 'user',
          createdAt: data.user.createdAt ?? '',
          isLoggedIn: true,
        });

        // 3. 온보딩 완료 유저만 재무 프로필 로드
        if (data.user.hasCompletedOnboarding) {
          await loadFinanceProfile();

          // 시뮬레이션 데이터 비교
          const SIM_STORAGE_KEY = 'moneyrun_simulation';
          const simRaw = sessionStorage.getItem(SIM_STORAGE_KEY);
          if (simRaw) {
            try {
              const input = JSON.parse(simRaw);
              const profile = useFinanceStore.getState();
              const isDifferent =
                profile.monthlyIncome !== (input.monthlyIncome || 0) ||
                profile.monthlyFixedCost !== (input.monthlyFixedCost || 0) ||
                profile.monthlyVariableCost !== (input.monthlyVariableCost || 0) ||
                profile.retirementAge !== (input.retirementAge || 0);

              sessionStorage.removeItem(SIM_STORAGE_KEY);

              if (isDifferent) {
                setHasProfileDiff(true);
              }
            } catch {
              sessionStorage.removeItem(SIM_STORAGE_KEY);
            }
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

  return {
    isInitialized: status !== 'loading' && (status !== 'authenticated' || isInitialized),
    isAuthenticated: status === 'authenticated' && isLoggedIn,
    hasCompletedOnboarding,
    onboardingVersion,
    hasProfileDiff,
  };
}

/** 저장된 JWT로 유저 정보 + 재무 프로필 복원 */
async function syncUser(jwt: string) {
  api.setToken(jwt);

  const [user, profile] = await Promise.allSettled([
    api.get<{
      id: string; nickname: string; email: string;
      hasCompletedOnboarding: boolean; role?: string; createdAt?: string;
      onboardingVersion?: number; activeCourseId?: string | null;
    }>('/users/me'),
    api.get<{
      nickname: string; age: number; retirementAge: number; pensionStartAge: number;
      monthlyIncome: number; monthlyInvestment: number; monthlyFixedCost: number; monthlyVariableCost: number;
      monthlyExpense: number; surplus: number; investmentPeriod: number; vestingPeriod: number;
      grade: 'RED' | 'YELLOW' | 'GREEN';
      variableCost: { monthly: number; weekly: number; daily: number; daysInMonth: number };
      availableBudget: { monthly: number; weekly: number; daily: number };
    }>('/finance/profile'),
  ]);

  if (user.status === 'fulfilled') {
    useUserStore.getState().setUser({
      ...user.value,
      role: (user.value.role as 'user' | 'admin') ?? 'user',
      onboardingVersion: user.value.onboardingVersion ?? 2,
      createdAt: user.value.createdAt ?? '',
      isLoggedIn: true,
    });
  }

  if (profile.status === 'fulfilled') {
    useFinanceStore.getState().setProfile(profile.value);
  }
}

async function loadFinanceProfile() {
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
  } catch {
    // 프로필 로드 실패
  }
}
