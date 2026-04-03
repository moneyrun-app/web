import type {
  DetailedReportsResponse,
  DetailedReport,
  WeeklyReportListItem,
  WeeklyReport,
  LearnContentListItem,
  LearnContent,
  ExternalScrap,
} from '@/types/book';

export const mockDetailedReports: DetailedReportsResponse = {
  canGenerateFree: false,
  items: [
    {
      id: 'dr-001',
      title: '4월 재무 분석 리포트',
      summary: '변동비 110만 원 중 외식비 35만 원이 가장 큰 비중을 차지합니다.',
      pdfUrl: '/reports/dr-001.pdf',
      createdAt: '2026-04-02T00:00:00.000Z',
    },
    {
      id: 'dr-002',
      title: '3월 재무 분석 리포트',
      summary: '저축률이 전월 대비 3% 상승했어요. 좋은 흐름입니다.',
      pdfUrl: '/reports/dr-002.pdf',
      createdAt: '2026-03-25T00:00:00.000Z',
    },
  ],
};

export const mockDetailedReport: DetailedReport = {
  id: 'dr-001',
  title: '4월 재무 분석 리포트',
  content: `## 현재 재무 상태\n\n월 실수령액 **230만 원** 기준, 고정비 **120만 원**을 제외하면 매달 **110만 원**이 변동비예요.\n\n## 잘하고 있는 점\n- 고정비를 서울 평균 이하로 유지하고 있어요\n\n## 개선할 점\n- 배달비를 주 2회 이하로 줄이면 월 15만 원 절약 가능`,
  pdfUrl: '/reports/dr-001.pdf',
  createdAt: '2026-04-02T00:00:00.000Z',
};

export const mockWeeklyReports: WeeklyReportListItem[] = [
  {
    id: 'wr-001',
    weekStart: '2026-03-31',
    weekEnd: '2026-04-06',
    summary: '회식이 잦았던 주였지만, 전체적으로 잘 관리했어요.',
    createdAt: '2026-04-07T00:00:00.000Z',
  },
];

export const mockWeeklyReport: WeeklyReport = {
  id: 'wr-001',
  weekStart: '2026-03-31',
  weekEnd: '2026-04-06',
  summary: '회식이 잦았던 주...',
  guide: `## 이번 주 요약\n\n회식이 잦았던 주였지만, 전체적으로 잘 관리했어요.\n\n### 다음 주 목표\n- 점심은 도시락 3번 이상\n- 배달 주문 주 1회 이하`,
  weeklyStats: {
    budgetComplianceRate: 0.72,
    biggestCategory: 'food',
    savedCategory: 'transport',
  },
  userInput: { overallFeeling: 'tight', memo: '회식이 2번 있어서 식비가 많이 나갔어요' },
  createdAt: '2026-04-07T00:00:00.000Z',
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
