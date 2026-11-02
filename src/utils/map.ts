type Point = { lat: number; lng: number };

// 점들이 모두 보이는 지도 영역. 가장자리 마커가 잘리지 않게 여유(padding배)를 두고,
// 아래쪽을 덮는 요약 카드만큼 중심을 아래로(bottomShift × 높이) 내린다
export function regionFor(points: Point[], padding = 2, bottomShift = 0.2) {
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // 점이 하나뿐이어도 동네 정도는 보이게 최소 크기를 둔다
  const latitudeDelta = Math.max((maxLat - minLat) * padding, 0.01);
  const longitudeDelta = Math.max((maxLng - minLng) * padding, 0.01);
  return {
    latitude: (minLat + maxLat) / 2 - latitudeDelta * bottomShift,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}
