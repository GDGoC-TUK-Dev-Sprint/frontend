import { timeAgo } from '../components/NotificationSheet';

const now = new Date(2026, 9, 29, 14, 0);
const minutesBefore = (m: number) => new Date(now.getTime() - m * 60000);

test('알림 시간 표시', () => {
  expect(timeAgo(minutesBefore(0), now)).toEqual({ key: 'justNow' });
  expect(timeAgo(minutesBefore(10), now)).toEqual({
    key: 'minutesAgo',
    count: 10,
  });
  expect(timeAgo(minutesBefore(150), now)).toEqual({
    key: 'hoursAgo',
    count: 2,
  });
  expect(timeAgo(new Date(2026, 9, 28, 23, 0), now)).toEqual({
    key: 'yesterday',
  });
  expect(timeAgo(new Date(2026, 9, 20), now)).toEqual({ key: 'date' });
});
