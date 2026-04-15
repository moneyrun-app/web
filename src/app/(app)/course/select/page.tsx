'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Loader2, RefreshCw } from 'lucide-react';
import { useAvailableCourses, useStartCourse, useCourseGenerateStatus } from '@/hooks/useApi';

const CATEGORY_TABS = ['전체', '연금', '주식', '부동산', '세금/연말정산', '소비/저축'] as const;

const CATEGORY_MAP: Record<string, string> = {
  '전체': '',
  '연금': '연금',
  '주식': '주식',
  '부동산': '부동산',
  '세금/연말정산': '세금_연말정산',
  '소비/저축': '소비_저축',
};

export default function CourseSelectPage() {
  const router = useRouter();
  const { data, isLoading } = useAvailableCourses();
  const startCourse = useStartCourse();
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [startingId, setStartingId] = useState<string | null>(null);
  const [generatingPurchaseId, setGeneratingPurchaseId] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState('');

  const { data: genStatus } = useCourseGenerateStatus(generatingPurchaseId);

  // 생성 완료 감지
  useEffect(() => {
    if (!genStatus) return;
    if (genStatus.status === 'completed') {
      setGeneratingPurchaseId(null);
      router.push('/pacemaker');
    }
    if (genStatus.status === 'failed') {
      setGeneratingPurchaseId(null);
      setStartingId(null);
    }
  }, [genStatus, router]);

  const handleStart = (courseId: string, title: string) => {
    setStartingId(courseId);
    startCourse.mutate(courseId, {
      onSuccess: (result) => {
        setGeneratingPurchaseId(result.purchaseId);
        setGeneratingTitle(title);
      },
      onError: () => {
        setStartingId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface rounded-xl w-1/2" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-9 w-20 bg-surface rounded-full" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface rounded-2xl" />)}
      </div>
    );
  }

  // 생성 중 로딩 화면
  if (generatingPurchaseId) {
    const progress = genStatus?.progress;
    const percent = progress?.percent ?? 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={40} className="text-accent" />
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-foreground">{generatingTitle}</h2>
          <motion.p
            key={progress?.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-sub"
          >
            {progress?.step || '마이북을 생성하고 있습니다...'}
          </motion.p>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {progress && (
            <p className="text-3xs text-placeholder text-center mt-1.5">
              {progress.chaptersDone}/{progress.totalChapters} 챕터
            </p>
          )}
        </div>
      </div>
    );
  }

  const courses = data ?? [];
  const categoryFilter = CATEGORY_MAP[activeTab] ?? '';
  const filtered = categoryFilter
    ? courses.filter((c) => c.category === categoryFilter)
    : courses;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface text-sub"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">코스 선택</h1>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'bg-surface text-sub'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 코스 목록 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-2xl">
            <p className="text-sm text-sub">이 카테고리에 수강 가능한 코스가 없어요</p>
          </div>
        ) : (
          filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border border-border rounded-2xl p-4 bg-background"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xs font-medium px-1.5 py-0.5 rounded bg-surface text-sub">
                      {course.level}
                    </span>
                    {course.isCompleted && (
                      <span className="inline-flex items-center gap-0.5 text-3xs font-medium text-accent">
                        <Check size={10} /> 완료
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{course.title}</h3>
                  <p className="text-xs text-sub mt-1 line-clamp-2">{course.description}</p>
                  <p className="text-3xs text-placeholder mt-1.5">{course.chapterCount}개 챕터</p>
                </div>

                {!course.isCompleted && (
                  <button
                    onClick={() => handleStart(course.id, course.title)}
                    disabled={startingId !== null}
                    className="shrink-0 h-9 px-4 text-xs font-bold rounded-xl bg-foreground text-background disabled:opacity-40"
                  >
                    {startingId === course.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : '시작하기'}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
