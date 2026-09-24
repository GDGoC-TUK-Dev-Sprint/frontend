# Koready Frontend

방한 외국인 전용 여행 계획 서비스의 모바일 클라이언트

## 기술 스택

- React Native 0.87
- TypeScript
- NativeWind v4

## 요구 사항

- Node.js >= 22.11.0
- [React Native 환경 설정](https://reactnative.dev/docs/set-up-your-environment) 완료

## 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS (최초 1회)
bundle install
bundle exec pod install

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
