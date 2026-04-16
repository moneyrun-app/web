'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useCompleteOnboarding } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';
import type { OnboardingCompleteResponse } from '@/types/course';

export default function WelcomePage() {
  const router = useRouter();
  const completeOnboarding = useCompleteOnboarding();
  const calledRef = useRef(false);
  const [data, setData] = useState<OnboardingCompleteResponse | null>(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    completeOnboarding.mutateAsync().then((res) => {
      setData(res);
      // 스토어 업데이트
      useUserStore.getState().setUser({
        hasCompletedOnboarding: true,
        onboardingVersion: 4,
      });
      useOnboardingStore.getState().clear();
    }).catch(() => {
      // 이미 완료된 경우도 있음 → 홈으로
      router.replace('/pacemaker');
    });
  }, [completeOnboarding, router]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-grade-green/10 flex items-center justify-center mb-6">
        <Sparkles className="text-grade-green" size={32} />
      </div>

      <p className="text-body-lg text-foreground leading-relaxed mb-2 whitespace-pre-line">
        {data.welcomeMessage}
      </p>

      <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-5 py-2 mt-4 mb-8">
        <span className="text-sm font-semibold text-foreground">{data.courseTitle}</span>
      </div>

      <button
        onClick={() => router.push('/pacemaker')}
        className="w-full max-w-xs h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 active:scale-[0.98] transition-all"
      >
        홈으로 가기
      </button>
    </motion.div>
  );
}
