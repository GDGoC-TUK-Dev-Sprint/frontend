# Koready Frontend

방한 외국인 전용 여행 계획 서비스의 모바일 클라이언트

## 기술 스택

- React Native 0.87 (bare React Native CLI, Expo 미사용)
- TypeScript
- React Navigation 7 (native-stack, bottom-tabs)
- 스타일링: `StyleSheet` + `src/theme/tokens.ts` (Figma 디자인시스템 기준)
- 폰트: Pretendard

맥에서 개발하며 Android·iOS 앱만 만든다(웹 빌드 없음).

## 요구 사항

- Node.js >= 22.11.0
- [React Native 환경 설정](https://reactnative.dev/docs/set-up-your-environment) 완료

## 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS (최초 1회, 네이티브 의존성이 바뀔 때마다 pod install 다시 실행)
bundle install
cd ios && bundle exec pod install && cd ..

# 실행
npm start        # Metro 서버
npm run ios      # iOS
npm run android  # Android
```

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm start` | Metro 개발 서버 실행 |
| `npm run ios` | iOS 앱 빌드 및 실행 |
| `npm run android` | Android 앱 빌드 및 실행 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Jest 테스트 실행 |

## 문서

- `CLAUDE.md`: 작업 규칙, 확정·미결정 사항, Git 규칙(브랜치·커밋·PR)
- `docs/spec.md`: 서비스 명세 (기능, 경비 로직, API, 화면)
- `docs/`의 나머지 문서: 외부 API 스키마, 추천 알고리즘, TourAPI 사용 규칙
