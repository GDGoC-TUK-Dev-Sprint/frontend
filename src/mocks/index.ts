import type { ImageSourcePropType } from 'react-native';

// TODO: 서버 API 연동 전 더미 데이터. 모든 화면의 더미는 이 파일에만 둔다
// 필드 이름은 spec §9 초안 기준이라 확정되지 않았다. 확정되면 아래 타입의 필드 이름을 바꾸면
// 타입 오류로 화면 쪽 사용처를 모두 찾을 수 있다. API 연동 후 타입은 src/api로 옮기고 이 파일은 지운다

// 추천 코스 배너 (01 메인). GET /api/courses/featured가 Figma API 목록에서 없어져 데이터 출처 미정
export type FeaturedCourse = {
  title: string;
  description: string;
  image: ImageSourcePropType;
};

// 나의 여행 티켓 (01 메인). GET /api/trips (spec API 17, F12-6)
// D-day는 startDate로 화면에서 계산한다
export type Trip = {
  tripId?: number; // 서버가 만든 여행이면 있다. 더미 여행은 없다
  tripNumber: string;
  title: string;
  region: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  travelers: number;
  // 장소 선택(02c) 조건 요약 카드용. GET /api/trips/{tripId} (spec API 18)
  stayName: string; // 숙소 이름 또는 "○○ 중심"
  budgetPerPerson?: number; // 원. 없으면 상관없음
  themes: { code: string; name: string }[]; // 고른 카테고리
  // 동선을 만든 뒤 일차 탭에 쓰는 일자 목록 (POST .../route 응답). 일정은 GET .../days/{dayNumber}로 받는다
  days?: { dayNumber: number; date: string }[];
  route?: TripRoute; // 동선을 만들기 전에는 없다. 없으면 티켓의 장소 영역을 숨긴다
};

export type TripRoute = {
  thumbnail?: ImageSourcePropType; // 사진이 없는 장소면 없다
  thumbnailLabel: string;
  stops: string[];
};

export const mockFeaturedCourse: FeaturedCourse = {
  title: '종로 · 청계천 힐링 산책로',
  description: '도심 속 물길 따라 걷는 여유로운 하루',
  image: require('../assets/images/dummy-course.jpg'),
};

// 동선까지 만든 여행 예시. 앱 시작 때부터 티켓을 보려면 TripContext의 초기값으로 넣는다
export const mockTripSample: Trip = {
  tripNumber: 'TK-2024',
  title: '서울 감성 카페 & 도심 힐링 탐방',
  region: '서울',
  startDate: '2026-11-13',
  endDate: '2026-11-15',
  travelers: 2,
  stayName: '명동 센트럴 호텔',
  budgetPerPerson: 500000,
  themes: [
    { code: 'SH', name: '쇼핑' },
    { code: 'FD', name: '음식' },
    { code: 'VE', name: '문화관광' },
    { code: 'NA', name: '자연관광' },
  ],
  route: {
    thumbnail: require('../assets/images/dummy-place.jpg'),
    thumbnailLabel: '성수동',
    stops: ['성수동 카페거리 → 서울숲', '경복궁 & 서촌 미식 투어'],
  },
};

// 알림 (01a 알림 확인). 알림 API가 없다 (spec F14, Q13)
export type NotificationCategory = 'schedule' | 'visit' | 'notice';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  placeId?: string; // 방문 정보(visit) 알림의 장소 상세 이동 대상
  title: string;
  message: string;
  createdAt: string; // ISO 8601
  read: boolean;
};

// 시간 표시(방금 전·10분 전·어제)가 항상 Figma처럼 보이도록 지금 기준으로 만든다
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60000).toISOString();

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    category: 'visit',
    placeId: 'p-museum',
    title: '방문 전 확인해 주세요',
    message: '국립중앙박물관의 운영시간과 이용 정보를 확인해 보세요.',
    createdAt: ago(0),
    read: false,
  },
  {
    id: 'n2',
    category: 'schedule',
    title: '오늘의 일정이 곧 시작돼요!',
    message: '오전 10시에 경복궁을 방문할 예정이에요.',
    createdAt: ago(10),
    read: true,
  },
  {
    id: 'n3',
    category: 'notice',
    title: '공지) KOREADY의 새로운 기능',
    message:
      'KOREADY의 새로운 기능을 소개합니다. 여행에 도움이 되는 새로운 기능을 확인해보세요.',
    createdAt: ago(24 * 60),
    read: true,
  },
  {
    id: 'n4',
    category: 'visit',
    placeId: 'p-museum',
    title: '방문 전 확인해 주세요',
    message: '국립중앙박물관의 운영시간과 이용 정보를 확인해 보세요.',
    createdAt: ago(24 * 60 + 30),
    read: true,
  },
];

// 공지사항 (공지사항 목록·상세). 공지 API가 spec §9에 없다 (알림 F14, Q13과 함께 확인 필요)
export type NoticeCategory = 'service' | 'update' | 'event';

// 본문은 문단과 강조 상자(주요 변경 사항)를 순서대로 담는다
// TODO: 서버가 본문을 어떤 형식(블록·HTML·마크다운)으로 줄지 정해지면 바꾼다
export type NoticeBlock =
  | { type: 'text'; text: string }
  | { type: 'highlight'; title: string; lines: string[] };

export type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  body: NoticeBlock[];
};

const greeting: NoticeBlock = {
  type: 'text',
  text: '안녕하세요, KOREADY입니다.',
};

export const mockNotices: Notice[] = [
  {
    id: 'notice-5',
    category: 'update',
    title: 'KOREADY의 새로운 기능',
    summary:
      'KOREADY의 새로운 기능을 소개합니다. 여행에 도움이 되는 새로운 기능을 확인해보세요.',
    date: '2024-10-02',
    body: [
      greeting,
      {
        type: 'text',
        text: 'KOREADY의 새로운 기능을 소개합니다. 여행에 도움이 되는 새로운 기능을 확인해보세요.',
      },
    ],
  },
  {
    id: 'notice-4',
    category: 'service',
    title: '일부 관광지 운영 시간 변경 안내',
    summary: '국립중앙박물관 등 주요 관광지의 운영 시간이 변경되었습니다.',
    date: '2024-09-28',
    body: [
      greeting,
      {
        type: 'text',
        text: '보다 정확한 여행 정보를 제공하기 위해 일부 관광지의 운영 시간이 변경되어 안내드립니다.',
      },
      {
        type: 'highlight',
        title: '주요 변경 사항',
        lines: [
          '국립중앙박물관 및 고궁 야간 관람 일정 조정',
          '/ 방문 전 공식 채널을 통한 사전 확인 권장',
        ],
      },
      {
        type: 'text',
        text: '여행 일정 계획 시 동선과 운영 시간을 재확인해 주시기 바라며, 최신 정보를 신속히 반영하도록 최선을 다하겠습니다.',
      },
    ],
  },
  {
    id: 'notice-3',
    category: 'service',
    title: '개인정보처리방침 개정 안내',
    summary: '보다 나은 서비스 제공을 위해 개인정보처리방침이 개정되었습니다.',
    date: '2024-09-20',
    body: [
      greeting,
      {
        type: 'text',
        text: '보다 나은 서비스 제공을 위해 개인정보처리방침이 개정되었습니다.',
      },
    ],
  },
  {
    id: 'notice-2',
    category: 'event',
    title: '가을 서울 여행 이벤트 안내',
    summary: '가을에 떠나는 서울 여행, 특별한 혜택을 만나보세요.',
    date: '2024-09-12',
    body: [
      greeting,
      {
        type: 'text',
        text: '가을에 떠나는 서울 여행, 특별한 혜택을 만나보세요.',
      },
    ],
  },
  {
    id: 'notice-1',
    category: 'update',
    title: '앱 업데이트 v1.2.0 안내',
    summary: '더 나은 서비스 이용을 위해 앱이 업데이트되었습니다.',
    date: '2024-09-01',
    body: [
      greeting,
      {
        type: 'text',
        text: '더 나은 서비스 이용을 위해 앱이 업데이트되었습니다.',
      },
    ],
  },
];

// 장소 상세 (07 장소 상세). GET /api/places/{placeId} (spec API 12, F2-3)
// 필드는 Figma 화면 기준 임시안이다. 운영시간·휴무·요금은 TourAPI 자유 텍스트라 서버가 준 문자열을 그대로 쓴다 (R-K09)
export type PlacePhoto = {
  source: ImageSourcePropType;
  copyright: 'Type1' | 'Type3'; // TourAPI cpyrhtDivCd. Type3은 자르지 않는다 (R-K11)
};

export type PlaceDetail = {
  id: string;
  name: string;
  category: string; // 대분류 · 중분류 (예: 역사관광 · 고궁)
  tagline: string; // 한 줄 소개
  photos: PlacePhoto[];
  // TODO: 별점·리뷰는 앱 사용자가 입력한다(팀 결정). spec F2-3은 표시하지 않는다고 되어 있고 API가 없다
  rating?: { average: number; count: number };
  address: string;
  operating: { isOpen: boolean; lastEntry?: string }; // 서버가 한국 시간 기준으로 판단
  hours?: { value: string; note?: string };
  closedDays?: { value: string; note?: string };
  fees?: { rows: { label: string; value: string }[]; note?: string };
  overview: string;
  transit?: {
    summary: string; // 헤더 오른쪽 (예: 3호선 경복궁역 연결)
    line: string; // 호선 번호
    lineColor: string; // 노선 색
    station: string;
  };
  lat: number;
  lng: number;
  isFavorite: boolean; // 상세 응답에 찜 여부가 온다 (F12-3)
  // TODO: 지금 여행 일정에 들어 있는 장소면 그 일정. 실제로는 여행 일정(GET .../days)에서 찾는다
  schedule?: { day: number; date: string; time: string };
};

const placeDetails: PlaceDetail[] = [
  {
    id: 'p-gyeongbokgung',
    name: '경복궁',
    category: '역사관광 · 고궁',
    tagline: '조선 왕조 제일의 법궁',
    photos: [
      {
        source: require('../assets/images/dummy-course.jpg'),
        copyright: 'Type1',
      },
      {
        source: require('../assets/images/dummy-place.jpg'),
        copyright: 'Type3',
      },
      {
        source: require('../assets/images/dummy-course.jpg'),
        copyright: 'Type1',
      },
    ],
    rating: { average: 4.7, count: 128 },
    address: '서울 종로구 사직로 161',
    operating: { isOpen: true, lastEntry: '17:00' },
    hours: { value: '09:00 ~ 18:00', note: '입장마감 17:00' },
    closedDays: { value: '매주 화요일', note: '공휴일 겹칠 시 변동' },
    fees: {
      rows: [
        { label: '대인 (만 25세 ~ 64세)', value: '3,000원' },
        { label: '만 24세 이하 / 만 65세 이상', value: '무료 입장' },
      ],
      note: '한복 착용자 무료',
    },
    overview:
      '경복궁은 조선 왕조의 법궁으로, 1395년에 창건된 서울에서 가장 웅장하고 아름다운 궁궐입니다. 근정전, 경회루, 향원정 등 한국 전통 건축의 아름다움을 한눈에 볼 수 있으며, 수문장 교대식과 야간 특별관람 등 다양한 행사가 열립니다.',
    transit: {
      summary: '3호선 경복궁역 연결',
      line: '3',
      lineColor: '#FA841A',
      station: '경복궁역 5번 출구 (도보 1분)',
    },
    lat: 37.5796,
    lng: 126.977,
    isFavorite: false,
    schedule: { day: 1, date: '2026-11-13', time: '10:00' },
  },
  {
    id: 'p-museum',
    name: '국립중앙박물관',
    category: '문화관광 · 박물관',
    tagline: '한국의 역사와 문화를 한곳에서',
    photos: [
      {
        source: require('../assets/images/dummy-place.jpg'),
        copyright: 'Type3',
      },
    ],
    address: '서울 용산구 서빙고로 137',
    operating: { isOpen: true, lastEntry: '17:30' },
    hours: { value: '10:00 ~ 18:00<br>수·토 ~21:00', note: '입장마감 17:30' },
    closedDays: { value: '1월 1일, 설날·추석 당일' },
    fees: { rows: [{ label: '상설전시', value: '무료' }] },
    overview:
      '국립중앙박물관은 선사시대부터 근대까지 한국의 역사와 문화를 보여주는 대표 박물관입니다.',
    transit: {
      summary: '4호선 이촌역 연결',
      line: '4',
      lineColor: '#00A5DE',
      station: '이촌역 2번 출구 (도보 5분)',
    },
    lat: 37.5239,
    lng: 126.9803,
    isFavorite: true,
  },
];

// TODO: GET /api/places/{placeId}로 교체
export const findMockPlace = (id: string) =>
  placeDetails.find(place => place.id === id);

// 일자별 일정 (계획 확인). GET /api/trips/{tripId}/days/{dayNumber} (spec API 22, F3-3·F3-7)
// 필드는 Figma 화면 기준 임시안이다
export type TripStop = {
  id: string; // 일정 항목 ID (DELETE .../items/{itemId})
  placeId: string;
  name: string;
  category: string; // 대분류 · 소분류
  photo?: PlacePhoto; // 사진이 없는 장소도 있다
  arriveAt: string; // HH:mm
  departAt: string;
  lat: number;
  lng: number;
};

export type TripDay = {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  lodgingName: string;
  lodgingLat: number;
  lodgingLng: number;
  departAt: string; // 숙소 출발 HH:mm
  returnAt: string; // 숙소 도착 HH:mm
  travelMinutes: number; // 숙소 왕복 포함 총 이동 시간
  // TODO: 경비 수치는 GET /api/trips/{tripId}/cost-estimate 응답에서 가져온다 (F4-9). 서버가 표시 통화로 환산한 문자열
  transitFarePerPerson: string;
  stops: TripStop[];
};

// 추천 장소 후보 (02c 장소 선택). GET /api/trips/{tripId}/candidates (spec API 20, F2-2·F2-8)
// 순위는 서버가 매긴다. 카테고리 탭마다 따로 순위를 매기므로(F2-6) 탭을 바꾸면 서버에 다시 요청한다
export type Candidate = {
  placeId: string;
  name: string;
  themeCode: string; // 카테고리 칩 필터용 대분류 코드
  category: string; // 대분류 · 중분류
  distanceKm: number; // 숙소에서 직선거리
  reasons: string[]; // 추천 이유 코드 (CATEGORY_MATCH·NEAR_STAY). 화면 문구는 장소 선택이 정한다
  photo?: PlacePhoto;
};
