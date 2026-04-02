'use client';

import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  date: string;
  title: string;
  summary: string;
}

export default function ContentListItem({ id, date, title, summary }: Props) {
  const router = useRouter();

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
  };

  return (
    <div>
      <p className="text-primary text-xs font-medium mb-2">{formatDate(date)}</p>
      <button
        onClick={() => router.push(`/book/${id}`)}
        className="w-full text-left bg-card rounded-2xl p-5"
      >
        <p className="font-semibold mb-1">{title}</p>
        <p className="text-sub text-sm leading-relaxed">{summary}</p>
      </button>
    </div>
  );
}
