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
