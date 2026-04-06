'use client';

import { useState } from 'react';
import { useAdminQuizzes } from '@/hooks/useApi';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AdminQuizzesPage() {
  const { data, isLoading, error } = useAdminQuizzes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-sub">
        퀴즈 목록을 불러올 수 없습니다.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* 요약 */}
      <div className="bg-background border border-border rounded-xl p-4 mb-4">
        <p className="text-sm text-sub">총 퀴즈 수</p>
        <p className="text-2xl font-bold">{data.total}개</p>
      </div>

      {/* 퀴즈 목록 */}
      <div className="space-y-2">
        {data.quizzes.map((quiz) => {
          const isExpanded = expandedId === quiz.id;
          return (
            <div key={quiz.id} className="bg-background border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : quiz.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface/50 transition-colors"
              >
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-status-info-bg text-status-info-text shrink-0 mt-0.5">
                  {quiz.category}
                </span>
                <span className="text-sm flex-1">{quiz.question}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-sub shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-sub shrink-0 mt-0.5" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  {/* 선택지 */}
                  <div className="mt-3 space-y-1.5">
                    {quiz.choices.map((choice, i) => (
                      <div
                        key={i}
                        className={`text-sm px-3 py-2 rounded-lg ${
                          i === quiz.correctAnswer
                            ? 'bg-status-success-bg text-status-success-text font-medium'
                            : 'bg-surface text-sub'
                        }`}
                      >
                        {i + 1}. {choice}
                        {i === quiz.correctAnswer && ' (정답)'}
                      </div>
                    ))}
                  </div>

                  {/* 해설 */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs text-sub mb-1">간단 해설</p>
                      <div className="text-sm bg-surface rounded-lg px-3 py-2 prose prose-sm max-w-none">
                        <ReactMarkdown>{quiz.briefExplanation}</ReactMarkdown>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-sub mb-1">상세 해설</p>
                      <div className="text-sm bg-surface rounded-lg px-3 py-2 prose prose-sm max-w-none">
                        <ReactMarkdown>{quiz.detailedExplanation}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-sub mt-2">
                      <span>출처: {quiz.source}</span>
                      <span>{new Date(quiz.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
