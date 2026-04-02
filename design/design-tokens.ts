/**
 * 머니런 디자인 토큰
 * ─────────────────
 * 프론트 개발 시 이 파일의 값을 참조하여 Tailwind 설정 및 컴포넌트 스타일링에 사용.
 * PNG 파일(01~09)과 함께 참고할 것.
 *
 * 색상 원칙: 파란색 사용 금지!
 * 60% 흰색(배경) + 30% 검정/회색(텍스트,버튼,테두리) + 10% 신호등(등급 액센트)
 */

// ─── 등급(Grade) 시스템 ───
export const GRADE_COLORS = {
  RED: {
    main: '#EF4444',
    bg: '#FEF2F2',
    text: '#991B1B',
  },
  YELLOW: {
    main: '#F59E0B',
    bg: '#FFFBEB',
    text: '#92400E',
  },
  GREEN: {
    main: '#22C55E',
    bg: '#F0FDF4',
    text: '#166534',
  },
} as const;

// ─── 중립 색상 ───
export const NEUTRAL = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
} as const;

// ─── 카카오 ───
export const KAKAO = {
  yellow: '#FEE500',
  text: '#3C1E1E',
} as const;

// ─── 타이포그래피 ───
export const TYPOGRAPHY = {
  display:     { size: 32, weight: 700, family: 'Pretendard' },
  h1:          { size: 24, weight: 700, family: 'Pretendard' },
  h2:          { size: 20, weight: 600, family: 'Pretendard' },
  bodyLarge:   { size: 16, weight: 400, family: 'Pretendard' },
  body:        { size: 14, weight: 400, family: 'Pretendard' },
  caption:     { size: 12, weight: 400, family: 'Pretendard' },
  amountLarge: { size: 28, weight: 700, family: 'Pretendard' },
  amount:      { size: 20, weight: 700, family: 'Pretendard' },
} as const;

// ─── 컴포넌트 스펙 ───

/** 버튼 */
export const BUTTON = {
  primary: {
    bg: '#111827',       // 검정 (파란색 아님!)
    text: '#FFFFFF',
    height: 48,
    radius: 12,
  },
  secondary: {
    bg: '#FFFFFF',
    text: '#6B7280',
    border: '#E5E7EB',
    height: 48,
    radius: 12,
  },
  ghost: {
    bg: 'transparent',
    text: '#6B7280',
    height: 40,
    radius: 8,
  },
} as const;

/** 카드 */
export const CARD = {
  bg: '#FFFFFF',
  border: '#E5E7EB',
  borderWidth: 1,
  radius: 16,
  padding: 16,
} as const;

/** 등급 뱃지 — 등급에 따라 GRADE_COLORS 참조 */
export const BADGE = {
  height: 28,
  paddingX: 12,
  radius: 9999,  // rounded-full
  fontSize: 12,
  fontWeight: 700,
} as const;

/** 하단 탭바 (Pill 스타일) */
export const TAB_BAR = {
  containerHeight: 56,  // + safe area
  bg: '#FFFFFF',
  borderTop: '#E5E7EB',
  pill: {
    height: 62,
    radius: 36,
    border: '#E5E7EB',
    padding: 4,
  },
  tab: {
    radius: 26,
    iconSize: 18,
    labelSize: 10,
    labelWeight: 600,
    /** 활성 탭: 등급 색상(GRADE_COLORS[grade].main) 배경 + 흰색 아이콘/텍스트 */
    /** 비활성 탭: 투명 배경 + #9CA3AF 아이콘/텍스트 */
  },
} as const;

/** 입력 필드 */
export const INPUT = {
  height: 52,
  bg: '#F9FAFB',
  border: '#E5E7EB',
  radius: 12,
  paddingX: 16,
  placeholderColor: '#9CA3AF',
} as const;

/** 토글 */
export const TOGGLE = {
  width: 44,
  height: 24,
  radius: 12,
  /** 활성: 등급 색상(GRADE_COLORS[grade].main) */
  /** 비활성: #E5E7EB */
  knobSize: 20,
  knobColor: '#FFFFFF',
} as const;

// ─── 화면 레이아웃 ───
export const LAYOUT = {
  /** 모바일 퍼스트 기준 너비 */
  screenWidth: 375,
  /** max-w-md mx-auto 로 데스크탑 중앙 정렬 */
  maxWidth: 'md',
  /** 컨텐츠 좌우 패딩 */
  contentPaddingX: 20,
  /** 상태바 높이 */
  statusBarHeight: 62,
} as const;

// ─── 화면 매핑 (design/ 폴더 PNG 참조) ───
export const SCREENS = {
  '01-landing':           '랜딩/로그인 — 머니런 로고 + 카카오 버튼',
  '02-onboarding-step1':  '온보딩 1단계 — 나이 입력',
  '03-onboarding-step2':  '온보딩 2단계 — 월 실수령 입력',
  '04-onboarding-step3':  '온보딩 3단계 — 좋은 소비 (적금, 연금저축 등)',
  '05-onboarding-step4':  '온보딩 4단계 — 고정 소비 (월세, 관리비, 통신비)',
  '06-onboarding-result': '온보딩 결과 — 등급 원형 + 하루 N원',
  '07-home-pacemaker':    '홈 — 잉여자금 + AI 메시지 + 추천 행동',
  '08-mybook':            '마이북 — 카테고리 탭 + 콘텐츠 리스트',
  '09-mypage':            '마이페이지 — 재무정보 수정 + 잉여자금 + 계정설정',
} as const;
