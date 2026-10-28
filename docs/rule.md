# rule.md — 외부 API 사용 규칙 (TourAPI 계열)

KOREADY가 쓰는 한국관광공사·한국문화관광연구원 API에서 **어떤 데이터를 얻을 수 있고, 어떻게 호출·저장·표시해야 하는지**를 정리한 규칙서입니다.

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.1 (2026-10-05). 위치기반 조회(`locationBasedList2`) 사용 규칙 R-K14, R-K17~R-K19 추가 |
| 근거 | 업로드된 공식 매뉴얼 9개와 코드표 2개(아래 §0.2). 문서에 없는 내용은 `[추정]`, 확인하지 못한 내용은 `[확인 필요]`로 표시 |
| 관계 | `spec.md`가 "무엇을 만들 것인가"라면 이 문서는 "외부 API를 어떻게 다룰 것인가". 충돌하면 이 문서의 사실 부분(파라미터·코드)을 우선하고 spec을 고친다 |
| 상세 명세 | 필드 전체 목록은 `KorService2_데이터_명세서.xlsx`(국문 관광정보 서비스)를 참고 |

규칙 표기: **반드시**(어기면 장애·계정 문제), **권장**(품질·유지보수), **금지**. 규칙 번호(R-xx)는 코드 리뷰·이슈에서 인용한다.

---

## 0. 한눈에 보기

### 0.1 쓰는 API

| # | 서비스 | 서비스 ID / 주소 | 오퍼레이션 | 얻는 데이터 | 갱신 | 우리 사용 방식 |
|---|---|---|---|---|---|---|
| 1 | 국문 관광정보 서비스 | `KorService2` · `apis.data.go.kr/B551011/KorService2` | 13개 | 장소 목록·상세(이용시간·입장료·개요)·이미지·숙박·법정동/분류 코드 | 일 1회 | **매일 배치 → DB 적재** (MVP 핵심) |
| 2 | 관광지별 연관 관광지 정보 | `TarRlteTarService1` | 2개 | 관광지별 함께 방문하는 곳 순위(최대 50위) | 월 1회(매월 8일) | **월 배치 → DB 적재** |
| 3 | 관광사진갤러리 서비스 | `PhotoGalleryService1` | 4개 | 관광사진(웹용 이미지 URL, 촬영월·장소·촬영자·키워드) | 일 1회 | 보조 이미지(라이선스 확인 후) |
| 4 | 관광 빅데이터 정보 서비스 | `DataLabService` | 2개 | 시도·시군구별 일일 방문자 수(현지인/외지인/외국인) | 일 1회 | 지역 인기도 보강(2차), 배치 |
| 5 | 관광실태조사 외래관광객 | `TourismAccdtOutService` (한국문화관광연구원) | 3개 | 방문지역 비율, 방한 활동 비율, 1인 평균 지출(US$) | 연 단위 | **검증용 기준값**(수동·연 1회) |
| 6 | 시군구 코드정보(파일) | `한국관광공사_TourAPI_관광지_시군구_코드정보_v1_0.xlsx` | - | 시도·시군구 코드 252개(서울 25개) | - | 코드표로 DB 적재 |
| 7 | 신분류체계 연계 정의서(파일) | `신분류체계정보_관광타입정보_연계_정의서.xlsx` | - | 대·중·소분류 240개 ↔ 관광타입 | - | 코드표·테마 매핑 기초 |

### 0.2 근거 문서 (약어는 규칙의 근거 표기에 사용)

| 약어 | 문서 | 버전 |
|---|---|---|
| `[M44]` | 한국관광공사_개방데이터_활용매뉴얼_국문 | Ver 4.4 (2026-02-10) |
| `[APPLY]` | TourAPI 활용 신청 매뉴얼(두 파일의 본문이 동일) | Ver 3.3 (2024-03-27) |
| `[REL]` | 관광지별 연관관광지 정보 활용매뉴얼 | Ver 4.1 (2025-05-23) |
| `[PHOTO]` | 관광사진갤러리 활용매뉴얼 | Ver 4.2 (2024-03-27) |
| `[BIG]` | 관광 빅데이터 정보활용 매뉴얼 | Ver 4.1 (2024-03-27) |
| `[KCTI]` | 관광실태조사_외래관광객 OPEN API 활용가이드 | v1.0 |
| `[SG]` | TourAPI 관광지 시군구 코드정보 | v1.0 |
| `[LCLS]` | 신분류체계정보 관광타입정보 연계 정의서 | - |
| `[SPEC]` | 팀의 `spec.md` 결정사항 | v1.4 |

### 0.3 이 문서가 다루지 않는 API (문서 미확보)

ODsay(대중교통 경로·운임), 한국수출입은행 환율, Papago 번역, 지도 SDK, 서울시·서울관광재단 통계 파일, 다국어 관광정보 서비스(영문·일문·중문)는 공식 문서를 받지 못해 규칙을 정하지 않았습니다. §9에서 확인할 항목을 정리했습니다.

---

## 1. 공통 규칙 (모든 TourAPI 계열: 1~4번)

### 1.1 호출 형식

| 규칙 | 내용 | 근거 |
|---|---|---|
| **R-C01** 반드시 | 모든 호출은 **서버(백엔드)** 에서만 한다. 앱·웹 프론트는 TourAPI를 직접 호출하지 않는다 | `[SPEC]` §11 |
| **R-C02** 반드시 | HTTP GET, 주소는 `https://apis.data.go.kr/B551011/{서비스}/{오퍼레이션}`. 문서는 HTTP·HTTPS 모두 [O]로 표기하지만 우리는 HTTPS만 쓴다 | `[M44]` 서비스 개요 |
| **R-C03** 반드시 | 필수 공통 파라미터 3개: `serviceKey`, `MobileOS`, `MobileApp`. `MobileOS=ETC`, `MobileApp=KOREADY`로 고정한다 | `[M44]` 요청 표. `MobileApp`은 서비스별 활용 통계용이며 URL 요청 시 반드시 기재 |
| **R-C04** 권장 | `MobileOS` 허용값 표기가 문서마다 다르다(`[M44]`·`[REL]` IOS/AND/WEB/ETC, `[PHOTO]`·`[BIG]` IOS/AND/WIN/ETC). 서버 호출은 모든 문서에서 공통으로 허용되는 `ETC`만 쓴다 | 문서 대조 |
| **R-C05** 반드시 | 항상 `_type=json`을 붙인다. 기본 응답은 XML이다 | `[M44]` |
| **R-C06** 반드시 | 모든 문자 인코딩은 UTF-8. 한글 키워드(`keyword`, `title`)는 URL 인코딩해서 보낸다 | `[M44]` `[PHOTO]` |
| **R-C07** 금지 | 매뉴얼의 예시 URL을 그대로 복사해 쓰지 않는다(오타·옛 오퍼레이션이 섞여 있음, §10) | 문서 대조 |

### 1.2 인증키

| 규칙 | 내용 | 근거 |
|---|---|---|
| **R-C10** 반드시 | 인증키는 AWS 비밀 저장소(Secrets Manager 또는 Parameter Store)에만 둔다. 코드·Git·앱 번들·로그·채팅·이슈에 쓰지 않는다 | `[SPEC]` §7·§11 |
| **R-C11** 반드시 | 인증키가 `%`를 포함한 인코딩 형태이든 원문이든 **HTTP 클라이언트에서 한 번만 인코딩**한다. 이중 인코딩 금지(코드 30 "등록되지 않은 서비스키"의 흔한 원인). 2015년 1월 이후 발급 키는 별도 인코딩이 필요 없다고 문서에 적혀 있다 | `[REL]` `[PHOTO]` `[BIG]` |
| **R-C12** 반드시 | 공공데이터포털 인증키는 계정에서 발급되며 여러 API에 같은 키를 쓰는 것으로 추정되지만 `[추정]`, 서비스마다 활용신청·승인은 따로 필요하다 | `[APPLY]` 활용신청 절차 |
| **R-C13** 권장 | 인증키 재발급은 포털이 권고하지 않는다고 매뉴얼에 적혀 있다. 노출 사고가 나면 즉시 포털 Q&A로 재발급 가능 여부를 문의한다 | `[APPLY]` |

### 1.3 계정·한도·승인

| 규칙 | 내용 | 근거 |
|---|---|---|
| **R-C20** 반드시 | 개발계정 한도: `[APPLY]`는 **오퍼레이션별 일 1,000건**, 각 서비스 매뉴얼은 **일 1,000건**이라고 쓴다. 두 표현이 다르므로 오퍼레이션별로 따로 센다고 가정하지 말고 **첫 대량 호출에서 실제 적용 방식을 확인**한다 | `[APPLY]` `[M44]` `[REL]` `[PHOTO]` `[BIG]` |
| **R-C21** 반드시 | 호출 가드: **오퍼레이션별 하루 900회**에서 자동 중단하고 `state`를 저장한다. 다음 실행은 이어받기. 한도 초과(코드 22)에서는 재시도하지 않는다 | `[SPEC]` 수집 스크립트 |
| **R-C22** 반드시 | 개발계정 승인은 자동. 소요 시간 표기가 문서마다 다르다(`[M44]` 약 10분, `[APPLY]` 10~30분, 서비스별 매뉴얼 약 30분). 신청 후 **30분 이후** 호출을 시작한다 | 문서 대조 |
| **R-C23** 반드시 | **운영계정**은 한국관광공사 담당자의 승인(약 1~3일)이 필요하다. 승인 시 활용 앱/웹 URL과 **개발계정의 호출 이력**을 확인하고, 활용사례로 등록·홍보된다. 승인 후 24개월 사용, 만료 시 연장신청 | `[APPLY]` |
| **R-C24** 권장 | 개발 기간(10월~)에 호출 이력을 쌓고, 웹 데모 URL(Vercel)을 준비한 뒤 운영계정을 신청한다. 사용하는 서비스(1~4번)마다 따로 신청한다 | `[APPLY]` `[SPEC]` |
| **R-C25** 반드시 | 활용신청 시 활용목적·상세기능·**라이선스 표시 동의**는 필수 입력이다. 공공데이터포털 계정 소유자(팀 대표 1명)가 신청하고 24개월 연장도 맡는다 | `[APPLY]` |

### 1.4 오류 처리

포털 오류는 **XML로만** 온다(`_type=json`을 붙여도 JSON이 아님). 응답을 JSON으로 파싱하다 실패하면 XML의 `returnReasonCode`를 읽는다.

**공공데이터포털 오류코드** (`[M44]` `[REL]` `[PHOTO]` `[BIG]` 동일)

| 코드 | 메시지 | 뜻 | 우리 처리 |
|---|---|---|---|
| 01 | `APPLICATION_ERROR` | 어플리케이션 에러 | 3회 재시도 |
| 04 | `HTTP_ERROR` | HTTP 에러 | 3회 재시도 |
| 12 | `NO_OPENAPI_SERVICE_ERROR` | 해당 오픈API 서비스가 없거나 폐기됨 | 즉시 중단·알림(서비스 주소·버전 확인) |
| 20 | `SERVICE_ACCESS_DENIED_ERROR` | 서비스 접근 거부 | 즉시 중단·알림(활용신청·승인 확인) |
| 22 | `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR` | 서비스 요청 제한 횟수 초과 에러 | 오늘 중단, 다음 날 이어받기(재시도 금지) |
| 30 | `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` | 등록되지 않은 서비스키 | 즉시 중단·알림(키·인코딩 확인) |
| 31 | `DEADLINE_HAS_EXPIRED_ERROR` | 활용 기간 만료 | 즉시 중단·알림(활용기간 연장) |
| 32 | `UNREGISTERED_IP_ERROR` | 등록되지 않은 IP | 즉시 중단·알림(IP 등록 확인) |
| 99 | `UNKNOWN_ERROR` | 기타 에러 | 1회 재시도 후 알림 |

**제공기관(한국관광공사) 오류코드** (`resultCode`는 정상일 때 `0000`)

| 코드 | 메시지 | 뜻 |
|---|---|---|
| 00 | `NORMAL_CODE` | 정상 |
| 01 | `APPLICATION_ERROR` | 어플리케이션 에러 |
| 02 | `DB_ERROR` | 데이터 베이스 에러 |
| 03 | `NODATA_ERROR` | 데이터 없음 에러 |
| 04 | `HTTP_ERROR` | HTTP 에러 |
| 05 | `SERVICETIMEOUT_ERROR` | 서비스 연결 실패 에러 |
| 10 | `INVALID_REQUEST_PARAMETER_ERROR` | 잘못된 요청 파라메터 에러 |
| 11 | `NO_MANDATORY_REQUEST_PARAMETERS_ERROR` | 필수 요청 파라메터가 없음 |
| 12 | `NO_OPENAPI_SERVICE_ERROR` | 해당 오픈API서비스가 없거나 폐기됨 |
| 20 | `SERVICE_ACCESS_DENIED_ERROR` | 서비스 접근 거부 |
| 21 | `TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR` | 일시적으로 사용할 수 없는 서비스 키 |
| 22 | `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR` | 서비스 요청 제한 횟수 초과 에러 |
| 30 | `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` | 등록되지 않은 서비스키 |
| 31 | `DEADLINE_HAS_EXPIRED_ERROR` | 활용기간 만료 |
| 32 | `UNREGISTERED_IP_ERROR` | 등록되지 않은 IP |
| 33 | `UNSIGNED_CALL_ERROR` | 서명되지 않은 호출 |
| 99 | `UNKNOWN_ERROR` | 기타 에러 |

| 규칙 | 내용 |
|---|---|
| **R-C30** 반드시 | JSON 파싱 실패 시 XML `returnReasonCode`를 로그에 남기고 위 표대로 처리한다. 인증키·요청 URL 전체는 로그에 남기지 않는다(키가 URL에 포함됨) |
| **R-C31** 반드시 | 네트워크 오류·코드 01/04는 2·4·6초 간격 최대 3회 재시도. 코드 12·20·30·31·32는 재시도 없이 배치를 멈추고 알림 |
| **R-C32** 반드시 | `resultCode`가 `0000`이 아니면 실패로 처리한다. 결과 없음은 `0000`이면서 `totalCount=0`이다 `[추정]` |

### 1.5 응답 처리

| 규칙 | 내용 | 근거 |
|---|---|---|
| **R-C40** 반드시 | 응답 구조: `response.header`(`resultCode`, `resultMsg`) + `response.body`(`items.item[ ]`, `numOfRows`, `pageNo`, `totalCount`) | `[M44]` 예제 |
| **R-C41** 반드시 | 결과 없음이면 `items`가 빈 문자열로, 결과가 1건이면 `item`이 배열이 아닌 단일 객체로 오는 경우가 있다고 여러 개발 사례가 기록한다. `items`·`item` 모두 방어 처리한다 | 개발 사례 `[추정]`, 문서에는 없음 |
| **R-C42** 반드시 | `item` 안의 필드는 **이름으로 접근**한다. 문서는 "XML·JSON에서 item 노드부터는 알파벳 순서로 정렬된다"고 적는다(`[REL]` `[BIG]`) | `[REL]` `[BIG]` |
| **R-C43** 반드시 | 값은 대부분 문자열로 온다(좌표·ID 포함). 서버에서 숫자·날짜로 변환하고, 빈 문자열은 `NULL`로 저장한다 | `[M44]` 예제 |
| **R-C44** 반드시 | 페이지네이션: 첫 호출을 `numOfRows=1`로 해서 `totalCount`를 읽고 `ceil(totalCount / numOfRows)` 페이지를 순회한다. `numOfRows` 최대값은 문서에 없으므로 100에서 시작하고 오류가 나면 50 → 10으로 줄인다 | `[확인 필요]` |
| **R-C45** 권장 | 응답 원문(JSON)은 `raw` 컬럼(JSONB)에 보존하고 필요한 필드만 정규 컬럼으로 뽑는다. 문서 개정으로 필드가 늘고 줄어도 재수집 없이 대응할 수 있다 | `[M44]` 개정이력(v4.3·v4.4 삭제) |

### 1.6 저장·갱신·표시

| 규칙 | 내용 |
|---|---|
| **R-C50** 반드시 | **사용자 요청 시점에 TourAPI를 호출하지 않는다.** 모든 데이터는 배치로 DB에 적재한 뒤 우리 API로 서빙한다. 호출 한도와 응답 지연 때문이다 `[SPEC]` |
| **R-C51** 반드시 | 배치 주기: 국문 관광정보 매일 1회(새벽) · 연관 관광지 월 1회(매월 8일 이후) · 빅데이터 주 1회 이상 · 관광사진 필요 시 · 외래관광객 조사 연 1회. 제공기관 갱신 주기 이상으로 자주 부르지 않는다 |
| **R-C52** 반드시 | 모든 장소 화면과 앱 정보 화면에 출처를 표시한다. 예: "자료: 한국관광공사 TourAPI". 라이선스 표시 동의를 한 이상 표기는 필수다 `[APPLY]` |
| **R-C53** 권장 | 데이터 갱신일을 기록해 화면에 "마지막 갱신일"을 표시하고, "정보가 틀려요" 신고를 받는다 `[SPEC]` |
| **R-C54** 권장 | 문서가 개정되면 파라미터·필드가 삭제된 사례가 있다(v4.3 키워드 검색의 관광타입 삭제, v4.4 지역코드 삭제). **월 1회** 매뉴얼 개정 여부와 응답 스키마를 점검하는 계약 테스트를 돌린다 `[M44]` |

---

## 2. 코드와 ID 규칙

### 2.1 관광타입 (`contentTypeId`)

| 코드 | 국문 서비스 | 다국어 서비스 코드(`[LCLS]`) | MVP |
|---|---|---|---|
| 12 | 관광지 | 76 | 사용 |
| 14 | 문화시설 | 78 | 사용 |
| 15 | 행사/공연/축제 | 85 | 제외 |
| 25 | 여행코스 | - | 제외 |
| 28 | 레포츠 | 75 | 사용 |
| 32 | 숙박 | 80 | 사용 |
| 38 | 쇼핑 | 79 | 사용 |
| 39 | 음식점 | 82 | 사용 |

| 규칙 | 내용 |
|---|---|
| **R-ID01** 반드시 | 국문 서비스의 타입 코드와 다국어 서비스의 타입 코드는 **다르다**(예: 관광지 12 ↔ 76). 언어별 서비스를 붙일 때 매핑표를 따로 둔다 |
| **R-ID02** 권장 | 행사(15)·여행코스(25)는 MVP에서 수집하지 않는다 `[SPEC]` |

### 2.2 지역 코드 — 두 가지 체계가 섞여 있다

| 체계 | 쓰는 곳 | 형태 | 서울 |
|---|---|---|---|
| 법정동 코드(국문 서비스) | `KorService2` | 시도 `lDongRegnCd` 2자리 + 시군구 `lDongSignguCd` **3자리** | `11` + `110`(종로구) 등 |
| 시군구 코드(5자리) | `TarRlteTarService1`(`areaCd`+`signguCd`), `DataLabService`(`areaCode`, `signguCode`), `[SG]` 파일 | 시도 2자리, 시군구 **5자리** | `11` / `11110`(종로구) 등 |

| 규칙 | 내용 |
|---|---|
| **R-ID10** 반드시 | 내부 DB의 지역 키는 **5자리 시군구 코드 하나**로 통일한다(`sigungu_cd`). KorService2 응답은 `lDongRegnCd + lDongSignguCd`를 이어 붙여 변환한다 |
| **R-ID11** 확인 필요 | 변환의 근거는 매뉴얼 예시 대조다. `lDongRegnCd=26, lDongSignguCd=380`이 부산 사하구, `50 + 130`이 서귀포시이며 `[SG]` 파일에서 26380 사하구, 50130 서귀포시와 일치한다 `[추정]`. 서울 실제 응답으로 확인한 뒤 확정한다 |
| **R-ID12** 반드시 | `lDongSignguCd`를 쓰려면 `lDongRegnCd`가 필수다. 서울 전체는 `lDongRegnCd=11`만 쓴다 `[M44]` |

**서울 시군구 25개** (`[SG]` 파일)

| 시군구 | 시군구코드(5자리) | KorService2 `lDongSignguCd`(뒤 3자리, 추정) |
|---|---|---|
| 종로구 | 11110 | 110 |
| 중구 | 11140 | 140 |
| 용산구 | 11170 | 170 |
| 성동구 | 11200 | 200 |
| 광진구 | 11215 | 215 |
| 동대문구 | 11230 | 230 |
| 중랑구 | 11260 | 260 |
| 성북구 | 11290 | 290 |
| 강북구 | 11305 | 305 |
| 도봉구 | 11320 | 320 |
| 노원구 | 11350 | 350 |
| 은평구 | 11380 | 380 |
| 서대문구 | 11410 | 410 |
| 마포구 | 11440 | 440 |
| 양천구 | 11470 | 470 |
| 강서구 | 11500 | 500 |
| 구로구 | 11530 | 530 |
| 금천구 | 11545 | 545 |
| 영등포구 | 11560 | 560 |
| 동작구 | 11590 | 590 |
| 관악구 | 11620 | 620 |
| 서초구 | 11650 | 650 |
| 강남구 | 11680 | 680 |
| 송파구 | 11710 | 710 |
| 강동구 | 11740 | 740 |

### 2.3 분류체계 (`lclsSystm1~3`)

- 대분류 2자리 → 중분류 4자리 → 소분류 8자리(예: `FD` → `FD05` → `FD050100`)
- 서비스분류코드(`cat1~3`)는 v4.4에서 **삭제**됐다. 분류 필터와 응답은 분류체계 코드만 쓴다 `[M44]`
- 목록 API 요청: `lclsSystm2`는 `lclsSystm1`이 필수이고, `lclsSystm3`는 1·2가 필수 `[M44]`

| 대분류 | 이름 | 중분류 수 | 소분류 수 | 연결되는 관광타입(소분류 수) |
|---|---|---|---|---|
| `AC` | 숙박 | 6 | 14 | 레포츠 4, 숙박 10 |
| `EV` | 축제/공연/행사 | 3 | 20 | 행사 20 |
| `EX` | 체험관광 | 7 | 31 | 관광지 31 |
| `FD` | 음식 | 5 | 21 | 음식점 21 |
| `HS` | 역사관광 | 4 | 24 | 관광지 24 |
| `LS` | 레저스포츠 | 4 | 40 | 레포츠 40 |
| `NA` | 자연관광 | 5 | 27 | 관광지 27 |
| `SH` | 쇼핑 | 7 | 13 | 쇼핑 13 |
| `VE` | 문화관광 | 11 | 44 | 관광지 23, 문화시설 17, 레포츠 3, 숙박 1 |
| `C01` | 추천코스 | 6 | 6 | 코스 6 |

| 규칙 | 내용 |
|---|---|
| **R-ID20** 권장 | 대분류만으로 관광타입을 정하지 않는다. 한 대분류가 여러 타입에 걸친다(예: 문화관광 `VE`는 관광지·문화시설·레포츠·숙박). 소분류와 `[LCLS]` 연결표로 확인한다 |
| **R-ID21** 권장 | 테마 매핑(맛집·카페·쇼핑 등)은 `lcls_theme_mapping_draft.csv`(초안)를 설정 파일로 관리한다. 서울 데이터 적재 후 분류별 장소 수로 조정한다 `[SPEC]` §5A.2 |

### 2.4 서비스 간 ID는 서로 연결되지 않는다

| 서비스 | 장소 식별자 | KorService2 `contentid`와의 관계 |
|---|---|---|
| KorService2 | `contentid`(숫자 문자열) | 기준 키 |
| 연관관광지 | `tAtsCd`, `rlteTatsCd`(32자리 해시 문자열) | **연결 키 없음** |
| 관광사진 | `galContentId`(숫자) | **연결 키 없음**(사진 콘텐츠 ID) |
| 빅데이터 | 장소 없음(시군구 단위) | 해당 없음 |

| 규칙 | 내용 |
|---|---|
| **R-ID30** 반드시 | 연관관광지·사진은 `contentid`로 조인할 수 없다. **장소명 + 시군구**로 매칭한다 |
| **R-ID31** 반드시 | 이름 정규화: 공백·괄호 안 내용·특수문자 제거, 소문자화. 같은 시군구 안에서 완전 일치를 먼저, 그다음 포함 일치를 시도한다 |
| **R-ID32** 반드시 | 매칭 실패·모호(후보 2개 이상)는 **버리고** 추측으로 연결하지 않는다. 매칭률을 로그와 대시보드로 남긴다 |

---

## 3. 국문 관광정보 서비스 — `KorService2`

### 3.1 오퍼레이션 13개

| # | 오퍼레이션 | 필수 파라미터(공통 제외) | 선택 파라미터 | 우리 용도 |
|---|---|---|---|---|
| 1 | `areaBasedList2` 지역기반 관광정보 조회 | 없음 | `arrange`, `contentTypeId`, `modifiedtime`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3` | 최초 전수 수집(타입별). MVP 핵심 |
| 2 | `locationBasedList2` 위치기반 관광정보 조회 | `mapX`, `mapY`, `radius` | `arrange`, `contentTypeId`, `modifiedtime`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3` | **누락 점검·보충·반경 캐시(보조)**. 순위 계산에는 쓰지 않음(R-K14) |
| 3 | `searchKeyword2` 키워드 검색 조회 | `keyword` | `arrange`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3` | 보조 검색. 숙박만 골라 검색 불가 |
| 4 | `searchFestival2` 행사 정보 조회 | `eventStartDate` | `arrange`, `eventEndDate`, `modifiedtime`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3` | MVP 제외 |
| 5 | `searchStay2` 숙박 정보 조회 | 없음 | `arrange`, `modifiedtime`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3` | 서울 숙박 적재(숙소 검색용). MVP 핵심 |
| 6 | `detailCommon2` 공통 정보 조회 | `contentId` | - | 장소 소개(overview)·홈페이지. MVP 핵심 |
| 7 | `detailIntro2` 소개 정보 조회 | `contentId`, `contentTypeId` | - | 이용시간·휴무 등(타입별 필드). MVP 핵심 |
| 8 | `detailInfo2` 반복 정보 조회 | `contentId`, `contentTypeId` | - | 입장료 등 반복정보. MVP 핵심 |
| 9 | `detailImage2` 이미지 정보 조회 | `contentId` | `imageYN` | 이미지 목록·저작권 유형. MVP 핵심 |
| 10 | `areaBasedSyncList2` 관광정보 동기화 목록 조회 | 없음 | `showflag`, `modifiedtime`, `arrange`, `contentTypeId`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1`, `lclsSystm2`, `lclsSystm3`, `oldContentid` | 일일 변경분 동기화. MVP 핵심 |
| 11 | `detailPetTour2` 반려동물 동반 여행 정보 | 없음 | `contentid` | 미사용 |
| 12 | `ldongCode2` 법정동 코드 조회 | 없음 | `lDongRegnCd`, `lDongListYn` | 법정동 코드(서울 11, 시군구). 1회 |
| 13 | `lclsSystmCode2` 분류체계 코드 조회 | 없음 | `lclsSystm1`, `lclsSystm2`, `lclsSystm3`, `lclsSystmListYn` | 분류체계 코드·명칭. 1회(정의서로 대체 가능) |

공통: `numOfRows`, `pageNo`, `_type` 선택. `MobileOS`, `MobileApp`, `serviceKey` 필수. 응답 항목 전체 목록은 `KorService2_데이터_명세서.xlsx`의 "응답필드" 시트.

### 3.2 무엇을 얻을 수 있나

| 필요한 데이터 | 오퍼레이션 | 필드(대표) | 비고 |
|---|---|---|---|
| 장소 목록(이름·주소·좌표·사진·분류) | `areaBasedList2`, `areaBasedSyncList2` | `contentid`, `contenttypeid`, `title`, `addr1`, `addr2`, `mapx`, `mapy`, `tel`, `firstimage`, `firstimage2`, `cpyrhtDivCd`, `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1~3`, `createdtime`, `modifiedtime` | 목록 응답에 이용시간·요금은 없다 |
| 장소 소개 | `detailCommon2` | `overview`, `homepage`, `telname`, 위 목록 필드 | `contentId`만 필수 |
| 이용시간·휴무 | `detailIntro2` | 타입별 필드(아래 §3.4) | 자유 텍스트 |
| 입장료 | `detailInfo2`(관광지 12), `detailIntro2`(문화시설 14·레포츠 28) | `infoname`, `infotext` / `usefee`, `usefeeleports` | 쇼핑·음식점은 요금 필드 없음 |
| 이미지 | `detailImage2` | `originimgurl`, `smallimageurl`, `imgname`, `serialnum`, `cpyrhtDivCd` | |
| 숙박 | `searchStay2`, `detailIntro2`(32), `detailInfo2`(32) | 입·퇴실 시간, 객실 정보·요금 | 객실 요금은 반복정보 |
| 지역·분류 이름 | `ldongCode2`, `lclsSystmCode2` | `code`, `name` | 1회 조회 후 DB 보관 |

### 3.3 규칙

| 규칙 | 내용 | 근거 |
|---|---|---|
| **R-K01** 반드시 | 서울 수집은 `lDongRegnCd=11`. 지역코드 `areaCode` 파라미터와 `areaCode2` 오퍼레이션은 v4.4에서 삭제되어 쓸 수 없다. 이전 블로그·예제의 `areaCode`, `cat1~3`을 쓰지 않는다 | `[M44]` 개정이력 |
| **R-K02** 반드시 | 전수 수집은 `areaBasedList2`를 **관광타입별로** 호출한다(`contentTypeId` 12, 14, 28, 32, 38, 39). 먼저 `numOfRows=1`로 각 타입의 `totalCount`를 확인한다. 이 오퍼레이션은 필수 파라미터가 공통 3개뿐이라 지역·타입을 안 주면 **전국 전체**가 온다 | `[M44]` 요청 표 |
| **R-K03** 반드시 | `arrange=C`(수정일순) 또는 `A`(제목순)로 수집한다. 대표 이미지가 반드시 있는 정렬(`O`·`Q`·`R`)은 이미지 없는 장소를 빼므로 전수 수집에 쓰지 않는다 | `[M44]` arrange 설명 |
| **R-K04** 반드시 | 매일 배치는 `areaBasedSyncList2`로 한다. `modifiedtime`(YYYYMMDD)에 전일을 주고 `showflag=1`(표출)과 `showflag=0`(비표출)을 **각각** 호출한다. `showflag=0`은 삭제하지 않고 `is_visible=false`로 숨긴다 | `[M44]` |
| **R-K05** 권장 | 콘텐츠 키가 바뀐 경우를 `oldContentid`로 추적한다(동기화 오퍼레이션 전용) | `[M44]` |
| **R-K06** 반드시 | 장소 1개의 상세는 호출이 나뉜다: `detailCommon2`(contentId), `detailIntro2`(contentId + contentTypeId), `detailInfo2`(contentId + contentTypeId), `detailImage2`(contentId, `imageYN`). 상세는 **추천 후보 상위부터 순차 적재**하고 한도에 걸리면 다음 날 이어받는다 | `[M44]` `[SPEC]` |
| **R-K07** 반드시 | `detailIntro2`의 응답 필드는 **관광타입마다 이름이 다르다**. 타입별 매핑표(§3.4)로 파싱하고, 모르는 필드는 `raw`에 보존한다 | `[M44]` |
| **R-K08** 반드시 | 입장료는 관광지(12)는 `detailInfo2`의 `infoname`(공백이 들어갈 수 있음, 예 "입 장 료")·`infotext`, 문화시설(14)은 `usefee`, 레포츠(28)는 `usefeeleports`. 쇼핑·음식점은 요금 필드가 없으므로 `NULL`("정보 없음") | `[M44]` |
| **R-K09** 반드시 | 이용시간·휴무·요금은 사람이 쓴 **자유 텍스트**다. 원문을 보존하고, `<br>` 등 HTML 태그는 제거해서 표시한다. 파싱에 실패하면 원문을 그대로 보여주고 "정보가 다를 수 있어요"를 붙인다 | `[SPEC]` |
| **R-K10** 반드시 | 좌표: 응답 `mapx`=**경도**, `mapy`=**위도**(WGS84). 요청 파라미터는 대문자 `mapX`, `mapY`다. 둘을 바꿔 쓰지 않는다 | `[M44]` |
| **R-K11** 반드시 | 이미지 저작권: 응답의 `cpyrhtDivCd`가 `Type1`(제1유형, 출처표시)이면 출처를 표시해 사용, `Type3`(제1유형 + 변경금지)이면 **원본 그대로** 쓴다(자르기·필터·글자 덧씌우기 같은 가공은 변경금지로 해석해 하지 않는다) | `[M44]` `detailImage2` 설명 |
| **R-K12** 권장 | 이미지 URL이 `http://`로 내려올 수 있다(매뉴얼 예시). 앱·웹이 HTTPS 전용이면 차단될 수 있으므로 서버에서 https 변환 가능 여부를 실제 응답으로 확인하고, 불가하면 서버 이미지 프록시·캐시를 둔다 `[추정]` | `[확인 필요]` |
| **R-K13** 반드시 | 숙소 검색은 `searchStay2`로 서울 숙박을 **DB에 적재한 뒤 자체 검색**한다. `searchKeyword2`는 v4.3부터 관광타입 필터가 없어 숙박만 골라 검색할 수 없다(`lclsSystm1=AC`로 제한은 가능) | `[M44]` 개정이력 `[SPEC]` |
| **R-K14** 반드시 | `locationBasedList2`(위치기반 관광정보 조회)는 **사용자 요청 시점에 호출하지 않는다.** 순위 계산의 후보와 거리는 DB에 적재한 서울 전체 데이터에서 직선거리로 계산한다. 이 오퍼레이션은 ① DB 누락 점검(대표 좌표 반경 비교, 주 1회) ② 누락 장소 보충 ③ 반경 결과 캐시 ④ 현재 위치 기반 "지금 근처"(Q3 결정 시)에만 쓴다. 이유: 일 1,000건 한도(사용자당 타입 5개 × 페이지 수만큼 호출), 반경 최대 20,000m(서울 동서 약 30km라 먼 인기 장소 누락), 응답에 이용시간·요금·개요 없음 | `[M44]` `[SPEC]` §5A.2a |
| **R-K15** 금지 | 행사(`searchFestival2`)·반려동물(`detailPetTour2`)은 MVP에서 호출하지 않는다 | `[SPEC]` |
| **R-K16** 반드시 | 이 서비스는 **국문**이다. 영문·일문·중문 장소명·설명은 별도 서비스(별도 활용신청, 다른 타입 코드)에서 받는다. 아직 해당 매뉴얼이 없다 | `[LCLS]` `[확인 필요]` |
| **R-K17** 반드시 | `locationBasedList2` 요청 파라미터: `mapX`=경도, `mapY`=위도(대문자 X, Y), `radius`=미터. 응답 필드는 `mapx`, `mapy`(소문자)다. 두 좌표를 바꿔 쓰지 않는다 | `[M44]` |
| **R-K18** 권장 | 호출 권장값: `radius=5000`에서 시작해 후보가 적으면 10000 → 20000으로 확대(최대 20000), `lDongRegnCd=11`(경기도로 넘어가는 반경에서도 서울만), `contentTypeId`를 12·14·28·38·39로 나눠 호출(숙박 32 제외), `arrange=E`(거리순). `arrange=S`(거리순 + 대표 이미지 있는 곳만)는 사진 없는 장소를 빼므로 쓰지 않는다. `numOfRows=100`에서 시작(R-C44) | `[M44]` |
| **R-K19** 반드시 | 응답의 `dist`는 요청 좌표 기준 거리(미터, 문자열, 매뉴얼 예시 `676.69...`)로 가정하고 **숫자로 변환해 쓴다.** 단위·정렬은 `profile_apis.py`의 반경 점검으로 직선거리(하버사인)와 비교해 확인한 뒤 확정한다 `[확인 필요]`. 캐시 키는 `(숙소 좌표 100m 반올림, contentTypeId, radius)`, 유효기간 24시간 | `[M44]` `[SPEC]` |

### 3.4 관광타입별 시간·휴무·요금 필드 (`detailIntro2` 문서 기준)

| 타입 | 이용·영업시간 | 쉬는날 | 요금 | 이 필드가 따로 있다 |
|---|---|---|---|---|
| 12 관광지 | `usetime`, `useseason`, `opendate` | `restdate` | **없음**(→ `detailInfo2`) | `expguide`, `parking`, `chkpet`, `chkcreditcard` |
| 14 문화시설 | `usetimeculture`, `spendtime` | `restdateculture` | `usefee` | `parkingculture`, `parkingfee` |
| 15 행사 | `playtime`, `eventstartdate`, `eventenddate`, `spendtimefestival` | - | `usetimefestival`(**이름은 시간이나 설명은 이용요금**) | `eventplace`, `program` |
| 28 레포츠 | `usetimeleports`, `openperiod` | `restdateleports` | `usefeeleports` | `reservation`, `parkingfeeleports` |
| 32 숙박 | `checkintime`, `checkouttime` | - | 객실 요금은 `detailInfo2`(`roomoffseasonminfee1·2`, `roompeakseasonminfee1·2`) | `roomcount`, `reservationurl` |
| 38 쇼핑 | `opentime`, `opendateshopping` | `restdateshopping` | 없음(`saleitemcost`는 품목 가격) | `chkcreditcard shopping`(필드명에 공백, 문서 오타 의심) |
| 39 음식점 | `opentimefood`, `opendatefood` | `restdatefood` | 없음 | `firstmenu`, `treatmenu`, `reservationfood` |

### 3.5 호출 레시피

| 작업 | 순서 | 호출량(예상) |
|---|---|---|
| 코드 준비(1회) | `ldongCode2`(`lDongRegnCd=11`, `lDongListYn=N`) → 서울 25구 이름 확인. 분류는 `[LCLS]` 파일로 대체 가능 | 1~2회 |
| 최초 전수 수집 | 타입별 `areaBasedList2`(`numOfRows=1`로 총수 확인 → 페이지 순회) + 숙박은 `searchStay2` | `Σ ceil(totalCount ÷ numOfRows)` |
| 상세 적재(며칠에 걸쳐) | 후보 상위부터 `detailIntro2` → `detailInfo2`(12·14·28) → `detailCommon2` → `detailImage2` | 장소 수 × 최대 4회, 호출 종류별로 일 900회 가드 |
| 매일 동기화 | `areaBasedSyncList2`(`modifiedtime`=전일, `showflag` 1·0) → 변경된 장소만 상세 재호출 | 보통 수십~수백 회 |
| 반경 점검(주 1회) | 대표 좌표 10곳 × 타입 5개: `locationBasedList2`(`radius=5000`, `arrange=E`, `lDongRegnCd=11`) 결과의 `contentid`가 DB에 모두 있는지 비교 → 없으면 보충(R-K14) | 지점 × 타입 × 페이지 수(최대 수백 회, 일 900회 가드 안에서 나눠 실행) |

---

## 4. 관광지별 연관 관광지 — `TarRlteTarService1`

선택한 관광지와 연결성이 높은 곳을 **전체·관광지·음식·숙박 유형별로 최대 50위**까지 제공한다. 데이터는 **월 1회(매월 8일)** 갱신된다 `[REL]`.

### 4.1 오퍼레이션

| 오퍼레이션 | 용도 | 필수 파라미터(공통 제외) |
|---|---|---|
| `areaBasedList1` | 시군구 기준 관광지별 연관 관광지 | `baseYm`(YYYYMM), `areaCd`, `signguCd` |
| `searchKeyword1` | 관광지명 키워드로 조회 | `baseYm`, `areaCd`, `signguCd`, `keyword` |

호출 주소의 서비스·오퍼레이션 이름은 **Call Back URL**(`.../TarRlteTarService1/areaBasedList1`, `.../searchKeyword1`)을 따른다.

### 4.2 얻는 데이터 (응답 필드)

| 필드 | 뜻 |
|---|---|
| `baseYm` | 기준연월 |
| `tAtsNm`(`tAtsCd`) | 기준 관광지명(코드, 32자리 해시) |
| `areaCd`/`areaNm`, `signguCd`/`signguNm` | 기준 관광지의 시도·시군구 |
| `rlteTatsNm`(`rlteTatsCd`) | 연관 관광지명(코드) |
| `rlteRegnCd`/`rlteRegnNm`, `rlteSignguCd`/`rlteSignguNm` | 연관 관광지의 시도·시군구 |
| `rlteCtgryLclsNm`/`MclsNm`/`SclsNm` | 연관 관광지의 분류 이름(예: 음식·음식·한식) |
| `rlteRank` | 연관 순위 |

### 4.3 규칙

| 규칙 | 내용 |
|---|---|
| **R-T01** 반드시 | `baseYm`, `areaCd`, `signguCd`는 모두 **필수**다. 서울 전체를 한 번에 받을 수 없고 **시군구(25개)마다** 호출한다. 코드는 `[SG]` 파일의 5자리 코드를 쓴다(예 종로구 `11110`) |
| **R-T02** 반드시 | 한 시군구의 결과가 많다(매뉴얼 예시 `totalCount` 800). 시군구마다 `numOfRows=1`로 총수를 확인한 뒤 순회하고, 25개 × 페이지 수의 호출량을 한도에 맞춰 며칠에 나눈다 |
| **R-T03** 반드시 | `baseYm`에 쓸 수 있는 최신 월을 모른다. 월 배치 시 **전월 → 전전월** 순서로 시도해 결과가 있는 가장 최근 월을 쓴다 `[추정]`. 어느 월 데이터인지 DB에 `base_ym`으로 저장한다 |
| **R-T04** 반드시 | `tAtsCd`·`rlteTatsCd`는 `contentid`와 무관한 해시다. **이름 + 시군구**로 우리 `place`와 매칭한다(R-ID30~32). 매칭된 쌍만 `place_related(place_id, related_place_id, rank, base_ym)`에 저장한다 |
| **R-T05** 권장 | 연관 점수는 순위 화면의 **보조 정렬**("함께 가기 좋은 곳")에만 쓴다. 초기 순위 점수에는 넣지 않는다(고른 장소가 있어야 의미가 생김) `[SPEC]` §5A.2 |
| **R-T06** 권장 | 연관 관광지 중 음식·숙박 분류(`rlteCtgryLclsNm`)가 섞여 있다. 화면의 카테고리 탭과 맞춰 필터한다 |
| **R-T07** 금지 | 매뉴얼의 `searchKeyword` 예시 URL(`.../TarRlteTarService/searchKeyword`)은 서비스명에 `1`이 빠져 있다. 사용 금지, Call Back URL을 쓴다 |

---

## 5. 관광사진갤러리 — `PhotoGalleryService1`

한국관광공사가 보유한 관광사진의 **제목·촬영장소·촬영월·촬영자·검색키워드와 웹용 이미지 URL**을 제공한다. 장소 좌표는 없다 `[PHOTO]`.

### 5.1 오퍼레이션

| 오퍼레이션 | 용도 | 필수 파라미터(공통 제외) | 비고 |
|---|---|---|---|
| `galleryList1` | 갤러리 목록(제목으로 그룹화) | 없음 | `arrange` A 촬영일 / B 제목 / C 수정일 |
| `gallerySearchList1` | 키워드 검색 목록 | `keyword` | 한글은 URL 인코딩 |
| `galleryDetailList1` | 제목 하나의 사진 상세 목록 | `title` | 한글은 URL 인코딩 |
| `gallerySyncDetailList1` | 동기화(표출/비표출) | `title` | `galUseFlag`(1 표출/0 비표출), `galModifiedTime` |

### 5.2 얻는 데이터 (응답 필드)

`galContentId`, `galContentTypeId`(샘플 17), `galTitle`, `galWebImageUrl`(웹용 이미지), `galCreatedtime`, `galModifiedtime`, `galPhotographyMonth`(YYYYMM), `galPhotographyLocation`(옵션), `galPhotographer`, `galSearchKeyword`. 동기화는 `galUseFlag`가 추가된다.

### 5.3 규칙

| 규칙 | 내용 |
|---|---|
| **R-P01** 반드시 | **라이선스가 이 매뉴얼에 없다.** 저작권 유형 필드(`cpyrhtDivCd`)도 응답에 없다. 활용신청 화면·포털 상세 페이지의 이용허락범위·공공누리 유형을 **직접 확인하기 전까지 서비스 화면에 쓰지 않는다**. (앞서 검색 결과에서 공공누리 1유형이라는 설명을 본 적이 있으나 이 문서로 확인하지 못했다) `[확인 필요]` |
| **R-P02** 반드시 | 사진은 `KorService2`의 이미지(`firstimage`, `detailImage2`)를 **우선**하고, 이미지가 없는 장소에만 보조로 쓴다 |
| **R-P03** 반드시 | 장소와의 연결은 제목 매칭이다: `gallerySearchList1`(`keyword`=장소명) → 결과의 `galTitle`·`galPhotographyLocation`이 우리 장소·시군구와 맞는지 확인 → `galleryDetailList1`(`title`)로 사진 목록. 확신이 없으면 연결하지 않는다(R-ID32) |
| **R-P04** 권장 | 이미지 크기 정보는 문서에 없다(웹용 경로 하나뿐). 실제 URL로 크기를 확인한 뒤 사용한다 |
| **R-P05** 반드시 | 서비스·오퍼레이션 이름이 `...Service1`, `...List1`이다(국문 서비스와 달리 `2`가 아님). 문서 기준을 따른다 |
| **R-P06** 반드시 | 동기화는 `title`이 필수라 제목 없이 전체 변경분을 받을 수 없다 `[PHOTO]` 요청 표. 전체 동기화가 필요하면 R-P01 확인 후 설계를 다시 한다 |

---

## 6. 관광 빅데이터 — `DataLabService`

데이터랩의 **지자체별 일일 방문자 수**를 제공한다. 관광객 구분은 `1 현지인(a)`, `2 외지인(b)`, `3 외국인(c)`이다 `[BIG]`.

### 6.1 오퍼레이션

| 오퍼레이션 | 단위 | 필수 파라미터(공통 제외) | 응답 핵심 필드 |
|---|---|---|---|
| `metcoRegnVisitrDDList` | 광역(시도) | `startYmd`, `endYmd`(yyyyMMdd) | `areaCode`, `areaNm`, `daywkDivCd`, `daywkDivNm`, `touDivCd`, `touDivNm`, `touNum`, `baseYmd` |
| `locgoRegnVisitrDDList` | 기초(시군구) | `startYmd`, `endYmd` | `signguCode`(5자리), `signguNm`, 이하 동일 |

### 6.2 규칙

| 규칙 | 내용 |
|---|---|
| **R-D01** 반드시 | **지역 필터 파라미터가 없다.** 날짜 범위만 주면 전국이 온다(매뉴얼 예시: 하루 기준 광역 51건 = 17개 시도 × 3구분, 기초 740건). 서울 25개 구와 `touDivCd=3`(외국인)만 **서버에서 걸러** 저장한다 |
| **R-D02** 반드시 | 호출량이 크다. 하루치도 수백 건이라 한 달이면 2만 건 이상이다. `numOfRows=1`로 `totalCount`를 먼저 보고 날짜 범위를 **주·월 단위로 나눠** 순회한다. 이어받기 가능하게 저장한다 |
| **R-D03** 반드시 | `touNum`은 소수(예: 4828435.5)이고 **국적별이 아니다**(외국인 전체). 이 값으로 "일본인 인기"를 말하지 않는다. 지역의 **외국인 전체 상대 인기도**로만 쓴다 |
| **R-D04** 권장 | 지역 점수 보강(`spec.md` §5A.2 ④)에는 최근 N주 평균 일 방문자를 시군구별로 정규화(0~1)해 쓴다. 요일 효과가 크므로 요일 평균을 쓰거나 7일 단위로 합산한다 |
| **R-D05** 확인 필요 | 최신 날짜까지 데이터가 있는지(제공 지연), 과거 몇 년까지 조회되는지, `numOfRows` 최대값은 문서에 없다. 실제 호출로 확인하고 이 문서를 갱신한다 |
| **R-D06** 권장 | 개발 URL이 `B551011//DataLabService`(슬래시 2개)로 적힌 오타가 있다. 운영 URL(`B551011/DataLabService`)을 쓴다 |

---

## 7. 외래관광객 조사 — `TourismAccdtOutService` (한국문화관광연구원)

문화체육관광부 국가승인통계 외래관광객조사(승인번호 제314002호)의 주요 지수를 제공한다. **TourAPI(한국관광공사)와 별도 서비스**이며 요청에 `MobileOS`·`MobileApp`이 없다 `[KCTI]`.

| 오퍼레이션 | 요청 | 얻는 데이터 |
|---|---|---|
| `getForeignTuristAreaRateList` | `YY`(연도), `SIDO_CD`(A 서울권 … Z 기타) | 방문지역별 비율(`ratio`, 중복응답 기준) |
| `getForeignTuristWtrsnRateList` | `YY`, `ACTIVITY_CD`(A 쇼핑 B 식도락관광 D 고궁/역사 유적지방문 E 자연경관 감상 F 시티투어 …) | 방한 활동별 비율 |
| `getForeignTuristExpndtrList` | `YY`, `TOURTYPE_CD`(Z 전체 I 개별 G 단체 A Air-Tel) | **1인 평균 지출 경비(US$)** `expense` |

공통 요청: `serviceKey`, `numOfRows`, `pageNo`, `YY` 필수. 응답은 **XML만**(문서 기준)이며 주소는 `http://openapi.tour.go.kr/openapi/service/TourismAccdtOutService`다.

| 규칙 | 내용 |
|---|---|
| **R-S01** 반드시 | **검증용 기준값으로만** 쓴다. 우리 경비 기준표(서울관광재단 원자료)가 공표 통계와 크게 어긋나지 않는지 연 1회 비교한다 `[SPEC]` |
| **R-S02** 반드시 | 이 API의 지출은 국적별·항목별이 아니라 **연도·여행객 구분별 1인 평균 한 값**이다. 평균이며 중앙값이 아니다. 경비 예측의 입력으로 쓰지 않는다 |
| **R-S03** 확인 필요 | 매뉴얼의 샘플 연도는 2011이다. 2024·2025 값이 조회되는지 `YY`를 바꿔 확인한다. 전송 암호화가 [ ]로 비어 있어 HTTPS 지원 여부도 확인한다 |
| **R-S04** 반드시 | 키는 서비스 문서에 `인증키(URL Encode)`라고 적혀 있다. 이 서비스도 포털 활용신청이 별도로 필요하다 `[추정]` |
| **R-S05** 주의 | `ACTIVITY_CD` 표에 `G`가 두 번(유흥/오락, 온천/스파) 나온다. 코드가 겹치므로 응답의 `activity` 이름을 함께 저장한다 |

---

## 8. 코드 파일 2종

| 파일 | 내용 | 규칙 |
|---|---|---|
| `[SG]` 시군구 코드정보 | 시도·시군구 코드 252행, 열 `areaCd`, `areaNm`, `sigunguCd`, `sigunguNm`. 서울 25개(`11110` 종로구 … `11740` 강동구) | **R-F01** 반드시: DB `sigungu` 테이블로 적재해 `TarRlteTarService1`·`DataLabService` 호출과 응답 조인에 쓴다 |
| `[LCLS]` 정의서 | 소분류 240개 ↔ 관광타입(국문·다국어 코드). 병합 칸이 있어 펼쳐서 읽는다 | **R-F02** 권장: `lcls`(코드·이름)와 `lcls_type`(소분류↔타입) 테이블로 적재해 테마 매핑에 쓴다 |

---

## 9. 문서 없는 API — 규칙 확정 전 확인할 것

공식 문서를 받지 못해 규칙을 정하지 않았습니다. 문서를 받으면 이 표를 채워 별도 절로 옮깁니다.

| API | `spec.md` 결정 | 확인할 것 |
|---|---|---|
| ODsay 대중교통 | 순서 확정 후 구간 운임·시간 조회, 결과 캐시 | 무료 한도, 서버 IP 등록 방식, 응답의 운임 필드, 약관상 결과 저장 허용 여부, 도보 시간 제공 여부 |
| 한국수출입은행 환율 | 매일 1회 배치, 영업일 기준 | 인증키 발급·한도, 응답 형식, 주말·공휴일 값 처리, 통화 코드 |
| Papago 번역 | 서버 프록시, 호출 제한 | 요금표(글자 과금), 지원 언어, 1회 최대 글자 수(5,000자 확인 필요), 약관 |
| 서울시 방문지·입장객 통계 파일 | 파일 다운로드, 이용 조건 확인 | 이용허락범위·공공누리 유형, 갱신 시기 |
| 다국어 관광정보(영문·일문·중문) | 장소명·설명 다국어 | 서비스 ID·URL, 타입 코드(정의서의 다국어 코드), 필드 차이, 활용신청 |
| 지도 SDK | Google 기본, 네이버 조건부 | 모바일 중국어 라벨, RN 연동, 키 사용 제한 |

---

## 10. 문서 간 불일치와 오류 (사용 전 알아둘 것)

| 항목 | 내용 | 대응 |
|---|---|---|
| 개발계정 한도 표현 | `[APPLY]` "오퍼레이션별 일 1,000건", 서비스 매뉴얼 "일 1,000건" | R-C20: 실제 적용 방식 확인 |
| 승인 소요 시간 | `[M44]` 약 10분, `[APPLY]` 10~30분, 서비스 매뉴얼 약 30분 | 30분 후 호출 |
| `MobileOS` 허용값 | WEB 또는 WIN으로 문서마다 다름 | `ETC` 고정 |
| `[M44]` 문서 버전 | 표지 Ver 4.4, 첫 표 Ver4.3(같은 작성일) | 4.4를 기준으로 |
| `[M44]` 지역코드 | 개정이력은 `areaCode2` 삭제인데 문서 앞 호출 예시는 아직 `areaCode2` 사용 | 삭제된 것으로 취급(R-K01) |
| `[M44]` `searchKeyword2` 예시 | `keyword시장`으로 `=` 누락 | 예시 복사 금지(R-C07) |
| `[M44]` `searchFestival2` 샘플 | `lDongRegnCd=36110`(5자리)로 적힘 | 시도 코드는 2자리 |
| `[M44]` 쇼핑 필드명 | `chkcreditcard shopping`(공백) | 실제 응답으로 확인 |
| `[M44]` 오퍼레이션 유형 | 상세 조회도 "조회 (목록)"으로 표기 | 무시 |
| `[REL]` 응답 표 | 표에는 `tAtsCd`가 없으나 4.1 개정 사유와 예시 응답에는 있음 | 있다고 보고 파싱, 없으면 `NULL` |
| `[REL]` `searchKeyword` 예시 | 경로에서 서비스명 `1` 누락 | R-T07 |
| `[REL]` 샘플 값 | 같은 시군구 샘플에서 코드가 `51130`과 `11530`으로 섞임 | 샘플 값 신뢰 금지 |
| `[PHOTO]` 서비스 이름 | `...Service1`, `...List1`(국문은 `...2`) | 문서 기준(R-P05) |
| `[PHOTO]` 라이선스 | 문서에 없음 | R-P01 |
| `[BIG]` 개발 URL | `B551011//DataLabService`(슬래시 2개) | 운영 URL 사용 |
| `[KCTI]` | 서비스 ID 빈칸, 샘플 연도 2011, 전송 암호화 미표기, `ACTIVITY_CD`의 `G` 중복 | R-S03, R-S05 |

---

## 11. 호출 템플릿 (인증키는 `<KEY>` 자리표시자)

실제 키는 서버 비밀 저장소에서 읽는다. 아래 URL은 형식 설명용이며 값은 문서 예시를 우리 용도로 바꾼 것이다.

```
# 1) 법정동 코드 — 서울 시군구
https://apis.data.go.kr/B551011/KorService2/ldongCode2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=30&pageNo=1&lDongRegnCd=11&lDongListYn=N

# 2) 서울 음식점 목록 — 총 개수만 확인(numOfRows=1)
https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=1&pageNo=1&arrange=C&contentTypeId=39&lDongRegnCd=11

# 3) 일일 동기화 — 표출 변경분
https://apis.data.go.kr/B551011/KorService2/areaBasedSyncList2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=100&pageNo=1&lDongRegnCd=11&modifiedtime=20261003&showflag=1

# 4) 상세 3종 (장소 1개)
https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&contentId=126128
https://apis.data.go.kr/B551011/KorService2/detailIntro2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&contentId=126128&contentTypeId=12
https://apis.data.go.kr/B551011/KorService2/detailInfo2?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&contentId=126128&contentTypeId=12

# 5) 연관 관광지 — 서울 중구
http://apis.data.go.kr/B551011/TarRlteTarService1/areaBasedList1?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=1&pageNo=1&baseYm=202509&areaCd=11&signguCd=11140

# 6) 관광사진 — 키워드 검색(한글은 URL 인코딩)
http://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=5&pageNo=1&keyword=<URL인코딩된 장소명>

# 7) 빅데이터 — 기초 지자체 하루치(전국이 오므로 서버에서 서울·외국인만 필터)
http://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList?serviceKey=<KEY>&MobileOS=ETC&MobileApp=KOREADY&_type=json&numOfRows=100&pageNo=1&startYmd=20261001&endYmd=20261001
```

위 예시의 `baseYm`, 날짜, `contentId`는 형식 설명용이다. 연관 관광지·사진·빅데이터는 문서의 호출 주소가 `http://`로 적혀 있으나 우리는 `https://`로 시도한다(R-C02).

### 응답 방어 처리 (언어 무관 규칙)

```
body   = response.body
items  = body.items
if items is empty string or null  -> 결과 없음(빈 목록)
item   = items.item
if item is object (not array)     -> [item]
각 필드는 이름으로 접근, 문자열 값을 숫자·날짜로 변환, 빈 문자열은 NULL
```

---

## 12. 시작 전 체크리스트

| 단계 | 할 일 | 담당(제안) |
|---|---|---|
| 1 | 포털 계정 소유자 1명 정하기. 사용 서비스(1~5번) 각각 활용신청(목적·상세기능·라이선스 동의) | 계정 소유자 |
| 2 | 승인 30분 후 `python profile_apis.py` 실행(약 130회 호출). 서울 타입별 건수, 필드 채움률, 상세·연관·사진·빅데이터 샘플, 이 문서의 "확인 필요" 항목 점검 결과가 엑셀 한 파일로 나옴. 결과 엑셀로 R-P01(사진 라이선스는 포털에서 별도 확인) 외 항목을 확정하고 이 문서를 갱신 | 데이터·백엔드 |
| 3 | 인증키를 비밀 저장소에 직접 입력. 메신저·문서에 붙여넣지 않기 | 계정 소유자 + 인프라 담당 |
| 4 | 호출 가드(오퍼레이션별 900), 재시도, 오류 처리, `raw` 보존을 공통 클라이언트로 구현 | 백엔드 |
| 5 | 서울 전수 수집 → 타입별 `totalCount`로 호출량 계산 → 며칠 일정 수립 | 데이터 |
| 6 | 운영계정 신청(개발계정 호출 이력 + 데모 URL 필요) | 계정 소유자 |
| 7 | R-P01(사진 라이선스), R-D05(빅데이터 범위), R-K12(이미지 https), R-K14·R-K19(반경 조회의 `dist` 단위·정렬), R-ID11(코드 변환), R-S03(연도)을 실제 호출로 확인하고 이 문서를 v1.1로 갱신 | 데이터·백엔드 |
