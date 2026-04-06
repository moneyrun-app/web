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

interface Props {
  children: string;
}

export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
      {fixEmphasis(children)}
    </ReactMarkdown>
  );
}
