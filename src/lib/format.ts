export function formatWon(amount: number): string {
  const man = amount / 10000;
  if (man >= 1) {
    return `${man % 1 === 0 ? man.toFixed(0) : man.toFixed(1)}만 원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function formatWonRaw(amount: number): string {
  return `${amount.toLocaleString()}원`;
}
