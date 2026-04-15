'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useActiveMissions } from '@/hooks/useApi';
import CourseProgressBar from '@/components/course/CourseProgressBar';
import MissionCard from '@/components/course/MissionCard';
import type { Mission } from '@/types/course';

export default function MissionsPage() {
  const router = useRouter();
  const { data, isLoading } = useActiveMissions();
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

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
    </div>
  );
}
