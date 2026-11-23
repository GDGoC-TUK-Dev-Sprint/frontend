import { formatMoney, formatRange } from '../utils/money';

const krw = (amount: number) => ({ amount, currency: 'KRW' });

test('통화 기호와 천 단위 쉼표', () => {
  expect(formatMoney(krw(1240000))).toBe('₩1,240,000');
  expect(formatMoney({ amount: 12.5, currency: 'USD' })).toBe('$12.50');
});

test('범위는 최소~최대, 같으면 한 값', () => {
  expect(formatRange({ min: 37000, max: 63000, currency: 'KRW' })).toBe(
    '₩37,000 ~ ₩63,000',
  );
  expect(formatRange({ min: 5000, max: 5000, currency: 'KRW' })).toBe('₩5,000');
});
