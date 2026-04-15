'use client';

const STEP_LABELS = ['관심 분야', '진단 퀴즈', '데이터 입력', '마이북 생성', '시작하기'];

interface OnboardingProgressProps {
  currentStep: number; // 1~5
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full transition-colors ${
                isDone ? 'bg-accent' : isActive ? 'bg-accent' : 'bg-border'
              }`}
            />
            <span className={`text-3xs transition-colors ${
              isActive ? 'text-accent font-semibold' : isDone ? 'text-sub' : 'text-placeholder'
            }`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
