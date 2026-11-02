import { regionFor } from '../utils/map';

// Region은 남서쪽 모서리 + 크기다
const contains = (r: ReturnType<typeof regionFor>, lat: number, lng: number) =>
  lat >= r.latitude &&
  lat <= r.latitude + r.latitudeDelta &&
  lng >= r.longitude &&
  lng <= r.longitude + r.longitudeDelta;

test('모든 점이 영역 안에 들어간다', () => {
  const points = [
    { lat: 37.5796, lng: 126.977 },
    { lat: 37.5512, lng: 126.9882 },
    { lat: 37.564, lng: 126.985 },
  ];
  const r = regionFor(points);
  for (const p of points) {
    expect(contains(r, p.lat, p.lng)).toBe(true);
  }
});

test('요약 카드에 가리지 않게 점들이 영역의 위쪽에 놓인다', () => {
  const r = regionFor([
    { lat: 37.5, lng: 127 },
    { lat: 37.52, lng: 127.02 },
  ]);
  const midLat = r.latitude + r.latitudeDelta / 2;
  expect(37.51).toBeGreaterThan(midLat);
});

test('점이 하나면 최소 크기를 쓴다', () => {
  const r = regionFor([{ lat: 37.5, lng: 127 }]);
  expect(r.latitudeDelta).toBe(0.01);
  expect(r.longitudeDelta).toBe(0.01);
  expect(contains(r, 37.5, 127)).toBe(true);
});
