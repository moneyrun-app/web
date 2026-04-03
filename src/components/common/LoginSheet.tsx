'use client';

import { X } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface Props {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginSheet({ open, onClose, message }: Props) {
  if (!open) return null;

  const handleKakaoLogin = () => {
    signIn('kakao', { callbackUrl: `${window.location.origin}/home` });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[400px] rounded-t-2xl md:rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">로그인이 필요해요</h3>
          <button onClick={onClose} className="p-1 text-sub hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-sub mb-6 leading-relaxed">
          {message || 'AI 상세 리포트 다운로드, 마이북 저장 등을 이용하려면 로그인이 필요합니다.'}
        </p>

        {/* Kakao Login */}
        <button
          onClick={handleKakaoLogin}
          className="w-full h-12 rounded-xl font-semibold text-foreground bg-kakao transition-colors hover:opacity-90 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.63 5.18l-.93 3.44c-.08.29.25.52.5.35l4.12-2.74c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.26C17 3.79 13.42 1 9 1z" fill="#191919"/>
          </svg>
          카카오로 시작하기
        </button>

        {/* Terms */}
        <p className="text-2xs text-placeholder mt-4 text-center leading-relaxed">
          로그인 시 개인정보 수집 및 이용에 동의합니다.
        </p>
      </div>
    </div>
  );
}
