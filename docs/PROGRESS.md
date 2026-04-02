# 머니런 프론트엔드 개발 진행 현황

> **최종 업데이트:** 2026-04-03

---

## 완료된 작업

### Phase 1: 기반 설정
- [x] 패키지 설치 (zustand, @tanstack/react-query, lucide-react, react-markdown, @tailwindcss/typography)
- [x] 글로벌 스타일 + 디자인 토큰 (`globals.css` — 등급 컬러, 카카오, 카드 등)
- [x] TypeScript 타입 정의 (`types/api.ts`, `finance.ts`, `book.ts`)
- [x] 유틸 함수 (`lib/format.ts`, `grade.ts`, `surplus.ts`, `api.ts`)
- [x] Zustand 스토어 (`store/userStore.ts`, `financeStore.ts`, `constantsStore.ts`)
- [x] TanStack Query Provider (`components/providers/QueryProvider.tsx`)
- [x] Mock 데이터 (`lib/mock/` — pacemaker, book, user, constants)

### Phase 2: 공통 컴포넌트
- [x] `BottomNav.tsx` — 하단 3탭 (페이스메이커/마이북/마이)
- [x] `GradeBadge.tsx` — 등급 뱃지 (RED/YELLOW/GREEN)
- [x] `AmountDisplay.tsx` — 금액 표시
- [x] `SkeletonLoader.tsx` — 스켈레톤 UI

### Phase 3: 랜딩 페이지 (`/`)
- [x] "머니런" 타이틀 + 카카오 로그인 버튼
- [x] Mock 로그인 (신규 유저 → 온보딩, 기존 유저 → 홈)

### Phase 4: 온보딩 (`/onboarding`)
- [x] 4스텝 구조 (나이 → 실수령액 → 좋은소비 → 고정소비)
- [x] 프로그레스바, 이전/다음 버튼
- [x] 결과 화면 (등급 원형 + "하루 OO원" + 공식 표시)
- [x] 완료 시 financeStore 업데이트 → `/home` 이동

### Phase 5: 페이스메이커 홈 (`/home`)
- [x] 앱 레이아웃 (`(app)/layout.tsx` + BottomNav)
- [x] 등급 뱃지 + 하루 사용 가능 금액
- [x] AI 메시지 카드 ("오늘의 한마디")
- [x] 추천 행동 카드 (→ 마이북 이동)

### Phase 6: 마이북 (`/book`)
- [x] 4개 탭 (상세리포트/주간/스크랩/학습)
- [x] 콘텐츠 목록 (날짜별 카드)
- [x] 상세 페이지 (`/book/[id]`) — 마크다운 렌더링

### Phase 7: 마이페이지 (`/my`)
- [x] 닉네임 + 등급 뱃지
- [x] 재무 정보 표시 (나이, 실수령, 좋은소비, 고정소비)
- [x] 계정 설정 영역

### 인프라
- [x] Vercel 연결 (프로젝트명: moneyrun)
- [x] 첫 배포 완료 (moneyrun-beta.vercel.app)
- [x] 기획 문서 5개 (`docs/` 폴더)
- [x] CLAUDE.md 작성

---

## 남은 작업

### 우선순위 높음 (MVP 필수)

1. **NextAuth.js 카카오 OAuth 연동**
   - `app/api/auth/[...nextauth]/route.ts` 생성
   - 카카오 개발자 앱 등록 → Client ID/Secret 설정
   - 로그인 → POST /auth/kakao → JWT 저장
   - 세션 기반 라우트 보호 (미인증 → `/`, 온보딩 미완료 → `/onboarding`)

2. **실제 API 연결 (Mock → Real)**
   - `lib/api.ts`에서 mock 모드 분기 제거
   - 환경변수 `NEXT_PUBLIC_API_URL` 설정
   - TanStack Query 훅으로 API 호출 전환 (현재는 mock 직접 import)
   - 에러 핸들링 + 토스트 알림

3. **마이페이지 수정 기능 구현**
   - 나이/실수령액 인라인 편집 → PATCH /finance/profile
   - 좋은 소비 CRUD → POST/PATCH/DELETE /finance/good-spendings
   - 고정 소비 수정 → PATCH /finance/fixed-expenses
   - 수정 시 Zustand + API 동시 업데이트 (optimistic update)

4. **주간 리포트 생성 UI**
   - "이번 주 리포트 만들기" 버튼
   - 체감 선택 (good/okay/tight/bad) + 메모 입력 모달
   - POST /book/weekly-reports → 결과 표시

5. **스크랩 토글 기능**
   - POST /book/learn/:id/scrap 연결
   - 스크랩 상태 UI 반영 (북마크 아이콘 토글)

### 우선순위 중간

6. **디자인 정밀도 개선**
   - 디자인 시안 (.pen / PDF)과 1:1 비교 후 미세 조정
   - 온보딩 슬라이드 애니메이션 추가
   - 로딩 스켈레톤 적용 (현재 컴포넌트는 만들었으나 페이지에 미적용)

7. **react-markdown 제대로 적용**
   - 현재 `/book/[id]`에서 수동 파싱 중
   - react-markdown + @tailwindcss/typography prose 클래스로 교체

8. **회원 탈퇴 플로우**
   - 확인 다이얼로그 → DELETE /users/me → 로그아웃 → 랜딩

### 우선순위 낮음 (나중에)

9. **PWA 설정** — manifest.json, 서비스워커
10. **SEO 최적화** — 메타태그, OG 이미지
11. **에러 바운더리** — 전역 에러 처리 컴포넌트
12. **페이스메이커 히스토리** — GET /pacemaker/history 연결

---

## 현재 파일 구조

```
src/
  app/
    layout.tsx              ← 루트 (QueryProvider 래핑)
    page.tsx                ← 랜딩/로그인
    globals.css             ← 디자인 토큰
    onboarding/page.tsx     ← 온보딩 4스텝+결과
    (app)/
      layout.tsx            ← 하단 BottomNav
      home/page.tsx         ← 페이스메이커
      book/page.tsx         ← 마이북 (4탭)
      book/[id]/page.tsx    ← 콘텐츠 상세
      my/page.tsx           ← 마이페이지

  components/
    providers/QueryProvider.tsx
    common/     ← BottomNav, GradeBadge, AmountDisplay, SkeletonLoader
    onboarding/ ← AgeInput, IncomeInput, GoodSpendingInput, FixedExpenseInput, SurplusResult
    pacemaker/  ← DailySurplus, TodayMessage, ActionCard
    book/       ← CategoryTabs, ContentListItem

  lib/
    api.ts, format.ts, grade.ts, surplus.ts
    mock/ ← mockPacemaker, mockBook, mockUser, mockConstants

  store/
    userStore.ts, financeStore.ts, constantsStore.ts

  types/
    api.ts, finance.ts, book.ts
```

---

## 기술 스택 (설치 완료)

| 패키지 | 버전 | 용도 |
|---|---|---|
| next | 16.2.2 | 프레임워크 |
| react | 19.2.4 | UI |
| tailwindcss | 4.x | 스타일링 |
| zustand | latest | 클라이언트 상태 |
| @tanstack/react-query | latest | 서버 상태 |
| lucide-react | latest | 아이콘 |
| react-markdown | latest | 마크다운 렌더링 |
| @tailwindcss/typography | latest | prose 스타일 |

### 아직 미설치 (필요 시)

| 패키지 | 용도 |
|---|---|
| next-auth | 카카오 OAuth (API 연결 시) |
| sonner / react-hot-toast | 토스트 알림 |
