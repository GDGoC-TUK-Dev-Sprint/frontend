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
  tripNumber: string;
  title: string;
  region: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  travelers: number;
  // 장소 선택(02c) 조건 요약 카드용. GET /api/trips/{tripId} (spec API 18)
  stayName: string; // 숙소 이름 또는 "○○ 중심"
  budgetPerPerson?: number; // 원. 없으면 상관없음
  themeCodes: string[];
  route?: TripRoute; // 동선을 만들기 전에는 없다. 없으면 티켓의 장소 영역을 숨긴다
};

export type TripRoute = {
  thumbnail: ImageSourcePropType;
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
  themeCodes: ['SH', 'FD', 'VE', 'NA'],
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
  category: string; // 대분류 · 중분류
  photo: PlacePhoto;
  arriveAt: string; // HH:mm
  departAt: string;
};

export type TripDay = {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  lodgingName: string;
  departAt: string; // 숙소 출발 HH:mm
  returnAt: string; // 숙소 도착 HH:mm
  travelMinutes: number; // 숙소 왕복 포함 총 이동 시간
  // TODO: 경비 수치는 GET /api/trips/{tripId}/cost-estimate 응답에서 가져온다 (F4-9). 서버가 표시 통화로 환산한 문자열
  transitFarePerPerson: string;
  stops: TripStop[];
};

const photoA: PlacePhoto = {
  source: require('../assets/images/dummy-course.jpg'),
  copyright: 'Type1',
};
const photoB: PlacePhoto = {
  source: require('../assets/images/dummy-place.jpg'),
  copyright: 'Type3',
};

// TODO: GET .../days/{dayNumber}로 교체. 경복궁·국립중앙박물관 외 장소는 상세 더미가 없다
export const mockTripDays: TripDay[] = [
  {
    dayNumber: 1,
    date: '2026-11-13',
    lodgingName: '명동 센트럴 호텔',
    departAt: '09:40',
    returnAt: '19:00',
    travelMinutes: 125,
    transitFarePerPerson: '₩6,100',
    stops: [
      {
        id: 'i1',
        placeId: 'p-gyeongbokgung',
        name: '경복궁',
        category: '역사관광 · 고궁',
        photo: photoA,
        arriveAt: '10:00',
        departAt: '11:30',
      },
      {
        id: 'i2',
        placeId: 'p-ikseondong',
        name: '익선동 한옥거리',
        category: '문화관광 · 골목길, 문화거리',
        photo: photoB,
        arriveAt: '12:00',
        departAt: '13:30',
      },
      {
        id: 'i3',
        placeId: 'p-gwangjang',
        name: '광장시장',
        category: '쇼핑 · 상설시장',
        photo: photoA,
        arriveAt: '13:45',
        departAt: '15:15',
      },
      {
        id: 'i4',
        placeId: 'p-namsan',
        name: '남산 서울타워',
        category: '역사관광 · 고궁',
        photo: photoB,
        arriveAt: '16:00',
        departAt: '18:30',
      },
    ],
  },
  {
    dayNumber: 2,
    date: '2026-11-14',
    lodgingName: '명동 센트럴 호텔',
    departAt: '09:30',
    returnAt: '17:00',
    travelMinutes: 70,
    transitFarePerPerson: '₩3,000',
    stops: [
      {
        id: 'i5',
        placeId: 'p-museum',
        name: '국립중앙박물관',
        category: '문화관광 · 박물관',
        photo: photoB,
        arriveAt: '10:00',
        departAt: '13:00',
      },
    ],
  },
  {
    dayNumber: 3,
    date: '2026-11-15',
    lodgingName: '명동 센트럴 호텔',
    departAt: '10:00',
    returnAt: '10:00',
    travelMinutes: 0,
    transitFarePerPerson: '₩0',
    stops: [],
  },
];

// 추천 장소 후보 (02c 장소 선택). GET /api/trips/{tripId}/candidates (spec API 20, F2-2·F2-8)
// 순위는 서버가 매긴다. 카테고리 탭마다 따로 순위를 매기므로(F2-6) 탭을 바꾸면 서버에 다시 요청한다
export type Candidate = {
  placeId: string;
  name: string;
  themeCode: string; // 카테고리 칩 필터용 대분류 코드
  category: string; // 대분류 · 중분류
  distanceKm: number; // 숙소에서 직선거리
  reasons: string[]; // 추천 이유 태그 최대 2개 (§5A.4). 근거 통계가 있을 때만 서버가 준다 (F2-9)
  photo: PlacePhoto;
};

const candidate = (
  placeId: string,
  name: string,
  themeCode: string,
  category: string,
  distanceKm: number,
  reasons: string[],
  photo: PlacePhoto,
): Candidate => ({
  placeId,
  name,
  themeCode,
  category,
  distanceKm,
  reasons,
  photo,
});

const mockCandidates: Candidate[] = [
  candidate(
    'p-gwangjang',
    '광장 시장',
    'SH',
    '쇼핑 · 상설시장',
    1.3,
    ['쇼핑 테마', '일본인 인기 지역'],
    photoA,
  ),
  candidate(
    'p-namsan',
    '남산 타워',
    'NA',
    '자연관광 · 전망대',
    0.3,
    ['서울 전망 명소', '일본인 인기 지역'],
    photoB,
  ),
  candidate(
    'p-museum',
    '국립중앙박물관',
    'VE',
    '문화관광 · 박물관',
    0.6,
    ['역사·문화 테마', '실내 관광 추천'],
    photoB,
  ),
  candidate(
    'p-ikseondong',
    '익선동 한옥거리',
    'VE',
    '문화관광 · 골목길, 문화거리',
    2.2,
    ['문화관광 테마', '일본인 인기 지역'],
    photoA,
  ),
  candidate(
    'p-gyeongbokgung',
    '경복궁',
    'VE',
    '역사관광 · 고궁',
    2.1,
    ['외국인 입장객 상위', '일본인 인기 지역'],
    photoA,
  ),
  candidate(
    'p-myeongdong',
    '명동 거리',
    'SH',
    '쇼핑 · 쇼핑거리',
    0.2,
    ['쇼핑 테마'],
    photoB,
  ),
  candidate(
    'p-tosokchon',
    '토속촌 삼계탕',
    'FD',
    '음식 · 한식',
    2.4,
    ['음식 테마', '일본인 인기 지역'],
    photoA,
  ),
  candidate(
    'p-seoulforest',
    '서울숲',
    'NA',
    '자연관광 · 도시공원',
    6.8,
    ['자연관광 테마'],
    photoB,
  ),
  candidate(
    'p-gwangjang-food',
    '광장시장 먹자골목',
    'FD',
    '음식 · 시장음식',
    1.4,
    ['음식 테마'],
    photoA,
  ),
  candidate(
    'p-insadong',
    '인사동 쌈지길',
    'SH',
    '쇼핑 · 전통상점',
    1.8,
    ['쇼핑 테마', '외국인 입장객 상위'],
    photoB,
  ),
  candidate(
    'p-cheonggyecheon',
    '청계천',
    'NA',
    '자연관광 · 하천',
    0.9,
    ['자연관광 테마'],
    photoA,
  ),
  candidate(
    'p-dongdaemun',
    '동대문디자인플라자',
    'VE',
    '문화관광 · 전시시설',
    2.6,
    ['문화관광 테마'],
    photoB,
  ),
];

// TODO: GET .../candidates?category=&query=&page= 로 교체. 서버가 검색·카테고리·페이지를 처리한다
export const searchMockCandidates = (query: string, themeCode?: string) =>
  mockCandidates.filter(
    c =>
      (!themeCode || c.themeCode === themeCode) &&
      c.name.includes(query.trim()),
  );

// 조건 입력 선택지 (02 조건 입력·02a 숙소 위치 검색). GET /api/meta/options (spec API 8)
// 국적은 권역 코드로만 저장한다 (spec F1-1, §11). 권역 매핑은 서버가 한다
export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  nameEn: string;
  flag: string; // TODO: Figma는 국기 SVG. API 응답에 국기 이미지가 있는지 확인 후 교체
};

// 여행 테마 8종. 코드는 신분류체계 대분류 (spec F1-7, §5A.2)
export type Theme = { code: string; name: string };

// 숙소 미정 시 고르는 서울 지역 (spec F1-3 ②)
export type Area = { code: string; name: string };

export type MetaOptions = {
  countries: Country[];
  themes: Theme[];
  areas: Area[];
};

export const mockMetaOptions: MetaOptions = {
  countries: [
    { code: 'JP', name: '일본', nameEn: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: '중국', nameEn: 'China', flag: '🇨🇳' },
    { code: 'TW', name: '대만', nameEn: 'Taiwan', flag: '🇹🇼' },
    { code: 'US', name: '미국', nameEn: 'United States', flag: '🇺🇸' },
    { code: 'TH', name: '태국', nameEn: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: '베트남', nameEn: 'Vietnam', flag: '🇻🇳' },
  ],
  themes: [
    { code: 'SH', name: '쇼핑' },
    { code: 'EX', name: '체험 관광' },
    { code: 'FD', name: '음식' },
    { code: 'EV', name: '축제/공연/행사' },
    { code: 'HS', name: '역사 관광' },
    { code: 'NA', name: '자연관광' },
    { code: 'LS', name: '레저 스포츠' },
    { code: 'VE', name: '문화 관광' },
  ],
  areas: [
    { code: 'myeongdong-jongno', name: '명동·종로' },
    { code: 'hongdae-mapo', name: '홍대·마포' },
    { code: 'gangnam', name: '강남' },
    { code: 'itaewon-yongsan', name: '이태원·용산' },
    { code: 'seongsu', name: '성수' },
    { code: 'jamsil', name: '잠실' },
    { code: 'dongdaemun', name: '동대문' },
    { code: 'yeouido', name: '여의도' },
    { code: 'seoulstation-namdaemun', name: '서울역·남대문' },
    { code: 'sinchon', name: '신촌' },
  ],
};

// 숙소 검색 결과. GET /api/lodgings (spec API 9, F1-3b)
export type LodgingType = 'hotel' | 'guesthouse' | 'hanok';

export type Lodging = {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  type: LodgingType;
  typeName: string; // 유형 배지 문구
  lat: number;
  lng: number;
};

const mockLodgings: Lodging[] = [
  {
    id: 'l1',
    name: '명동 센트럴 호텔',
    nameEn: 'Myeongdong Central Hotel',
    address: '서울 중구 명동길 00',
    type: 'hotel',
    typeName: '호텔',
    lat: 37.564,
    lng: 126.985,
  },
  {
    id: 'l2',
    name: '명동 스카이 게스트하우스',
    nameEn: 'Myeongdong Sky Guesthouse',
    address: '서울 중구 퇴계로 00',
    type: 'guesthouse',
    typeName: '게스트하우스',
    lat: 37.561,
    lng: 126.986,
  },
  {
    id: 'l3',
    name: '명동 한옥 스테이',
    nameEn: 'Myeongdong Hanok Stay',
    address: '서울 중구 남대문로 00',
    type: 'hanok',
    typeName: '한옥',
    lat: 37.563,
    lng: 126.981,
  },
];

// TODO: GET /api/lodgings?query= 로 교체. 서버는 이름·주소를 국문·영문으로 검색한다
export const searchMockLodgings = (query: string) => {
  const q = query.trim().toLowerCase();
  return mockLodgings.filter(lodging =>
    [lodging.name, lodging.nameEn, lodging.address].some(text =>
      text.toLowerCase().includes(q),
    ),
  );
};
