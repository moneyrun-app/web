'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import { mockUser, mockFinanceProfile } from '@/lib/mock/mockUser';

export default function LandingPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setProfile = useFinanceStore((s) => s.setProfile);

  const handleLogin = () => {
    setUser({
      id: mockUser.id,
      nickname: mockUser.nickname,
      email: mockUser.email,
      hasCompletedOnboarding: false,
      isLoggedIn: true,
    });
    router.push('/onboarding');
  };

  const handleLoginExisting = () => {
    setUser({
      id: mockUser.id,
      nickname: mockUser.nickname,
      email: mockUser.email,
      hasCompletedOnboarding: true,
      isLoggedIn: true,
    });
    setProfile(mockFinanceProfile);
    router.push('/home');
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6">
      <h1 className="text-4xl font-bold mb-4">머니런</h1>
      <p className="text-sub text-center mb-10 leading-relaxed">
        AI가 매일 잔소리해주는
        <br />
        돈 관리 코치
      </p>

      <button
        onClick={handleLogin}
        className="w-full py-4 rounded-xl bg-kakao text-foreground font-semibold text-lg hover:brightness-95 transition"
      >
        카카오로 시작하기
      </button>

      <button
        onClick={handleLoginExisting}
        className="w-full mt-3 py-3 rounded-xl border border-card-border text-sub text-sm hover:bg-card transition"
      >
        (개발용) 기존 유저로 로그인
      </button>
    </main>
  );
}
