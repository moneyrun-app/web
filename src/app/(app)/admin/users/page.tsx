'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, error } = useAdminUsers(page, limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-sub">
        유저 목록을 불러올 수 없습니다.
      </div>
    );
  }

  if (!data) return null;

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div>
      {/* 요약 */}
      <div className="bg-background border border-border rounded-xl p-4 mb-4">
        <p className="text-sm text-sub">총 유저 수</p>
        <p className="text-2xl font-bold">{data.total.toLocaleString()}명</p>
      </div>

      {/* 테이블 */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-sub">닉네임</th>
                <th className="text-left px-4 py-3 font-medium text-sub">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-sub">역할</th>
                <th className="text-left px-4 py-3 font-medium text-sub">온보딩</th>
                <th className="text-left px-4 py-3 font-medium text-sub">가입일</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium">{user.nickname}</td>
                  <td className="px-4 py-3 text-sub">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-status-error-bg text-status-error-text'
                        : 'bg-surface text-sub'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      user.hasCompletedOnboarding ? 'bg-status-success' : 'bg-disabled'
                    }`} />
                  </td>
                  <td className="px-4 py-3 text-sub">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-sub px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
