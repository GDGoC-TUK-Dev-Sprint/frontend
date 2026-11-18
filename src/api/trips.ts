import { request } from './client';
import type { Candidate, PlacePhoto, TripDay } from '../mocks';
import { formatMoney, type Money, type MoneyRange } from '../utils/money';

// 여행 계획 흐름 API (spec §9 8·9·16·20~26). 응답 필드는 팀 API 명세와 배포 서버 응답 기준

export type Code = { code: string; name: string };
export type LatLng = { lat: number; lng: number };
export type { Money, MoneyRange };

// 02 조건 입력 선택지. 국적은 ISO 3166-1 코드, 카테고리는 TourAPI 대분류 8개
export type Area = Code & { center: LatLng };
export type MetaOptions = {
  nationalities: Code[];
  categories: Code[];
  areas: Area[]; // 숙소를 정하지 못했을 때 고르는 지역
};

export function getMetaOptions() {
  return request<MetaOptions>('GET', '/api/meta/options', { auth: false });
}

// 02a 숙소 검색 결과. lodgingType은 분류체계 소분류 코드 (예: AC010100 호텔)
export type Lodging = {
  placeId: number;
  name: string; // 요청 언어
  nameKo: string;
  address: string;
  lodgingType: Code;
  location: LatLng;
};

export function searchLodgings(query: string) {
  return request<{ items: Lodging[]; totalCount: number }>(
    'GET',
    `/api/lodgings?query=${encodeURIComponent(query)}`,
    { auth: false },
  );
}

// 숙소 지정 방식: 검색한 숙소(PLACE) / 숙소 미정일 때 고른 지역(AREA). 지도 핀(PIN)은 02b를 만들 때 붙인다
export type StayRequest =
  | { type: 'PLACE'; placeId: number }
  | { type: 'AREA'; areaCode: string };

export type TripRequest = {
  nationality: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  partySize: number;
  budgetPerPerson?: Money; // 없으면 "상관없음"
  categories: string[];
  stay: StayRequest;
};

// 여행 요약 (API 18). 여행 만들기(16) 응답과 같다
export type TripSummary = {
  tripId: number;
  ticketNo: string;
  status: 'DRAFT' | 'CONFIRMED';
  editable: boolean; // 확정한 여행은 false
  progress: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  title: string | null; // 동선을 만든 뒤 생긴다
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  partySize: number;
  budgetPerPerson: Money | null;
  categories: Code[];
  stay: { type: string; name: string; nameKo: string; address: string | null };
};

// 끝나지 않은 확정 여행이 있으면 409 ACTIVE_TRIP_EXISTS
export function createTrip(body: TripRequest) {
  return request<TripSummary>('POST', '/api/trips', { body });
}

// ── 02c 장소 선택 ──

// 목록·카드·지도에 쓰는 장소 요약 (PlaceSummary). image.license가 TYPE3이면 자르지 않는다 (R-K11)
export type PlaceSummary = {
  placeId: number;
  name: string;
  nameKo: string;
  category: Code; // 대분류
  classification: Code; // 소분류
  image: { url: string; thumbnailUrl: string; license: string } | null;
  location: LatLng;
};

export type CandidatePage = {
  guide: {
    days: number;
    recommendedMin: number;
    recommendedMax: number;
    maxPerDay: number;
  };
  items: {
    rank: number | null; // 검색이면 null
    place: PlaceSummary;
    distanceFromStayM: number;
    reasons: string[]; // CATEGORY_MATCH, NEAR_STAY
    inTrip: boolean; // 이미 동선에 들어간 장소
  }[];
  totalCount: number;
};

// page는 0부터. query가 있으면 카테고리 조건을 풀고 이름으로 찾는다
export function getCandidates(
  tripId: number,
  {
    category,
    query,
    page,
  }: { category?: string; query?: string; page: number },
) {
  const params = [`page=${page}`];
  if (category) params.push(`category=${category}`);
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  return request<CandidatePage>(
    'GET',
    `/api/trips/${tripId}/candidates?${params.join('&')}`,
  );
}

export type RouteResult = {
  trip: TripSummary; // 제목이 생긴 여행
  days: { dayNumber: number; date: string; itemCount: number }[];
  unscheduled: { place: PlaceSummary; reason: string }[]; // 동선에 넣지 못한 장소
};

// 다시 부르면 동선을 덮어쓴다
export function createRoute(tripId: number, placeIds: number[]) {
  return request<RouteResult>('POST', `/api/trips/${tripId}/route`, {
    body: { placeIds },
  });
}

// ── 03 동선 · 03a 지도 · 계획 확인 ──

export type TripDayResponse = {
  dayNumber: number;
  date: string;
  departTime: string | null;
  returnTime: string | null;
  summary: {
    itemCount: number;
    totalTravelMinutes: number;
    farePerPerson: Money | null; // 운임을 받지 못한 구간이 있으면 null
  };
  stay: { name: string; location: LatLng };
  items: {
    itemId: number;
    seq: number;
    place: PlaceSummary;
    origin: 'SELECTED' | 'MEAL';
    mealType: 'LUNCH' | 'DINNER' | null;
    arriveTime: string;
    departTime: string;
    stayMinutes: number;
    warnings: string[];
  }[];
};

export function getTripDay(tripId: number, dayNumber: number) {
  return request<TripDayResponse>(
    'GET',
    `/api/trips/${tripId}/days/${dayNumber}`,
  );
}

// 순서 변경·삭제는 서버가 시각·이동 구간을 다시 계산한 그 일자 전체를 돌려준다
export function reorderDay(
  tripId: number,
  dayNumber: number,
  itemIds: number[],
) {
  return request<TripDayResponse>(
    'PUT',
    `/api/trips/${tripId}/days/${dayNumber}/order`,
    { body: { itemIds } },
  );
}

export function deleteTripItem(tripId: number, itemId: number) {
  return request<TripDayResponse>(
    'DELETE',
    `/api/trips/${tripId}/items/${itemId}`,
  );
}

// ── 04 예상 경비 ──

// 금액은 모두 범위다. 숙박·항공은 들어 있지 않다
export type Breakdown = { perPerson: MoneyRange; total: MoneyRange };

export type CostEstimate = Breakdown & {
  trip: TripSummary;
  budget: {
    status: 'NO_BUDGET' | 'WITHIN' | 'OVER' | 'MAY_EXCEED';
    perPerson: Money | null;
    total: Money | null;
    overPerPerson: MoneyRange | null;
    overTotal: MoneyRange | null;
  };
  items: (Breakdown & {
    item: Code; // FOOD·SIGHTSEEING·TRANSPORT·SHOPPING·OTHER
    sharePct: number;
    source: Code; // 근거 데이터
  })[];
  days: (Breakdown & {
    day: number;
    date: string;
    peak: boolean; // 가장 많이 쓰는 날
    items: (Breakdown & { item: string })[];
  })[];
};

export function getCostEstimate(tripId: number) {
  return request<CostEstimate>('GET', `/api/trips/${tripId}/cost-estimate`);
}

// 확정하면 편집할 수 없고, 끝나지 않은 확정 여행은 하나만 둔다
export function confirmTrip(tripId: number) {
  return request<TripSummary>('POST', `/api/trips/${tripId}/confirm`);
}

// ── 서버 응답을 화면이 쓰는 모양으로 ──

const toPhoto = (image: PlaceSummary['image']): PlacePhoto | undefined =>
  image
    ? {
        source: { uri: image.url },
        copyright: image.license === 'TYPE3' ? 'Type3' : 'Type1',
      }
    : undefined;

const categoryLabel = (place: PlaceSummary) =>
  `${place.category.name} · ${place.classification.name}`;

export const toCandidate = (
  item: CandidatePage['items'][number],
): Candidate => ({
  placeId: String(item.place.placeId),
  name: item.place.name,
  themeCode: item.place.category.code,
  category: categoryLabel(item.place),
  distanceKm: Math.round(item.distanceFromStayM / 100) / 10,
  reasons: item.reasons,
  photo: toPhoto(item.place.image),
});

export const toTripDay = (day: TripDayResponse): TripDay => ({
  dayNumber: day.dayNumber,
  date: day.date,
  lodgingName: day.stay.name,
  lodgingLat: day.stay.location.lat,
  lodgingLng: day.stay.location.lng,
  departAt: day.departTime ?? '',
  returnAt: day.returnTime ?? '',
  travelMinutes: day.summary.totalTravelMinutes,
  transitFarePerPerson: day.summary.farePerPerson
    ? formatMoney(day.summary.farePerPerson)
    : '-',
  stops: day.items.map(item => ({
    id: String(item.itemId),
    placeId: String(item.place.placeId),
    name: item.place.name,
    category: categoryLabel(item.place),
    photo: toPhoto(item.place.image),
    arriveAt: item.arriveTime,
    departAt: item.departTime,
    lat: item.place.location.lat,
    lng: item.place.location.lng,
  })),
});
