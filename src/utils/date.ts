// 화면에서 같이 쓰는 날짜 계산. 모두 기기 시간대 기준이다

// "2026-09-18"을 기기 시간대의 그날 0시로 읽는다
// new Date('2026-09-18')은 UTC로 읽혀서 UTC보다 늦은 시간대(미국 등)에서는 하루 전 날짜가 된다
export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (a: Date, b?: Date) =>
  !!b && a.toDateString() === b.toDateString();

const pad = (n: number) => String(n).padStart(2, '0');

// 2026.10.21 (sep '. ' 이면 2026. 10. 21)
export const formatDot = (date: Date, sep = '.') =>
  [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(sep);

// Figma 조건 입력의 기간 표시: "2026. 09. 18 ~ 09. 20" (끝 날짜는 연도 생략)
export const formatDateRange = (start: Date, end: Date) =>
  `${formatDot(start, '. ')} ~ ${pad(end.getMonth() + 1)}. ${pad(
    end.getDate(),
  )}`;

// "9월 18일" · "Sep 18"
export const formatMonthDay = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

// 박 수. 같은 날이면 0 (서머타임으로 하루가 23·25시간이어도 반올림으로 맞춘다)
export const nightsBetween = (start: Date, end: Date) =>
  Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000,
  );

// 달력 칸: 1일 앞은 요일만큼 빈칸(null), 마지막 주는 7칸을 채운다
export function monthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const days = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = Array(new Date(year, m, 1).getDay()).fill(
    null,
  );
  for (let d = 1; d <= days; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

// 기간 고르기: 첫 탭은 시작, 두 번째 탭은 끝
// 시작보다 앞을 누르면 시작을 바꾸고, 다 고른 뒤 누르면 새로 시작한다
export function pickDay(
  { start, end }: { start?: Date; end?: Date },
  day: Date,
): { start?: Date; end?: Date } {
  if (!start || end || day < start) return { start: day, end: undefined };
  return { start, end: day };
}

// 알림 시간 문구 종류: 방금 전 · N분 전 · N시간 전 · 어제, 그보다 오래되면 날짜
export function timeAgo(
  date: Date,
  now: Date,
): {
  key: 'justNow' | 'minutesAgo' | 'hoursAgo' | 'yesterday' | 'date';
  count?: number;
} {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return { key: 'justNow' };
  if (minutes < 60) return { key: 'minutesAgo', count: minutes };
  if (isSameDay(date, now)) {
    return { key: 'hoursAgo', count: Math.floor(minutes / 60) };
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(date, yesterday) ? { key: 'yesterday' } : { key: 'date' };
}
