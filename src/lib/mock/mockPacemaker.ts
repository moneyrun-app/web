import type { PacemakerToday } from '@/types/book';

export const mockPacemakerToday: PacemakerToday = {
  id: 'pm-001',
  date: '2026-04-05',
  message: '야 하루에 16,000원인데 어제 추천한 행동 잘 했더라 ㅎㅎ 오늘도 도시락?',
  grade: 'YELLOW',
  dailyVariableCost: 16_000,
  spendingStatus: {
    todayRemaining: 16_000,
    weeklyRemaining: 116_000,
    weeklyUsed: 0,
    level: 'green',
  },
  quizzes: [
    {
      id: 'quiz-001',
      question: '적금을 중도해지하면 어떤 이자율이 적용될까?',
      choices: ['약정 이자율', '중도해지 이자율', '기본 금리', '무이자'],
      source: '금융상식',
      category: '저축',
    },
  ],
  quizCount: 1,
  actions: [],
  disclaimer: '참고용 조언이며, 개인 상황에 따라 다를 수 있어요',
  createdAt: '2026-04-05T00:00:00.000Z',
};
