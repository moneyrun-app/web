'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100vh - 56px)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-display md:text-5xl font-bold leading-tight mb-3 text-foreground">
        <span className="md:hidden">65세에<br />거지 되지 마세요</span>
        <span className="hidden md:inline">65세에 거지 되지 마세요</span>
      </h1>
      <p className="text-sub text-body-lg mb-10">30초면 내 미래를 확인할 수 있어요</p>
      <button
        onClick={() => router.push('/onboarding')}
        className="inline-flex items-center gap-2 h-14 px-10 bg-foreground text-background text-base font-bold rounded-2xl hover:bg-foreground/90 active:scale-[0.97] transition-all"
      >
        무료로 시작하기
        <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}
