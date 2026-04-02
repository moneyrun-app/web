import { formatWonRaw } from '@/lib/format';

interface AmountDisplayProps {
  amount: number;
  label?: string;
  size?: 'md' | 'lg' | 'xl';
}

export default function AmountDisplay({ amount, label, size = 'lg' }: AmountDisplayProps) {
  const sizeClass = size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className="text-center">
      {label && <p className="text-sub text-sm mb-1">{label}</p>}
      <p className={`font-bold ${sizeClass}`}>{formatWonRaw(amount)}</p>
    </div>
  );
}
