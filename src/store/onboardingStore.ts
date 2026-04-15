'use client';

import { create } from 'zustand';
import type { CourseCategory, CourseLevel } from '@/types/course';

const STORAGE_KEY = 'moneyrun_onboarding_v3';

interface OnboardingState {
  currentStep: number;
  selectedCategory: CourseCategory | null;
  assignedLevel: CourseLevel | null;
  courseTitle: string | null;
  diagnosticAnswers: Array<{ questionId: string; answer: number }>;

  setStep: (step: number) => void;
  setCategory: (category: CourseCategory) => void;
  setLevel: (level: CourseLevel, courseTitle: string) => void;
  setDiagnosticAnswers: (answers: Array<{ questionId: string; answer: number }>) => void;
  loadFromSession: () => void;
  saveToSession: () => void;
  clear: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  selectedCategory: null,
  assignedLevel: null,
  courseTitle: null,
  diagnosticAnswers: [],

  setStep: (step) => {
    set({ currentStep: step });
    get().saveToSession();
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().saveToSession();
  },

  setLevel: (level, courseTitle) => {
    set({ assignedLevel: level, courseTitle });
    get().saveToSession();
  },

  setDiagnosticAnswers: (answers) => {
    set({ diagnosticAnswers: answers });
    get().saveToSession();
  },

  loadFromSession: () => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        set({
          currentStep: parsed.currentStep ?? 1,
          selectedCategory: parsed.selectedCategory ?? null,
          assignedLevel: parsed.assignedLevel ?? null,
          courseTitle: parsed.courseTitle ?? null,
          diagnosticAnswers: parsed.diagnosticAnswers ?? [],
        });
      } catch {
        // ignore
      }
    }
  },

  saveToSession: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: state.currentStep,
      selectedCategory: state.selectedCategory,
      assignedLevel: state.assignedLevel,
      courseTitle: state.courseTitle,
      diagnosticAnswers: state.diagnosticAnswers,
    }));
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
    set({
      currentStep: 1,
      selectedCategory: null,
      assignedLevel: null,
      courseTitle: null,
      diagnosticAnswers: [],
    });
  },
}));
