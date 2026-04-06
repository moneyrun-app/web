'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BookOpen, User, Shield } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const tabs = [
  { href: '/home', icon: Activity, label: '페이스메이커' },
  { href: '/book', icon: BookOpen, label: '마이북' },
  { href: '/my', icon: User, label: '마이' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const role = useUserStore((s) => s.role);

  const allTabs = role === 'admin'
    ? [...tabs, { href: '/admin', icon: Shield, label: '어드민' }]
    : tabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {allTabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive ? 'text-accent' : 'text-placeholder'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
