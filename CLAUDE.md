# CLAUDE.md — 머니런 프론트엔드

> Claude Code가 이 프로젝트를 이해하기 위한 메인 문서.
> **코드 작성 전 반드시 읽을 것.**

---

## 프로젝트 개요

**머니런(MoneyRun)** — AI가 매일 내 돈 관리를 잔소리해주는 금융 코칭 서비스.
비로그인 시뮬레이션 체험 → 로그인 → 자동 온보딩 → 페이스메이커 / 머니북 / 마이북 / 마이페이지 / 어드민.

---

## 관련 문서

| 문서 | 설명 |
|---|---|
| `docs/프론트엔드_전달사항_v2.0.md` | v2.0 기획 + API 명세 + 페이지별 가이드 |

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
      page.tsx                 ← 랜딩/시뮬레이션 8스텝 위저드 (/)
    (app)/
      layout.tsx               ← 인증 가드 + SideNav/BottomNav(4탭) + 자동 온보딩
      pacemaker/page.tsx       ← 페이스메이커 (/pacemaker) — 퀴즈1개 + 출석 + AI메시지
      money-book/page.tsx      ← 머니북 서점 (/money-book)
      money-book/[id]/page.tsx ← 책 상세 + 동적 폼 구매
      my-book/page.tsx         ← 마이북 머니레터 (/my-book)
      my-book/report/[id]/     ← 상세 리포트 열람
      my-book/books/[purchaseId]/ ← 구매한 책 열람 + 하이라이트
      my-book/highlights/      ← 하이라이트 모아보기
      my-book/scraps/          ← 스크랩 모아보기 (URL + 퀴즈)
      my-book/wrong-notes/     ← 오답 노트
      my-page/page.tsx         ← 마이페이지 (/my-page) — 프로필 + 출석 + 뱃지
      admin/
        users/page.tsx         ← 어드민 유저
        quizzes/page.tsx       ← 어드민 퀴즈
        config/page.tsx        ← 어드민 설정
    api/
      auth/[...nextauth]/route.ts  ← NextAuth 핸들러
      proxy/[...path]/route.ts     ← CORS 프록시

  components/
    providers/                 ← QueryProvider, ThemeInit
    common/                    ← SideNav, BottomNav(4탭), GradeBadge, AmountDisplay,
                                 SkeletonLoader, Markdown, LoginSheet, ConfirmDialog,
                                 GradeProvider, ThemeToggle
    simulation/                ← SimulationResult, StepCurrentReport, StepFutureProjection,
                                 StepActionCTA, InvestmentChart, TrajectoryChart
    pacemaker/                 ← TodayMessage
    book/                      ← V6ReportDetail, ReportSections (26개 섹션)

  hooks/
    useApi.ts                  ← TanStack Query 훅 (퀴즈/출석/머니북/마이북/하이라이트 등)
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
    financeStore.ts            ← 재무 프로필 (나이, 소득, 투자액, 등급, 잉여자금, availableBudget)
    simulationStore.ts         ← 시뮬레이션 입력 (sessionStorage 영속화)
    constantsStore.ts          ← 운영 상수
    themeStore.ts              ← 테마 (light/dark)

  types/
    api.ts                     ← API 응답 타입, User, Admin 타입
    finance.ts                 ← 재무 타입, 시뮬레이션 타입, 등급, AvailableBudget
    book.ts                    ← 페이스메이커(PacemakerToday, TodayQuiz, Attendance), 리포트, 스크랩
    quiz.ts                    ← 퀴즈 스크랩, 난이도, 출석 스트릭/히스토리
    money-book.ts              ← 머니북 서점 (BookListItem, BookDetail, RequiredField, Purchase)
    my-book.ts                 ← 마이북 (Overview, BookReader, Highlight, Scraps)
    report-v6.ts               ← V6 섹션 리포트 타입 (26개 섹션)
```

---

## 핵심 아키텍처

### 상태 관리

| 종류 | 도구 | 용도 |
|---|---|---|
| 서버 상태 | TanStack Query | API 데이터 (캐시/갱신) |
| 클라이언트 상태 | Zustand (5개) | 유저, 재무, 시뮬레이션, 상수, 테마 |

### 인증 흐름

```
랜딩(/) → 시뮬레이션(8스텝) → "카카오로 시작하기"
→ NextAuth → 카카오 토큰 → POST /auth/kakao → JWT (sessionStorage)
→ 신규: POST /auth/onboarding (monthlyInvestment 포함) → /pacemaker
→ 기존: GET /finance/profile + GET /users/me → /pacemaker
```

### 등급 판정 (lib/grade.ts)

```
지출 비율 = (fixedCost + variableCost) / monthlyIncome
RED    : >= 70%
YELLOW : 50% ~ 70%
GREEN  : < 50%
```

---

## 페이지별 API 매핑

| 페이지 | API |
|---|---|
| 랜딩(시뮬레이션) | 프론트 자체 계산 (`lib/simulation.ts`) |
| 로그인 | `POST /auth/kakao` |
| 온보딩 (자동) | `POST /auth/onboarding` |
| 페이스메이커 | `GET /pacemaker/today`, `POST /quiz/:id/answer`, `POST /quiz/:id/scrap`, `PATCH /quiz/level`, `POST /pacemaker/feedback` |
| 머니북(서점) | `GET /money-book`, `GET /money-book/:id`, `POST /money-book/:id/purchase` |
| 마이북 > 메인 | `GET /my-book/overview` |
| 마이북 > 리포트 | `GET /book/detailed-reports`, `GET /book/detailed-reports/:id` |
| 마이북 > 책 열람 | `GET /my-book/books/:purchaseId`, `POST /my-book/books/:purchaseId/highlights`, `DELETE /my-book/highlights/:id` |
| 마이북 > 하이라이트 | `GET /my-book/highlights` |
| 마이북 > 스크랩 | `GET /my-book/scraps`, `POST /my-book/generate-from-scraps`, `GET /book/scraps`, `POST /book/scraps`, `DELETE /book/scraps/:id` |
| 마이북 > 오답노트 | `GET /my-book/wrong-notes` |
| 마이페이지 | `GET /finance/profile`, `PATCH /finance/profile`, `GET /users/me`, `GET /attendance/streak`, `GET /attendance/history` |
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

*머니런 프론트엔드 CLAUDE.md v4.0 — 2026.04.11*
