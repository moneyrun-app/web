'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Markdown from '@/components/common/Markdown';
import { formatWon } from '@/lib/format';
import type { MonthlyReportV2, Badge, QuizItem, WrongNoteItem } from '@/types/monthly-report-v2';

// ─── Helpers ───

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-background border border-border rounded-2xl p-4 md:p-5 ${className}`}>{children}</div>;
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
  );
}

function ChangeBadge({ value, suffix = '%', inverted = false }: { value: number | null; suffix?: string; inverted?: boolean }) {
  if (value === null) return <span className="text-xs text-sub px-2 py-0.5 bg-surface rounded-full">첫 달</span>;
  // inverted: 감소가 좋은 경우 (지출)
  const isGood = inverted ? value < 0 : value > 0;
  const isUp = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
      isGood ? 'bg-grade-green-bg text-grade-green-text' : 'bg-grade-red-bg text-grade-red-text'
    }`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isUp ? '+' : ''}{value}{suffix}
    </span>
  );
}

function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`h-2.5 bg-surface rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Spending Block ───

function SpendingBlock({ data }: { data: MonthlyReportV2['sections']['spending'] }) {
  const donutData = [
    { name: '고정비', value: data.fixedRatio, color: '#6366f1' },
    { name: '변동비', value: data.variableRatio, color: '#f59e0b' },
    { name: '잉여', value: data.surplusRatio, color: '#10b981' },
  ];

  return (
    <div className="space-y-3">
      <SectionHeader title="소비 돌아보기" icon="💸" />

      {/* 도넛 차트 + 비율 */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                  {donutData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-sub">{d.name}</span>
                <span className="text-xs font-semibold ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-sub">고정비</p>
            <p className="text-sm font-semibold">{formatWon(data.fixedCost)}</p>
          </div>
          <div>
            <p className="text-xs text-sub">변동비</p>
            <p className="text-sm font-semibold">{formatWon(data.variableCost)}</p>
          </div>
          <div>
            <p className="text-xs text-sub">잉여</p>
            <p className="text-sm font-semibold text-grade-green-text">{formatWon(data.surplus)}</p>
          </div>
        </div>
      </Card>

      {/* 증감률 */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-sub mb-1">총 지출</p>
            <p className="text-base font-bold">{formatWon(data.totalSpent)}</p>
            <div className="mt-1">
              <ChangeBadge value={data.spendingChangeRate} inverted />
            </div>
          </div>
          <div>
            <p className="text-xs text-sub mb-1">절약액</p>
            <p className="text-base font-bold text-grade-green-text">{formatWon(data.surplus)}</p>
            <div className="mt-1">
              <ChangeBadge value={data.savingsChangeRate} />
            </div>
          </div>
        </div>
      </Card>

      {/* 또래 비교 */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-sub">{data.peerAgeGroup} 또래 중</p>
            <p className="text-lg font-bold text-accent">상위 {data.peerPercentile}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-sub">또래 평균 잉여율</p>
            <p className="text-sm font-semibold">{data.peerAvgSurplusRatio}%</p>
          </div>
        </div>
      </Card>

      {/* 소비 습관 통계 */}
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-sub mb-0.5">절약일</p>
            <p className="text-lg font-bold text-grade-green-text">{data.daysUnder}일</p>
          </div>
          <div>
            <p className="text-xs text-sub mb-0.5">과소비일</p>
            <p className="text-lg font-bold text-grade-red-text">{data.daysOver}일</p>
          </div>
          <div>
            <p className="text-xs text-sub mb-0.5">무지출</p>
            <p className="text-lg font-bold text-accent">{data.noSpendDays}일</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-sub">최고 연속 절약</span>
          <span className="text-sm font-semibold">{data.bestStreak}일</span>
        </div>
      </Card>

      {/* AI 서술 */}
      <Card>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
          <Markdown>{data.ai_narrative}</Markdown>
        </div>
      </Card>
    </div>
  );
}

// ─── Proposals Block ───

function ProposalsBlock({ data }: { data: MonthlyReportV2['sections']['proposals'] }) {
  return (
    <div className="space-y-3">
      <SectionHeader title="제안 이행 체크" icon="✅" />

      {/* 이행률 */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">이행률</span>
          <span className="text-lg font-bold text-accent">{data.completionRate}%</span>
        </div>
        <ProgressBar value={data.completionRate} />
      </Card>

      {/* 체크리스트 결과 */}
      <Card>
        <p className="text-xs text-sub mb-3">상세 리포트 제안</p>
        <div className="space-y-2">
          {data.items.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${
              item.checked ? 'bg-grade-green-bg/50' : 'bg-grade-red-bg/30'
            }`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                item.checked ? 'bg-grade-green-text' : 'bg-grade-red-text'
              }`}>
                {item.checked ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
              </div>
              <span className="text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 페이스메이커 액션 */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-sub">페이스메이커 액션</span>
          <span className="text-sm font-semibold">{data.pacemakerActionCompleted}/{data.pacemakerActionTotal}</span>
        </div>
        <ProgressBar value={data.pacemakerActionRate} />
      </Card>

      {/* AI 서술 */}
      <Card>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
          <Markdown>{data.ai_narrative}</Markdown>
        </div>
      </Card>
    </div>
  );
}

// ─── Goals Block ───

function BadgeCard({ badge }: { badge: Badge }) {
  const earned = badge.earned;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
      earned ? 'border-accent bg-accent/5' : 'border-border opacity-60'
    }`}>
      <span className="text-2xl">{badge.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{badge.name}</p>
        <p className="text-xs text-sub">{badge.description}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
        earned ? 'bg-accent text-white' : 'bg-surface text-sub'
      }`}>
        {badge.progress}
      </span>
    </div>
  );
}

function GoalsBlock({ data }: { data: MonthlyReportV2['sections']['goals'] }) {
  const earned = data.badges.filter((b) => b.earned);
  const notEarned = data.badges.filter((b) => !b.earned);

  return (
    <div className="space-y-3">
      <SectionHeader title="목표 & 배지" icon="🎯" />

      {/* AI 서술 (챌린지 + 내러티브) */}
      <Card>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
          <Markdown>{data.ai_narrative}</Markdown>
        </div>
      </Card>

      {/* 획득 배지 */}
      {earned.length > 0 && (
        <Card>
          <p className="text-xs text-sub mb-3">획득한 배지</p>
          <div className="space-y-2">
            {earned.map((b) => <BadgeCard key={b.code} badge={b} />)}
          </div>
        </Card>
      )}

      {/* 미획득 배지 */}
      {notEarned.length > 0 && (
        <Card>
          <p className="text-xs text-sub mb-3">도전 중인 배지</p>
          <div className="space-y-2">
            {notEarned.map((b) => <BadgeCard key={b.code} badge={b} />)}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Learning Block ───

function QuizItemRow({ quiz }: { quiz: QuizItem }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      quiz.correct ? 'bg-grade-green-bg/30' : 'bg-grade-red-bg/30'
    }`}>
      <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold ${
        quiz.correct ? 'bg-grade-green-text' : 'bg-grade-red-text'
      }`}>
        {quiz.correct ? 'O' : 'X'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{quiz.question}</p>
        <span className="text-xs text-sub">{quiz.category}</span>
      </div>
    </div>
  );
}

function WrongNoteAccordion({ note }: { note: WrongNoteItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface/50 transition-colors"
      >
        <span className="w-5 h-5 rounded-md bg-grade-red-text flex items-center justify-center shrink-0 text-white text-xs font-bold">X</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm">{note.question}</p>
          <p className="text-xs text-sub mt-0.5">{note.briefExplanation}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-sub shrink-0" /> : <ChevronDown size={16} className="text-sub shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-border">
          <div className="flex gap-2 my-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-grade-red-bg text-grade-red-text">
              내 답: {note.choices[note.userAnswer - 1]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-grade-green-bg text-grade-green-text">
              정답: {note.choices[note.correctAnswer - 1]}
            </span>
          </div>
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80">
            <Markdown>{note.detailedExplanation}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

function LearningBlock({ data }: { data: MonthlyReportV2['sections']['learning'] }) {
  return (
    <div className="space-y-3">
      <SectionHeader title="학습 현황" icon="📚" />

      {/* FQ 점수 */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-sub">FQ 점수</p>
            <p className="text-3xl font-bold text-accent">{data.fqScore}<span className="text-base font-normal text-sub">점</span></p>
          </div>
          <div className="text-right">
            <ChangeBadge value={data.fqChange} suffix="점" />
            {data.prevFqScore !== null && (
              <p className="text-xs text-sub mt-1">전월 {data.prevFqScore}점</p>
            )}
          </div>
        </div>
        {/* 간이 게이지 */}
        <div className="mt-3">
          <div className="h-3 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${data.fqScore}%`,
                background: `linear-gradient(90deg, #f59e0b, #10b981)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-sub">0</span>
            <span className="text-xs text-sub">100</span>
          </div>
        </div>
      </Card>

      {/* 퀴즈 통계 */}
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-sub mb-0.5">총 퀴즈</p>
            <p className="text-lg font-bold">{data.totalQuizzes}</p>
          </div>
          <div>
            <p className="text-xs text-sub mb-0.5">정답률</p>
            <p className="text-lg font-bold text-grade-green-text">{data.correctRate}%</p>
          </div>
          <div>
            <p className="text-xs text-sub mb-0.5">학습시간</p>
            <p className="text-lg font-bold">{data.totalStudyMinutes}분</p>
          </div>
        </div>
      </Card>

      {/* 카테고리 태그 */}
      <Card>
        <p className="text-xs text-sub mb-2">학습 분야</p>
        <div className="flex flex-wrap gap-2">
          {data.topCategories.map((cat) => (
            <span key={cat} className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">{cat}</span>
          ))}
        </div>
      </Card>

      {/* 퀴즈 리스트 (오답 상단) */}
      <Card>
        <p className="text-xs text-sub mb-3">퀴즈 결과</p>
        <div className="space-y-2">
          {data.quizList.map((q) => <QuizItemRow key={q.quizId} quiz={q} />)}
        </div>
      </Card>

      {/* 오답노트 아코디언 */}
      {data.wrongNotes.length > 0 && (
        <div>
          <p className="text-xs text-sub mb-2">오답노트</p>
          <div className="space-y-2">
            {data.wrongNotes.map((n) => <WrongNoteAccordion key={n.quizId} note={n} />)}
          </div>
        </div>
      )}

      {/* AI 서술 */}
      <Card>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
          <Markdown>{data.ai_narrative}</Markdown>
        </div>
      </Card>
    </div>
  );
}

// ─── Rewards Block ───

function RewardsBlock({ data }: { data: MonthlyReportV2['sections']['rewards'] }) {
  return (
    <div className="space-y-3">
      <SectionHeader title="배지 & 보상" icon="🏆" />

      {/* 획득 배지 */}
      {data.earnedBadges.length > 0 && (
        <Card>
          <p className="text-xs text-sub mb-3">이번 달 획득 배지</p>
          <div className="grid grid-cols-3 gap-3">
            {data.earnedBadges.map((b) => (
              <div key={b.code} className="text-center p-3 bg-accent/5 rounded-xl border border-accent/20">
                <span className="text-3xl block mb-1">{b.icon}</span>
                <p className="text-xs font-semibold">{b.name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 레벨업 오답 키트 */}
      {data.levelUpKit.available && (
        <Card className="border-accent/30 bg-accent/5">
          <p className="text-sm font-semibold mb-1">레벨업 오답 키트</p>
          <p className="text-xs text-sub mb-3">오답 {data.levelUpKit.wrongQuizCount}개를 복습하면 배지를 받을 수 있어요!</p>
          <button className="w-full h-10 rounded-xl text-sm font-semibold bg-accent text-white hover:opacity-90 transition-opacity">
            복습 퀴즈 시작하기
          </button>
        </Card>
      )}

      {/* AI 서술 */}
      <Card>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground">
          <Markdown>{data.ai_narrative}</Markdown>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Component ───

interface Props {
  report: MonthlyReportV2;
  onBack: () => void;
}

export default function MonthlyReportV2Detail({ report, onBack }: Props) {
  const { sections } = report;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} aria-label="돌아가기" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      <h1 className="text-xl md:text-2xl font-bold mb-1">{report.month} 월간 리포트</h1>
      <p className="text-sm text-sub mb-6">{report.summary}</p>

      {/* 유저 입력 요약 */}
      {report.userInput && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-sub">
            체감: {report.userInput.overallFeeling === 'good' ? '😊 여유' : report.userInput.overallFeeling === 'okay' ? '🙂 보통' : report.userInput.overallFeeling === 'tight' ? '😥 빠듯' : '😰 힘듦'}
          </span>
          {report.userInput.memo && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-sub truncate max-w-[200px]">
              {report.userInput.memo}
            </span>
          )}
        </div>
      )}

      {/* 5개 블록 */}
      <SpendingBlock data={sections.spending} />
      <ProposalsBlock data={sections.proposals} />
      <GoalsBlock data={sections.goals} />
      <LearningBlock data={sections.learning} />
      <RewardsBlock data={sections.rewards} />
    </div>
  );
}
