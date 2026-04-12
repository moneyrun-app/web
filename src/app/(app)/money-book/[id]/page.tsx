'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles, BookOpen, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useMoneyBook, usePurchaseBook } from '@/hooks/useApi';

const CATEGORY_STYLES: Record<string, { bg: string; accent: string; label: string }> = {
  tax: { bg: 'from-blue-600 to-blue-800', accent: 'text-blue-400', label: '세금' },
  pension: { bg: 'from-emerald-600 to-emerald-800', accent: 'text-emerald-400', label: '퇴직연금' },
  retirement: { bg: 'from-emerald-600 to-emerald-800', accent: 'text-emerald-400', label: '퇴직연금' },
  realestate: { bg: 'from-amber-600 to-amber-800', accent: 'text-amber-400', label: '부동산' },
  real_estate: { bg: 'from-amber-600 to-amber-800', accent: 'text-amber-400', label: '부동산' },
  stock: { bg: 'from-red-600 to-red-800', accent: 'text-red-400', label: '주식' },
  insurance: { bg: 'from-purple-600 to-purple-800', accent: 'text-purple-400', label: '보험' },
  savings: { bg: 'from-teal-600 to-teal-800', accent: 'text-teal-400', label: '저축' },
  saving: { bg: 'from-teal-600 to-teal-800', accent: 'text-teal-400', label: '저축' },
};

const DEFAULT_STYLE = { bg: 'from-gray-600 to-gray-800', accent: 'text-gray-400', label: '' };

function getCatStyle(category: string) {
  const key = category.toLowerCase().replace(/[\s-]/g, '_');
  const style = CATEGORY_STYLES[key];
  return style ?? { ...DEFAULT_STYLE, label: category };
}

// 카테고리별 CTA 메시지
const CATEGORY_CTA: Record<string, { headline: string; sub: string }> = {
  tax: {
    headline: '내 소득과 가족 상황에 딱 맞는 절세 전략을 AI가 분석해드려요',
    sub: '놓치고 있던 공제 항목을 찾아보세요',
  },
  pension: {
    headline: '내 연금 유형과 적립금에 맞는 최적 전략을 AI가 설계해드려요',
    sub: '퇴직까지 얼마나 더 모을 수 있는지 확인하세요',
  },
  retirement: {
    headline: '내 연금 유형과 적립금에 맞는 최적 전략을 AI가 설계해드려요',
    sub: '퇴직까지 얼마나 더 모을 수 있는지 확인하세요',
  },
  realestate: {
    headline: '내 자산과 소득에 맞는 부동산 전략을 AI가 분석해드려요',
    sub: '지금 시점에서 최선의 선택을 찾아보세요',
  },
  real_estate: {
    headline: '내 자산과 소득에 맞는 부동산 전략을 AI가 분석해드려요',
    sub: '지금 시점에서 최선의 선택을 찾아보세요',
  },
  stock: {
    headline: '내 투자 성향과 자금에 맞는 포트폴리오를 AI가 설계해드려요',
    sub: '리스크를 줄이면서 수익을 높이는 전략을 확인하세요',
  },
  insurance: {
    headline: '내 나이와 상황에 맞는 보험 포트폴리오를 AI가 점검해드려요',
    sub: '과잉 보장은 줄이고 빠진 보장은 찾아보세요',
  },
  savings: {
    headline: '내 소득과 지출 패턴에 맞는 저축 전략을 AI가 만들어드려요',
    sub: '목표 금액까지 가장 빠른 루트를 설계해드려요',
  },
  saving: {
    headline: '내 소득과 지출 패턴에 맞는 저축 전략을 AI가 만들어드려요',
    sub: '목표 금액까지 가장 빠른 루트를 설계해드려요',
  },
};

const DEFAULT_CTA = {
  headline: '내 상황에 맞는 맞춤 콘텐츠를 AI가 생성해드려요',
  sub: '간단한 정보만 입력하면 나만의 책이 완성돼요',
};

export default function MoneyBookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading } = useMoneyBook(id);
  const purchase = usePurchaseBook();
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-52 bg-surface rounded-2xl" />
        <div className="h-6 w-2/3 bg-surface rounded-lg" />
        <div className="h-40 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-sub mb-4">책을 찾을 수 없어요</p>
        <button onClick={() => router.back()} className="h-10 px-6 text-sm font-medium rounded-xl border border-border hover:bg-surface transition-colors">
          돌아가기
        </button>
      </div>
    );
  }

  const catStyle = getCatStyle(book.category);
  const catKey = book.category.toLowerCase().replace(/[\s-]/g, '_');
  const cta = CATEGORY_CTA[catKey
  ] ?? DEFAULT_CTA;

  const handleFieldChange = (key: string, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = book.requiredFields
    .filter((f) => f.required)
    .every((f) => formValues[f.key] !== undefined && formValues[f.key] !== '');

  const handlePurchase = () => {
    purchase.mutate({ bookId: id, extraData: formValues }, {
      onSuccess: (res) => {
        router.push(`/my-book/books/${res.purchaseId}`);
      },
    });
  };

  // 이미 구매한 경우
  if (book.isPurchased) {
    return (
      <div>
        <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 mb-3 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${catStyle.bg} p-5 mb-5`}>
          <div className="relative z-10">
            <span className="text-white/60 text-xs">{catStyle.label}</span>
            <h1 className="text-xl font-bold text-white mt-1">{book.title}</h1>
            <p className="text-white/70 text-sm mt-2">{book.description}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/my-book/books/${book.purchaseId}`)}
          className="w-full h-12 bg-foreground text-background text-sm font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <BookOpen size={16} /> 마이북에서 읽기
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => router.back()} aria-label="돌아가기" className="p-1.5 -ml-1.5 mb-3 rounded-lg hover:bg-surface transition-colors">
        <ArrowLeft size={20} />
      </button>

      {/* 히어로 커버 */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${catStyle.bg} p-5 mb-5`}>
        {book.coverImageUrl && (
          <>
            <img src={book.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        )}
        <div className="relative z-10">
          <span className="text-white/60 text-xs">{catStyle.label}</span>
          <h1 className="text-xl font-bold text-white mt-1">{book.title}</h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">{book.description}</p>
        </div>
      </div>

      {/* AI CTA 카드 */}
      <div className="bg-gradient-to-r from-surface to-background border border-border rounded-2xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={18} className="text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-snug">{cta.headline}</p>
            <p className="text-xs text-sub mt-1">{cta.sub}</p>
          </div>
        </div>
      </div>

      {/* 목차 미리보기 */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <BookOpen size={14} /> 이런 내용을 다뤄요
        </h2>
        <div className="space-y-0 border border-border rounded-xl overflow-hidden">
          {book.chapters.map((ch, idx) => (
            <div
              key={ch.order ?? ch.chapterOrder ?? idx}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
            >
              <span className={`text-xs font-bold ${catStyle.accent} shrink-0 w-5 text-center`}>
                {ch.order ?? ch.chapterOrder ?? idx + 1}
              </span>
              <p className="text-sm text-foreground flex-1">{ch.title}</p>
              <Lock size={12} className="text-disabled shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 구매 섹션 */}
      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* 헤더 - 토글 */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <Sparkles size={18} className="text-background" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">나만의 맞춤 책 만들기</p>
              <p className="text-xs text-sub mt-0.5">간단한 정보 입력 → AI가 분석 → 맞춤 콘텐츠 생성</p>
            </div>
          </div>
          {showForm ? <ChevronUp size={18} className="text-sub" /> : <ChevronDown size={18} className="text-sub" />}
        </button>

        {/* 폼 */}
        {showForm && (
          <div className="px-4 pb-4 border-t border-border">
            <p className="text-xs text-sub mt-3 mb-4">
              아래 정보를 입력하면 AI가 내 상황에 맞는 개인화된 콘텐츠를 생성해요.
            </p>

            <div className="space-y-3 mb-5">
              {book.requiredFields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formValues[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    >
                      <option value="">{field.placeholder || '선택해주세요'}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          formValues[field.key] != null && formValues[field.key] !== ''
                            ? Number(formValues[field.key]).toLocaleString()
                            : ''
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          if (raw === '') {
                            handleFieldChange(field.key, '');
                            return;
                          }
                          let num = parseInt(raw, 10);
                          if (field.max != null && num > field.max) num = field.max;
                          handleFieldChange(field.key, num);
                        }}
                        placeholder={field.placeholder}
                        className={`w-full h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-foreground/20 ${field.unit ? 'pr-12' : ''}`}
                      />
                      {field.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sub">{field.unit}</span>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formValues[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={!isFormValid || purchase.isPending}
              className="w-full h-12 bg-foreground text-background text-sm font-bold rounded-xl disabled:opacity-30 flex items-center justify-center gap-2 transition-opacity"
            >
              {purchase.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI가 분석 중이에요...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  나만의 책 만들기
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
