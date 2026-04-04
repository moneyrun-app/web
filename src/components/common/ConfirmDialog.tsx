'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '다음에',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  // 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]"
        onClick={onCancel}
      />

      {/* 다이얼로그 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[slideUp_300ms_ease-out]">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-sub leading-relaxed whitespace-pre-line">{description}</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-sub hover:bg-surface transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-foreground text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
