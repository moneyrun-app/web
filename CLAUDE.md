# CLAUDE.md — 머니런 프론트엔드

> Claude Code가 이 프로젝트를 이해하기 위한 메인 문서.
> **코드 작성 전 반드시 읽을 것.**

---

## 프로젝트 개요

**머니런(MoneyRun)** — AI가 매일 내 돈 관리를 잔소리해주는 금융 코칭 서비스.
비로그인 시뮬레이션 체험 → 로그인 → 자동 온보딩 → 페이스메이커(홈) / 마이북 / 마이페이지 / 어드민.

---

## 관련 문서

| 문서 | 설명 |
|---|---|
| `docs/01_프로덕트_기획서_v2.0.md` | 기획 원본 (v3.0) |
| `docs/02_API_통합_명세서_v2.0.md` | API 문서 (v3.0, 33개 엔드포인트) |
| `docs/03_전체_플로우_정의서_v2.0.md` | 유저 여정 + 데이터 흐름 (v3.0) |
| `docs/04_기술결정사항_DECISIONS.md` | 왜 이렇게 만들었는지 |
| `docs/05_페이지별_개발가이드_v2.0.md` | 페이지별 상세 (v3.0) |
| `docs/06_마이북_리팩토링_변경사항.md` | 마이북 개편 + 백엔드 요청 |
| `docs/PROGRESS.md` | 개발 진행 현황 (v3.0) |

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 상태 관리 | Zustand (5개 스토어) + TanStack Query (서버 캐시) |
| 스타일링 | Tailwind CSS v4 |
| 인증 | NextAuth.js v5 (카카오 OAuth → NestJS JWT) |
| 애니메이션 | Framer Motion |
| 차트 | Recharts |
| 아이콘 | Lucide React |
| 마크다운 | react-markdown + rehype-raw + @tailwindcss/typography |
| 배포 | Vercel (프로젝트명: moneyrun) |

---

## 명령어

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

---

## 폴더 구조

```
src/
  app/
    layout.tsx                 ← 루트 (SessionProvider + QueryProvider + ThemeInit)
    globals.css                ← 디자인 토큰 + 다크모드
    (public)/
      layout.tsx               ← 공개 레이아웃 (헤더: 로고+테마+로그인)
      page.tsx                 ← 랜딩/시뮬레이션 위저드 (/)
    (app)/
      layout.tsx               ← 인증 가드 + SideNav/BottomNav + 자동 온보딩
      home/page.tsx            ← 페이스메이커 (/home)
      book/page.tsx            ← 마이북 (/book)
      book/[id]/page.tsx       ← 리포트 상세 (/book/[id]?type=)
      my/page.tsx              ← 마이페이지 (/my)
      admin/
        users/page.tsx         ← 어드민 유저 (/admin/users)
        quizzes/page.tsx       ← 어드민 퀴즈 (/admin/quizzes)
        config/page.tsx        ← 어드민 설정 (/admin/config)
    api/
      auth/[...nextauth]/route.ts  ← NextAuth 핸들러
      proxy/[...path]/route.ts     ← CORS 프록시

  components/
    providers/                 ← QueryProvider, ThemeInit
    common/                    ← SideNav, BottomNav, GradeBadge, AmountDisplay,
                                 SkeletonLoader, Markdown, LoginSheet, ConfirmDialog,
                                 GradeProvider, ThemeToggle
    simulation/                ← SimulationResult, StepCurrentReport, StepFutureProjection,
                                 StepActionCTA, InvestmentChart, TrajectoryChart
    pacemaker/                 ← DailySurplus, TodayMessage, TrafficLight, InvestmentTier
    book/                      ← CategoryTabs, ContentListItem, MonthlyReportCreate,
                                 MonthlyReportV2Detail, V6ReportDetail, ReportSections (26개 섹션)

  hooks/
    useApi.ts                  ← TanStack Query 훅 (33개 API 엔드포인트)
    useFocusTrap.ts            ← 모달 포커스 관리

  lib/
    api.ts                     ← API 클라이언트 (JWT 인터셉터 + 자동 갱신 + /api/proxy)
    auth.ts                    ← NextAuth 설정 (카카오 프로바이더)
    format.ts                  ← 금액 포맷 (formatWon, formatWonRaw, decodeHtml)
    grade.ts                   ← 등급 판정 (RED/YELLOW/GREEN) + 색상 설정
    simulation.ts              ← 시뮬레이션 계산 (기본 + 투자 시나리오)
    mock/                      ← mockPacemaker, mockBook, mockUser, mockConstants

  store/
    userStore.ts               ← 유저 정보 (id, nickname, role, isLoggedIn)
    financeStore.ts            ← 재무 프로필 (나이, 소득, 등급, 잉여자금, 변동비)
    simulationStore.ts         ← 시뮬레이션 입력 (sessionStorage 영속화)
    constantsStore.ts          ← 운영 상수
    themeStore.ts              ← 테마 (light/dark)

  types/
    api.ts                     ← API 응답 타입, User, Admin 타입
    finance.ts                 ← 재무 타입, 시뮬레이션 타입, 등급
    book.ts                    ← 마이북 타입 (체크, 퀴즈, 리포트, 스크랩)
    monthly-report-v2.ts       ← 월간 리포트 v2 타입
    report-v6.ts               ← V6 섹션 리포트 타입 (26개 섹션)
```

---

## 핵심 아키텍처

### 상태 관리

| 종류 | 도구 | 용도 |
|---|---|---|
| 서버 상태 | TanStack Query | API 데이터 (캐시/갱신, 18개 쿼리 키) |
| 클라이언트 상태 | Zustand (5개) | 유저, 재무, 시뮬레이션, 상수, 테마 |

### 인증 흐름

```
랜딩(/) → 시뮬레이션 → "카카오로 시작하기"
→ NextAuth → 카카오 토큰 → POST /auth/kakao → JWT (sessionStorage)
→ 신규: 시뮬레이션 데이터로 POST /auth/onboarding → /home
→ 기존: GET /finance/profile + GET /users/me → /home
```

### 등급 판정 (lib/grade.ts)

```
지출 비율 = (fixedCost + variableCost) / monthlyIncome
RED    : >= 70%
YELLOW : 50% ~ 70%
GREEN  : < 50%
```

### 금액 포맷 (lib/format.ts)

```typescript
formatWon(130000000) → "1억 3000만 원"
formatWon(2300000)   → "230만 원"
formatWonRaw(36666)  → "36,666원"
```

---

## 페이지별 API 매핑

| 페이지 | API |
|---|---|
| 랜딩(시뮬레이션) | 프론트 자체 계산 (`lib/simulation.ts`) |
| 로그인 | `POST /auth/kakao` |
| 온보딩 (자동) | `POST /auth/onboarding` |
| 페이스메이커(홈) | `GET /pacemaker/today`, `POST /pacemaker/quiz/:quizId/answer`, `POST /pacemaker/feedback`, `GET /pacemaker/daily-checks`, `GET /pacemaker/weekly-summary`, `POST /pacemaker/daily-check`, `GET /pacemaker/monthly-finalize-status`, `POST /pacemaker/monthly-finalize`, `POST /pacemaker/monthly-finalize/cancel` |
| 마이북 > 리포트 | `GET /book/detailed-reports`, `GET /book/detailed-reports/:id`, `GET /book/monthly-reports`, `GET /book/monthly-reports/:id`, `GET /book/monthly-reports/proposals`, `POST /book/monthly-reports` |
| 마이북 > 오답노트 | `GET /book/wrong-notes` |
| 마이북 > 스크랩 | `GET /book/scraps`, `POST /book/scraps`, `DELETE /book/scraps/:id` |
| 마이페이지 | `GET /finance/profile`, `PATCH /finance/profile`, `GET /users/me` |
| 어드민 | `GET /admin/users`, `GET /admin/quizzes`, `PATCH /admin/constants/:key` |
| 공통 | `GET /constants` |

---

## API 설정

| 항목 | 값 |
|---|---|
| Base URL (개발) | `http://localhost:3001` |
| Base URL (프로덕션) | `https://api.moneyrun.io` |
| 인증 | `Authorization: Bearer {JWT}` |
| CORS 프록시 | `/api/proxy/[...path]` (브라우저에서 백엔드 직접 호출 차단) |
| 금액 단위 | 항상 원 정수 |

---

## 개발 규칙

1. **금액은 원 단위 정수** — UI 표시만 formatWon() 사용
2. **모바일 우선** — 반응형 (BottomNav 모바일 + SideNav 데스크탑)
3. **로딩: 스켈레톤 UI** — 빈 화면/스피너 금지
4. **에러: 토스트** — 401은 로그인으로 리다이렉트
5. **인증 가드** — `(app)/layout.tsx`에서 처리, 미인증 시 / 리다이렉트
6. **constants는 앱 시작 시 1회 로드** — `GET /constants` (1시간 캐시)
7. **컴포넌트는 'use client' 최소화** — 서버 컴포넌트 우선
8. **다크모드** — `themeStore` + localStorage + html class 기반

---

*머니런 프론트엔드 CLAUDE.md v3.0 — 2026.04.08*
