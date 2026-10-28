import { monthGrid, pickDay } from '../components/DateRangeModal';

test('달력 칸: 2026년 10월은 목요일 시작, 5주', () => {
  const grid = monthGrid(new Date(2026, 9, 1));
  expect(grid).toHaveLength(35);
  expect(grid.slice(0, 4)).toEqual([null, null, null, null]);
  expect(grid[4]?.getDate()).toBe(1);
  expect(grid[34]?.getDate()).toBe(31);
});

test('날짜 고르기: 시작 → 끝 → 다시 시작', () => {
  const d = (day: number) => new Date(2026, 9, day);
  let range = pickDay({}, d(21));
  expect(range).toEqual({ start: d(21), end: undefined });
  range = pickDay(range, d(18)); // 시작보다 앞이면 시작을 바꾼다
  expect(range).toEqual({ start: d(18), end: undefined });
  range = pickDay(range, d(24));
  expect(range).toEqual({ start: d(18), end: d(24) });
  expect(pickDay(range, d(26))).toEqual({ start: d(26), end: undefined });
});
