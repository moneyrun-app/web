'use client';

import type { Grade } from '@/types/finance';

const gradeVars: Record<Grade | 'NONE', { main: string; light: string; dark: string }> = {
  RED:    { main: '#EF4444', light: '#FEF2F2', dark: '#991B1B' },
  YELLOW: { main: '#F59E0B', light: '#FFFBEB', dark: '#92400E' },
  GREEN:  { main: '#22C55E', light: '#F0FDF4', dark: '#166534' },
  NONE:   { main: '#111827', light: '#F9FAFB', dark: '#111827' },
};

interface Props {
  grade: Grade | 'NONE';
  children: React.ReactNode;
}

export default function GradeProvider({ grade, children }: Props) {
  const vars = gradeVars[grade] ?? gradeVars.NONE;
  return (
    <div
      style={{
        '--grade-main': vars.main,
        '--grade-light': vars.light,
        '--grade-dark': vars.dark,
      } as React.CSSProperties}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
