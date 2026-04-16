'use client';

import { create } from 'zustand';
import type { CourseCategory, CourseLevel, OnboardingStep } from '@/types/course';

const STORAGE_KEY = 'moneyrun_onboarding_v4';

interface OnboardingState {
  currentStep: OnboardingStep;
  selectedCategory: CourseCategory | null;
  levelChoice: 'beginner' | 'find-level' | null;
  assignedLevel: CourseLevel | null;
  courseTitle: string | null;
  quizAnswers: Array<{ questionId: string; answer: number }>;

  setStep: (step: OnboardingStep) => void;
  setCategory: (category: CourseCategory) => void;
  setLevelChoice: (choice: 'beginner' | 'find-level') => void;
  setLevel: (level: CourseLevel, courseTitle: string) => void;
  setQuizAnswers: (answers: Array<{ questionId: string; answer: number }>) => void;
  loadFromSession: () => void;
  saveToSession: () => void;
  clear: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'select-level',
  selectedCategory: null,
  levelChoice: null,
  assignedLevel: null,
  courseTitle: null,
  quizAnswers: [],

  setStep: (step) => {
    set({ currentStep: step });
    get().saveToSession();
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().saveToSession();
  },

  setLevelChoice: (choice) => {
    set({ levelChoice: choice });
    get().saveToSession();
  },

  setLevel: (level, courseTitle) => {
    set({ assignedLevel: level, courseTitle });
    get().saveToSession();
  },

  setQuizAnswers: (answers) => {
    set({ quizAnswers: answers });
    get().saveToSession();
  },

  loadFromSession: () => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        set({
          currentStep: parsed.currentStep ?? 'select-level',
          selectedCategory: parsed.selectedCategory ?? null,
          levelChoice: parsed.levelChoice ?? null,
          assignedLevel: parsed.assignedLevel ?? null,
          courseTitle: parsed.courseTitle ?? null,
          quizAnswers: parsed.quizAnswers ?? [],
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
      levelChoice: state.levelChoice,
      assignedLevel: state.assignedLevel,
      courseTitle: state.courseTitle,
      quizAnswers: state.quizAnswers,
    }));
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
    set({
      currentStep: 'select-level',
      selectedCategory: null,
      levelChoice: null,
      assignedLevel: null,
      courseTitle: null,
      quizAnswers: [],
    });
  },
}));
