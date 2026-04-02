# CLAUDE.md — 머니런 프론트엔드

> Claude Code가 이 프로젝트를 이해하기 위한 메인 문서.
> **코드 작성 전 반드시 읽을 것.**

---

## 프로젝트 개요

**머니런(MoneyRun)** — AI가 매일 내 돈 관리를 잔소리해주는 금융 코칭 서비스.
MVP: **3페이지** — 페이스메이커(홈) / 마이북 / 마이페이지.

---

## 관련 문서

| 문서 | 설명 |
|---|---|
| `docs/01_프로덕트_기획서_v2.0.md` | 기획 원본 |
| `docs/02_API_통합_명세서_v2.0.md` | 유일한 API 문서 |
| `docs/03_전체_플로우_정의서_v2.0.md` | 유저 여정 + 데이터 흐름 |
| `docs/04_기술결정사항_DECISIONS.md` | 왜 이렇게 만들었는지 |
| `docs/05_페이지별_개발가이드_v2.0.md` | 페이지별 상세 |

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 상태 관리 | Zustand (클라이언트) + TanStack Query (서버) |
| 스타일링 | Tailwind CSS v4 |
| 인증 | NextAuth.js (카카오 OAuth 중계) |
| 아이콘 | Lucide React |
| 마크다운 | react-markdown + @tailwindcss/typography |
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
    layout.tsx                 ← 루트 레이아웃
    page.tsx                   ← 랜딩/로그인 (/)
    onboarding/
      page.tsx                 ← 온보딩 (/onboarding)
    (app)/                     ← 로그인 후 3탭 구간
      layout.tsx               ← 하단 3탭 BottomNav
      home/
        page.tsx               ← 페이스메이커 (/home)
      book/
        page.tsx               ← 마이북 (/book)
        [id]/
          page.tsx             ← 콘텐츠 상세
      my/
        page.tsx               ← 마이페이지 (/my)
    api/auth/[...nextauth]/route.ts

  components/
    common/                    ← BottomNav, GradeBadge, AmountDisplay, SkeletonLoader
    onboarding/                ← AgeInput, IncomeInput, GoodSpendingInput, FixedExpenseInput, SurplusResult
    pacemaker/                 ← TodayMessage, DailySurplus, ActionCard
    book/                      ← CategoryTabs, ContentListItem, ContentDetail, ReportDetail, ScrapButton
    my/                        ← ProfileEditForm, GoodSpendingEditor, FixedExpenseEditor, AccountSettings

  lib/
    api.ts                     ← API 클라이언트 (JWT 인터셉터)
    surplus.ts                 ← 잉여자금 계산
    grade.ts                   ← 등급 판정
    format.ts                  ← 금액 포맷 유틸

  store/
    userStore.ts               ← 유저 정보 + 등급
    financeStore.ts            ← 재무 프로필 + 잉여자금
    constantsStore.ts          ← 운영 상수

  types/
    api.ts                     ← API 응답 공통 타입
    finance.ts                 ← 재무 관련 타입
    book.ts                    ← 마이북 관련 타입
```

---

## 핵심 아키텍처

### 상태 관리

| 종류 | 도구 | 용도 |
|---|---|---|
| 서버 상태 | TanStack Query | API 데이터 (캐시/갱신) |
| 클라이언트 상태 | Zustand | 유저 정보, 잉여자금, 등급 |

### 인증 흐름

```
NextAuth → 카카오 토큰 → POST /auth/kakao → NestJS JWT
→ isNewUser면 /onboarding, 아니면 /home
```

### 잉여자금 계산 (lib/surplus.ts)

```typescript
function calculateSurplus(monthlyIncome: number, goodSpendings: GoodSpending[], fixedExpenses: FixedExpenses) {
  const goodTotal = goodSpendings.reduce((sum, g) => sum + g.amount, 0);
  const fixedTotal = fixedExpenses.rent + fixedExpenses.utilities + fixedExpenses.phone;
  const monthly = monthlyIncome - goodTotal - fixedTotal;
  return {
    monthly,
    weekly: Math.floor(monthly / 4.3),
    daily: Math.floor(monthly / 30),
  };
}
```

### 등급 판정 (lib/grade.ts)

```typescript
type Grade = 'RED' | 'YELLOW' | 'GREEN';

function calculateGrade(monthlyIncome: number, goodSpendingTotal: number): Grade {
  if (goodSpendingTotal === 0) return 'RED';
  const ratio = goodSpendingTotal / monthlyIncome;
  if (ratio < 0.10) return 'RED';
  if (ratio < 0.20) return 'YELLOW';
  return 'GREEN';
}
```

### 금액 포맷 (lib/format.ts)

```typescript
function formatWon(amount: number): string {
  const man = amount / 10000;
  if (man >= 1) return `${man.toFixed(man % 1 === 0 ? 0 : 1)}만 원`;
  return `${amount.toLocaleString()}원`;
}
```

---

## 3탭 BottomNav

```typescript
const tabs = [
  { href: '/home', icon: Home,     label: '페이스메이커' },
  { href: '/book', icon: BookOpen, label: '마이북' },
  { href: '/my',   icon: User,     label: '마이' },
];
```

---

## 페이지별 API 매핑

| 페이지 | API |
|---|---|
| 온보딩 | `POST /onboarding` |
| 페이스메이커(홈) | `GET /pacemaker/today` |
| 마이북 > 상세 리포트 | `GET /book/detailed-reports`, `GET /book/detailed-reports/:id` |
| 마이북 > 주간 리포트 | `GET /book/weekly-reports`, `GET /book/weekly-reports/:id` |
| 마이북 > 학습 | `GET /book/learn`, `GET /book/learn/:id`, `POST /book/learn/:id/scrap` |
| 마이북 > 스크랩 | `GET /book/scraps` |
| 마이페이지 | `GET /finance/profile`, `PATCH /finance/profile`, `POST/PATCH/DELETE /finance/good-spendings`, `PATCH /finance/fixed-expenses` |

---

## API 설정

| 항목 | 값 |
|---|---|
| Base URL (개발) | `http://localhost:3001` |
| Base URL (프로덕션) | `https://api.moneyrun.io` |
| 인증 | `Authorization: Bearer {JWT}` |
| 금액 단위 | 항상 원 정수 |

---

## 개발 규칙

1. **금액은 원 단위 정수** — UI 표시만 formatWon() 사용
2. **모바일 우선** — `max-w-md mx-auto`
3. **로딩: 스켈레톤 UI** — 빈 화면/스피너 금지
4. **에러: 토스트** — 401은 로그인으로 리다이렉트
5. **온보딩 미완료 시** → `/onboarding`으로 강제 이동
6. **constants는 앱 시작 시 1회 로드** — `GET /constants`
7. **컴포넌트는 'use client' 최소화** — 서버 컴포넌트 우선, 상호작용 필요한 것만 클라이언트

---

*머니런 프론트엔드 CLAUDE.md v2.0 — 2026.04.02*
