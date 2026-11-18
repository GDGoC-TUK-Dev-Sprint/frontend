import { toCandidate, toTripDay, type PlaceSummary } from '../api/trips';

const place = (image: PlaceSummary['image']): PlaceSummary => ({
  placeId: 1273,
  name: '덕수궁',
  nameKo: '덕수궁',
  category: { code: 'HS', name: '역사관광' },
  classification: { code: 'HS010100', name: '고궁' },
  image,
  location: { lat: 37.565, lng: 126.976 },
});

test('후보: ID는 문자열, 거리는 km, 사진이 없으면 photo 없음', () => {
  const c = toCandidate({
    rank: 1,
    place: place(null),
    distanceFromStayM: 804,
    reasons: ['NEAR_STAY'],
    inTrip: false,
  });
  expect(c).toMatchObject({
    placeId: '1273',
    category: '역사관광 · 고궁',
    distanceKm: 0.8,
  });
  expect(c.photo).toBeUndefined();
});

test('일자: 변경 금지 사진(TYPE3)은 Type3, 운임을 못 받으면 "-"', () => {
  const day = toTripDay({
    dayNumber: 1,
    date: '2026-12-10',
    departTime: '09:00',
    returnTime: '11:20',
    summary: { itemCount: 1, totalTravelMinutes: 50, farePerPerson: null },
    stay: { name: '명동', location: { lat: 37.56, lng: 126.98 } },
    items: [
      {
        itemId: 7,
        seq: 1,
        place: place({
          url: 'https://x/a.jpg',
          thumbnailUrl: '',
          license: 'TYPE3',
        }),
        origin: 'SELECTED',
        mealType: null,
        arriveTime: '09:16',
        departTime: '09:46',
        stayMinutes: 30,
        warnings: [],
      },
    ],
  });
  expect(day.transitFarePerPerson).toBe('-');
  expect(day.stops[0]).toMatchObject({ id: '7', placeId: '1273' });
  expect(day.stops[0].photo).toEqual({
    source: { uri: 'https://x/a.jpg' },
    copyright: 'Type3',
  });
});
