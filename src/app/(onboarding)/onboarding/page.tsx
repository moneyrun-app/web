'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingStatus } from '@/hooks/useApi';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import StepCategorySelect from '@/components/onboarding/StepCategorySelect';
import StepDiagnosticQuiz from '@/components/onboarding/StepDiagnosticQuiz';
import StepFinanceInput from '@/components/onboarding/StepFinanceInput';
import StepBookGeneration from '@/components/onboarding/StepBookGeneration';
import StepWelcome from '@/components/onboarding/StepWelcome';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: serverStatus, isLoading } = useOnboardingStatus();
  const store = useOnboardingStore();

  // 세션에서 로컬 상태 복원
  useEffect(() => {
    store.loadFromSession();
  }, []);

  // 서버 상태와 동기화 — 서버가 source of truth
  useEffect(() => {
    if (!serverStatus) return;

    if (serverStatus.isComplete) {
      router.replace('/pacemaker');
      return;
    }

    // 서버 currentStep이 로컬보다 앞서면 서버를 따름
    if (serverStatus.currentStep > store.currentStep) {
      store.setStep(serverStatus.currentStep);
    }

    // 서버에서 받은 카테고리 동기화
    if (serverStatus.step1.selectedCategory && !store.selectedCategory) {
      store.setCategory(serverStatus.step1.selectedCategory);
    }
  }, [serverStatus]);

  const currentStep = store.currentStep;

  const goToStep = (step: number) => {
    store.setStep(step);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-2 bg-surface rounded-full" />
        <div className="h-8 bg-surface rounded-xl w-2/3 mx-auto" />
        <div className="h-4 bg-surface rounded-lg w-1/2 mx-auto" />
        <div className="space-y-3 mt-8">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-surface rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <OnboardingProgress currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <StepCategorySelect
              onComplete={() => goToStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepDiagnosticQuiz
              onComplete={(result) => {
                store.setLevel(result.assignedLevel, result.courseTitle);
                goToStep(3);
              }}
            />
          )}

          {currentStep === 3 && (
            <StepFinanceInput
              onComplete={() => goToStep(4)}
            />
          )}

          {currentStep === 4 && (
            <StepBookGeneration
              onComplete={() => goToStep(5)}
            />
          )}

          {currentStep === 5 && (
            <StepWelcome />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
