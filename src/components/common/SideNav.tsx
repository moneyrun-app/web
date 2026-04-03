'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useUserStore } from '@/store/userStore';

const tabs = [
  { href: '/home', icon: Activity, label: '페이스메이커' },
  { href: '/book', icon: BookOpen, label: '마이북' },
  { href: '/my', icon: User, label: '마이' },
];

export default function SideNav() {
  const pathname = usePathname();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/' });
  };

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-white z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <span className="text-xl font-bold text-foreground">머니런</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-light text-accent-dark font-medium'
                  : 'text-sub hover:bg-surface'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sub hover:bg-surface w-full transition-colors">
          <Settings className="w-5 h-5" />
          설정
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sub hover:bg-surface w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
