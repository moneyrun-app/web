'use client';

import { useState } from 'react';
import { Check, BookOpen, Zap, Calculator } from 'lucide-react';
import { useCompleteMission } from '@/hooks/useApi';
import type { Mission } from '@/types/course';

const TYPE_ICONS = {
  action: Zap,
  read: BookOpen,
  calculate: Calculator,
} as const;

const TYPE_LABELS = {
  action: '실행',
  read: '읽기',
  calculate: '계산',
} as const;

interface MissionCardProps {
  mission: Mission;
}

export default function MissionCard({ mission }: MissionCardProps) {
  const completeMission = useCompleteMission();
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const Icon = TYPE_ICONS[mission.type];

  const handleComplete = () => {
    completeMission.mutate({
      missionId: mission.id,
      note: note.trim() || undefined,
    }, {
      onSuccess: () => setShowNote(false),
    });
  };

  return (
    <div className={`rounded-xl border p-3.5 transition-colors ${
      mission.completed
        ? 'border-border bg-surface/50'
        : 'border-border bg-background'
    }`}>
      <div className="flex items-start gap-3">
        {/* 아이콘/체크 */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          mission.completed
            ? 'bg-accent/10 text-accent'
            : 'bg-surface text-sub'
        }`}>
          {mission.completed ? <Check size={16} /> : <Icon size={16} />}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-3xs px-1.5 py-0.5 rounded font-medium ${
              mission.completed ? 'bg-accent/10 text-accent' : 'bg-surface text-sub'
            }`}>
              {TYPE_LABELS[mission.type]}
            </span>
          </div>
          <p className={`text-sm font-medium ${
            mission.completed ? 'text-sub line-through' : 'text-foreground'
          }`}>
            {mission.title}
          </p>
          <p className="text-xs text-sub mt-0.5">{mission.description}</p>

          {mission.completed && mission.completedAt && (
            <p className="text-3xs text-placeholder mt-1">
              완료: {mission.completedAt.split('T')[0].replace(/-/g, '.')}
            </p>
          )}

          {/* 완료 버튼 */}
          {!mission.completed && (
            <div className="mt-2.5">
              {showNote ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="메모 (선택)"
                    className="w-full h-9 px-3 text-xs bg-surface border border-border rounded-lg outline-none focus:border-foreground"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleComplete}
                      disabled={completeMission.isPending}
                      className="flex-1 h-9 text-xs font-bold rounded-lg bg-accent text-white disabled:opacity-40"
                    >
                      {completeMission.isPending ? '저장 중...' : '완료'}
                    </button>
                    <button
                      onClick={() => setShowNote(false)}
                      className="h-9 px-3 text-xs rounded-lg border border-border"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNote(true)}
                  className="h-8 px-4 text-xs font-medium rounded-lg bg-foreground text-background"
                >
                  완료하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
