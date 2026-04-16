'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGenerationStatus } from '@/hooks/useApi';
import { useUserStore } from '@/store/userStore';

function getLoadingMessage(percent: number, nickname: string): string {
  if (percent <= 10) return `${nickname}님의 데이터를 분석하고 있습니다`;
  if (percent <= 50) return `${nickname}님만을 위한 마이북을 쓰고 있습니다`;
  if (percent <= 90) return `실습 미션을 준비하고 있습니다`;
  return `마무리 중입니다`;
}

export default function GeneratingPage() {
  const router = useRouter();
  const nickname = useUserStore((s) => s.nickname);
  const { data } = useGenerationStatus(true);
  const completedRef = useRef(false);

  // 시간 기반 fallback progress
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const serverPercent = data?.progress?.percent ?? 0;
  const fallbackPercent = Math.min(95, Math.floor((elapsed / 60) * 95));
  const percent = serverPercent > 0 ? serverPercent : fallbackPercent;
  const statusText = data?.progress?.step || getLoadingMessage(percent, nickname);

  useEffect(() => {
    if (!data || completedRef.current) return;

    if (data.status === 'completed') {
      completedRef.current = true;
      setTimeout(() => router.push('/course/welcome'), 500);
    }
    if (data.status === 'failed') {
      completedRef.current = true;
    }
  }, [data, router]);

  const isFailed = data?.status === 'failed';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* 로딩 아이콘 */}
        {!isFailed && (
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4"
                  className="text-foreground"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * percent / 100) }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                {percent}%
              </span>
            </div>
          </div>
        )}

        {isFailed ? (
          <>
            <p className="text-h2 font-bold text-foreground mb-2">생성에 실패했어요</p>
            <p className="text-body text-sub mb-6">다시 시도해 주세요</p>
            <button
              onClick={() => { completedRef.current = false; router.refresh(); }}
              className="w-full h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 active:scale-[0.98] transition-all"
            >
              다시 시도
            </button>
          </>
        ) : (
          <>
            <p className="text-body-lg font-semibold text-foreground mb-2">{statusText}</p>
            {data?.progress?.step && (
              <p className="text-sm text-sub">{data.progress.step}</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
