'use client';

import { useState } from 'react';
import {
  useAdminBooks,
  useAdminBookDetail,
  useCreateAdminBook,
  useUpdateAdminBook,
  useDeleteAdminBook,
  useUpdateAdminChapters,
} from '@/hooks/useApi';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  Loader2, X, GripVertical, BookOpen,
} from 'lucide-react';
import type {
  AdminRequiredField, CreateBookRequest, AdminBookChapter,
} from '@/types/api';
import { getCategoryLabel } from '@/lib/category';

const CATEGORIES = ['tax', 'retirement', 'real_estate', 'stock', 'insurance', 'saving'];
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c, getCategoryLabel(c)]));

// === 책 생성/수정 폼 ===
function BookFormDialog({
  open,
  initial,
  onSave,
  onClose,
  isPending,
}: {
  open: boolean;
  initial?: { id: string; title: string; description: string; category: string; coverImageUrl: string | null; requiredFields?: AdminRequiredField[] };
  onSave: (data: CreateBookRequest) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [fields, setFields] = useState<AdminRequiredField[]>(
    initial?.requiredFields ?? [],
  );

  if (!open) return null;

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { key: '', label: '', type: 'text', required: true },
    ]);
  };

  const updateField = (idx: number, patch: Partial<AdminRequiredField>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSave = title.trim() && description.trim() && fields.every((f) => f.key && f.label);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-12 pb-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg p-5 animate-[slideUp_300ms_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{initial ? '책 수정' : '새 책 등록'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface"><X size={18} /></button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* 기본 정보 */}
          <div>
            <label className="text-xs text-sub mb-1 block">제목 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none" placeholder="2026 연말정산 완전정복" />
          </div>
          <div>
            <label className="text-xs text-sub mb-1 block">설명 *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none resize-none" placeholder="책에 대한 간단한 설명" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-sub mb-1 block">카테고리 *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-sub mb-1 block">커버 이미지 URL</label>
              <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none" placeholder="https://..." />
            </div>
          </div>

          {/* 추가 온보딩 필드 */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">추가 온보딩 필드</p>
              <button onClick={addField} className="text-xs text-accent flex items-center gap-1 hover:underline">
                <Plus size={12} /> 필드 추가
              </button>
            </div>
            {fields.length === 0 && (
              <p className="text-xs text-sub py-2">구매 시 추가로 입력받을 필드가 없습니다.</p>
            )}
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-surface rounded-lg p-2">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <input value={field.key} onChange={(e) => updateField(idx, { key: e.target.value })} placeholder="key (예: annual_income)" className="flex-1 h-8 px-2 bg-background border border-border rounded text-xs focus:outline-none font-mono" />
                      <input value={field.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="라벨 (예: 연소득)" className="flex-1 h-8 px-2 bg-background border border-border rounded text-xs focus:outline-none" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <select value={field.type} onChange={(e) => updateField(idx, { type: e.target.value as AdminRequiredField['type'] })} className="h-8 px-2 bg-background border border-border rounded text-xs focus:outline-none">
                        <option value="number">숫자</option>
                        <option value="text">텍스트</option>
                        <option value="select">선택</option>
                      </select>
                      {field.type === 'select' && (
                        <input
                          value={field.options?.join(', ') ?? ''}
                          onChange={(e) => updateField(idx, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                          placeholder="옵션 (콤마 구분)"
                          className="flex-1 h-8 px-2 bg-background border border-border rounded text-xs focus:outline-none"
                        />
                      )}
                      <input value={field.placeholder ?? ''} onChange={(e) => updateField(idx, { placeholder: e.target.value })} placeholder="placeholder" className="flex-1 h-8 px-2 bg-background border border-border rounded text-xs focus:outline-none" />
                    </div>
                  </div>
                  <button onClick={() => removeField(idx)} className="p-1 text-sub hover:text-red-500 shrink-0 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-sub hover:bg-surface transition-colors">취소</button>
          <button
            onClick={() => onSave({ title: title.trim(), description: description.trim(), category, coverImageUrl: coverImageUrl || undefined, requiredFields: fields })}
            disabled={!canSave || isPending}
            className="flex-1 h-11 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {initial ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

// === 챕터 관리 패널 ===
function ChapterPanel({ bookId, onClose }: { bookId: string; onClose: () => void }) {
  const { data, isLoading } = useAdminBookDetail(bookId);
  const updateChapters = useUpdateAdminChapters();
  const [chapters, setChapters] = useState<{ id?: string; order: number; title: string; promptTemplate: string }[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (data && !initialized) {
    setChapters(data.chapters.map((c) => ({ id: c.id, order: c.order, title: c.title, promptTemplate: c.promptTemplate })));
    setInitialized(true);
  }

  const addChapter = () => {
    const nextOrder = chapters.length + 1;
    setChapters((prev) => [...prev, { order: nextOrder, title: '', promptTemplate: '' }]);
  };

  const updateChapter = (idx: number, patch: Partial<typeof chapters[number]>) => {
    setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeChapter = (idx: number) => {
    setChapters((prev) => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, order: i + 1 })));
  };

  const handleSave = () => {
    updateChapters.mutate(
      { bookId, chapters: chapters.map((c, i) => ({ ...c, order: i + 1 })) },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-8 pb-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl p-5 animate-[slideUp_300ms_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">챕터 관리 — {data?.book.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface"><X size={18} /></button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => (
                <div key={idx} className="bg-surface rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={14} className="text-sub" />
                    <span className="text-xs text-sub font-mono">Ch.{idx + 1}</span>
                    <input
                      value={ch.title}
                      onChange={(e) => updateChapter(idx, { title: e.target.value })}
                      placeholder="챕터 제목"
                      className="flex-1 h-8 px-2 bg-background border border-border rounded text-sm focus:outline-none"
                    />
                    <button onClick={() => removeChapter(idx)} className="p-1 text-sub hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div>
                    <label className="text-[10px] text-sub mb-1 block">프롬프트 템플릿</label>
                    <textarea
                      value={ch.promptTemplate}
                      onChange={(e) => updateChapter(idx, { promptTemplate: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none resize-none font-mono"
                      placeholder="{{nickname}}님의 {{annual_income}} 기준으로..."
                    />
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="text-center text-sub text-sm py-6">아직 챕터가 없습니다.</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <button onClick={addChapter} className="text-xs text-accent flex items-center gap-1 hover:underline">
                <Plus size={12} /> 챕터 추가
              </button>
              <div className="flex gap-3">
                <button onClick={onClose} className="h-10 px-5 rounded-xl border border-border text-sm text-sub hover:bg-surface transition-colors">취소</button>
                <button
                  onClick={handleSave}
                  disabled={updateChapters.isPending || chapters.some((c) => !c.title.trim())}
                  className="h-10 px-5 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {updateChapters.isPending && <Loader2 size={14} className="animate-spin" />}
                  저장하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// === 메인 페이지 ===
export default function AdminMoneyBookPage() {
  const { data, isLoading, error } = useAdminBooks();
  const createBook = useCreateAdminBook();
  const updateBook = useUpdateAdminBook();
  const deleteBook = useDeleteAdminBook();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string; title: string; description: string; category: string;
    coverImageUrl: string | null; requiredFields?: AdminRequiredField[];
  } | null>(null);
  const [chapterBookId, setChapterBookId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-sub">머니북 목록을 불러올 수 없습니다.</div>;
  }

  const books = data?.items ?? [];

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-background border border-border rounded-xl p-4 flex-1">
          <p className="text-sm text-sub">등록된 책</p>
          <p className="text-2xl font-bold">{books.length}권</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="ml-3 h-10 px-4 bg-foreground text-background text-sm font-medium rounded-xl flex items-center gap-2 hover:opacity-90 shrink-0"
        >
          <Plus size={16} /> 새 책 등록
        </button>
      </div>

      {/* 책 목록 */}
      <div className="space-y-2">
        {books.map((book) => {
          const isExpanded = expandedId === book.id;
          return (
            <div key={book.id} className="bg-background border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : book.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface/50 transition-colors"
              >
                <BookOpen size={16} className="text-sub shrink-0" />
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-surface text-sub shrink-0">
                  {CATEGORY_LABELS[book.category] || book.category}
                </span>
                <span className="text-sm font-medium flex-1 truncate">{book.title}</span>
                <span className="text-xs text-sub shrink-0">{book.category}</span>
                {isExpanded ? <ChevronUp size={16} className="text-sub" /> : <ChevronDown size={16} className="text-sub" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-sub mt-3 mb-2">{book.description}</p>

                  {/* 추가 온보딩 필드 */}
                  {(book.requiredFields?.length ?? 0) > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-sub mb-1">추가 온보딩 필드</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(book.requiredFields ?? []).map((f) => (
                          <span key={f.key} className="text-xs bg-surface px-2 py-1 rounded font-mono">
                            {f.label} ({f.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setChapterBookId(book.id)}
                      className="h-9 px-4 text-xs font-medium bg-surface border border-border rounded-lg hover:bg-surface/80 transition-colors"
                    >
                      챕터 관리
                    </button>
                    <button
                      onClick={() => { setEditTarget(book); setShowForm(true); }}
                      className="h-9 px-3 text-xs font-medium bg-surface border border-border rounded-lg hover:bg-surface/80 transition-colors flex items-center gap-1"
                    >
                      <Pencil size={12} /> 수정
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(book.id)}
                      className="h-9 px-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {books.length === 0 && (
          <div className="text-center py-12 text-sub">
            <BookOpen size={32} className="mx-auto mb-2 text-disabled" />
            <p>등록된 책이 없습니다. 새 책을 등록해보세요.</p>
          </div>
        )}
      </div>

      {/* 책 생성/수정 폼 */}
      <BookFormDialog
        open={showForm}
        initial={editTarget ?? undefined}
        isPending={createBook.isPending || updateBook.isPending}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        onSave={(formData) => {
          if (editTarget) {
            updateBook.mutate({ id: editTarget.id, ...formData }, {
              onSuccess: () => { setShowForm(false); setEditTarget(null); },
            });
          } else {
            createBook.mutate(formData, {
              onSuccess: () => { setShowForm(false); },
            });
          }
        }}
      />

      {/* 챕터 관리 패널 */}
      {chapterBookId && (
        <ChapterPanel bookId={chapterBookId} onClose={() => setChapterBookId(null)} />
      )}

      {/* 삭제 확인 다이얼로그 */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[slideUp_300ms_ease-out]">
            <h3 className="text-lg font-bold mb-2">책 삭제</h3>
            <p className="text-sm text-sub mb-6">이 책과 모든 챕터를 삭제합니다. 이미 구매한 유저에게는 영향이 없습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-sub hover:bg-surface transition-colors">취소</button>
              <button
                onClick={() => {
                  deleteBook.mutate(confirmDeleteId, {
                    onSuccess: () => { setConfirmDeleteId(null); setExpandedId(null); },
                  });
                }}
                disabled={deleteBook.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {deleteBook.isPending && <Loader2 size={14} className="animate-spin" />}
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
