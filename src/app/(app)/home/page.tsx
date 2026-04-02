'use client';

import { useFinanceStore } from '@/store/financeStore';
import { mockPacemakerToday } from '@/lib/mock/mockPacemaker';
import DailySurplus from '@/components/pacemaker/DailySurplus';
import TodayMessage from '@/components/pacemaker/TodayMessage';
import ActionCard from '@/components/pacemaker/ActionCard';

export default function HomePage() {
  const { surplus, grade } = useFinanceStore();
  const pacemaker = mockPacemakerToday;

  return (
    <div className="max-w-md mx-auto w-full px-5 py-4 space-y-5">
      <DailySurplus grade={grade} dailySurplus={surplus.daily} />
      <TodayMessage message={pacemaker.message} />
      {pacemaker.actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
