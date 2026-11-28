// 서버가 표시 통화로 환산해 준 금액을 화면 문자열로 바꾼다 (spec F7-3). 앱은 금액을 계산하지 않는다
export type Money = { amount: number; currency: string };
export type MoneyRange = { min: number; max: number; currency: string };

const SYMBOLS: Record<string, string> = {
  KRW: '₩',
  JPY: '¥',
  USD: '$',
  EUR: '€',
};

// KRW·JPY는 정수, USD·EUR는 소수 둘째 자리까지 (서버 반올림 규칙과 같다)
export function formatMoney({ amount, currency }: Money) {
  const decimals = currency === 'USD' || currency === 'EUR' ? 2 : 0;
  const number = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${SYMBOLS[currency] ?? `${currency} `}${number}`;
}

// 경비는 범위로 보여준다. 최소와 최대가 같으면 한 값만
export function formatRange({ min, max, currency }: MoneyRange) {
  const low = formatMoney({ amount: min, currency });
  return min === max
    ? low
    : `${low} ~ ${formatMoney({ amount: max, currency })}`;
}
