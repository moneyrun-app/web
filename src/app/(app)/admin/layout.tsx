'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, HelpCircle, Settings, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useEffect } from 'react';

const adminTabs = [
  { href: '/admin/users', icon: Users, label: '유저 관리' },
  { href: '/admin/quizzes', icon: HelpCircle, label: '퀴즈 관리' },
  { href: '/admin/config', icon: Settings, label: '시스템 설정' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useUserStore((s) => s.role);

  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/home');
    }
  }, [role, router]);

  if (role !== 'admin') return null;

  return (
    <div>
      {/* 어드민 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/home')}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-sub" />
        </button>
        <h1 className="text-xl font-bold">어드민</h1>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
        {adminTabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm flex-1 justify-center transition-colors ${
                isActive
                  ? 'bg-background text-foreground font-medium shadow-sm'
                  : 'text-sub hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
