'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * 모달 포커스 트랩 훅 — 콜백 ref 패턴.
 * - 모달이 열리면 첫 번째 포커스 가능 요소에 자동 포커스
 * - Tab 순환으로 모달 밖 이동 방지
 * - 모달이 닫히면 이전 포커스 요소로 복원
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>() {
  const [el, setEl] = useState<T | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) {
      // 모달 닫힘 → 이전 포커스 복원
      previousFocus.current?.focus();
      previousFocus.current = null;
      return;
    }

    // 모달 열림 → 현재 포커스 저장 후 트랩 시작
    previousFocus.current = document.activeElement as HTMLElement;

    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = el.querySelectorAll<HTMLElement>(FOCUSABLE);
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstNode) {
          e.preventDefault();
          lastNode?.focus();
        }
      } else {
        if (document.activeElement === lastNode) {
          e.preventDefault();
          firstNode?.focus();
        }
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [el]);

  return useCallback((node: T | null) => { setEl(node); }, []);
}
