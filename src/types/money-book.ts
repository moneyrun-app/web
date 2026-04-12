// === MoneyBook (서점) ===

export interface BookListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImageUrl: string | null;
  chapterCount?: number;
  isPurchased: boolean;
  requiredFields?: RequiredField[];
  createdAt?: string;
}

export interface BooksResponse {
  items: BookListItem[];
}

export interface RequiredField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  // number일 때
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  // select일 때
  options?: string[];
  placeholder?: string;
  required: boolean;
}

export interface ChapterPreview {
  id?: string;
  order?: number;
  chapterOrder?: number;
  title: string;
  preview: string;
}

export interface BookDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImageUrl: string | null;
  isPurchased: boolean;
  purchaseId: string | null;
  chapters: ChapterPreview[];
  requiredFields: RequiredField[];
}

export interface PurchaseResponse {
  purchaseId: string;
  status: 'generating';
  estimatedSeconds: number;
}
