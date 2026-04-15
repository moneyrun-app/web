'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useGenerateOnboardingStep4, useOnboardingStep4Status } from '@/hooks/useApi';
import { useUserStore } from '@/store/userStore';

const LOADING_MESSAGES = [
  { threshold: 0, text: '데이터를 분석하고 있습니다' },
  { threshold: 10, text: '만을 위한 마이북을 쓰고 있습니다' },
  { threshold: 30, text: '실습 미션을 준비하고 있습니다' },
  { threshold: 60, text: '거의 다 완성됐어요!' },
];

const TIMEOUT_SECONDS = 120;

interface StepBookGenerationProps {
  onComplete: () => void;
}

export default function StepBookGeneration({ onComplete }: StepBookGenerationProps) {
  const nickname = useUserStore((s) => s.nickname);
  const generateStep4 = useGenerateOnboardingStep4();
  const [polling, setPolling] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  const { data: statusData } = useOnboardingStep4Status(polling);

  // 생성 시작 (멱등)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    generateStep4.mutate(undefined, {
      onSuccess: () => setPolling(true),
      onError: () => setFailed(true),
    });
  }, []);

  // 경과 시간 카운터
  useEffect(() => {
    if (!polling) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= TIMEOUT_SECONDS) {
          setTimedOut(true);
          setPolling(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [polling]);

  // 상태 감지
  useEffect(() => {
    if (!statusData) return;

    if (statusData.status === 'completed') {
      setPolling(false);
      onComplete();
    }
    if (statusData.status === 'failed') {
      setPolling(false);
      setFailed(true);
    }
  }, [statusData, onComplete]);

  const handleRetry = () => {
    setFailed(false);
    setTimedOut(false);
    setElapsedSeconds(0);
    startedRef.current = false;
    generateStep4.mutate(undefined, {
      onSuccess: () => setPolling(true),
      onError: () => setFailed(true),
    });
  };

  // 현재 로딩 메시지
  const currentMessage = LOADING_MESSAGES.reduce((msg, m) =>
    elapsedSeconds >= m.threshold ? m : msg
  , LOADING_MESSAGES[0]);

  const progressPercent = Math.min((elapsedSeconds / 60) * 100, 95);

  // 실패/타임아웃
  if (failed || timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
          <RefreshCw size={24} className="text-sub" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {timedOut ? '시간이 좀 걸리고 있어요' : '생성에 실패했어요'}
          </h3>
          <p className="text-sm text-sub">다시 시도해주세요</p>
        </div>
        <button
          onClick={handleRetry}
          className="h-12 px-8 text-sm font-bold rounded-2xl bg-foreground text-background"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={40} className="text-accent" />
      </motion.div>

      <div className="text-center space-y-2">
        <motion.p
          key={currentMessage.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold text-foreground"
        >
          {nickname ? `${nickname}님` : ''}{currentMessage.text}
        </motion.p>
        <p className="text-xs text-sub">잠시만 기다려주세요</p>
      </div>

      {/* 진행률 바 */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-3xs text-placeholder text-center mt-1.5">{elapsedSeconds}초</p>
      </div>
    </div>
  );
}
