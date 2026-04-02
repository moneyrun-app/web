import type { PacemakerToday } from '@/types/book';

export const mockPacemakerToday: PacemakerToday = {
  id: 'pm-001',
  date: '2026-04-02',
  message: '야 하루에 3만 5천 원인데 어제 배달만 2번이잖아 ㅋㅋ 오늘은 도시락 싸가',
  grade: 'YELLOW',
  dailySurplus: 34833,
  actions: [
    {
      type: 'learn_content',
      id: 'learn-001',
      title: '배달비 월 30만 원 = 1년 360만 원\n그 돈이면 제주도 왕복 3번 가능',
      label: '이거 읽어봐',
    },
  ],
  createdAt: '2026-04-02T00:00:00.000Z',
};
