import type { PacemakerToday } from '@/types/book';

export const mockPacemakerToday: PacemakerToday = {
  id: 'pm-001',
  date: '2026-04-05',
  cards: [
    { cardNumber: 1, emoji: '👋', title: '시은아, 현실 체크!', content: '월 300만원 벌어서 고정비 120만원, 투자 50만원 빼면 하루에 쓸 수 있는 돈이 43,000원이야.' },
    { cardNumber: 2, emoji: '📊', title: '숫자로 보는 너의 돈', content: '이번 달 변동비 예산은 130만원. 하루 43,000원 페이스를 유지하면 돼.' },
    { cardNumber: 3, emoji: '💡', title: '오늘의 꿀팁', content: '점심 도시락 싸면 하루 1만원 절약. 한 달이면 30만원이야.' },
  ],
  grade: 'YELLOW',
  theme: '투자/금융 상식',
  quote: '워렌 버핏 — 돈을 잃지 마라. 그게 첫 번째 규칙이다.',
  todayQuiz: {
    id: 'quiz-001',
    quizCode: 'Q00001',
    question: '적금을 중도해지하면 어떤 이자율이 적용될까?',
    choices: ['약정 이자율', '중도해지 이자율', '기본 금리', '무이자'],
    hint: '은행에서 약속한 이자율과 다른 별도 이자율이 있어요.',
    difficultyLevel: 2,
    difficultyLabel: '심화',
    totalAttempts: 142,
    correctCount: 89,
    correctRate: 62.7,
  },
  attendance: {
    checkedToday: false,
    currentStreak: 5,
    totalDays: 23,
  },
  createdAt: '2026-04-05T00:00:00.000Z',
};
