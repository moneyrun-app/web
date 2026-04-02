import type {
  DetailedReportsResponse,
  DetailedReport,
  WeeklyReportListItem,
  WeeklyReport,
  LearnContentListItem,
  LearnContent,
  ScrapItem,
} from '@/types/book';

export const mockDetailedReports: DetailedReportsResponse = {
  canGenerate: true,
  nextAvailableDate: null,
  items: [
    {
      id: 'dr-001',
      title: '4월 재무 분석',
      summary: '잉여자금 104만 원으로 YELLOW 등급이에요. 배달비를 줄이면 GREEN까지 갈 수 있어요.',
      createdAt: '2026-04-02T00:00:00.000Z',
    },
    {
      id: 'dr-002',
      title: '3월 재무 분석',
      summary: '저번 달 대비 외식비 15% 감소! 좋은 흐름이야.',
      createdAt: '2026-03-25T00:00:00.000Z',
    },
  ],
};

export const mockDetailedReport: DetailedReport = {
  id: 'dr-001',
  title: '4월 재무 분석',
  content: `## 현재 재무 상태

월 실수령액 **230만 원** 기준, 좋은 소비(적금 + 연금저축) **40만 원**, 고정 소비 **85.5만 원**을 제외하면 매달 **104.5만 원**이 잉여자금이에요.

## 잘하고 있는 점
- 적금과 연금저축을 꾸준히 하고 있어요
- 고정 소비를 서울 평균 이하로 유지하고 있어요

## 개선할 점
- 통신비를 알뜰 요금제로 전환하면 월 2만 원 절약 가능
- 배달비를 주 2회 이하로 줄이면 월 15만 원 절약 가능`,
  grade: 'YELLOW',
  surplus: { monthly: 1045000, daily: 34833 },
  analysis: {
    wellDone: '적금과 연금저축을 꾸준히 하고 있어요.',
    improvement: '고정 소비 중 통신비를 줄일 수 있어요.',
    actionPlan: '알뜰 요금제 전환 시 월 2만 원 절약 가능',
  },
  createdAt: '2026-04-02T00:00:00.000Z',
};

export const mockWeeklyReports: WeeklyReportListItem[] = [
  {
    id: 'wr-001',
    weekStart: '2026-03-25',
    weekEnd: '2026-03-31',
    summary: '이번 주 잘 버텼어요. 식비를 잘 잡았어요.',
    createdAt: '2026-04-01T00:00:00.000Z',
  },
];

export const mockWeeklyReport: WeeklyReport = {
  id: 'wr-001',
  weekStart: '2026-03-25',
  weekEnd: '2026-03-31',
  summary: '이번 주 잘 버텼어요. 식비를 잘 잡았어요.',
  guide: `## 이번 주 요약\n\n회식이 잦았던 주였지만, 전체적으로 잘 관리했어요.\n\n### 다음 주 목표\n- 점심은 도시락 3번 이상\n- 배달 주문 주 1회 이하`,
  userInput: { overallFeeling: 'okay', memo: '' },
  createdAt: '2026-04-01T00:00:00.000Z',
};

export const mockLearnContents: LearnContentListItem[] = [
  { id: 'learn-001', title: '비상금 없으면 진짜 거지 됩니다', grade: 'RED', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-002', title: '배달비 월 30만 원 = 1년 360만 원', grade: 'RED', isRead: true, isScrapped: true, readMinutes: 1 },
  { id: 'learn-003', title: '복리가 뭔지 모르면 평생 월급쟁이', grade: 'RED', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-004', title: '청년도약계좌 안 하면 정부가 주는 돈 버리는 거', grade: 'YELLOW', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-005', title: '연말정산 환급 적은 이유 99% 이거', grade: 'YELLOW', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-006', title: '연금저축 지금 안 하면 65세에 후회', grade: 'GREEN', isRead: false, isScrapped: false, readMinutes: 1 },
  { id: 'learn-007', title: 'ETF 모르면 적금만 하다 인플레이션에 짐', grade: 'GREEN', isRead: false, isScrapped: false, readMinutes: 1 },
];

export const mockLearnContent: LearnContent = {
  id: 'learn-001',
  title: '비상금 없으면 진짜 거지 됩니다',
  content: `## 비상금이 왜 필요해?\n\n갑자기 핸드폰이 고장 나거나, 병원에 갈 일이 생기면?\n\n비상금 없이 카드 할부로 해결하면, 이자가 눈덩이처럼 불어나요.\n\n## 얼마나 모아야 해?\n\n최소 **월 생활비 3개월치**를 비상금으로 모아두세요.\n\n예: 월 생활비 150만 원이면 → 비상금 450만 원\n\n## 어디에 넣어?\n\n- 파킹통장 (CMA)\n- 수시입출금 가능한 예금\n- 절대 투자 계좌에 넣지 마세요!`,
  grade: 'RED',
  isRead: true,
  isScrapped: false,
};

export const mockScraps: ScrapItem[] = [
  { id: 'learn-002', title: '배달비 월 30만 원 = 1년 360만 원', grade: 'RED', type: 'learn', scrappedAt: '2026-04-01T12:00:00.000Z' },
];
