'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Trophy, Loader2, ArrowRight } from 'lucide-react';
import { useActiveMissions, useCompleteCourse } from '@/hooks/useApi';
import CourseProgressBar from '@/components/course/CourseProgressBar';
import MissionCard from '@/components/course/MissionCard';
import type { Mission, CompleteCourseResponse } from '@/types/course';

export default function MissionsPage() {
  const router = useRouter();
  const { data, isLoading } = useActiveMissions();
  const completeCourse = useCompleteCourse();
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [completionResult, setCompletionResult] = useState<CompleteCourseResponse | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface rounded-xl w-1/2" />
        <div className="h-4 bg-surface rounded-lg w-1/3" />
        <div className="h-2 bg-surface rounded-full" />
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
      </div>
    );
  }

  if (!data) return null;

  const allCompleted = data.summary.completed === data.summary.total && data.summary.total > 0;

  const handleCompleteCourse = () => {
    completeCourse.mutate(undefined, {
      onSuccess: (result) => {
        setCompletionResult(result);
      },
    });
  };

  // 축하 화면
  if (completionResult) {
    const { courseSummary } = completionResult;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Trophy size={36} className="text-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-foreground mb-2"
        >
          축하합니다!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-sub mb-6"
        >
          &ldquo;{courseSummary.title}&rdquo;을 끝까지 완주했어요
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs bg-surface rounded-2xl p-5 mb-8 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-sub">완료 미션</span>
            <span className="font-bold text-foreground">{courseSummary.completedMissions}/{courseSummary.totalMissions}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sub">수강 기간</span>
            <span className="font-bold text-foreground">{courseSummary.daysSpent}일</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <button
            onClick={() => router.push('/course/select')}
            className="w-full h-12 rounded-xl bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} /> 다음 코스 선택하기
          </button>
        </motion.div>
      </div>
    );
  }

  // 챕터별 그룹핑
  const chapters = new Map<number, Mission[]>();
  for (const mission of data.missions) {
    const group = chapters.get(mission.chapterNumber) ?? [];
    group.push(mission);
    chapters.set(mission.chapterNumber, group);
  }

  const toggleChapter = (num: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  };

  // 현재 진행 중인 챕터 (첫 번째 미완료 미션의 챕터)는 기본 열림
  const firstIncomplete = data.missions.find((m) => !m.completed);
  const defaultOpen = firstIncomplete?.chapterNumber ?? 1;

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface text-sub"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{data.courseTitle}</h1>
          <p className="text-xs text-sub">미션 {data.summary.completed}/{data.summary.total}개 완료</p>
        </div>
      </div>

      <CourseProgressBar
        current={data.summary.completed}
        total={data.summary.total}
        label="미션 진행률"
      />

      {/* 챕터별 아코디언 */}
      <div className="space-y-3">
        {Array.from(chapters.entries()).map(([chapterNum, missions]) => {
          const isOpen = expandedChapters.has(chapterNum) ||
            (!expandedChapters.size && chapterNum === defaultOpen);
          const completed = missions.filter((m) => m.completed).length;
          const allDone = completed === missions.length;

          return (
            <div key={chapterNum} className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleChapter(chapterNum)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-background hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className={allDone ? 'text-accent' : 'text-sub'} />
                  <span className="text-sm font-bold text-foreground">{chapterNum}장</span>
                  <span className="text-xs text-sub">{completed}/{missions.length}</span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  {missions
                    .sort((a, b) => a.missionOrder - b.missionOrder)
                    .map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 코스 완료 버튼 */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pt-2 pb-4"
          >
            <button
              onClick={handleCompleteCourse}
              disabled={completeCourse.isPending}
              className="w-full h-13 rounded-2xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {completeCourse.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> 완료 처리 중...</>
              ) : (
                <><Trophy size={16} /> 코스 완료하기</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
