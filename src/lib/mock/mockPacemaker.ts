import type { PacemakerToday } from '@/types/book';

export const mockPacemakerToday: PacemakerToday = {
  id: 'pm-001',
  date: '2026-04-03',
  message: '야 하루에 3만 6천 원인데 어제 추천한 행동 잘 했더라 ㅎㅎ 오늘도 도시락?',
  grade: 'YELLOW',
  dailyVariableCost: 36_666,
  spendingStatus: {
    todayRemaining: 36_666,
    weeklyRemaining: 180_000,
    weeklyUsed: 75_813,
    level: 'green',
  },
  actions: [
    {
      id: 'action-001',
      type: 'learn_content',
      contentId: 'learn-001',
      title: '배달비 월 30만 원 = 1년 360만 원',
      label: '이거 읽어봐 →',
      status: 'pending',
    },
  ],
  disclaimer: '참고용 조언이며, 개인 상황에 따라 다를 수 있어요',
  canRefresh: true,
  createdAt: '2026-04-03T00:00:00.000Z',
};
