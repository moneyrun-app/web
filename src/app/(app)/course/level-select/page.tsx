'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { useOnboardingStatus, useSelectLevel, useCompleteOnboarding } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';

export default function LevelSelectPage() {
  const router = useRouter();
  const { data: status, isLoading } = useOnboardingStatus();
  const selectLevel = useSelectLevel();
  const completeOnboarding = useCompleteOnboarding();
  const store = useOnboardingStore();
  const nickname = useUserStore((s) => s.nickname);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!status) return;
    if (status.isComplete) { router.replace('/pacemaker'); return; }
    if (status.currentStep === 'quiz') { router.replace('/course/quiz'); return; }
    // generation/complete 단계면 바로 complete 처리 후 홈으로
    if (status.currentStep === 'generation' || status.currentStep === 'complete') {
      if (completingRef.current) return;
      completingRef.current = true;
      (async () => {
        try { await completeOnboarding.mutateAsync(); } catch { /* ignore */ }
        useUserStore.getState().setUser({ hasCompletedOnboarding: true, onboardingVersion: 4 });
        store.clear();
        router.replace('/pacemaker');
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleSelect = async (choice: 'beginner' | 'find-level') => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const result = await selectLevel.mutateAsync({ choice });
      store.setLevelChoice(choice);
      setResultMessage(result.message);

      if (choice === 'beginner') {
        if (result.assignedLevel) store.setLevel(result.assignedLevel, result.courseTitle ?? '');
        // 메시지 표시 후 바로 complete + 페이스메이커 (마이북 생성은 백그라운드)
        setTimeout(async () => {
          try { await completeOnboarding.mutateAsync(); } catch { /* ignore */ }
          useUserStore.getState().setUser({ hasCompletedOnboarding: true, onboardingVersion: 4 });
          store.clear();
          router.replace('/pacemaker');
        }, 2000);
      } else {
        // 퀴즈 페이지로
        setTimeout(() => router.push('/course/quiz'), 1500);
      }
    } catch {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  // 결과 메시지 표시 모드
  if (resultMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-grade-green/10 flex items-center justify-center mb-6">
          <BookOpen className="text-grade-green" size={28} />
        </div>
        <p className="text-body-lg text-foreground leading-relaxed whitespace-pre-line">{resultMessage}</p>
      </motion.div>
    );
  }

  const category = status?.selectedCategory ?? '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-h1 font-bold text-foreground leading-snug mb-2">
          {nickname}님만을 위한<br />
          {category}에 대한<br />
          코스 생성을 위해<br />
          한 가지 확인해주세요!
        </h1>

        <div className="mt-10 space-y-4">
          <button
            onClick={() => handleSelect('beginner')}
            disabled={submitting}
            className="w-full h-16 bg-surface border-2 border-border rounded-2xl flex items-center justify-center gap-3 text-lg font-bold text-foreground hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <BookOpen size={22} />
            기초부터 시작하기
          </button>
          <button
            onClick={() => handleSelect('find-level')}
            disabled={submitting}
            className="w-full h-16 bg-surface border-2 border-border rounded-2xl flex items-center justify-center gap-3 text-lg font-bold text-foreground hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Search size={22} />
            내 레벨 찾기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
