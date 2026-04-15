'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useCompleteOnboardingStep5 } from '@/hooks/useApi';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function StepWelcome() {
  const router = useRouter();
  const completeStep5 = useCompleteOnboardingStep5();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    completeStep5.mutate(undefined, {
      onSuccess: (res) => {
        setWelcomeMessage(res.welcomeMessage);
        setCourseTitle(res.courseTitle);
        setCompleted(true);

        // 즉시 유저 상태 업데이트 — layout 가드가 다시 온보딩으로 보내지 않도록
        useUserStore.getState().setUser({
          hasCompletedOnboarding: true,
          onboardingVersion: 3,
        });

        // 온보딩 스토어 클리어
        useOnboardingStore.getState().clear();
      },
    });
  }, []);

  const handleGoHome = () => {
    router.push('/pacemaker');
  };

  if (!completed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
        <p className="text-sm text-sub">마무리하고 있어요...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className="flex flex-col items-center justify-center py-12 gap-6 text-center"
    >
      {/* 아이콘 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
      >
        <Sparkles size={32} className="text-accent" />
      </motion.div>

      {/* 메시지 */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">준비 완료!</h2>

        {courseTitle && (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-bold">
            {courseTitle}
          </div>
        )}

        {welcomeMessage && (
          <div className="bg-surface rounded-2xl p-5 mx-4">
            <p className="text-sm leading-relaxed text-foreground">{welcomeMessage}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <motion.button
        onClick={handleGoHome}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-xs h-14 bg-foreground text-background text-base font-bold rounded-2xl"
      >
        홈으로 가기
      </motion.button>
    </motion.div>
  );
}
