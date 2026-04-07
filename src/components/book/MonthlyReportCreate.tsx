'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import type { OverallFeeling, ProposalItem, ProposalCheck } from '@/types/monthly-report-v2';
import { useMonthlyReportProposals, useCreateMonthlyReport } from '@/hooks/useApi';

const feelings: { value: OverallFeeling; emoji: string; label: string }[] = [
  { value: 'good', emoji: '😊', label: '여유로웠어' },
  { value: 'okay', emoji: '🙂', label: '보통이었어' },
  { value: 'tight', emoji: '😥', label: '빠듯했어' },
  { value: 'bad', emoji: '😰', label: '힘들었어' },
];

interface Props {
  month: string; // "2026-03" 형식
  onClose: () => void;
  onCreated: (id: string) => void;
}

export default function MonthlyReportCreate({ month, onClose, onCreated }: Props) {
  const [step, setStep] = useState(0); // 0: feeling, 1: proposals, 2: memo
  const [feeling, setFeeling] = useState<OverallFeeling | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [memo, setMemo] = useState('');

  const { data: proposals, isLoading: proposalsLoading } = useMonthlyReportProposals();
  const createReport = useCreateMonthlyReport();

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    if (!feeling) return;
    const proposalChecks: ProposalCheck[] = (proposals ?? []).map((p) => ({
      proposalId: p.id,
      checked: checks[p.id] ?? false,
    }));
    createReport.mutate(
      { month, overallFeeling: feeling, memo, proposalChecks },
      { onSuccess: (data) => onCreated(data.id) },
    );
  };

  const canNext = step === 0 ? !!feeling : true;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-background w-full md:w-[480px] rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="p-1 -ml-1 rounded-lg hover:bg-surface transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-base font-bold">
              {step === 0 && `${month.split('-')[1]}월, 어땠어?`}
              {step === 1 && '제안 이행 체크'}
              {step === 2 && '한 줄 메모'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-sub hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-1.5 px-4 pt-3 shrink-0">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 0: Feeling */}
          {step === 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-sm text-sub mb-4">이번 달 생활비, 체감은 어땠어?</p>
              {feelings.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFeeling(f.value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                    feeling === f.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="text-sm font-medium">{f.label}</span>
                  {feeling === f.value && <Check size={16} className="ml-auto text-accent" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Proposal Checks */}
          {step === 1 && (
            <div className="space-y-3 pt-2">
              <p className="text-sm text-sub mb-4">상세 리포트에서 제안한 항목이야. 이번 달에 실천한 건 체크해줘!</p>
              {proposalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />)}
                </div>
              ) : (proposals ?? []).length === 0 ? (
                <p className="text-sm text-sub text-center py-8">아직 제안 항목이 없어요</p>
              ) : (
                (proposals ?? []).map((p: ProposalItem) => (
                  <button
                    key={p.id}
                    onClick={() => toggleCheck(p.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                      checks[p.id]
                        ? 'border-grade-green-text bg-grade-green-bg/50'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checks[p.id]
                        ? 'bg-grade-green-text border-grade-green-text'
                        : 'border-border'
                    }`}>
                      {checks[p.id] && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm text-left">{p.title}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Memo */}
          {step === 2 && (
            <div className="pt-2">
              <p className="text-sm text-sub mb-4">이번 달에 대해 한마디 남겨줘 (선택)</p>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이번달 외식이 좀 많았다..."
                rows={4}
                className="w-full p-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:outline-none resize-none"
                maxLength={200}
              />
              <p className="text-xs text-placeholder text-right mt-1">{memo.length}/200</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0">
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="w-full h-12 rounded-xl font-semibold text-white bg-accent disabled:bg-disabled disabled:text-sub transition-colors flex items-center justify-center gap-2"
            >
              다음
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createReport.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white bg-accent disabled:bg-disabled disabled:text-sub transition-colors flex items-center justify-center gap-2"
            >
              {createReport.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  리포트 생성 중...
                </>
              ) : (
                '리포트 생성하기'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
