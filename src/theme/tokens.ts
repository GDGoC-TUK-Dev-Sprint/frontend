// src/theme/tokens.ts
// 출처: 피그마 디자인 시스템 섹션 (스크린샷 기준 초안)
// TODO 표시는 피그마 라벨과 실제 색이 달라 보여서 확인이 필요한 값입니다.

export const colors = {
  brand: {
    primary: '#0078FF',
    primarySoft: '#DBEAFE', // brand-primary-soft
    surfaceSubtle: '#EFF6FF', // surface-brand-subtle
  },
  surface: {
    default: '#FFFFFF',
    base: '#F8F9FC',
    subtle: '#F2F3F8',
    negativeSoft: '#FFF2F2',
    negativeSubtle: '#FFEAEA',
    iconBg: '#F1F5F9', // 아이콘 배경 (알림·공지·조건 카드) — 디자인 시스템에 없음, 확인 필요
  },
  text: {
    base: '#383838',
    muted: '#697383', // text-muted
    subtle: '#94A3B8',
    negative: '#FA5252',
    // 아래 세 값은 디자인 시스템에 없음, 확인 필요 (Figma 화면에 직접 쓰인 값)
    strong: '#1A1C1C', // 조건 입력 제목·입력값
    label: '#354153', // 입력 라벨, 시트·알림 제목
    emphasis: '#0F172A', // 인원 숫자
    faint: '#B4BBCB', // 공지 날짜 (디자인 시스템에 없음, 확인 필요)
    // 아래 값도 디자인 시스템에 없음, 확인 필요 (여러 화면의 Figma에 반복해 쓰인 값)
    heading: '#1F242E', // 헤더·로그인 제목, 지도 요약 제목
    secondary: '#475569', // 분류 태그, 시간대, 언어 버튼
    info: '#64748B', // 안내 상자 글자
    notice: '#6B7380', // 로그인 안내, 지도 요약 설명
    caption: '#737A87', // 이미지 출처 문구 (R-C52)
    helper: '#9EA6B2', // 회원가입 도움말, 로그인 "또는"
  },
  // 디자인 시스템에 없음, 확인 필요
  icon: {
    strong: '#334155', // 인원 − 아이콘
  },
  // 디자인 시스템에 없음, 확인 필요
  border: {
    divider: '#E8E8E8', // 조건 입력 섹션 구분선
    light: '#EEEEEE', // 공지 상세 구분선
    subtle: '#F1F5F9', // 시트·카드 테두리, 숙소 검색 구분선
    line: '#E5E8ED', // 하단 탭바 테두리, 로그인 "또는" 구분선
  },
} as const;

// 폰트 패밀리는 피그마에 적혀 있지 않아 팀 결정으로 Pretendard 사용 (src/assets/fonts)
// 굵기는 fontWeight가 아니라 굵기별 폰트 파일로 지정한다 (Android에서 fontWeight를 같이 주면 대체 폰트로 바뀔 수 있음)
export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

// lineHeight는 피그마의 배수(1.1 등)를 px로 환산해 둠 (React Native는 px 단위)
const px = (size: number, ratio: number) => Math.round(size * ratio);

export const typography = {
  display: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    lineHeight: px(28, 1.1),
  },
  titleStrong: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    lineHeight: px(22, 1.3),
  },
  titleBase: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    lineHeight: px(16, 1.4),
  },
  bodyStrong: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    lineHeight: px(14, 1.5),
  },
  bodyBase: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    lineHeight: px(14, 1.5),
  },
  bodySubtle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    lineHeight: px(12, 1.5),
  },
  captionBase: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    lineHeight: px(11, 1.6),
  },
  captionSubtle: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    lineHeight: px(10, 1.6),
  },
} as const;

export const spacing = {
  screenPadding: 16, // 상하좌우 padding
  sectionGap: 20, // 메인 영역의 섹션 간격
  groupGap: 16, // 그룹 안 콘텐츠 간격
} as const;

export const radius = {
  cardLarge: 16,
  cardSmall: 12,
} as const;

// 피그마 effect 스타일 card·footer. boxShadow는 CSS box-shadow와 같아 피그마 값을 그대로 쓴다
// shadow* + elevation 대신 쓰는 이유: Android elevation은 색·불투명도를 지정할 수 없다 (New Architecture 필요)
export const shadow = {
  card: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' },
  bottomBar: { boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.05)' },
} as const;
