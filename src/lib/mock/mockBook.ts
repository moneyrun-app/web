import type {
  DetailedReportsResponse,
  DetailedReport,
  ExternalScrap,
} from '@/types/book';

export const mockDetailedReports: DetailedReportsResponse = {
  items: [
    {
      id: 'dr-001',
      title: '시뮬레이터 분석 리포트',
      summary: '변동비 110만 원 중 외식비 35만 원이 가장 큰 비중을 차지합니다.',
      analyzedAt: '2026-04-02T00:00:00.000Z',
      createdAt: '2026-04-02T00:00:00.000Z',
    },
  ],
};

export const mockDetailedReport: DetailedReport = {
  id: 'dr-001',
  title: '시뮬레이터 분석 리포트',
  content: {
    sections: [
      {
        type: 'hero_card',
        data: {
          grade: 'RED',
          title: '소비케어 집중이 필요해요',
          subtitle: '총지출이 수입의 83%를 차지하고 있어요',
          dailyBudget: 16000,
          monthlyBudget: 500000,
        },
      },
      {
        type: 'summary_table',
        title: '재무 현황 요약',
        data: {
          income: 3000000,
          fixedCost: 1500000,
          variableCost: 1000000,
          totalExpense: 2500000,
          surplus: 500000,
          expenseRatio: 83.3,
          daysInMonth: 30,
        },
      },
      {
        type: 'disclaimer',
        text: '이 리포트는 입력하신 재무 정보를 기반으로 생성된 참고 자료이며, 실제 투자 수익률은 시장 상황에 따라 달라질 수 있습니다.',
      },
    ],
  },
  analyzedAt: '2026-04-02T00:00:00.000Z',
  createdAt: '2026-04-02T00:00:00.000Z',
};

export const mockScraps: ExternalScrap[] = [
  {
    id: 'scrap-001',
    url: 'https://youtube.com/watch?v=abc123',
    channel: 'youtube',
    creator: '슈카월드',
    title: '2026년 금리 전망',
    aiSummary: '2026년 하반기 기준금리 인하 가능성이 높아지고 있으며, 예적금 금리는 점진적 하락 예상...',
    createdAt: '2026-04-03T00:00:00.000Z',
  },
];
