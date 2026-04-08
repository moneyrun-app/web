# 머니런 프론트엔드 개발 진행 현황

> **최종 업데이트:** 2026-04-08

---

## 완료된 작업

### Phase 1: 기반 설정
- [x] 패키지 설치 (zustand, @tanstack/react-query, lucide-react, react-markdown, @tailwindcss/typography, framer-motion, recharts, next-auth)
- [x] 글로벌 스타일 + 디자인 토큰 (`globals.css` — 등급 컬러, 다크모드, 카드 등)
- [x] TypeScript 타입 정의 (`types/api.ts`, `finance.ts`, `book.ts`, `monthly-report-v2.ts`, `report-v6.ts`)
- [x] 유틸 함수 (`lib/format.ts`, `grade.ts`, `simulation.ts`, `api.ts`, `auth.ts`)
- [x] Zustand 스토어 4개 (`userStore`, `financeStore`, `simulationStore`, `constantsStore`, `themeStore`)
- [x] TanStack Query Provider + 전체 API 훅 (`hooks/useApi.ts`)
- [x] API 프록시 (`app/api/proxy/[...path]/route.ts` — CORS 우회)

### Phase 2: 공통 컴포넌트
- [x] `SideNav.tsx` — 데스크탑 사이드바 (홈/마이북/마이/어드민)
- [x] `BottomNav.tsx` — 모바일 하단 탭 (어드민 역할 대응)
- [x] `GradeBadge.tsx` — 등급 뱃지 (RED/YELLOW/GREEN, 사이즈 설정)
- [x] `AmountDisplay.tsx` — 금액 표시 (md/lg/xl)
- [x] `SkeletonLoader.tsx` — 스켈레톤 UI
- [x] `Markdown.tsx` — 마크다운 렌더링 (rehype-raw, 한국어 강조 패턴 수정)
- [x] `LoginSheet.tsx` — 로그인 바텀시트/모달
- [x] `ConfirmDialog.tsx` — 확인 다이얼로그 (ESC, 바디 스크롤 잠금)
- [x] `GradeProvider.tsx` — 등급별 CSS 변수 주입
- [x] `ThemeToggle.tsx` — 다크모드 토글
- [x] `ThemeInit.tsx` — 테마 초기화 (localStorage 기반)

### Phase 3: 랜딩 (시뮬레이션) — `/`
- [x] 7단계 시뮬레이션 위저드 (닉네임~변동비)
- [x] Framer Motion 슬라이드 애니메이션
- [x] 금액 만원 접미사 오버레이
- [x] Enter/ESC 키보드 네비게이션
- [x] sessionStorage 영속화
- [x] 시뮬레이션 결과 3단계 캐러셀 (현재/미래/CTA)
- [x] 투자 시나리오 (3%/7%/10%) 차트
- [x] 공개 레이아웃 (헤더: 로고 + 테마토글 + 로그인)

### Phase 4: 인증 + 자동 온보딩
- [x] NextAuth.js v5 카카오 OAuth 연동
- [x] 카카오 토큰 → POST /auth/kakao → JWT 교환
- [x] JWT sessionStorage 저장 + 자동 복원
- [x] 신규 유저: 시뮬레이션 데이터 → POST /auth/onboarding → 자동 프로필 생성
- [x] 기존 유저: GET /finance/profile + GET /users/me 동기화
- [x] 프로필 충돌 감지 → 업데이트 확인 다이얼로그
- [x] 인증 가드 (미인증 → /, 온보딩 미완료 → 자동 처리)

### Phase 5: 페이스메이커 홈 — `/home`
- [x] AI 오늘의 메시지 (테마 태그 + 한마디)
- [x] 월간 소비 캘린더 (7일×주수 그리드, 색상 상태)
- [x] 일별 호버 툴팁 (금액 + 상태)
- [x] 데일리 체크 모달 (상태 + 금액 입력)
- [x] 좌우 스와이프 월 전환 (터치 + 버튼)
- [x] 월간 확정/취소 워크플로우
- [x] 미확정 과거 월 알림
- [x] 데일리 퀴즈 (객관식 4지선다)
- [x] 퀴즈 결과 + 간단/상세 설명 (마크다운)
- [x] 메시지 피드백 기능

### Phase 6: 마이북 — `/book`
- [x] 3탭 구조 (리포트 / 오답노트 / 스크랩)
- [x] 상세 리포트 목록 + 월간 리포트 구분선 레이아웃
- [x] 월간 리포트 생성 3단계 모달 (체감→제안→메모)
- [x] 오답노트 (내 답/정답 배지 + 펼침/접기 상세 설명)
- [x] 외부 URL 스크랩 (FAB 버튼 + AI 요약)
- [x] 리포트 상세: V6 섹션 기반 26개 컴포넌트 (`ReportSections.tsx`)
- [x] 리포트 상세: 월간 V2 + 레거시 마크다운 폴백
- [x] 라우팅: `/book/{id}?type=detailed|monthly`

### Phase 7: 마이페이지 — `/my`
- [x] 닉네임 + 등급 뱃지
- [x] 재무 프로필 편집 (닉네임, 나이, 은퇴나이, 연금나이, 실수령, 고정비, 변동비)
- [x] 일/주/월 예산 + 잉여자금 실시간 계산
- [x] PATCH /finance/profile 저장
- [x] stale 프로필 경고

### Phase 8: 어드민 — `/admin/*`
- [x] 유저 관리 (페이지네이션 테이블)
- [x] 퀴즈 관리 (펼침/접기 + 마크다운 해설)
- [x] 운영 상수 관리 (실시간 수정)

### 인프라
- [x] Vercel 연결 (프로젝트명: moneyrun)
- [x] 배포 완료
- [x] 기획 문서 v3.0 업데이트
- [x] CLAUDE.md v3.0 업데이트
- [x] 다크모드 지원
- [x] 반응형 (모바일 BottomNav + 데스크탑 SideNav)

---

## 남은 작업

### 우선순위 높음

1. **회원 탈퇴 플로우** — DELETE /users/me + 확인 다이얼로그 + 로그아웃
2. **마케팅 동의 토글** — PATCH /users/me 연결
3. **좋은소비/고정소비 개별 CRUD** — 마이페이지에서 항목별 추가/수정/삭제 (현재는 통합 PATCH)

### 우선순위 중간

4. **에러 핸들링 강화** — 전역 에러 바운더리 + 토스트 알림
5. **PWA 설정** — manifest.json, 서비스워커
6. **SEO 최적화** — 메타태그, OG 이미지

### 우선순위 낮음

7. **페이스메이커 히스토리** — 과거 메시지 목록
8. **푸시 알림** — 매일 아침 페이스메이커 알림

---

## 현재 파일 구조

```
src/
  app/
    layout.tsx              ← 루트 (SessionProvider + QueryProvider + ThemeInit)
    globals.css             ← 디자인 토큰 + 다크모드
    (public)/
      layout.tsx            ← 공개 레이아웃 (헤더)
      page.tsx              ← 랜딩/시뮬레이션 위저드
    (app)/
      layout.tsx            ← 인증 가드 + SideNav/BottomNav
      home/page.tsx         ← 페이스메이커 (메시지+캘린더+퀴즈)
      book/page.tsx         ← 마이북 (3탭)
      book/[id]/page.tsx    ← 리포트 상세 (V6/V2/레거시)
      my/page.tsx           ← 마이페이지 (프로필 편집)
      admin/
        page.tsx            ← → /admin/users 리다이렉트
        layout.tsx          ← 어드민 레이아웃
        users/page.tsx      ← 유저 관리
        quizzes/page.tsx    ← 퀴즈 관리
        config/page.tsx     ← 상수 관리
    api/
      auth/[...nextauth]/route.ts  ← NextAuth 핸들러
      proxy/[...path]/route.ts     ← CORS 프록시

  components/
    providers/              ← QueryProvider, ThemeInit
    common/                 ← SideNav, BottomNav, GradeBadge, AmountDisplay,
                              SkeletonLoader, Markdown, LoginSheet, ConfirmDialog,
                              GradeProvider, ThemeToggle
    simulation/             ← SimulationResult, StepCurrentReport, StepFutureProjection,
                              StepActionCTA, InvestmentChart, TrajectoryChart
    pacemaker/              ← DailySurplus, TodayMessage, TrafficLight, InvestmentTier
    book/                   ← CategoryTabs, ContentListItem, MonthlyReportCreate,
                              MonthlyReportV2Detail, V6ReportDetail, ReportSections

  hooks/
    useApi.ts               ← TanStack Query 훅 (33개 API)
    useFocusTrap.ts         ← 모달 포커스 관리

  lib/
    api.ts                  ← API 클라이언트 (JWT 인터셉터 + 자동 갱신)
    auth.ts                 ← NextAuth 설정 (카카오)
    format.ts               ← 금액 포맷 (formatWon, formatWonRaw, decodeHtml)
    grade.ts                ← 등급 판정 + 색상 설정
    simulation.ts           ← 시뮬레이션 계산 (기본 + 강화)
    mock/                   ← mockPacemaker, mockBook, mockUser, mockConstants

  store/
    userStore.ts            ← 유저 정보 (id, nickname, role, isLoggedIn)
    financeStore.ts         ← 재무 프로필 (나이, 소득, 등급, 잉여자금, 변동비)
    simulationStore.ts      ← 시뮬레이션 입력 (sessionStorage 영속화)
    constantsStore.ts       ← 운영 상수
    themeStore.ts           ← 테마 (light/dark)

  types/
    api.ts                  ← API 응답 타입, User, Admin 타입
    finance.ts              ← 재무 타입, 시뮬레이션 타입, 등급
    book.ts                 ← 마이북 타입 (체크, 퀴즈, 리포트, 스크랩)
    monthly-report-v2.ts    ← 월간 리포트 v2 타입
    report-v6.ts            ← V6 섹션 리포트 타입 (26개 섹션)
```

---

## 기술 스택 (설치 완료)

| 패키지 | 용도 |
|---|---|
| next 16.x | 프레임워크 (App Router) |
| react 19.x | UI |
| typescript | 타입 안전성 |
| tailwindcss 4.x | 스타일링 |
| zustand | 클라이언트 상태 (4개 스토어) |
| @tanstack/react-query | 서버 상태 (캐시/갱신) |
| next-auth v5 | 카카오 OAuth |
| framer-motion | 애니메이션 (슬라이드, 페이드, 카운트업) |
| recharts | 차트 (도넛/라인/바/게이지) |
| lucide-react | 아이콘 |
| react-markdown | 마크다운 렌더링 |
| rehype-raw | HTML 인라인 마크다운 |
| @tailwindcss/typography | prose 스타일 |

---

*머니런 프론트엔드 진행 현황 v3.0 — 2026.04.08*
