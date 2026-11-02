import { regionFor } from '../utils/map';

test('모든 점이 영역 안에 들어간다', () => {
  const points = [
    { lat: 37.5796, lng: 126.977 },
    { lat: 37.5512, lng: 126.9882 },
    { lat: 37.564, lng: 126.985 },
  ];
  const r = regionFor(points);
  for (const p of points) {
    expect(Math.abs(p.lat - r.latitude)).toBeLessThanOrEqual(
      r.latitudeDelta / 2,
    );
    expect(Math.abs(p.lng - r.longitude)).toBeLessThanOrEqual(
      r.longitudeDelta / 2,
    );
  }
});

test('점이 하나면 최소 크기를 쓴다', () => {
  const r = regionFor([{ lat: 37.5, lng: 127 }]);
  expect(r.latitudeDelta).toBe(0.01);
  expect(r.longitudeDelta).toBe(0.01);
});
