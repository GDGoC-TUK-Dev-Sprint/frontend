import { request } from './client';
import { toPhoto, type Code, type LatLng, type PlaceSummary } from './trips';
import type { PlaceDetail } from '../mocks';
import { formatMoney, type Money } from '../utils/money';
import { stripHtml } from '../utils/text';

// 장소 상세 (API 명세 12)·찜 (13·14). 로그인하지 않아도 상세는 받는다
export type PlaceDetailResponse = {
  placeId: number;
  name: string;
  nameKo: string;
  category: Code;
  classification: Code;
  location: LatLng;
  summary: string | null; // 한 줄 소개
  images: NonNullable<PlaceSummary['image']>[];
  address: string;
  hours: {
    type: 'STRUCTURED' | 'ALWAYS_OPEN' | 'UNKNOWN';
    now: {
      status: 'OPEN' | 'BREAK' | 'CLOSED' | 'UNKNOWN';
      closesAt: string | null;
      lastEntryAt: string | null;
    };
    text: string | null; // 운영시간 원문
    restText: string | null; // 쉬는 날 원문
  };
  fees: {
    type: 'FREE' | 'PAID' | 'VARIES' | 'UNKNOWN';
    items: { audience: string; label: string; amount: Money }[];
    text: string | null; // 요금 원문
  };
  overview: string | null;
  // 이 여행(tripId)에 담긴 장소면 처음 나오는 일정. 로그인하지 않았거나 담기지 않았으면 null
  inTrip: {
    tripId: number;
    dayNumber: number;
    date: string;
    arriveTime: string;
  } | null;
  favorited: boolean;
};

export function getPlaceDetail(placeId: string, tripId?: number) {
  const query = tripId ? `?tripId=${tripId}` : '';
  return request<PlaceDetailResponse>('GET', `/api/places/${placeId}${query}`);
}

// 이미 찜했거나 찜하지 않았어도 204
export function setFavorite(placeId: string, on: boolean) {
  return request<void>(on ? 'PUT' : 'DELETE', `/api/favorites/${placeId}`);
}

// 화면이 쓰는 모양으로. 이용시간·휴무·요금은 원문 그대로 보여준다 (R-K09, 태그는 화면에서 지운다)
// 상세 사진은 원본 url을 쓴다 (목록은 썸네일)
export const toPlaceDetail = (
  res: PlaceDetailResponse,
  freeLabel: string,
): PlaceDetail => ({
  id: String(res.placeId),
  name: res.name,
  category: `${res.category.name} · ${res.classification.name}`,
  tagline: res.summary ?? '',
  photos: res.images.flatMap(
    image => toPhoto({ ...image, thumbnailUrl: image.url }) ?? [],
  ),
  address: res.address,
  // 운영 상태를 모르면(UNKNOWN) 배지를 숨긴다
  operating:
    res.hours.now.status === 'UNKNOWN'
      ? undefined
      : {
          isOpen: res.hours.now.status === 'OPEN',
          lastEntry: res.hours.now.lastEntryAt ?? undefined,
        },
  hours: res.hours.text ? { value: res.hours.text } : undefined,
  closedDays: res.hours.restText ? { value: res.hours.restText } : undefined,
  // 대상별 요금이 없으면 원문 한 줄. 무료면 배지
  fees: {
    rows: res.fees.items.length
      ? res.fees.items.map(item => ({
          label: item.label,
          value:
            item.amount.amount === 0 ? freeLabel : formatMoney(item.amount),
        }))
      : res.fees.text
      ? [{ label: '', value: stripHtml(res.fees.text) }]
      : [],
    note: res.fees.type === 'FREE' ? freeLabel : undefined,
  },
  overview: res.overview ? stripHtml(res.overview) : '',
  lat: res.location.lat,
  lng: res.location.lng,
  isFavorite: res.favorited,
  schedule: res.inTrip
    ? {
        day: res.inTrip.dayNumber,
        date: res.inTrip.date,
        time: res.inTrip.arriveTime,
      }
    : undefined,
});
