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
- 지도는 네이버 지도 SDK를 쓴다 (Q8 팀 결정, 2026-10-29). spec §7.6·§15는 아직 Google 기본으로 적혀 있다.
- TODO: 토큰 보안 저장소 라이브러리는 아직 정해지지 않았다.
- 서버는 Spring Boot REST API다(spec §7.2). TODO: 백엔드 저장소 위치.

## 2. 문서 안내 (읽는 순서)

1. @docs/spec.md: 기준 문서(v1.6). 기능(§4), 경비 로직(§5), API 32개(§9), 화면 대응표와 Figma 수정 항목(§10), 미결정 사항(§15). §9와 §10은 Figma를 따른다.
2. @docs/api_schema_core.md: 핵심 외부 API(TourAPI `KorService2`, ODsay)의 필드. 앱이 직접 부르지 않으며, 화면에 나오는 데이터가 어디서 오는지 이해하는 데 쓴다.
3. @docs/api_schema.md: 나머지 외부 API(환율, Papago 등) 전체 스키마.
4. @docs/recommendation_design.md: 추천 순위·동선 알고리즘 상세(서버 로직).
5. @docs/rule.md: TourAPI 계열 호출·저장·표시 규칙(R-xx 번호). 대부분 서버용이고, 프론트 관련 규칙은 6절에 요약했다.
6. @docs/theme_map.json: 테마 ↔ TourAPI 분류체계 매핑 초안.

## 3. 확정된 결정사항 (어기면 안 됨)

- **숙박·항공은 경비에서 제외한다.** 경비 화면과 희망 예산 모두 "숙박·항공 제외" 기준이다 (spec §2.2, §5.1, F1-6).
- **경비는 범위로 표시한다.** 중간값을 크게 보여주고, 범위(알뜰/보통/여유)와 항목별 근거 배지·출처 시트를 함께 둔다 (spec F4-1, F4-2, F4-5, F4-6).
- 경비 화면의 모든 수치는 `GET /api/trips/{tripId}/cost-estimate` 응답 하나에서 나온다. 화면마다 따로 계산하지 않는다 (spec F4-9).
- **로그인이 필수이고 게스트 모드는 없다.** 앱 시작 때 `GET /api/users/me`로 토큰을 확인하고, 실패하면 재발급을 시도한 뒤 로그인 화면으로 보낸다 (spec F8-1, F11).
- 401 응답은 한 곳에서 토큰 재발급(`POST /api/auth/refresh`) 후 재시도한다. 토큰은 기기 보안 저장소에 둔다 (spec F11-4, F11-7).
- **표시 통화는 한 가지만 쓴다.** KRW·JPY·USD·EUR 중 하나를 고르고, 환산은 서버가 한다 (spec F4-8, F7-3).
- **앱 언어는 영어·한국어 2개다.** 기본값은 기기 로케일이고, 지원하지 않는 언어면 영어를 쓴다 (spec F7-1, F7-2).
- 모든 요청에 `Accept-Language: ko | en`과 `X-Currency`를 보낸다. 언어·통화 설정은 서버가 아니라 기기에만 저장한다 (spec F7-4, F7-5, §9.1).
- 화면 문자열은 하드코딩하지 않는다 (spec §12).

## 4. 아직 결정되지 않은 사항 (임의로 구현하지 말고 사용자에게 물어볼 것)

| # | 내용 | 근거 |
|---|---|---|
| Q12 | 비밀번호 찾기·재설정: Figma에 화면이 없고, 이메일을 받지 않아 복구 수단이 없음 | spec §15, F11-9 |
| Q13 | 알림(01a)을 MVP에 넣을지 여부: 화면만 있고 API는 없음 | spec §15, F14 |
| Q14 | 추천 모드 "상관없음"을 화면에 둘지 여부: Figma 조건 입력에 모드 토글이 없음 | spec §15, recommendation_design §12 |
| Q15 | 챗봇 장소 카드의 별점·대기시간·예약 가능 표시: 데이터 소스가 없음 | spec §15, F13-3 |
| Q16 | 번역(F9)과 지도 앱 길 안내 버튼(F10)을 MVP에 유지할지 여부: Figma에 화면·API가 없음 | spec §15 |
| - | 행사/축제 테마(`EV`) 포함 여부: rule.md R-ID02·R-K15는 MVP에서 제외, spec은 테마 8종에 포함 | rule.md §2.1·§3.3, spec F1-7 |

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

- TODO: 릴리스 빌드 명령(Android APK·AAB, iOS 아카이브). 저장소에 스크립트가 없다.
- TODO: 타입 체크 스크립트. 저장소에 스크립트가 없다.
## 6. 코드 규칙과 폴더 구조

### `src/` 폴더 역할

| 폴더 | 넣는 것 |
|---|---|
| `screens/` | 화면 1개 = 파일 1개, 이름은 `○○Screen.tsx` (예: `LoginScreen.tsx`) |
| `components/` | 여러 화면에서 같이 쓰는 UI (예: `AppHeader`, `ScreenPlaceholder`) |
| `navigation/` | 스택·탭 구성(`RootNavigator`, `MainTabs`), 하단 탭바(`TabBar`), 화면 파라미터 타입 |
| `auth/` | 로그인 상태(`AuthContext`). 토큰 저장·재발급은 인증 API 연동 때 추가 |
| `api/` | 서버 API 호출 (spec §9). 아직 없음 |
| `theme/` | `tokens.ts` (색·타이포·간격·라운드·그림자) |
| `assets/` | `fonts/`(Pretendard), `icons/`(Figma 아이콘 SVG), `images/`(로고 등) |
| `utils/` | 화면과 무관한 순수 함수 (예: `date.ts` 날짜 계산). 테스트는 `__tests__/`에 둔다 |
| `mocks/` | API 연동 전 더미 데이터와 그 타입. 더미는 모든 화면이 이 한 곳에서 가져온다 |
| `__tests__/` | Jest 테스트 |

- 색·글자·간격 값은 `src/theme/tokens.ts`에서 가져온다. 디자인 시스템에 없는 Figma 색은 `tokens.ts`에 Figma 값 그대로 넣고 "디자인 시스템에 없음, 확인 필요" 주석을 단다. 예전 화면에는 아직 파일 안 상수로 남은 값이 있다. `tokens.ts`의 `TODO` 값(`primarySoft`, `text.muted`, 그림자 불투명도)은 Figma 확인 전이다 (spec §10.2).
- 굵기는 `fontWeight`가 아니라 `fontFamily`(Pretendard 굵기별 파일)로 지정한다. 폰트를 추가하면 `src/assets/fonts`와 `android/app/src/main/assets/fonts`에 넣고 iOS `Info.plist`·Xcode 리소스에 등록한다.
- 아이콘·로고는 Figma에서 받은 SVG를 `src/assets/`에 두고 `react-native-svg-transformer`로 컴포넌트처럼 import한다. 상태에 따라 색이 바뀌는 아이콘은 선 색을 `currentColor`로 바꾸고 `color` prop으로 지정한다.
- TODO: 화면을 기능별 하위 폴더로 묶을지, 한 화면에서만 쓰는 컴포넌트의 위치, 상태 관리, API 클라이언트 구조. 화면을 구현하면서 정한다.

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
- spec §9의 API 요청·응답 필드는 초안이다(Figma에 정의되어 있지 않음). 확정되지 않은 필드에 의존하는 코드를 쓰기 전에 확인한다.
- 문서끼리 충돌하면 spec.md가 우선한다(단, 1절에서 폐기한 개발 환경 내용은 CLAUDE.md가 우선). 충돌을 발견하면 사용자에게 알린다.
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
