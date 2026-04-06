/**
 * 금액을 한국어 단위로 표시
 * 1억 3000만 원, 230만 원, 3만 6천 원, 5,000원
 */
export function formatWon(amount: number): string {
  if (amount < 0) return `-${formatWon(-amount)}`;
  if (amount === 0) return '0원';

  const eok = Math.floor(amount / 100_000_000);
  const remainder = amount % 100_000_000;
  const man = Math.floor(remainder / 10_000);
  const won = remainder % 10_000;

  const parts: string[] = [];

  if (eok > 0) parts.push(`${eok}억`);

  if (man > 0) {
    if (man >= 1000) {
      const cheon = Math.floor(man / 1000);
      const rest = man % 1000;
      if (rest === 0) {
        parts.push(`${cheon}천만`);
      } else {
        parts.push(`${man.toLocaleString()}만`);
      }
    } else {
      parts.push(`${man}만`);
    }
  }

  if (won > 0 && eok === 0) {
    parts.push(`${won.toLocaleString()}`);
  }

  return parts.join(' ') + ' 원';
}

/**
 * 금액을 원 단위 숫자+원으로 표시
 * 36,666원
 */
export function formatWonRaw(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

/**
 * HTML 엔티티 디코딩 (&quot; &amp; &lt; 등 → 실제 문자)
 */
export function decodeHtml(html: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = html;
  return el.value;
}
