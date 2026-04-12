// 카테고리 영문 키 → 한글 라벨 매핑
const CATEGORY_LABELS: Record<string, string> = {
  tax: '세금',
  pension: '퇴직연금',
  retirement: '퇴직연금',
  realestate: '부동산',
  real_estate: '부동산',
  stock: '주식',
  insurance: '보험',
  savings: '저축',
  saving: '저축',
};

export function getCategoryLabel(category: string): string {
  const key = category.toLowerCase().replace(/[\s-]/g, '_');
  return CATEGORY_LABELS[key] ?? category;
}
