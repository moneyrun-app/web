'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useFinanceStore } from '@/store/financeStore';
import {
  useFinanceProfile,
  useUpdateFinanceProfile,
  useAttendanceStreak,
  useAttendanceHistory,
  usePacemakerToday,
  useActiveCourse,
} from '@/hooks/useApi';
import GradeBadge from '@/components/common/GradeBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { api } from '@/lib/api';
import { formatWon } from '@/lib/format';
import { Pencil, Save, X, Loader2, Flame, Award, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const levelCharacters: Record<number, { emoji: string; name: string }> = {
  1: { emoji: '🌱', name: '새싹' },
  2: { emoji: '🌿', name: '풀잎' },
  3: { emoji: '🌳', name: '나무' },
  4: { emoji: '💎', name: '다이아' },
  5: { emoji: '🏆', name: '챔피언' },
};

export default function MyPage() {
  const router = useRouter();
  const userNickname = useUserStore((s) => s.nickname);
  const storeFinance = useFinanceStore();
  const { data: profile } = useFinanceProfile();
  const updateProfile = useUpdateFinanceProfile();
  const { data: streak } = useAttendanceStreak();
  const { data: pacemaker } = usePacemakerToday();
  const { data: activeCourse } = useActiveCourse();

  const now = new Date();
  const [calMonth, setCalMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const { data: history } = useAttendanceHistory(calMonth);

  const [isEditing, setIsEditing] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      useFinanceStore.getState().setProfile(profile);
    }
  }, [profile]);

  const fin = profile ?? storeFinance;

  const [editNickname, setEditNickname] = useState(fin.nickname || userNickname || '');
  const [editAge, setEditAge] = useState(fin.age);
  const [editRetirementAge, setEditRetirementAge] = useState(fin.retirementAge);
  const [editPensionStartAge, setEditPensionStartAge] = useState(fin.pensionStartAge);
  const [editIncome, setEditIncome] = useState(fin.monthlyIncome);
  const [editInvestment, setEditInvestment] = useState(fin.monthlyInvestment);
  const [editFixed, setEditFixed] = useState(fin.monthlyFixedCost);
  const [editVariable, setEditVariable] = useState(fin.monthlyVariableCost);

  const syncEditState = () => {
    setEditNickname(fin.nickname || userNickname || '');
    setEditAge(fin.age);
    setEditRetirementAge(fin.retirementAge);
    setEditPensionStartAge(fin.pensionStartAge);
    setEditIncome(fin.monthlyIncome);
    setEditInvestment(fin.monthlyInvestment);
    setEditFixed(fin.monthlyFixedCost);
    setEditVariable(fin.monthlyVariableCost);
  };

  useEffect(() => {
    syncEditState();
  }, [fin.nickname, fin.age, fin.retirementAge, fin.pensionStartAge, fin.monthlyIncome, fin.monthlyInvestment, fin.monthlyFixedCost, fin.monthlyVariableCost, userNickname]);

  const quizLevel = pacemaker?.todayQuiz?.difficultyLevel ?? 1;
  const character = levelCharacters[quizLevel] ?? levelCharacters[1];
  const quizCount = streak?.totalDays ?? 0;
  const badgeCount = streak?.badges.length ?? 0;

  const handleEdit = () => {
    syncEditState();
    setIsEditing(true);
  };

  const handleCancel = () => {
    syncEditState();
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile.mutate({
      nickname: editNickname,
      age: editAge,
      retirementAge: editRetirementAge,
      pensionStartAge: editPensionStartAge,
      monthlyIncome: editIncome,
      monthlyInvestment: editInvestment,
      monthlyFixedCost: editFixed,
      monthlyVariableCost: editVariable,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        setShowReportDialog(true);
      },
    });
  };

  const handleGenerateReport = () => {
    setShowReportDialog(false);
    api.post('/book/detailed-reports/generate').catch(() => {});
  };

  const handleNumChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setter(parseInt(raw, 10) || 0);
  };

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const infoItems = [
    { label: '나이', value: `${fin.age}세` },
    { label: '은퇴 나이', value: `${fin.retirementAge}세` },
    { label: '수령 나이', value: `${fin.pensionStartAge}세` },
    { label: '월 실수령', value: formatWon(fin.monthlyIncome) },
    { label: '월 투자액', value: formatWon(fin.monthlyInvestment) },
    { label: '월 고정비', value: formatWon(fin.monthlyFixedCost) },
    { label: '월 변동비', value: formatWon(fin.monthlyVariableCost) },
  ];

  return (
    <div className="space-y-6">
      {/* 프로필 카드 */}
      <div className="bg-background border border-border rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-3xl">
            {character.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{fin.nickname || userNickname || '유저'}</h1>
              <GradeBadge grade={fin.grade} />
            </div>
            <p className="text-xs text-sub">Lv.{quizLevel} {character.name}</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-xs text-sub mb-0.5">퀴즈</p>
            <p className="text-lg font-bold">{quizCount}<span className="text-xs font-normal text-sub">문제</span></p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-xs text-sub mb-0.5">레벨</p>
            <p className="text-lg font-bold">Lv.{quizLevel}</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-xs text-sub mb-0.5">뱃지</p>
            <p className="text-lg font-bold">{badgeCount}<span className="text-xs font-normal text-sub">개</span></p>
          </div>
        </div>

        {/* 내 정보 — 읽기 모드 */}
        <div className="bg-surface rounded-xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold">내 정보</span>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-3xs text-accent hover:opacity-80 transition-opacity"
            >
              <Pencil size={11} />
              수정
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {infoItems.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sub">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {profile?.isStale && (
          <div className="mt-3 bg-grade-yellow-bg border border-grade-yellow rounded-xl p-2.5 text-xs text-grade-yellow-text">
            정보가 오래됐어요. 수정 버튼을 눌러 업데이트해주세요!
          </div>
        )}
      </div>

      {/* 현재 코스 */}
      {activeCourse && (
        <button
          onClick={() => router.push('/course/missions')}
          className="w-full text-left bg-background border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-accent" />
            <span className="text-sm font-bold text-foreground">현재 코스</span>
          </div>
          <p className="text-sm font-medium text-foreground mb-2">{activeCourse.title}</p>
          <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${activeCourse.missionSummary.totalMissions > 0 ? (activeCourse.missionSummary.completedMissions / activeCourse.missionSummary.totalMissions) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-sub">
              {activeCourse.currentChapter}/{activeCourse.totalChapters}장 · 미션 {activeCourse.missionSummary.completedMissions}/{activeCourse.missionSummary.totalMissions}개
            </span>
            <span className="text-xs font-medium text-accent">미션 보기 →</span>
          </div>
        </button>
      )}

      {/* 내 정보 수정 — 편집 모드 (별도 카드) */}
      {isEditing && (
        <div className="bg-background border-2 border-accent/30 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold">내 정보 수정</h2>
            <button onClick={handleCancel} className="p-1 text-sub hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* 닉네임 */}
            <div>
              <label htmlFor="edit-nickname" className="block text-xs text-sub mb-1.5">닉네임</label>
              <input
                id="edit-nickname"
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* 2열 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-age" className="block text-xs text-sub mb-1.5">나이</label>
                <div className="relative">
                  <input id="edit-age" type="text" inputMode="numeric" value={editAge || ''} onChange={handleNumChange(setEditAge)}
                    className="w-full h-10 px-3 pr-8 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">세</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-retire" className="block text-xs text-sub mb-1.5">은퇴 나이</label>
                <div className="relative">
                  <input id="edit-retire" type="text" inputMode="numeric" value={editRetirementAge || ''} onChange={handleNumChange(setEditRetirementAge)}
                    className="w-full h-10 px-3 pr-8 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">세</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-pension" className="block text-xs text-sub mb-1.5">수령 나이</label>
                <div className="relative">
                  <input id="edit-pension" type="text" inputMode="numeric" value={editPensionStartAge || ''} onChange={handleNumChange(setEditPensionStartAge)}
                    className="w-full h-10 px-3 pr-8 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">세</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-income" className="block text-xs text-sub mb-1.5">월 실수령</label>
                <div className="relative">
                  <input id="edit-income" type="text" inputMode="numeric" value={editIncome ? editIncome / 10000 : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditIncome(Math.round((parseInt(raw, 10) || 0) * 10000)); }}
                    className="w-full h-10 px-3 pr-12 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">만원</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-invest" className="block text-xs text-sub mb-1.5">월 투자액</label>
                <div className="relative">
                  <input id="edit-invest" type="text" inputMode="numeric" value={editInvestment ? editInvestment / 10000 : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditInvestment(Math.round((parseInt(raw, 10) || 0) * 10000)); }}
                    className="w-full h-10 px-3 pr-12 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">만원</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-fixed" className="block text-xs text-sub mb-1.5">월 고정비</label>
                <div className="relative">
                  <input id="edit-fixed" type="text" inputMode="numeric" value={editFixed ? editFixed / 10000 : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditFixed(Math.round((parseInt(raw, 10) || 0) * 10000)); }}
                    className="w-full h-10 px-3 pr-12 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">만원</span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-variable" className="block text-xs text-sub mb-1.5">월 변동비</label>
                <div className="relative">
                  <input id="edit-variable" type="text" inputMode="numeric" value={editVariable ? editVariable / 10000 : ''} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditVariable(Math.round((parseInt(raw, 10) || 0) * 10000)); }}
                    className="w-full h-10 px-3 pr-12 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-accent transition-colors" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">만원</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full mt-5 h-11 flex items-center justify-center gap-1.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            저장하기
          </button>
        </div>
      )}

      {/* 뱃지 모음 */}
      {streak && streak.badges.length > 0 && (
        <div className="bg-background border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-yellow-500" />
            <h2 className="text-sm font-semibold">뱃지 모음</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {streak.badges.map((badge) => (
              <div key={badge.code} className="text-center p-2 rounded-xl bg-surface">
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-3xs font-medium mt-1">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 출석 현황 */}
      {streak && (
        <div className="bg-background border border-border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-orange-500" />
            <h2 className="text-sm font-semibold">출석 현황</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-sub">연속</p>
              <p className="text-xl font-bold">{streak.currentStreak}일</p>
            </div>
            <div className="bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-sub">누적</p>
              <p className="text-xl font-bold">{streak.totalDays}일</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigateMonth(-1)} className="p-1 text-sub hover:text-foreground"><ChevronLeft size={16} /></button>
            <span className="text-xs font-medium">{calMonth}</span>
            <button onClick={() => navigateMonth(1)} className="p-1 text-sub hover:text-foreground"><ChevronRight size={16} /></button>
          </div>
          {history && (
            <div className="grid grid-cols-7 gap-1">
              {['월','화','수','목','금','토','일'].map((d) => (
                <div key={d} className="text-center text-3xs text-sub py-1">{d}</div>
              ))}
              {(() => {
                const [y, m] = calMonth.split('-').map(Number);
                const firstDay = (new Date(y, m - 1, 1).getDay() + 6) % 7;
                const daysInMonth = new Date(y, m, 0).getDate();
                const cells = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateStr = `${calMonth}-${String(d).padStart(2, '0')}`;
                  const checked = history.records.some((r) => r.date === dateStr);
                  cells.push(
                    <div key={d} className={`text-center text-3xs py-1 rounded ${
                      checked ? 'bg-green-100 dark:bg-green-900/30 text-green-700 font-semibold' : ''
                    }`}>
                      {d}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          )}
        </div>
      )}

      {/* 풋터 */}
      <footer className="text-center py-4 space-y-4">
        <button
          role="switch"
          aria-checked={false}
          aria-disabled="true"
          aria-label="마케팅 수신 동의 (준비 중)"
          className="inline-flex items-center gap-2 text-xs text-placeholder hover:text-sub transition-colors cursor-not-allowed"
        >
          <span className="w-8 h-[18px] rounded-full bg-disabled relative inline-block">
            <span className="absolute left-0.5 top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow transition-transform" />
          </span>
          마케팅 수신 동의
        </button>
        <div>
          <button className="text-xs text-placeholder hover:text-grade-red transition-colors">
            회원 탈퇴
          </button>
        </div>
      </footer>

      {/* 리포트 생성 알럿 */}
      <ConfirmDialog
        open={showReportDialog}
        title="정보가 변경되었어요"
        description="변경된 정보로 새 상세 리포트를 생성할까요?"
        confirmText="리포트 생성"
        cancelText="나중에"
        onConfirm={handleGenerateReport}
        onCancel={() => setShowReportDialog(false)}
      />
    </div>
  );
}
