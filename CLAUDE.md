# CLAUDE.md

KOREADY(코레디) 프론트엔드 저장소에서 작업할 때 따르는 안내서다. 세부 내용은 복사하지 않고 `docs/` 문서로 연결한다.

## 1. 프로젝트 소개와 기술 스택

공공데이터로 서울 여행 동선을 짜고, 같은 국적 여행자의 실제 지출 통계로 **범위와 근거가 있는 여행 경비**를 보여주는 방한 외국인 전용 여행 계획 서비스의 모바일 클라이언트다 (@docs/spec.md §1.1).

| 영역 | 현재 저장소 상태 (`package.json` 기준) |
|---|---|
| 프레임워크 | bare React Native CLI, `react-native` 0.87.1, `react` 19.2.3 |
| 언어 | TypeScript (`@react-native/typescript-config`) |
| 테스트·린트 | Jest (`@react-native/jest-preset`), ESLint (`@react-native/eslint-config`), Prettier 2.8.8 |
| 런타임 | Node.js >= 22.11.0 |

- 개발 환경: bare React Native CLI, 맥에서 개발한다. Android·iOS 앱만 만들고 웹 빌드는 하지 않는다.
- spec.md의 Expo, EAS Build, Vercel 웹 배포 관련 내용(§2.3, §7.1, §7.2, §7.5 등)은 폐기되었다. spec이 갱신되기 전까지는 이 CLAUDE.md가 우선한다.
- 푸시 알림, 음성 인식, OCR 등 네이티브 모듈은 아직 선정하지 않았다. 임의로 설치하지 말고 먼저 질문한다.
- 스타일링은 `StyleSheet` + `src/theme/tokens.ts`로 한다. NativeWind는 쓰지 않는다.
- 폰트는 Pretendard, 화면 이동은 React Navigation, 아이콘·로고는 `react-native-svg`(SVG)를 쓴다.
- 지도는 네이버 지도 SDK(`@mj-studio/react-native-naver-map`)를 쓴다 (Q8 팀 결정, 2026-10-29). spec §7.6·§15는 아직 Google 기본으로 적혀 있다.
- 동선 순서 변경(드래그)은 `react-native-sortables`(순수 JS)를 쓴다(2026-11-02 결정). `react-native-gesture-handler` 2.x + `react-native-reanimated` 4 + `react-native-worklets` 위에서 동작한다. `react-native-draggable-flatlist`는 React 19·reanimated 4·New Architecture에서 놓은 카드가 사라지는 문제가 있어 쓰지 않는다.
- 네이버 지도 `Region`의 `latitude`·`longitude`는 중심이 아니라 남서쪽 모서리다(`src/utils/map.ts`). 커스텀 뷰 마커는 `width`·`height`를 주지 않으면 보이지 않는다.
- 토큰 보안 저장소는 `react-native-keychain`을 쓴다(2026-11-16 결정, `src/auth/tokenStorage.ts`).
- 서버는 Spring Boot REST API다(spec §7.2). 백엔드는 같은 조직의 `backend` 저장소이고 `develop` 브랜치가 최신이다.

## 2. 문서 안내 (읽는 순서)

**기준은 팀 설계 문서다 (2026-11-16 대조).** 기능 목록·DB 설계·API 명세의 원본은 팀이 따로 관리하는 비공개 설계 문서(노션 "KOREADY 기능 목록"·"KOREADY DB 설계"·"KOREADY API 명세")이고, 아래 `docs/` 문서는 2026-10-28에 들여온 사본이다. 서로 다르면 팀 설계 문서가 맞다. 이 저장소는 공개 저장소라 팀 설계 문서의 경로·링크·본문을 옮겨 적지 않고, 구현에 필요한 결과만 적는다. `docs/` 문서 중 팀 결정으로 바뀐 부분은 spec.md 맨 위 "0. 팀 설계 결정과 다른 부분"에 모았다.

1. @docs/spec.md: 프론트 명세(v1.7). 팀 결정과 다른 부분(§0), 기능(§4), 경비 로직(§5), API 32개·인증 요청·응답·에러 코드(§9), 화면 대응표와 Figma 수정 항목(§10), 미결정 사항(§15). §9와 §10은 Figma를 따른다.
2. @docs/api_schema_core.md: 핵심 외부 API(TourAPI `KorService2`, ODsay)의 필드. 앱이 직접 부르지 않으며, 화면에 나오는 데이터가 어디서 오는지 이해하는 데 쓴다.
3. @docs/api_schema.md: 나머지 외부 API(환율, Papago 등) 전체 스키마.
4. @docs/recommendation_design.md: 추천 순위·동선 알고리즘 상세(서버 로직). **순위식과 추천 모드는 팀 결정으로 바뀌었다** (spec §0).
5. @docs/rule.md: TourAPI 계열 호출·저장·표시 규칙(R-xx 번호). 대부분 서버용이고, 프론트 관련 규칙은 6절에 요약했다. 연관 관광지·지역별 방문자 수는 적재하지 않기로 했다 (spec §0).
6. @docs/theme_map.json: 테마 ↔ TourAPI 분류체계 매핑 초안. **쓰지 않는다.** 카테고리가 TourAPI 대분류 8개 그대로라 매핑이 필요 없다 (spec §0).

## 3. 확정된 결정사항 (어기면 안 됨)

- **숙박·항공은 경비에서 제외한다.** 경비 화면과 희망 예산 모두 "숙박·항공 제외" 기준이다 (spec §2.2, §5.1, F1-6).
- **경비는 범위(최소~최대)로 표시하고 데이터 한계를 함께 보여준다.** 총액·항목·일자 금액이 모두 범위다. 응답에 1인 기준과 전체 기준이 둘 다 오므로 전환할 때 다시 요청하지 않는다. 근거 출처와 데이터 한계 문장도 응답에 온다. 알뜰/보통/여유 3단계와 중간값 강조는 팀 설계에 없다 (spec §0, 2026-11-16 수정. 이전 문장은 spec F4-1·F4-2 기준이었다).
- 경비 화면의 모든 수치는 `GET /api/trips/{tripId}/cost-estimate` 응답 하나에서 나온다. 화면마다 따로 계산하지 않는다 (spec F4-9).
- **로그인이 필수이고 게스트 모드는 없다.** 앱 시작 때 `GET /api/users/me`로 토큰을 확인하고, 실패하면 재발급을 시도한 뒤 로그인 화면으로 보낸다 (spec F8-1, F11).
- 401 응답은 한 곳(`src/api/client.ts`)에서 토큰 재발급(`POST /api/auth/refresh`) 후 재시도한다. 명세는 `401 TOKEN_EXPIRED`일 때만 재발급하고 `401 UNAUTHORIZED`면 바로 로그인 화면이다. 리프레시 토큰은 한 번만 쓸 수 있어 재발급은 한 번에 하나만 부른다. 토큰은 기기 보안 저장소에 둔다 (spec F11-4, F11-7).
- 오류 응답은 `{code, message, fields}`다. `message`는 개발 확인용이고 화면 문구는 앱이 `code`로 정한다 (spec §9.1).
- **확정한 여행은 편집할 수 없다.** 여행 상태는 `DRAFT`·`CONFIRMED` 두 값이고, 진행 예정·진행 중·완료는 서버가 날짜로 계산해 준다. 끝나지 않은 확정 여행은 사용자마다 하나다 (새로 만들면 `409 ACTIVE_TRIP_EXISTS`).
- **출처 없는 정보(외부 평점·대기시간·예약 가능)는 시안에 있어도 표시하지 않는다.**
- 장소 사진이 나오는 곳에는 "한국관광공사 이미지를 사용하였습니다." 문구를 둔다 (`components/ImageCredit`).
- **표시 통화는 한 가지만 쓴다.** KRW·JPY·USD·EUR 중 하나를 고르고, 환산은 서버가 한다 (spec F4-8, F7-3).
- **앱 언어는 영어·한국어 2개다.** 기본값은 기기 로케일이고, 지원하지 않는 언어면 영어를 쓴다 (spec F7-1, F7-2).
- 모든 요청에 `Accept-Language: ko | en`과 `X-Currency`를 보낸다. 언어·통화 설정은 서버가 아니라 기기에만 저장한다 (spec F7-4, F7-5, §9.1).
- 화면 문자열은 하드코딩하지 않는다 (spec §12).

## 4. 아직 결정되지 않은 사항 (임의로 구현하지 말고 사용자에게 물어볼 것)

| # | 내용 | 근거 |
|---|---|---|
| Q12 | 비밀번호 찾기·재설정: Figma에 화면이 없고, 이메일을 받지 않아 복구 수단이 없음. 팀 설계 문서에도 없음 | spec §15, F11-9 |
| Q13 | 알림(01a)을 서비스 범위에 넣을지: 화면만 있고 API·DB는 없음. 팀에서도 미정 | spec §15, F14 |
| Q16 | 번역(F9)·지도 앱 길 안내(F10)·오프라인 열람(F8): 팀 설계 문서(기능 목록·API)에 없다. spec에만 남은 기능이라 구현하지 않고 먼저 묻는다 | spec §15 |
| - | 기본 표시 통화(국적 통화 / KRW): 팀 미정. 앱은 임시로 KRW를 보낸다 | spec §0 |
| - | 로그인·가입 뒤 이동할 화면, 아이디 중복 확인을 부르는 때와 결과 문구: 시안에 없음. 앱은 임시로 가입 뒤 바로 로그인해 메인으로 가고, 가입하기를 누를 때 중복을 확인한다 | spec §0 |
| - | 경비 세부 규칙(서울 보정, 업종 → 항목, 통계 없는 국적, 범위 기준)과 "기타" 항목: 팀 미정. 응답에 `OTHER`가 없을 수 있다 | spec §0 |
| - | 국적 목록, LLM 제공자(정해지기 전에는 여행 제목·안내 문구가 템플릿이고 챗봇은 동작하지 않음) | spec §0 |

해결된 것: Q14 추천 모드 토글은 두지 않는다(카테고리 필터 + 인기도 순위 한 가지). Q15 챗봇 카드의 별점·대기시간·예약 가능은 표시하지 않는다. 행사/축제(`EV`)는 카테고리 8개에 포함하고 여행 기간과 겹치는 행사만 후보다.

이 밖에 spec에 `[결정 필요]`·`[확인 필요]`로 표시된 항목도 같은 방식으로 다룬다.

## 5. 개발 명령어

```bash
npm install                 # 의존성 설치
bundle install              # iOS 최초 1회
bundle exec pod install     # iOS 최초 1회 (README 기준)

npm start                   # Metro 개발 서버
npm run ios                 # iOS 빌드 및 실행
npm run android             # Android 빌드 및 실행
npm run lint                # ESLint
npm test                    # Jest
```

- 네이버 지도 Client ID는 Git에 올리지 않는다. 빌드 전에 각자 아래 두 파일을 만든다. 없으면 지도만 인증 실패로 회색이 된다.
  - Android: `android/local.properties`에 `NAVER_MAP_CLIENT_ID=값`
  - iOS: `ios/Koready/Secrets.example.xcconfig`를 `ios/Koready/Secrets.xcconfig`로 복사하고 값을 넣는다
- TODO: 릴리스 빌드 명령(Android APK·AAB, iOS 아카이브). 저장소에 스크립트가 없다.
- TODO: 타입 체크 스크립트. 저장소에 스크립트가 없다.
## 6. 코드 규칙과 폴더 구조

### `src/` 폴더 역할

| 폴더 | 넣는 것 |
|---|---|
| `screens/` | 화면 1개 = 파일 1개, 이름은 `○○Screen.tsx` (예: `LoginScreen.tsx`). 화면이 커지면 구역 파일과 상태 훅을 `screens/<화면 이름>/` 하위 폴더에 둔다 (예: `screens/tripCondition/`, `screens/placeDetail/`, `screens/placeSelect/`) |
| `components/` | 여러 화면에서 같이 쓰는 UI (예: `AppHeader`, `Button`, `PlaceCard`). 여행 화면 공통: `TripHeader`(여행 요약 카드·일차 탭), `DayTimeline`(숙소~장소 타임라인), `ImageCredit`(이미지 출처, R-C52), `Pagination` |
| `navigation/` | 스택·탭 구성(`RootNavigator`, `MainTabs`), 하단 탭바(`TabBar`), 화면 파라미터 타입 |
| `auth/` | 로그인 상태(`AuthContext`: 앱 시작 때 토큰 확인, 로그인·가입·로그아웃), 토큰 보안 저장(`tokenStorage`), 가입 입력 규칙(`validation`) |
| `trips/` | 준비 중인 여행 상태(`TripContext`). 조건 입력에서 만들고 메인 티켓·장소 선택·계획 확인·지도·동선이 읽는다. API 연동 전에는 앱을 끄면 사라진다 |
| `api/` | 서버 API 호출 (spec §9). `client.ts`가 서버 주소·공통 헤더·오류(`ApiError`)·401 재발급을 맡고, 기능별 파일(`auth.ts`)이 그것을 쓴다 |
| `theme/` | `tokens.ts` (색·타이포·간격·라운드·그림자) |
| `assets/` | `fonts/`(Pretendard), `icons/`(Figma 아이콘 SVG), `images/`(로고 등) |
| `utils/` | 화면과 무관한 순수 함수 (`date.ts` 날짜, `text.ts` HTML 태그 제거, `map.ts` 지도 영역, `pagination.ts` 페이지 번호). 테스트는 `__tests__/`에 둔다 |
| `mocks/` | API 연동 전 더미 데이터와 그 타입. 더미는 모든 화면이 이 한 곳에서 가져온다 |
| `__tests__/` | Jest 테스트. 네이티브 모듈 대체(네이버 지도 등)는 루트 `jest.setup.js`, SVG 대체는 루트 `__mocks__/svgMock.js` |

- 색·글자·간격 값은 `src/theme/tokens.ts`에서 가져온다. 디자인 시스템에 없는 Figma 색은 `tokens.ts`에 Figma 값 그대로 넣고 "디자인 시스템에 없음, 확인 필요" 주석을 단다. 여러 화면에 반복되는 값은 `tokens.ts`로 옮겼고(`text.secondary`·`text.caption` 등), 한 화면에서만 쓰는 값은 아직 파일 안 상수로 남아 있다. `tokens.ts`의 `TODO` 값(`primarySoft`, `text.muted`, 그림자 불투명도)은 Figma 확인 전이다 (spec §10.2).
- 굵기는 `fontWeight`가 아니라 `fontFamily`(Pretendard 굵기별 파일)로 지정한다. 폰트를 추가하면 `src/assets/fonts`와 `android/app/src/main/assets/fonts`에 넣고 iOS `Info.plist`·Xcode 리소스에 등록한다.
- 아이콘·로고는 Figma에서 받은 SVG를 `src/assets/`에 두고 `react-native-svg-transformer`로 컴포넌트처럼 import한다. 상태에 따라 색이 바뀌는 아이콘은 선 색을 `currentColor`로 바꾸고 `color` prop으로 지정한다.
- 한 화면에서만 쓰는 구역 컴포넌트와 상태 훅은 `screens/<화면 이름>/`에 둔다. 여러 화면이 쓸 수 있는 UI는 `components/`에 둔다.
- API 호출은 `src/api/client.ts`의 `request()`를 거친다. 화면에서 `fetch`를 직접 부르지 않는다. TODO: 상태 관리.

### rule.md 중 프론트에 해당하는 규칙

- **R-C01**: 앱·웹은 TourAPI를 직접 호출하지 않는다. 모든 외부 API는 서버를 거친다.
- **R-C10**: 인증키는 서버 비밀 저장소에만 둔다. 코드, Git, 앱 번들, 로그에 넣지 않는다.
- **R-C52**: 장소 화면과 앱 정보 화면에 출처를 표시한다 (예: "자료: 한국관광공사 TourAPI").
- **R-K09**: 이용시간·휴무·요금은 자유 텍스트다. HTML 태그(`<br>` 등)를 제거해 표시하고, 파싱에 실패하면 원문을 보여주며 "정보가 다를 수 있어요"를 붙인다.
- **R-K11**: 이미지 저작권 `Type3`은 원본 그대로 쓴다. 자르기, 필터, 글자 덧씌우기를 하지 않는다. `Type1`은 출처를 표시해 쓴다.
- **R-K12**: TourAPI 이미지 URL이 `http://`로 올 수 있다. 처리 방식은 서버에서 확인 중이다.
- 나머지 규칙(호출 형식, 한도, 배치, 코드 체계)은 서버용이다. 필요하면 @docs/rule.md 를 본다.

## 7. 작업 방식 규칙

- 모르는 API, 응답 필드, 색상, 문구는 추측해서 만들지 않는다. `docs/`에서 찾고, 없으면 사용자에게 질문한다.
- API 요청·응답 필드는 팀 API 명세가 기준이고 spec §9.6의 예시는 옛 초안이다. 백엔드 구현이 명세와 다를 수 있으니, 연동 전에 `backend` 저장소 `develop`의 컨트롤러·DTO를 함께 확인한다.
- 문서끼리 충돌하면 팀 설계 문서 > spec.md 순서다(단, 1절에서 폐기한 개발 환경 내용은 CLAUDE.md가 우선). 충돌을 발견하면 사용자에게 알린다.
- 이 저장소는 공개 저장소다. 팀 설계 문서의 경로·링크·본문, Figma 링크를 파일·커밋·이슈·PR에 쓰지 않는다.
- Figma는 읽기만 하고 수정하지 않는다.
- 키, 시크릿, 토큰을 코드, 문서, 커밋, 로그에 넣지 않는다 (spec §11, rule.md R-C10).
- 한 번에 큰 변경을 하지 않는다. 작은 단위로 나눠 진행한다.

## 8. Git 규칙

- 커밋은 Conventional Commits 형식(`타입(범위): 내용`)을 따르고 한국어로 쓴다. 예: `feat(auth): 로그인 화면 추가`
- PR은 Squash and merge로 합친다. PR 제목이 Squash 커밋 제목이 되므로 PR 제목도 Conventional Commits 형식으로 쓴다.
- 커밋 메시지와 PR 본문에 Claude, Anthropic, `Co-Authored-By`, "Generated with Claude Code" 문구를 넣지 않는다.
- 브랜치 이름은 `타입/이슈번호-설명` 형식으로 짓는다. `main`에 직접 푸시하지 않는다.
- 작업 브랜치는 `develop`에서 만들고 PR로 `develop`에 합친다. `main`에는 최종 단계에서 `develop`을 PR로 합친다.
- PR과 이슈는 조직 `GDGoC-TUK-Dev-Sprint/.github` 저장소의 템플릿(`bug_report`, `feature_request`, `PULL_REQUEST_TEMPLATE`)을 따른다. 이 저장소에 `.github/ISSUE_TEMPLATE`을 따로 만들면 조직 템플릿이 적용되지 않으므로 만들지 않는다.
- 커밋, 푸시, PR 생성 전에 반드시 사용자에게 먼저 확인한다.
