import type {
  DetailedReportsResponse,
  DetailedReport,
  MonthlyReportListItem,
  MonthlyReport,
  LearnContentListItem,
  LearnContent,
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
        type: 'donut_chart',
        title: '수입 배분 현황',
        data: [
          { label: '고정비', value: 1500000, color: '#6B7280' },
          { label: '변동비', value: 1000000, color: '#EF4444' },
          { label: '잉여자금', value: 500000, color: '#10B981' },
        ],
      },
      {
        type: 'comparison_card',
        title: '또래 평균 비교 (30대 초반 서울)',
        data: [
          { label: '고정비', mine: 1500000, average: 1300000, diff: 200000 },
          { label: '변동비', mine: 1000000, average: 800000, diff: 200000 },
          { label: '잉여자금', mine: 500000, average: 700000, diff: -200000 },
        ],
      },
      {
        type: 'bar_chart',
        title: '변동비 절감 플랜',
        subtitle: '목표: 100만 원 → 70만 원 (30만 원 절감)',
        data: [
          { label: '외식/배달', current: 400000, target: 250000 },
          { label: '카페/음료', current: 100000, target: 50000 },
        ],
      },
      {
        type: 'progress_card',
        title: '등급 업그레이드 로드맵',
        data: {
          current: 'RED',
          next: 'YELLOW',
          currentRatio: 83.3,
          targetRatio: 70,
          amountToSave: 200000,
          message: '변동비를 월 20만 원만 줄이면 YELLOW 등급으로 올라갈 수 있어요',
        },
      },
      {
        type: 'simulation_table',
        title: '은퇴 시뮬레이션',
        subtitle: '월 50만 원 투자 시 (24년간)',
        data: {
          investmentPeriod: 24,
          vestingPeriod: 10,
          monthlySaving: 500000,
          cases: [
            { label: '예적금 3%', rate: 3, asset55: 210000000, asset65: 280000000, monthlyPension: 583000 },
            { label: 'KOSPI 7%', rate: 7, asset55: 400000000, asset65: 790000000, monthlyPension: 1645000 },
            { label: 'S&P500 10%', rate: 10, asset55: 660000000, asset65: 1710000000, monthlyPension: 3562000 },
          ],
        },
      },
      {
        type: 'tip_card',
        title: '알고 계셨나요?',
        items: [
          { emoji: '☕', text: '커피 하루 1잔(4,500원) 줄이면 연 164만 원 절약' },
          { emoji: '🍔', text: '배달 주 1회 줄이면 연 78만 원 절약' },
        ],
      },
      {
        type: 'action_checklist',
        title: '이번 달 액션 플랜',
        items: [
          { id: 'a1', text: '배달앱 주 1회 제한', category: '식비', savingEstimate: 150000 },
          { id: 'a2', text: '커피 텀블러 지참', category: '카페', savingEstimate: 50000 },
        ],
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

export const mockMonthlyReports: MonthlyReportListItem[] = [
  {
    id: 'mr-001',
    month: '2026-03',
    summary: '3월은 외식비가 많았지만, 전체적으로 잘 관리했어요.',
    createdAt: '2026-04-01T00:00:00.000Z',
  },
];

export const mockMonthlyReport: MonthlyReport = {
  id: 'mr-001',
  month: '2026-03',
  summary: '3월은 외식비가 많았지만...',
  guide: `## 3월 요약\n\n외식비가 많았지만, 전체적으로 잘 관리했어요.\n\n### 4월 목표\n- 점심은 도시락 3번 이상\n- 배달 주문 주 1회 이하`,
  monthlyStats: {
    greenDays: 15,
    yellowDays: 10,
    redDays: 6,
    totalCheckedDays: 31,
  },
  createdAt: '2026-04-01T00:00:00.000Z',
};

export const mockLearnContents: LearnContentListItem[] = [
  { id: 'learn-001', title: '비상금 없으면 진짜 거지 됩니다', grade: 'RED', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-002', title: '배달비 월 30만 원 = 1년 360만 원', grade: 'RED', isRead: true, isScrapped: true, readMinutes: 1 },
  { id: 'learn-003', title: '청년도약계좌 안 하면 정부가 주는 돈 버리는 거', grade: 'YELLOW', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-004', title: '연말정산 환급 적은 이유 99% 이거', grade: 'YELLOW', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-005', title: '연금저축 지금 안 하면 65세에 후회', grade: 'GREEN', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-006', title: 'ETF 모르면 적금만 하다 인플레이션에 짐', grade: 'GREEN', isRead: false, isScrapped: false, readMinutes: 1 },
];

export const mockLearnContent: LearnContent = {
  id: 'learn-001',
  title: '비상금 없으면 진짜 거지 됩니다',
  content: `## 비상금이 왜 필요해?\n\n갑자기 핸드폰이 고장 나거나, 병원에 갈 일이 생기면?\n\n비상금 없이 카드 할부로 해결하면, 이자가 눈덩이처럼 불어나요.\n\n## 얼마나 모아야 해?\n\n최소 **월 생활비 3개월치**를 비상금으로 모아두세요.\n\n## 어디에 넣어?\n\n- 파킹통장 (CMA)\n- 수시입출금 가능한 예금\n- 절대 투자 계좌에 넣지 마세요!`,
  grade: 'RED',
  isRead: true,
  isScrapped: false,
};

export const mockScraps: ExternalScrap[] = [
  {
    id: 'scrap-001',
    url: 'https://youtube.com/watch?v=abc123',
    channel: 'youtube',
    creator: '슈카월드',
    contentDate: '2026-03-30',
    title: '2026년 금리 전망',
    aiSummary: '2026년 하반기 기준금리 인하 가능성이 높아지고 있으며, 예적금 금리는 점진적 하락 예상...',
    scrapCount: 42,
    createdAt: '2026-04-03T00:00:00.000Z',
  },
];
