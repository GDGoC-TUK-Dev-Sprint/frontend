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

// 02b 지도에서 선택: 주소·장소명 검색과 핀 위치의 주소·서울 여부 (로그인 없이 부른다)
export type GeoItem = {
  type: 'ADDRESS' | 'PLACE';
  label: string;
  address: string;
  location: LatLng;
  inSeoul: boolean;
};

export function searchGeo(query: string) {
  return request<{ items: GeoItem[] }>(
    'GET',
    `/api/geo/search?query=${encodeURIComponent(query)}`,
    { auth: false },
  );
}

// address는 바다처럼 주소가 없는 곳이면 null
export function reverseGeo({ lat, lng }: LatLng) {
  return request<{ address: string | null; inSeoul: boolean }>(
    'GET',
    `/api/geo/reverse?lat=${lat}&lng=${lng}`,
    { auth: false },
  );
}

// 숙소 지정 방식: 검색한 숙소(PLACE) / 숙소 미정일 때 고른 지역(AREA) / 지도 핀(PIN)
export type StayRequest =
  | { type: 'PLACE'; placeId: number }
  | { type: 'AREA'; areaCode: string }
  | { type: 'PIN'; location: LatLng };

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
  nationality: Code;
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  partySize: number;
  budgetPerPerson: Money | null;
  categories: Code[];
  // 이름은 장소면 장소 이름, 지역이면 지역 이름, 핀이면 핀 주소. placeId·areaCode는 그 유형일 때만
  stay: {
    type: 'PLACE' | 'AREA' | 'PIN';
    placeId: number | null;
    areaCode: string | null;
    name: string;
    nameKo: string;
    address: string | null;
    location: LatLng;
  };
  routeCreated: boolean;
};

// 끝나지 않은 확정 여행이 있으면 409 ACTIVE_TRIP_EXISTS
export function createTrip(body: TripRequest) {
  return request<TripSummary>('POST', '/api/trips', { body });
}

// 확정한 여행 목록 (API 17). CURRENT는 메인 티켓, PAST는 마이페이지 이전 여행
export type TripListItem = TripSummary & {
  daySummaries: {
    dayNumber: number;
    date: string;
    places: string[]; // 그날 주요 장소 앞 3곳 (식사 제외)
    areaNames: string[];
    image: PlaceSummary['image'];
  }[];
  expenseSaved: boolean;
};

export function listTrips(period: 'CURRENT' | 'PAST') {
  return request<{ items: TripListItem[]; totalCount: number }>(
    'GET',
    `/api/trips?period=${period}`,
  );
}

export function getTrip(tripId: number) {
  return request<TripSummary>('GET', `/api/trips/${tripId}`);
}

// 조건 다시 저장 (API 19). 서버가 그 여행의 동선을 지운다. 확정한 여행이면 409
export function updateTrip(tripId: number, body: TripRequest) {
  return request<TripSummary>('PUT', `/api/trips/${tripId}`, { body });
}

// 메인 티켓의 X. 확정 여부와 관계없이 지운다 (204)
export function deleteTrip(tripId: number) {
  return request<void>('DELETE', `/api/trips/${tripId}`);
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

// 금액은 모두 범위다. 숙박·항공은 들어 있지 않다. 1인(perPerson)과 인원 합계(total)가 같은 구조로 둘 다 온다
export type CostItemCode =
  | 'FOOD'
  | 'SIGHTSEEING'
  | 'TRANSPORT'
  | 'SHOPPING'
  | 'OTHER';

export type CostBreakdown = {
  amount: MoneyRange;
  budget: {
    amount: Money; // 희망 예산 (1인 / 인원 합계)
    status: 'WITHIN_BUDGET' | 'MAY_EXCEED' | 'OVER_BUDGET';
    usagePct: { min: number; max: number } | null; // 예산이 0원이면 null
    overBy: MoneyRange | null; // 예산 안이면 null
    leftOver: MoneyRange | null; // 최소도 넘으면 null
  } | null; // 희망 예산이 없으면 null
  items: {
    item: CostItemCode; // 이름은 앱이 정한다
    amount: MoneyRange;
    sharePct: number;
    basis: string; // 계산 근거 문장 (요청 언어)
  }[];
  days: {
    dayNumber: number;
    date: string;
    amount: MoneyRange;
    items: { item: CostItemCode; amount: MoneyRange }[];
    highest: boolean; // 가장 많이 쓰는 날
  }[];
};

export type CostEstimate = {
  trip: TripSummary;
  perPerson: CostBreakdown;
  total: CostBreakdown;
  guidance: string | null; // 예산 조정 안내 (1인 기준). 희망 예산이 없으면 null
  limitations: { code: string; message: string }[]; // 데이터 한계. message를 그대로 쓴다
  sources: { name: string; detail: string | null }[]; // 근거 출처
  exchangeRate: {
    currency: string;
    krwPerUnit: number;
    rateDate: string;
  } | null; // KRW면 null
};

export function getCostEstimate(tripId: number) {
  return request<CostEstimate>('GET', `/api/trips/${tripId}/cost-estimate`);
}

// 확정하면 편집할 수 없고, 끝나지 않은 확정 여행은 하나만 둔다
export function confirmTrip(tripId: number) {
  return request<TripSummary>('POST', `/api/trips/${tripId}/confirm`);
}

// ── 서버 응답을 화면이 쓰는 모양으로 ──

// 목록·타임라인은 작은 사진이라 썸네일을 쓴다 (원본은 수 MB라 목록에서 늦게 뜬다)
// iOS는 http 이미지를 막는다. TourAPI가 http로 줄 수 있어(R-K12) https로 바꾼다
export const toPhoto = (image: PlaceSummary['image']): PlacePhoto | undefined =>
  image
    ? {
        source: {
          uri: (image.thumbnailUrl || image.url).replace(/^http:/, 'https:'),
        },
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
