'use client';

import { useState, useEffect } from 'react';
import { useConstants, useUpdateAdminConstant } from '@/hooks/useApi';
import { Pencil, Loader2 } from 'lucide-react';

const CONFIG_ITEMS: { key: string; label: string; isCurrency: boolean }[] = [
  { key: 'seoul_avg_rent', label: '서울 평균 월세', isCurrency: true },
  { key: 'avg_food', label: '평균 식비', isCurrency: true },
  { key: 'avg_transport', label: '평균 교통비', isCurrency: true },
  { key: 'avg_subscription', label: '평균 구독료', isCurrency: true },
  { key: 'avg_shopping', label: '평균 쇼핑비', isCurrency: true },
  { key: 'avg_leisure', label: '평균 여가비', isCurrency: true },
  { key: 'avg_etc', label: '평균 기타비', isCurrency: true },
  { key: 'inflation_rate', label: '인플레이션율', isCurrency: false },
];

const API_KEY_MAP: Record<string, string> = {
  seoul_avg_rent: 'seoulAverageRent',
  avg_food: 'food',
  avg_transport: 'transport',
  avg_subscription: 'subscription',
  avg_shopping: 'shopping',
  avg_leisure: 'leisure',
  avg_etc: 'etc',
  inflation_rate: 'inflationRate',
};

function getCurrentValue(constants: Record<string, unknown>, configKey: string): string {
  const apiKey = API_KEY_MAP[configKey];
  if (!apiKey) return '';

  if (configKey === 'seoul_avg_rent' || configKey === 'inflation_rate') {
    const val = constants[apiKey];
    return val != null ? String(val) : '';
  }

  const cat = constants.categoryAverages as Record<string, number> | undefined;
  if (cat && apiKey in cat) {
    return String(cat[apiKey]);
  }

  return '';
}

function formatDisplay(value: string, isCurrency: boolean): string {
  if (isCurrency) return `${Number(value).toLocaleString()}원`;
  return value;
}

// 수정 다이얼로그
function EditDialog({
  open,
  label,
  configKey,
  currentValue,
  isCurrency,
  onSave,
  onClose,
  isPending,
}: {
  open: boolean;
  label: string;
  configKey: string;
  currentValue: string;
  isCurrency: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    if (open) setValue(currentValue);
  }, [open, currentValue]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[slideUp_300ms_ease-out]">
        <h3 className="text-lg font-bold text-foreground mb-1">{label} 수정</h3>
        <p className="text-xs text-sub mb-4">{configKey}</p>

        <div className="mb-2">
          <label className="text-sm text-sub mb-1 block">현재 값</label>
          <p className="text-sm font-mono bg-surface rounded-lg px-3 py-2">
            {formatDisplay(currentValue, isCurrency)}
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm text-sub mb-1 block">새로운 값</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none font-mono"
            autoFocus
            placeholder={isCurrency ? '숫자만 입력 (원 단위)' : '값 입력'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value !== currentValue) onSave(value);
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-sub hover:bg-surface transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(value)}
            disabled={isPending || value === currentValue || !value.trim()}
            className="flex-1 h-12 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '수정하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminConfigPage() {
  const { data: constants, isLoading, error } = useConstants();
  const updateConstant = useUpdateAdminConstant();
  const [editTarget, setEditTarget] = useState<{ key: string; label: string; isCurrency: boolean } | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !constants) {
    return (
      <div className="text-center py-12 text-sub">
        시스템 설정을 불러올 수 없습니다.
      </div>
    );
  }

  const handleSave = async (value: string) => {
    if (!editTarget) return;
    try {
      await updateConstant.mutateAsync({ key: editTarget.key, value });
      setEditTarget(null);
      setSavedKey(editTarget.key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      // 에러는 mutation에서 처리
    }
  };

  const editCurrentValue = editTarget
    ? getCurrentValue(constants as unknown as Record<string, unknown>, editTarget.key)
    : '';

  return (
    <div>
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <p className="text-sm font-medium">운영 상수</p>
          <p className="text-xs text-sub mt-0.5">
            마지막 업데이트: {new Date(constants.updatedAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="divide-y divide-border">
          {CONFIG_ITEMS.map((item) => {
            const currentVal = getCurrentValue(constants as unknown as Record<string, unknown>, item.key);
            const isSaved = savedKey === item.key;

            return (
              <div key={item.key} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-sub">{item.key}</p>
                </div>

                <span className="text-sm font-mono">
                  {formatDisplay(currentVal, item.isCurrency)}
                  {isSaved && (
                    <span className="ml-2 text-xs text-status-success-text">저장됨</span>
                  )}
                </span>

                <button
                  onClick={() => setEditTarget(item)}
                  className="p-1.5 rounded-lg hover:bg-surface text-sub hover:text-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <EditDialog
        open={!!editTarget}
        label={editTarget?.label ?? ''}
        configKey={editTarget?.key ?? ''}
        currentValue={editCurrentValue}
        isCurrency={editTarget?.isCurrency ?? false}
        onSave={handleSave}
        onClose={() => setEditTarget(null)}
        isPending={updateConstant.isPending}
      />
    </div>
  );
}
