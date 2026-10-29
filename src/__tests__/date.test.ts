import {
  formatDateRange,
  monthGrid,
  nightsBetween,
  parseDate,
  pickDay,
  timeAgo,
} from '../utils/date';

const d = (month: number, day: number, hour = 0) =>
  new Date(2026, month - 1, day, hour);

test('YYYY-MM-DD는 기기 시간대의 그날로 읽는다', () => {
  const date = parseDate('2026-09-18');
  expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
    2026, 8, 18,
  ]);
});

test('기간 표시와 박 수', () => {
  expect(formatDateRange(d(9, 18), d(9, 20))).toBe('2026. 09. 18 ~ 09. 20');
  expect(nightsBetween(d(10, 30), d(11, 2))).toBe(3);
  expect(nightsBetween(d(10, 30), d(10, 30))).toBe(0);
});

test('달력 칸: 2026년 10월은 목요일 시작, 5주', () => {
  const grid = monthGrid(d(10, 1));
  expect(grid).toHaveLength(35);
  expect(grid.slice(0, 4)).toEqual([null, null, null, null]);
  expect(grid[4]?.getDate()).toBe(1);
  expect(grid[34]?.getDate()).toBe(31);
});

test('날짜 고르기: 시작 → 끝 → 다시 시작', () => {
  let range = pickDay({}, d(10, 21));
  expect(range).toEqual({ start: d(10, 21), end: undefined });
  range = pickDay(range, d(10, 18)); // 시작보다 앞이면 시작을 바꾼다
  expect(range).toEqual({ start: d(10, 18), end: undefined });
  range = pickDay(range, d(10, 24));
  expect(range).toEqual({ start: d(10, 18), end: d(10, 24) });
  expect(pickDay(range, d(10, 26))).toEqual({
    start: d(10, 26),
    end: undefined,
  });
});

test('알림 시간 표시', () => {
  const now = d(10, 29, 14);
  const minutesBefore = (m: number) => new Date(now.getTime() - m * 60000);
  expect(timeAgo(minutesBefore(0), now)).toEqual({ key: 'justNow' });
  expect(timeAgo(minutesBefore(10), now)).toEqual({
    key: 'minutesAgo',
    count: 10,
  });
  expect(timeAgo(minutesBefore(150), now)).toEqual({
    key: 'hoursAgo',
    count: 2,
  });
  expect(timeAgo(d(10, 28, 23), now)).toEqual({ key: 'yesterday' });
  expect(timeAgo(d(10, 20), now)).toEqual({ key: 'date' });
});
