# 머니런 API 통합 명세서

> **버전:** v3.0
> **최종 수정:** 2026.04.08
> **범위:** 프론트엔드 실제 사용 기준 전체 API

---

## 기본 규칙

| 항목 | 규칙 |
|---|---|
| Base URL (개발) | `http://localhost:3001` |
| Base URL (프로덕션) | `https://api.moneyrun.io` |
| 인증 방식 | `Authorization: Bearer {JWT}` |
| 날짜 형식 | ISO 8601 UTC |
| **금액 단위** | **항상 원 정수** |

---

## 공통 응답

```json
// 성공
{ "success": true, "data": { ... } }

// 실패
{ "success": false, "message": "에러 설명", "code": "ERROR_CODE" }
```

| HTTP | code | 설명 |
|---|---|---|
| 400 | `BAD_REQUEST` | 잘못된 요청 |
| 401 | `UNAUTHORIZED` | JWT 없음/만료 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 422 | `VALIDATION_ERROR` | 입력값 오류 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |

---

## 1. 인증 (Auth)

### POST `/auth/kakao` — 로그인/회원가입

**Request**

```json
{ "accessToken": "kakao_access_token_string" }
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "nestjs_jwt_token",
    "user": {
      "id": "uuid",
      "nickname": "김민수",
      "email": "user@email.com",
      "isNewUser": true,
      "hasCompletedOnboarding": false
    }
  }
}
```

### POST `/auth/onboarding` — 온보딩 데이터 저장 (인증 필요)

최초 1회. 재무 프로필 + 좋은 소비 + 고정 소비를 한 번에 저장.

**Request**

```json
{
  "nickname": "닉네임",
  "age": 27,
  "monthlyIncome": 2300000,
  "goodSpendings": [
    { "type": "savings", "label": "적금", "amount": 300000 },
    { "type": "pension_savings", "label": "연금저축", "amount": 100000 }
  ],
  "fixedExpenses": {
    "rent": 700000,
    "utilities": 100000,
    "phone": 55000
  }
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "grade": "YELLOW",
    "surplus": {
      "monthly": 1045000,
      "weekly": 243023,
      "daily": 34833
    }
  }
}
```

---

## 2. 유저 (Users)

### GET `/users/me` — 내 정보 조회 (인증 필요)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "김민수",
    "email": "user@email.com",
    "marketingConsent": false,
    "hasCompletedOnboarding": true,
    "createdAt": "2026-04-02T00:00:00.000Z"
  }
}
```

---

## 3. 재무 프로필 (Finance)

### GET `/finance/profile` — 재무 프로필 + 잉여자금 조회 (인증 필요)

```json
{
  "success": true,
  "data": {
    "age": 27,
    "monthlyIncome": 2300000,
    "grade": "YELLOW",
    "goodSpendings": [
      { "id": "uuid", "type": "savings", "label": "적금", "amount": 300000 },
      { "id": "uuid", "type": "pension_savings", "label": "연금저축", "amount": 100000 }
    ],
    "goodSpendingTotal": 400000,
    "fixedExpenses": {
      "rent": 700000,
      "utilities": 100000,
      "phone": 55000
    },
    "fixedExpenseTotal": 855000,
    "surplus": {
      "monthly": 1045000,
      "weekly": 243023,
      "daily": 34833
    }
  }
}
```

### PATCH `/finance/profile` — 재무 프로필 수정 (인증 필요)

수정 즉시 잉여자금 재계산 후 반환. 변경할 항목만 전송.

```json
{ "age": 28, "monthlyIncome": 2500000, "nickname": "새닉네임" }
```

---

## 4. 시뮬레이션 (Simulation)

### POST `/simulation/calculate` — 시뮬레이션 계산 (인증 불필요)

비로그인 사용자도 사용 가능한 시뮬레이션.

**Request**

```json
{
  "age": 27,
  "monthlyIncome": 2300000,
  "goodSpendings": [
    { "type": "savings", "label": "적금", "amount": 300000 }
  ],
  "fixedExpenses": {
    "rent": 700000,
    "utilities": 100000,
    "phone": 55000
  }
}
```

---

## 5. 페이스메이커 (Pacemaker)

### GET `/pacemaker/today` — 오늘의 페이스메이커 메시지 (인증 필요)

오늘 메시지가 없으면 AI로 생성 후 반환. 이미 있으면 캐시된 메시지 반환.

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2026-04-02",
    "message": "야 하루에 34,833원인데 어제 배달만 2번이잖아 ㅋㅋ 오늘은 도시락 싸가자",
    "grade": "YELLOW",
    "dailySurplus": 34833,
    "actions": [
      {
        "type": "learn_content",
        "id": "uuid",
        "title": "배달비 월 30만 원 = 1년 360만 원",
        "label": "이거 읽어봐 →"
      }
    ],
    "createdAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### POST `/pacemaker/quiz/:quizId/answer` — 퀴즈 답변 (인증 필요)

**Request**

```json
{ "userAnswer": 2 }
```

### POST `/pacemaker/feedback` — 메시지 피드백 (인증 필요)

**Request**

```json
{ "messageId": "uuid", "type": "like|dislike|report", "content": "피드백 내용" }
```

### GET `/pacemaker/daily-checks` — 일일 체크 조회 (인증 필요)

**Query:** `?month=2026-04`

### GET `/pacemaker/weekly-summary` — 주간 요약 (인증 필요)

**Query:** `?date=2026-04-07`

### POST `/pacemaker/daily-check` — 일일 체크 제출 (인증 필요)

**Request**

```json
{ "date": "2026-04-07", "status": "under|over|skip", "amount": 30000 }
```

### GET `/pacemaker/monthly-finalize-status` — 월간 확정 상태 (인증 필요)

### POST `/pacemaker/monthly-finalize` — 월간 확정 (인증 필요)

**Request**

```json
{ "month": "2026-03" }
```

### POST `/pacemaker/monthly-finalize/cancel` — 월간 확정 취소 (인증 필요)

**Request**

```json
{ "month": "2026-03" }
```

---

## 6. 마이북 (Book)

### 오답노트

#### GET `/book/wrong-notes` — 오답노트 목록 (인증 필요)

### 상세 리포트

#### GET `/book/detailed-reports` — 상세 리포트 목록 (인증 필요)

```json
{
  "success": true,
  "data": {
    "canGenerate": true,
    "nextAvailableDate": null,
    "items": [
      {
        "id": "uuid",
        "title": "4월 재무 분석 리포트",
        "summary": "잉여자금 104만 원, 하루 3.5만 원...",
        "createdAt": "2026-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET `/book/detailed-reports/:id` — 상세 리포트 상세 (인증 필요)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "4월 재무 분석 리포트",
    "content": "마크다운 본문...",
    "grade": "YELLOW",
    "surplus": { "monthly": 1045000, "daily": 34833 },
    "analysis": {
      "wellDone": "적금과 연금저축을 꾸준히 하고 있어요.",
      "improvement": "고정 소비 중 통신비를 줄일 수 있어요.",
      "actionPlan": "알뜰 요금제 전환 시 월 2만 원 절약 가능"
    },
    "createdAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### 월간 리포트

#### GET `/book/monthly-reports` — 월간 리포트 목록 (인증 필요)

#### GET `/book/monthly-reports/:id` — 월간 리포트 상세 (인증 필요)

#### GET `/book/monthly-reports/proposals` — 월간 리포트 제안 항목 (인증 필요)

#### POST `/book/monthly-reports` — 월간 리포트 생성 (인증 필요)

### 학습 콘텐츠

#### GET `/book/learn` — 금융 학습 콘텐츠 목록 (인증 필요)

**Query:** `?grade=RED` (선택)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "비상금 없으면 진짜 거지 됩니다",
      "grade": "RED",
      "isRead": false,
      "isScrapped": false,
      "readMinutes": 1
    }
  ]
}
```

#### GET `/book/learn/:id` — 콘텐츠 상세 (인증 필요, 조회 시 자동 읽음 처리)

#### POST `/book/learn/:id/scrap` — 스크랩 토글 (인증 필요)

### 스크랩

#### GET `/book/scraps` — 내 스크랩 목록 (인증 필요)

#### POST `/book/scraps` — 외부 스크랩 추가 (인증 필요)

**Request**

```json
{ "url": "https://example.com/article" }
```

#### DELETE `/book/scraps/:id` — 스크랩 삭제 (인증 필요)

---

## 7. 통계 (Statistics)

### GET `/statistics/peers` — 또래 통계 비교 (인증 불필요)

**Query:** `?age=27&monthlyIncome=2300000`

---

## 8. 운영 상수 (Constants)

### GET `/constants` — 운영 상수 조회 (인증 불필요)

앱 시작 시 1회 호출.

```json
{
  "success": true,
  "data": {
    "seoulAverageRent": 730000,
    "categoryAverages": {
      "food": 420000,
      "transport": 80000,
      "subscription": 50000,
      "shopping": 150000,
      "leisure": 220000,
      "etc": 100000
    },
    "inflationRate": 0.025,
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## 9. 어드민 (Admin)

### GET `/admin/users` — 유저 목록 (어드민 전용)

**Query:** `?page=1&limit=20`

### GET `/admin/quizzes` — 퀴즈 목록 (어드민 전용)

### PATCH `/admin/constants/:key` — 운영 상수 수정 (어드민 전용)

**Request**

```json
{ "value": "새로운 값" }
```

---

## API 엔드포인트 전체 목록 (프론트엔드 실사용 기준)

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| POST | `/auth/kakao` | X | 로그인/회원가입 |
| POST | `/auth/onboarding` | O | 온보딩 데이터 저장 |
| GET | `/users/me` | O | 내 정보 조회 |
| GET | `/finance/profile` | O | 재무 프로필 + 잉여자금 |
| PATCH | `/finance/profile` | O | 재무 프로필 수정 |
| POST | `/simulation/calculate` | X | 시뮬레이션 계산 |
| GET | `/pacemaker/today` | O | 오늘의 메시지 |
| POST | `/pacemaker/quiz/:quizId/answer` | O | 퀴즈 답변 |
| POST | `/pacemaker/feedback` | O | 메시지 피드백 |
| GET | `/pacemaker/daily-checks` | O | 일일 체크 조회 |
| GET | `/pacemaker/weekly-summary` | O | 주간 요약 |
| POST | `/pacemaker/daily-check` | O | 일일 체크 제출 |
| GET | `/pacemaker/monthly-finalize-status` | O | 월간 확정 상태 |
| POST | `/pacemaker/monthly-finalize` | O | 월간 확정 |
| POST | `/pacemaker/monthly-finalize/cancel` | O | 월간 확정 취소 |
| GET | `/book/wrong-notes` | O | 오답노트 |
| GET | `/book/detailed-reports` | O | 상세 리포트 목록 |
| GET | `/book/detailed-reports/:id` | O | 상세 리포트 상세 |
| GET | `/book/monthly-reports` | O | 월간 리포트 목록 |
| GET | `/book/monthly-reports/:id` | O | 월간 리포트 상세 |
| GET | `/book/monthly-reports/proposals` | O | 월간 리포트 제안 |
| POST | `/book/monthly-reports` | O | 월간 리포트 생성 |
| GET | `/book/learn` | O | 학습 콘텐츠 목록 |
| GET | `/book/learn/:id` | O | 학습 콘텐츠 상세 |
| POST | `/book/learn/:id/scrap` | O | 스크랩 토글 |
| GET | `/book/scraps` | O | 내 스크랩 목록 |
| POST | `/book/scraps` | O | 외부 스크랩 추가 |
| DELETE | `/book/scraps/:id` | O | 스크랩 삭제 |
| GET | `/statistics/peers` | X | 또래 통계 비교 |
| GET | `/constants` | X | 운영 상수 |
| GET | `/admin/users` | O | 어드민 유저 목록 |
| GET | `/admin/quizzes` | O | 어드민 퀴즈 목록 |
| PATCH | `/admin/constants/:key` | O | 어드민 상수 수정 |

**총 33개 엔드포인트** (인증 필요: 29개, 비로그인: 4개)

---

*머니런 API 통합 명세서 v3.0 — 2026.04.08*
