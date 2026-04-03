import { memo } from 'react';
import { formatWonRaw } from '@/lib/format';
import type { VariableCost } from '@/types/finance';

interface Props {
  variableCost: VariableCost;
}

function InvestmentTier({ variableCost }: Props) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">투자 체급</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-sub">하루</span>
          <span className="text-lg md:text-xl font-bold">{formatWonRaw(variableCost.daily)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-sub">주간</span>
          <span className="text-lg md:text-xl font-bold">{formatWonRaw(variableCost.weekly)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-sub">월간</span>
          <span className="text-lg md:text-xl font-bold">{formatWonRaw(variableCost.monthly)}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(InvestmentTier);
