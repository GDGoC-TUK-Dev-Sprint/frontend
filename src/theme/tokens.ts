// src/theme/tokens.ts
// 출처: 피그마 디자인 시스템 섹션 (스크린샷 기준 초안)
// TODO 표시는 피그마 라벨과 실제 색이 달라 보여서 확인이 필요한 값입니다.

export const colors = {
  brand: {
    primary: '#0078FF',
    primarySoft: '#DBEAFF', // TODO 피그마 라벨이 #0078FF로 적혀 있음. 색 견본에서 추정한 값
    surfaceSubtle: '#EFF6FF', // surface-brand-subtle
  },
  surface: {
    default: '#FFFFFF',
    base: '#F8F9FC',
    subtle: '#F2F3F8',
    negativeSoft: '#FFF2F2',
    negativeSubtle: '#FFEAEA',
  },
  text: {
    base: '#383838',
    muted: '#6A7384', // TODO 피그마 라벨이 #383838로 적혀 있음. 색 견본에서 추정한 값
    subtle: '#94A3B8',
    negative: '#FA5252',
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
  display:       { fontSize: 28, fontFamily: fontFamily.bold, lineHeight: px(28, 1.1) },
  titleStrong:   { fontSize: 22, fontFamily: fontFamily.bold, lineHeight: px(22, 1.3) },
  titleBase:     { fontSize: 16, fontFamily: fontFamily.medium, lineHeight: px(16, 1.4) },
  bodyStrong:    { fontSize: 14, fontFamily: fontFamily.semibold, lineHeight: px(14, 1.5) },
  bodyBase:      { fontSize: 14, fontFamily: fontFamily.regular, lineHeight: px(14, 1.5) },
  bodySubtle:    { fontSize: 12, fontFamily: fontFamily.medium, lineHeight: px(12, 1.5) },
  captionBase:   { fontSize: 11, fontFamily: fontFamily.regular, lineHeight: px(11, 1.6) },
  captionSubtle: { fontSize: 10, fontFamily: fontFamily.regular, lineHeight: px(10, 1.6) },
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

// React Native 그림자 (피그마: y 4, blur 12)
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // TODO 피그마 그림자 불투명도 확인
    shadowRadius: 12,
    elevation: 4, // Android
  },
  bottomBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, // TODO 피그마 그림자 불투명도 확인
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
