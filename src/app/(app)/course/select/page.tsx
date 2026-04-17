'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useAvailableCourses, useStartCourse, useCourseGenerateStatus } from '@/hooks/useApi';

const CATEGORIES = ['예적금', '연금', '주식', '부동산', '세금', '소비'] as const;
const LEVEL_ORDER = ['기초', '심화', '마스터'] as const;

const LEVEL_STYLE: Record<string, string> = {
  '기초': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  '심화': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  '마스터': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const CATEGORY_EMOJI: Record<string, string> = {
  '예적금': '🏦',
  '연금': '👵',
  '주식': '📈',
  '부동산': '🏠',
  '세금': '🧾',
  '소비': '🛍️',
};

export default function CourseSelectPage() {
  const router = useRouter();
  const { data, isLoading } = useAvailableCourses();
  const startCourse = useStartCourse();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [generatingPurchaseId, setGeneratingPurchaseId] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const { data: genStatus } = useCourseGenerateStatus(generatingPurchaseId);

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

  const courses = data ?? [];

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => {
      const inCategory = courses.filter((c) => c.category === category);
      const byLevel = LEVEL_ORDER.map((level) => ({
        level,
        items: inCategory.filter((c) => c.level === level),
      })).filter((group) => group.items.length > 0);

      return { category, groups: byLevel, total: inCategory.length };
    });
  }, [courses]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface rounded-xl w-1/2" />
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-surface rounded-2xl" />)}
      </div>
    );
  }

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

      <div className="space-y-3">
        {grouped.map((section) => {
          const isOpen = openCategory === section.category;
          const disabled = section.total === 0;

          return (
            <div
              key={section.category}
              className="border border-border rounded-2xl bg-background overflow-hidden"
            >
              <button
                type="button"
                onClick={() => !disabled && setOpenCategory(isOpen ? null : section.category)}
                disabled={disabled}
                className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left disabled:opacity-40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl leading-none">{CATEGORY_EMOJI[section.category]}</span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground">{section.category}</h2>
                    <p className="text-3xs text-placeholder mt-0.5">
                      {section.total > 0 ? `코스 ${section.total}개` : '수강 가능한 코스 없음'}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-sub"
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && !disabled && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-5 border-t border-border">
                      {section.groups.map((group) => (
                        <div key={group.level} className="space-y-2.5">
                          <div className="flex items-center gap-2 pt-3">
                            <span
                              className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                                LEVEL_STYLE[group.level] ?? 'bg-surface text-sub'
                              }`}
                            >
                              {group.level}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>

                          <div className="space-y-2">
                            {group.items.map((course) => (
                              <div
                                key={course.id}
                                className="border border-border rounded-xl p-3 bg-surface/40"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-sm font-bold text-foreground">
                                        {course.title}
                                      </h3>
                                      {course.isCompleted && (
                                        <span className="inline-flex items-center gap-0.5 text-3xs font-medium text-accent shrink-0">
                                          <Check size={10} /> 완료
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-sub mt-1 line-clamp-2">
                                      {course.description}
                                    </p>
                                    <p className="text-3xs text-placeholder mt-1.5">
                                      {course.chapterCount}개 챕터
                                    </p>
                                  </div>

                                  {!course.isCompleted && (
                                    <button
                                      onClick={() => handleStart(course.id, course.title)}
                                      disabled={startingId !== null}
                                      className="shrink-0 h-9 px-4 text-xs font-bold rounded-xl bg-foreground text-background disabled:opacity-40 flex items-center justify-center"
                                    >
                                      {startingId === course.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : '시작하기'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
