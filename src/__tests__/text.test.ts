import { stripHtml } from '../utils/text';

test('br은 줄바꿈, 나머지 태그는 지운다', () => {
  expect(stripHtml('10:00 ~ 18:00<br>수·토 ~21:00')).toBe(
    '10:00 ~ 18:00\n수·토 ~21:00',
  );
  expect(stripHtml('<b>매주 화요일</b><BR/>공휴일')).toBe(
    '매주 화요일\n공휴일',
  );
});

test('엔티티를 되돌리고 앞뒤 공백을 지운다', () => {
  expect(stripHtml(' 대인&nbsp;3,000원 &amp; 소인 ')).toBe(
    '대인 3,000원 & 소인',
  );
});
