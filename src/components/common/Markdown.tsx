'use client';

import dynamic from 'next/dynamic';
import rehypeRaw from 'rehype-raw';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-4 bg-surface rounded w-3/4" />,
});

/** CommonMark에서 )**한글 패턴이 bold 닫기로 인식 안 되는 문제 우회 */
function fixEmphasis(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * hast 트리의 <p>, <li> 내부 children을 문장 단위 <span data-sentence>로 감싸는 rehype 플러그인.
 * React 렌더링 단계에서 처리하므로 DOM mutation 불필요 → unmount 시 removeChild 에러 방지.
 */
function rehypeSentences() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function transform(tree: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walk = (node: any) => {
      if (node.type === 'element' && (node.tagName === 'p' || node.tagName === 'li')) {
        wrapSentencesIn(node);
        return;
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapSentencesIn(node: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = node.children ?? [];
  if (children.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any[] = [];

  const flush = () => {
    if (current.length === 0) return;
    const hasContent = current.some(
      (c) => (c.type === 'text' && c.value.trim()) || c.type === 'element',
    );
    if (hasContent) {
      out.push({
        type: 'element',
        tagName: 'span',
        properties: { 'data-sentence': '' },
        children: current,
      });
    } else {
      out.push(...current);
    }
    current = [];
  };

  for (const child of children) {
    if (child.type === 'text') {
      const parts = (child.value as string).split(/(?<=[.?!。])\s+/);
      parts.forEach((part, i) => {
        if (i > 0) {
          flush();
          out.push({ type: 'text', value: ' ' });
        }
        if (part) current.push({ type: 'text', value: part });
      });
    } else {
      current.push(child);
    }
  }
  flush();

  node.children = out;
}

interface Props {
  children: string | null | undefined;
  /** <p>, <li>의 각 문장을 <span data-sentence>로 래핑 (책 리더처럼 문장 단위 인터랙션용) */
  wrapSentences?: boolean;
}

export default function Markdown({ children, wrapSentences = false }: Props) {
  if (!children) return null;
  const plugins = wrapSentences ? [rehypeRaw, rehypeSentences] : [rehypeRaw];
  return (
    <ReactMarkdown rehypePlugins={plugins}>
      {fixEmphasis(children)}
    </ReactMarkdown>
  );
}
