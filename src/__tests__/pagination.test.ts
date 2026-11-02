import { pageItems } from '../utils/pagination';

test('처음·끝과 현재 주변만 보이고 사이는 …로 줄인다', () => {
  expect(pageItems(1, 10)).toEqual([1, 2, 3, '…', 10]);
  expect(pageItems(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
  expect(pageItems(10, 10)).toEqual([1, '…', 8, 9, 10]);
});

test('페이지가 적으면 모두 보인다', () => {
  expect(pageItems(1, 1)).toEqual([1]);
  expect(pageItems(2, 3)).toEqual([1, 2, 3]);
  expect(pageItems(3, 4)).toEqual([1, 2, 3, 4]);
});
