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
export type Trip = {
  tripNumber: string;
  dDay: number;
  title: string;
  region: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  travelers: number;
  thumbnail: ImageSourcePropType;
  thumbnailLabel: string;
  stops: string[];
};

export const mockFeaturedCourse: FeaturedCourse = {
  title: '종로 · 청계천 힐링 산책로',
  description: '도심 속 물길 따라 걷는 여유로운 하루',
  image: require('../assets/images/dummy-course.jpg'),
};

export const mockTrip: Trip = {
  tripNumber: 'TK-2024',
  dDay: 12,
  title: '서울 감성 카페 & 도심 힐링 탐방',
  region: '서울',
  startDate: '2026-09-18',
  endDate: '2026-09-20',
  travelers: 2,
  thumbnail: require('../assets/images/dummy-place.jpg'),
  thumbnailLabel: '성수동',
  stops: ['성수동 카페거리 → 서울숲', '경복궁 & 서촌 미식 투어'],
};

// 알림 (01a 알림 확인). 알림 API가 없다 (spec F14, Q13)
export type NotificationCategory = 'schedule' | 'visit' | 'notice';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
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
