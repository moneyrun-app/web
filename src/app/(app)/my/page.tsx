'use client';

import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import GradeBadge from '@/components/common/GradeBadge';
import { formatWon } from '@/lib/format';
import { User } from 'lucide-react';

export default function MyPage() {
  const nickname = useUserStore((s) => s.nickname);
  const { age, monthlyIncome, goodSpendings, fixedExpenses, grade } = useFinanceStore();

  return (
    <div className="max-w-md mx-auto w-full px-5 py-6">
      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-6">
        <User size={28} className="text-sub" />
        <h1 className="text-xl font-bold">{nickname || '유저'}</h1>
        <GradeBadge grade={grade} />
      </div>

      {/* 내 재무 정보 */}
      <section className="mb-6">
        <h2 className="text-primary text-sm font-medium mb-3">내 재무 정보</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>나이</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{age}세</span>
              <button className="text-sub text-sm">수정</button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>월 실수령</span>
            <span className="font-medium">{formatWon(monthlyIncome)}</span>
          </div>
        </div>
      </section>

      <hr className="border-card-border mb-6" />

      {/* 좋은 소비 */}
      <section className="mb-6">
        <h2 className="text-primary text-sm font-medium mb-3">좋은 소비</h2>
        <div className="space-y-3">
          {goodSpendings.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span>{item.label}</span>
              <span className="font-medium">{formatWon(item.amount)}</span>
            </div>
          ))}
          <button className="text-sub text-sm">+ 추가</button>
        </div>
      </section>

      <hr className="border-card-border mb-6" />

      {/* 고정 소비 */}
      <section className="mb-6">
        <h2 className="text-primary text-sm font-medium mb-3">고정 소비</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>월세</span>
            <span className="font-medium">{formatWon(fixedExpenses.rent)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>관리비</span>
            <span className="font-medium">{formatWon(fixedExpenses.utilities)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>통신비</span>
            <span className="font-medium">{formatWon(fixedExpenses.phone)}</span>
          </div>
        </div>
      </section>

      <hr className="border-card-border mb-6" />

      {/* 계정 설정 */}
      <section>
        <h2 className="text-primary text-sm font-medium mb-3">계정</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>마케팅 수신 동의</span>
            <span className="text-sub text-sm">미동의</span>
          </div>
          <button className="text-red-400 text-sm">회원 탈퇴</button>
        </div>
      </section>
    </div>
  );
}
