# KOREADY API 데이터 스키마 명세 (api_schema.md)

기획서·`spec.md`에서 호출하는 외부 API의 **요청 방식과 응답 필드 구조**를 한 문서로 모았습니다.
작성일 2026-10-13. 근거는 업로드된 공식 매뉴얼, 공식 문서 열람, 팀 Notion 문서(KorService2 실측)입니다.
실제 API 호출 응답은 이 환경에서 확인하지 못했습니다 (인증키 없음, 외부 호출 차단).

## 0. 읽는 법

| 표시 | 뜻 |
|---|---|
| ✅ | 공식 매뉴얼·문서에서 필드 표를 직접 확인 |
| ⚠️ | 일부만 확인 (아래 비고에 범위 표시) |
| ❓ | 문서를 열람하지 못함. 구현 전 확인 필요 |

## 1. 사용하는 API 한눈에 보기

| 절 | API | 제공처 | spec 용도 | 상태 |
|---|---|---|---|---|
| §3 | 국문 관광정보 `KorService2` | 한국관광공사 | 장소·숙소·분류·운영시간·입장료 (F1~F4) | ✅ |
| §4 | 외국어 관광정보 `EngService2` 등 | 한국관광공사 | 장소명·설명 다국어 (F2-5, F7) | ❓ |
| §5 | 관광지별 연관 관광지 `TarRlteTarService1` | 한국관광공사 | 함께 가기 좋은 곳 (F2-11) | ✅ |
| §6 | 관광 빅데이터 `DataLabService` | 한국관광공사 | 시군구 일별 방문자 수 (인기도 보조) | ✅ |
| §7 | 관광사진 `PhotoGalleryService1` | 한국관광공사 | 사진 보강 (라이선스 미확인 → 사용 보류) | ✅ |
| §8 | 관광실태조사(외래관광객) `TourismAccdtOutService` | 한국문화관광연구원 | 기준표 검증값 | ✅ |
| §9 | 대중교통 길찾기 `searchPubTransPathT` | ODsay | 구간 시간·운임·수단 (F3-2) | ✅ |
| §10 | 환율 `exchangeJSON` | 한국수출입은행 | 표시 통화 환산 (F4-8, 한 통화만 표시) | ✅ |
| §11 | 번역 `translation` | 네이버 클라우드 Papago | 텍스트 번역 (F9) | ✅ |
| §12 | 실시간 도시데이터 `citydata` | 서울시 | 지역 혼잡도 (2차) | ⚠️ |
| §13 | 장소 검색 `places:searchText` | Google | 평점·리뷰 수 (선택, 스파이크) | ⚠️ |
| §14 | 검색어 트렌드 | 네이버 데이터랩 | 바이럴 신호 후보 (선택) | ❓ |
| §15 | 통합 Raw Data·통계 파일 | 서울관광재단·서울시 | 경비 기준표, 국적별 인기도 | ❓ (파일, 코드표 필요) |

## 2. 공통 사항 (한국관광공사 TourAPI 계열: 2~6번)

- 인증: 공공데이터포털 일반 인증키를 `serviceKey` 파라미터로 전달. 문서 예시는 URL 인코딩 키. 이미 인코딩된 키를 다시 인코딩하지 않는다.
- 공통 요청 파라미터: `MobileOS`(IOS/AND/WEB/ETC, 필수), `MobileApp`(서비스명, 필수), `serviceKey`(필수), `_type=json`(기본은 XML), `numOfRows`, `pageNo`.
- 응답 껍데기 (매뉴얼은 XML 예시, JSON은 같은 구조):
  ```
  response
  ├ header { resultCode "0000", resultMsg "OK" }
  └ body   { items { item[] }, numOfRows, pageNo, totalCount }
  ```
- **JSON에서도 숫자는 문자열**로 온다 (매뉴얼 샘플 JSON 타입이 모두 문자열). DB 적재 때 변환 필요. 빈 값은 빈 문자열.
- 결과가 없거나 1건일 때 `items`가 빈 문자열이거나 `item`이 배열이 아닌 단일 객체일 수 있다는 개발 사례가 있다 ⚠️. 파싱에서 방어한다 (매뉴얼에는 기술 없음).
- 포털 오류(코드 01, 04, 12, 20, 22, 30, 31, 32, 99)는 **XML로만** 출력된다 (문서 설명). JSON 파서가 실패하면 XML 오류인지 확인한다.
- 공통 에러 코드 (제공기관): 00 정상, 01 어플리케이션 에러, 02 DB 에러, 03 데이터 없음, 04 HTTP 에러, 05 서비스 연결 실패, 10 잘못된 요청 파라미터, 11 필수 파라미터 없음, 12 서비스 없음·폐기, 20 접근 거부, 21 일시적으로 사용 불가한 키, 22 일일 호출 한도 초과, 30 미등록 키, 31 활용 기간 만료, 32 미등록 IP, 33 서명되지 않은 호출, 99 기타.
- 개발계정 호출 한도: 활용신청 매뉴얼 v3.3은 "오퍼레이션별 일 1,000건", 활용 매뉴얼 v4.4는 "일 1,000건". 표현이 달라 첫 대량 호출에서 확인한다.
- 서비스 간 ID는 호환되지 않는다 (연관 관광지·사진은 `contentid`가 없음). 이름과 시군구로 매칭한다 (§15).

---

## 3. 국문 관광정보 `KorService2` ✅

- Base URL: `https://apis.data.go.kr/B551011/KorService2/{오퍼레이션}` (문서 표기는 http와 https 모두 [O])
- 근거: 활용 매뉴얼 국문 v4.4, 활용신청 매뉴얼 v3.3, `KorService2_데이터_명세서.xlsx`(오퍼레이션별 요청·응답 전체 표), Notion「KorService2」문서(2026-10-13 실측)
- 상세 전체 표는 xlsx의 `요청파라미터`(145행), `응답필드`(425행) 시트에 있다. 아래는 개발에 필요한 형태로 묶은 요약이다.

### 3.1 오퍼레이션

| 오퍼레이션 | 국문명 | 필수 파라미터 | KOREADY 용도 |
|---|---|---|---|
| `areaBasedList2` | 지역기반 관광정보 조회 | MobileOS, MobileApp, serviceKey | 서울 장소 목록 수집(타입·분류별). 이름·주소·좌표·사진·분류의 기본 소스 |
| `locationBasedList2` | 위치기반 관광정보 조회 | MobileOS, MobileApp, serviceKey, mapX, mapY, radius | 숙소 좌표 반경(최대 20km)·거리순 조회. 순위 계산에는 쓰지 않는다 (spec §5A.2a, R-K14) |
| `searchKeyword2` | 키워드 검색 조회 | MobileOS, MobileApp, serviceKey, keyword | 키워드 검색. v4.3부터 관광타입 필터가 없어 숙박만 골라 검색할 수 없음 |
| `searchFestival2` | 행사 정보 조회 | MobileOS, MobileApp, serviceKey, eventStartDate | 행사 정보. MVP 제외(선택) |
| `searchStay2` | 숙박 정보 조회 | MobileOS, MobileApp, serviceKey | 숙박 목록. 숙소 검색용으로 서울 숙박을 DB에 적재 |
| `detailCommon2` | 공통 정보 조회 | MobileOS, MobileApp, serviceKey, contentId | 장소 상세의 개요·홈페이지. 요청은 contentId만 필수 |
| `detailIntro2` | 소개 정보 조회 | MobileOS, MobileApp, serviceKey, contentId, contentTypeId | 이용시간·휴무일 등 타입별 소개정보(필드명이 타입마다 다름) |
| `detailInfo2` | 반복 정보 조회 | MobileOS, MobileApp, serviceKey, contentId, contentTypeId | 반복정보. 관광지 입장료가 여기에 있음 |
| `detailImage2` | 이미지 정보 조회 | MobileOS, MobileApp, serviceKey, contentId | 장소 이미지 목록과 저작권 유형 |
| `areaBasedSyncList2` | 관광정보 동기화 목록 조회 | MobileOS, MobileApp, serviceKey | 매일 변경분 동기화(modifiedtime, showflag로 비표출 처리) |
| `detailPetTour2` | 반려동물 동반 여행 정보 | MobileOS, MobileApp, serviceKey | 반려동물 동반 정보. MVP 사용 안 함 |
| `ldongCode2` | 법정동 코드 조회 | MobileOS, MobileApp, serviceKey | 법정동 코드 조회(서울 시도코드 11 → 시군구명) |
| `lclsSystmCode2` | 분류체계 코드 조회 | MobileOS, MobileApp, serviceKey | 분류체계 코드·명칭 조회 |

`areaCode2`, `categoryCode2`, `cat1~3`는 v4.4에서 삭제되었다. 지역은 법정동 코드, 분류는 분류체계 코드를 쓴다.

### 3.2 요청 파라미터 사전

| 파라미터 | 의미 | 필수인 오퍼레이션 | 쓸 수 있는 오퍼레이션 | 설명 |
|---|---|---|---|---|
| `arrange` | 정렬 구분 | - | areaBasedList2, areaBasedSyncList2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 정렬 구분 (A=제목순, C=수정일순, D=생성일순) 대표 이미지가 반드시 있는 정렬 (O=제목순, Q=수정일순, R=생성일순) |
| `contentTypeId` | 관광타입 ID | detailInfo2, detailIntro2 | areaBasedList2, areaBasedSyncList2, detailInfo2, detailIntro2, locationBasedList2 | 관광타입(12: 관광지, 14: 문화시설, 15: 축제공연행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점) ID |
| `modifiedtime` | 콘텐츠 수정일 | - | areaBasedList2, areaBasedSyncList2, locationBasedList2, searchFestival2, searchStay2 | 콘텐츠 수정일(형식: YYYYMMDD) |
| `lDongRegnCd` | 법정동 시도 코드 | - | areaBasedList2, areaBasedSyncList2, ldongCode2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 법정동 시도 코드(법정동 코드 조회 참고) |
| `lDongSignguCd` | 법정동 시군구 코드 | - | areaBasedList2, areaBasedSyncList2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 법정동 시군구 코드(법정동 코드 조회 참고, lDongRegnCd 필수) |
| `lclsSystm1` | 분류체계 대분류 | - | areaBasedList2, areaBasedSyncList2, lclsSystmCode2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 분류체계 대분류(분류체계 코드 조회 참고) |
| `lclsSystm2` | 분류체계 중분류 | - | areaBasedList2, areaBasedSyncList2, lclsSystmCode2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 분류체계 중분류(분류체계 코드 조회 참고, lclsSystm1 필수) |
| `lclsSystm3` | 분류체계 소분류 | - | areaBasedList2, areaBasedSyncList2, lclsSystmCode2, locationBasedList2, searchFestival2, searchKeyword2, searchStay2 | 분류체계 소분류(분류체계 코드 조회 참고, lclsSystm1, lclsSystm2 필수) |
| `mapX` | X좌표 | locationBasedList2 | locationBasedList2 | GPS X좌표(WGS84 경도좌표) |
| `mapY` | Y좌표 | locationBasedList2 | locationBasedList2 | GPS Y좌표(WGS84 위도좌표) |
| `radius` | 거리 반경 | locationBasedList2 | locationBasedList2 | 거리 반경(단위: m), Max값 20000m=20Km |
| `keyword` | 요청 키워드 | searchKeyword2 | searchKeyword2 | 검색 요청할 키워드 (국문=인코딩 필요) |
| `eventStartDate` | 행사 시작일 | searchFestival2 | searchFestival2 | 행사 시작일 (형식: YYYYMMDD) |
| `eventEndDate` | 행사 종료일 | - | searchFestival2 | 행사 종료일 (형식: YYYYMMDD) |
| `contentId` | 콘텐츠ID | detailCommon2, detailImage2, detailInfo2, detailIntro2 | detailCommon2, detailImage2, detailInfo2, detailIntro2 | 콘텐츠ID |
| `imageYN` | 이미지조회1 | - | detailImage2 | Y=콘텐츠이미지조회 N=”음식점”타입의 음식메뉴 이미지 |
| `showflag` | 표출여부 | - | areaBasedSyncList2 | 콘텐츠표출여부(1=표출, 0=비표출) |
| `oldContentid` | 이전 콘텐츠ID | - | areaBasedSyncList2 | 이전 콘텐츠ID(DB저장 동기화시 이전 KEY 값으로 조회 용도) |
| `contentid` | 콘텐츠ID | - | detailPetTour2 | 콘텐츠ID(미기입 시 반려동물 전부 출력) |
| `lDongListYn` | 법정동 목록조회 여부 | - | ldongCode2 | 법정동 목록조회 여부(N: 코드조회, Y: 전체목록조회) |
| `lclsSystmListYn` | 분류체계 목록조회 여부 | - | lclsSystmCode2 | 분류체계 목록조회 여부(N: 코드조회, Y: 전체목록조회) |

주의: 좌표는 `mapX`(경도), `mapY`(위도) 대문자로 보내고, 응답은 `mapx`, `mapy` 소문자로 온다.
`locationBasedList2`의 `radius`는 최대 20,000(m). `arrange`는 A 제목순, C 수정일순, D 생성일순, O·Q·R은 대표 이미지가 있는 것만.

### 3.3 목록 계열 응답 item 필드 (areaBasedList2 · locationBasedList2 · searchKeyword2 · searchFestival2 · searchStay2 · areaBasedSyncList2 · detailCommon2)

약어: AB=areaBasedList2, LB=locationBasedList2, SK=searchKeyword2, SF=searchFestival2, SS=searchStay2, SY=areaBasedSyncList2, DC=detailCommon2

| 필드 | 의미 | 샘플 | 있는 오퍼레이션 |
|---|---|---|---|
| `addr1` | 주소 | 부산광역시 사하구 낙동남로 1240 (하단동) | 전체 |
| `addr2` | 상세주소 |  | 전체 |
| `contentid` | 콘텐츠 ID | 127974 | 전체 |
| `contenttypeid` | 관광타입 ID | 12 | 전체 |
| `createdtime` | 등록일 | 20031208090000 | 전체 |
| `firstimage` | 대표이미지(원본) | http://tong.visitkorea.or.kr/cms/resource/62/ | 전체 |
| `firstimage2` | 대표이미지(썸네일) | http://tong.visitkorea.or.kr/cms/resource/62/ | 전체 |
| `cpyrhtDivCd` | 저작권 유형 | Type1 | 전체 |
| `mapx` | GPS X좌표 | 128.9460030322 | 전체 |
| `mapy` | GPS Y좌표 | 35.1045320626 | 전체 |
| `mlevel` | Map Level | 6 | 전체 |
| `modifiedtime` | 콘텐츠 수정일 | 20250618095454 | 전체 |
| `tel` | 전화번호 |  | 전체 |
| `title` | 제목 | 을숙도 공원 | 전체 |
| `zipcode` | 우편번호 | 49435 | 전체 |
| `lDongRegnCd` | 법정동 시도 코드 | 26 | 전체 |
| `lDongSignguCd` | 법정동 시군구 코드 | 380 | 전체 |
| `lclsSystm1` | 분류체계 대분류 | NA | 전체 |
| `lclsSystm2` | 분류체계 중분류 | NA04 | 전체 |
| `lclsSystm3` | 분류체계 소분류 | NA040500 | 전체 |
| `dist` | 거리 | 676.6965032191895 | LB |
| `eventstartdate` | 행사 시작일 | 20260101 | SF |
| `eventenddate` | 행사 종료일 | 20261231 | SF |
| `progresstype` | 진행상태정보 | 선택안함 | SF |
| `festivaltype` | 축제유형명 |  | SF |
| `showflag` | 표출여부 | 1 | SY |
| `homepage` | 홈페이지주소 | <a href=\"https://tour.daegu.go.kr/index.do?m | DC |
| `telname` | 전화번호명 |  | DC |
| `overview` | 개요 | 동촌유원지는 대구시 동쪽 금호강변에 있는 44만 평의 유원지로….<이하생략> | DC |

- 위치기반 조회 결과에만 `dist`(중심 좌표에서의 거리, 문서 단위 m)가 붙는다. 실제 단위·정렬은 프로파일러로 확인한다.
- 동기화 목록(`areaBasedSyncList2`)에는 `showflag`(1 표출, 0 비표출)가 있다. 비표출은 삭제하지 않고 숨김 처리한다.
- `detailCommon2`에는 목록 필드에 더해 `overview`(개요), `homepage`(HTML `<a>` 태그가 섞임), `telname`이 있다.
- 행사(`searchFestival2`)는 `eventstartdate`, `eventenddate`(YYYYMMDD)가 붙는다.
- `cpyrhtDivCd`: Type1 출처 표시, Type3 출처 표시 + 변경 금지.

### 3.4 `detailIntro2` 소개정보 (필수 파라미터: `contentId`, `contentTypeId`)

타입마다 필드명이 다르다. 시간·휴무·요금 핵심 필드는 아래 요약과 같다.

| 타입 | 이용·영업시간 | 쉬는 날 | 요금 |
|---|---|---|---|
| 12 관광지 | usetime, useseason, opendate | restdate | - |
| 14 문화시설 | usetimeculture, spendtime | restdateculture | usefee |
| 15 행사/공연/축제 | playtime, eventstartdate, eventenddate, spendtimefestival |  | usetimefestival |
| 28 레포츠 | usetimeleports, openperiod | restdateleports | usefeeleports |
| 32 숙박 | checkintime, checkouttime |  | - |
| 38 쇼핑 | opentime, opendateshopping | restdateshopping | saleitemcost |
| 39 음식점 | opentimefood, opendatefood | restdatefood | - |

- 관광지(12)는 소개정보에 요금 필드가 **없다**. 입장료는 `detailInfo2`에 있다.
- 숙박(32) 객실 요금(`roomoffseasonminfee1·2`, `roompeakseasonminfee1·2`)도 `detailInfo2`에 있다.
- 값은 대부분 자유 텍스트 (예: 경복궁 `[1월~2월/11월~12월]09:00~17:00 (입장마감 16:00)...`). HTML 줄바꿈(`<br>`)이 섞인다.

타입별 전체 필드 (필드명 = 의미):

- **contentTypeId=12 (관광지)**: `accomcount` 수용인원, `chkbabycarriage` 유모차대여정보, `chkcreditcard` 신용카드가능정보, `chkpet` 애완동물동반가능정보, `expagerange` 체험가능연령, `expguide` 체험안내, `heritage1` 세계문화유산유무, `heritage2` 세계자연유산유무, `heritage3` 세계기록유산유무, `infocenter` 문의및안내, `opendate` 개장일, `parking` 주차시설, `restdate` 쉬는날, `useseason` 이용시기, `usetime` 이용시간
- **contentTypeId=14 (문화시설)**: `accomcountculture` 수용인원, `chkbabycarriageculture` 유모차대여정보, `chkcreditcardculture` 신용카드가능정보, `chkpetculture` 애완동물동반가능정보, `discountinfo` 할인정보, `infocenterculture` 문의및안내, `parkingculture` 주차시설, `parkingfee` 주차요금, `restdateculture` 쉬는날, `usefee` 이용요금, `usetimeculture` 이용시간, `scale` 규모, `spendtime` 관람소요시간
- **contentTypeId=15 (행사/공연/축제)**: `agelimit` 관람가능연령, `bookingplace` 예매처, `discountinfofestival` 할인정보, `eventenddate` 행사종료일, `eventhomepage` 행사홈페이지, `eventplace` 행사장소, `eventstartdate` 행사시작일, `festivalgrade` 축제등급, `placeinfo` 행사장위치안내, `playtime` 공연시간, `program` 행사프로그램, `spendtimefestival` 관람소요시간, `sponsor1` 주최자정보, `sponsor1tel` 주최자연락처, `sponsor2` 주관사정보, `sponsor2tel` 주관사연락처, `subevent` 부대행사, `usetimefestival` 이용요금
- **contentTypeId=25 (여행코스)**: `distance` 코스총거리, `infocentertourcourse` 문의및안내, `schedule` 코스일정, `taketime` 코스총소요시간, `theme` 코스테마
- **contentTypeId=28 (레포츠)**: `accomcountleports` 수용인원, `chkbabycarriageleports` 유모차대여정보, `chkcreditcardleports` 신용카드가능정보, `chkpetleports` 애완동물동반가능정보, `expagerangeleports` 체험가능연령, `infocenterleports` 문의및안내, `openperiod` 개장기간, `parkingfeeleports` 주차요금, `parkingleports` 주차시설, `reservation` 예약안내, `restdateleports` 쉬는날, `scaleleports` 규모, `usefeeleports` 입장료, `usetimeleports` 이용시간
- **contentTypeId=32 (숙박)**: `accomcountlodging` 수용가능인원, `checkintime` 입실시간, `checkouttime` 퇴실시간, `chkcooking` 객실내취사여부, `foodplace` 식음료장, `infocenterlodging` 문의및안내, `parkinglodging` 주차시설, `pickup` 픽업서비스, `roomcount` 객실수, `reservationlodging` 예약안내, `reservationurl` 예약안내홈페이지, `roomtype` 객실유형, `scalelodging` 규모, `subfacility` 부대시설 (기타), `barbecue` 바비큐장여부, `beauty` 뷰티시설정보, `beverage` 식음료장여부, `bicycle` 자전거대여여부, `campfire` 캠프파이어여부, `fitness` 휘트니스센터여부, `karaoke` 노래방여부, `publicbath` 공용샤워실여부, `publicpc` 공용 PC실여부, `sauna` 사우나실여부, `seminar` 세미나실여부, `sports` 스포츠시설여부, `refundregulation` 환불규정
- **contentTypeId=38 (쇼핑)**: `chkbabycarriageshopping` 유모차대여정보, `chkcreditcardshopping` (원문 표기는 공백 포함 `chkcreditcard shopping`, 실제 응답 확인) 신용카드가능정보, `chkpetshopping` 애완동물동반가능정보, `culturecenter` 문화센터바로가기, `fairday` 장서는날, `infocentershopping` 문의및안내, `opendateshopping` 개장일, `opentime` 영업시간, `parkingshopping` 주차시설, `restdateshopping` 쉬는날, `restroom` 화장실설명, `saleitem` 판매품목, `saleitemcost` 판매품목별가격, `scaleshopping` 규모, `shopguide` 매장안내
- **contentTypeId=39 (음식점)**: `chkcreditcardfood` 신용카드가능정보, `discountinfofood` 할인정보, `firstmenu` 대표메뉴, `infocenterfood` 문의및안내, `kidsfacility` 어린이놀이방여부, `opendatefood` 개업일, `opentimefood` 영업시간, `packing` 포장가능, `parkingfood` 주차시설, `reservationfood` 예약안내, `restdatefood` 쉬는날, `scalefood` 규모, `seat` 좌석수, `smoking` 금연/흡연여부, `treatmenu` 취급메뉴, `lcnsno` 인허가번호

### 3.5 `detailInfo2` 반복정보 (필수 파라미터: `contentId`, `contentTypeId`)

장소당 여러 행. 일반 타입은 "항목명 + 내용" 행이다.

- **숙박, 여행코스를 제외한 타입**: `fldgubun` 일련번호, `infoname` 제목, `infotext` 내용, `serialnum` 반복일련번호
- **contentTypeId=25 (여행코스)**: `subcontentid` 하위콘텐츠ID, `subdetailalt` 코스이미지설명, `subdetailimg` 코스이미지, `subdetailoverview` 코스개요, `subname` 코스명, `subnum` 반복일련번호
- **contentTypeId=32 (숙박)**: `roomcode` 객실코드, `roomtitle` 객실명칭, `roomsize1` 객실크기(평), `roomcount` 객실수, `roombasecount` 기준인원, `roommaxcount` 최대인원, `roomoffseasonminfee1` 비수기주중최소, `roomoffseasonminfee2` 비수기주말최소, `roompeakseasonminfee1` 성수기주중최소, `roompeakseasonminfee2` 성수기주말최소, `roomintro` 객실소개, `roombathfacility` 목욕시설여부, `roombath` 욕조여부, `roomhometheater` 홈시어터여부, `roomaircondition` 에어컨여부, `roomtv` TV 여부, `roompc` PC 여부, `roomcable` 케이블설치여부, `roominternet` 인터넷여부, `roomrefrigerator` 냉장고여부, `roomtoiletries` 세면도구여부, `roomsofa` 소파여부, `roomcook` 취사용품여부, `roomtable` 테이블여부, `roomhairdryer` 드라이기여부, `roomsize2` 객실크기(평방미터), `roomimg1` 객실사진1, `roomimg1alt` 객실사진1 설명, `cpyrhtDivCd1` 저작권 유형 1, `roomimg2` 객실사진2, `roomimg2alt` 객실사진2 설명, `cpyrhtDivCd2` 저작권 유형 2, `roomimg3` 객실사진3, `roomimg3alt` 객실사진3 설명, `cpyrhtDivCd3` 저작권 유형 3, `roomimg4` 객실사진4, `roomimg4alt` 객실사진4 설명, `cpyrhtDivCd4` 저작권 유형 4, `roomimg5` 객실사진5, `roomimg5alt` 객실사진5 설명, `cpyrhtDivCd5` 저작권 유형 5

- 타입별 항목명(`infoname`)은 값으로 오는 자유 텍스트이다. 관광지는 `입장료`·`관람료`·`시설이용료`·`주차요금` 등이 실측에서 확인됐다 (항목명 19종). 항목 목록은 xlsx `반복정보` 시트 참고.
- 일반 타입 예: `{ "fldgubun":"3", "infoname":"입 장 료", "infotext":"무료", "serialnum":"0" }`. `infoname`에 공백이 섞인 변형이 9종 있어 공백을 제거하고 비교한다.
- `fldgubun`(1~4)의 의미는 문서에 없다 ❓.
- 여행코스(25)는 구성 장소 행(`subcontentid`, `subnum`, `subname`, `subdetailoverview`, `subdetailimg`)이 온다.

### 3.6 코드 조회·이미지·기타 오퍼레이션

- **`ldongCode2`** (법정동 코드): `code` 코드, `name` 코드명, `rnum` 일련번호, `lDongRegnCd` 법정동 시도코드, `lDongRegnNm` 법정동 시도명, `lDongSignguCd` 법정동 시군구코드, `lDongSignguNm` 법정동 시군구명
- **`lclsSystmCode2`** (분류체계 코드): `code` 코드: 1Depth, 2Depth, 3Depth 코드, `name` 코드: 1Depth, 2Depth, 3Depth 코드명, `rnum` 일련번호, `lclsSystm1Cd` 분류체계 대분류코드, `lclsSystm1Nm` 분류체계 대분류명, `lclsSystm2Cd` 분류체계 중분류코드, `lclsSystm2Nm` 분류체계 중분류명, `lclsSystm3Cd` 분류체계 소분류코드, `lclsSystm3Nm` 분류체계 소분류명
- **`detailImage2`** (이미지): `contentid` 콘텐츠ID, `imgname` 이미지명, `originimgurl` 원본이미지, `serialnum` 이미지일련번호, `cpyrhtDivCd` 저작권 유형, `smallimageurl` 썸네일이미지
- **`detailPetTour2`** (반려동물 (MVP 미사용)): `acmpyPsblCpam` 동반가능동물, `relaRntlPrdlst` 관련 렌탈 품목, `acmpyNeedMtr` 동반시 필요사항, `relaFrnshPrdlst` 관련 비치 품목, `etcAcmpyInfo` 기타 동반 정보, `relaPurcPrdlst` 관련 구매 품목, `relaAcdntRiskMtr` 관련 사고 대비사항, `acmpyTypeCd` 동반유형코드(동반구분), `relaPosesFclty` 관련 구비 시설, `contentid` 콘텐츠 ID, `petTursmInfo` 반려동물 관광정보

- `ldongCode2`: 서울 시도코드 `11`, 시군구 25개 (예: `110` 종로구). 5자리 시군구 코드는 `lDongRegnCd + lDongSignguCd` (예: `11110`).
- `lclsSystmCode2`: `lclsSystmListYn=Y`로 전체 목록. 대분류 10 · 중분류 59 · 소분류 246 (Notion 문서, 2026-10-13 조회). 정의서는 240으로 표기해 차이가 있다.
- `detailImage2`: 필수 요청 `contentId`. 응답 `imgname`, `originimgurl`, `smallimageurl`, `serialnum`, `cpyrhtDivCd`.

### 3.7 실측 채움률과 규모 (Notion 문서, 2026-10-13)

서울(`lDongRegnCd=11`) 8,003건, 상세(공통·소개) 8,083건, 반복정보 858건(관광지 778 + 여행코스 80) 수집 완료.
호출 한도 때문에 상세는 장소당 1회씩이 병목이다.

| 구분 | 필드 | 채움률·비고 |
|---|---|---|
| 목록 | `addr1` / `addr2` | 100% / 44% |
| 목록 | `mapx`, `mapy` | 100%, 이상치 10건 (9건 동일 기본값 117.99/19.69, 1건 강원 좌표) |
| 목록 | `lDongRegnCd`, `lDongSignguCd`, `lclsSystm1~3` | 100% |
| 목록 | `areacode`, `sigungucode`, `cat1~3` | 24~25% (옛 코드, 미사용) |
| 목록 | `firstimage` | 90% (음식점 69%, 숙박 49%). http 이미지 23% |
| 목록 | `cpyrhtDivCd` | 이미지 있는 장소 100% (Type3 89%) |
| 목록 | `tel` / `mlevel` | 2.4% / 76% |
| 공통 | `overview` | 유형별 98.4~100% (숙박 98.4%) |
| 공통 | `homepage` | 문화시설 93%, 관광지 72%, 음식점 20% (23%가 `<a>` 태그) |
| 소개 | 관광지 `usetime`, `restdate` | 96.4%, 95.1% |
| 소개 | 문화시설 `usetimeculture`, `restdateculture`, `usefee` | 98.4%, 97.9%, 89% |
| 소개 | 레포츠 `usetimeleports`, `usefeeleports` | 96.3%, 1.3% (125건 중 45건은 소개정보 응답 자체가 빔) |
| 소개 | 쇼핑 `opentime`, `restdateshopping` | 98.0% (후보 251건 기준) |
| 소개 | 음식점 `opentimefood`, `restdatefood`, `firstmenu`, `treatmenu`, `lcnsno` | 99.8%, 98.9%, 99.4%, 95.1%, 96.5% |
| 소개 | 축제 `eventstartdate`, `eventenddate`, `usetimefestival` | 100%, 100%, 98.9% |
| 반복 | 관광지 입장료 항목 | 778곳 중 566곳. 무료만 502, 금액 표기 51, 무료+별도 13 |
| 반복 | 관광지 | 65곳은 빈 응답. 항목명 19종 |
| 소개 | 운영시간이 `09:00~18:00` 단순형 | 관광지 12%, 레포츠 14%, 음식점 26%, 문화시설 32%, 쇼핑 26% |

콘텐츠 유형별 서울 건수: 관광지(12) 778, 문화시설(14) 573, 축제(15) 189, 레포츠(28) 125, 숙박(32) 383, 쇼핑(38) 4,356 (사후면세점 4,104), 음식점(39) 1,599.
영업 상태·폐업 필드는 없다.

---

## 4. 외국어 관광정보 서비스 ❓

- 서비스 ID는 `EngService2`(영문), `JpnService2`(일문), `ChsService2`(중문 간체) 등으로 알려져 있다 (서드파티 문서 기준). 공식 매뉴얼은 열람하지 못했다.
- 확인된 사실 (spec·정의서 기준): 국문 서비스와 **별도 활용신청**이 필요하고, 콘텐츠 유형 ID가 다르다 (국문 → 다국어: 관광지 12→76, 문화시설 14→78, 축제 15→85, 레포츠 28→75, 숙박 32→80, 쇼핑 38→79, 음식점 39→82, 여행코스 25→없음).
- 확인할 것: 오퍼레이션 목록과 응답 필드가 국문(`KorService2`)과 같은 구조인지, 서울 장소가 국문과 같은 `contentid`로 연결되는지(안 되면 이름·좌표 매칭), 법정동·분류체계 파라미터 지원 여부.
- 팀 Notion 문서는 "공식 외국어 장소명은 TourAPI로 얻을 수 없다"고 기록해, `spec.md` F2-5(TourAPI 다국어 사용)와 어긋난다. 이 서비스를 직접 호출해 확인하면 정리된다.

---

## 5. 관광지별 연관 관광지 `TarRlteTarService1` ✅

- 근거: TourAPI 활용 매뉴얼 관광지별 연관 관광지 정보 v4.1
- Base URL: `http://apis.data.go.kr/B551011/TarRlteTarService1/`
- 오퍼레이션: `areaBasedList1`(지역기반), `searchKeyword1`(키워드 검색)

| 파라미터 | 필수 | 설명·샘플 |
|---|---|---|
| `baseYm` | Y | 기준연월 `YYYYMM` (예 `202504`) |
| `areaCd` | Y | 지역(시도) 코드 (예 `51`) |
| `signguCd` | Y | 시군구 코드 5자리 (예 `51130`) |
| `keyword` | Y (`searchKeyword1`) | 관광지명 |
| 공통 | | `MobileOS`, `MobileApp`, `serviceKey`, `_type`, `numOfRows`, `pageNo` |

응답 item 필드 (알파벳 순 정렬):

| 필드 | 의미 | 샘플 |
|---|---|---|
| `baseYm` | 기준연월 | 202504 |
| `tAtsNm` | 관광지명 (기준 관광지) | 간현관광지 |
| `areaCd`, `areaNm` | 기준 관광지 시도 코드·이름 | 51, 강원특별자치도 |
| `signguCd`, `signguNm` | 기준 관광지 시군구 코드·이름 | 51130, 원주시 |
| `rlteTatsCd` | 연관 관광지 코드 (해시 문자열, 32자) | 0bfeca21... |
| `rlteTatsNm` | 연관 관광지명 | 고척스카이돔 |
| `rlteRegnCd`, `rlteRegnNm` | 연관 관광지 시도 | 51, 강원특별자치도 |
| `rlteSignguCd`, `rlteSignguNm` | 연관 관광지 시군구 | 51130, 원주시 |
| `rlteCtgryLclsNm`, `rlteCtgryMclsNm`, `rlteCtgrySclsNm` | 연관 카테고리 대·중·소분류명 | 관광지, 문화관광, 전시시설 |
| `rlteRank` | 연관 순위 | 1 |

- `TarRlteTarService1`의 `contentid`는 없다. KorService2와는 **이름 + 시군구**로 매칭한다.
- 서울은 시군구(25개)별로 호출한다. 개발계정 한도가 있어 운영계정 신청을 함께 계획한다.
- 매뉴얼 샘플 값이 일관되지 않다 (기준 관광지는 원주시인데 연관 관광지 예시가 `고척스카이돔`). 실제 응답으로 확인한다 ⚠️.

---

## 6. 관광 빅데이터 `DataLabService` ✅

- 근거: TourAPI 활용 매뉴얼 관광 빅데이터 v4.1
- Base URL: `http://apis.data.go.kr/B551011/DataLabService/`

| 오퍼레이션 | 단위 | 필수 파라미터 |
|---|---|---|
| `metcoRegnVisitrDDList` | 광역 지자체(시도) 일별 방문자 수 | `startYmd`, `endYmd` (`yyyyMMdd`) |
| `locgoRegnVisitrDDList` | 기초 지자체(시군구) 일별 방문자 수 | `startYmd`, `endYmd` |

응답 item 필드:

| 필드 | 의미 | 샘플 |
|---|---|---|
| `areaCode`, `areaNm` | 시도 코드·이름 (광역만) | 11, 서울특별시 |
| `signguCode`, `signguNm` | 시군구 코드·이름 (기초만) | 11110, 종로구 |
| `daywkDivCd`, `daywkDivNm` | 요일 구분 (1 월 ~ 7 일) | 4, 목요일 |
| `touDivCd`, `touDivNm` | 관광객 구분: 1 현지인, 2 외지인, 3 외국인 | 1, 현지인(a) |
| `touNum` | 관광객 수 | 176473.5 |
| `baseYmd` | 기준일 | 20210513 |

- 외국인은 **합계**만 있고 국적별 구분은 없다. 지역 필터 파라미터도 없어 조회 기간 전체를 받아 걸러야 한다.
- 소수점이 있는 추정치이다 (예 `4828435.5`).

---

## 7. 관광사진 `PhotoGalleryService1` ✅

- 근거: TourAPI 활용 매뉴얼 관광사진 v4.2
- Base URL: `http://apis.data.go.kr/B551011/PhotoGalleryService1/`
- **이용허락 범위(라이선스) 필드가 매뉴얼에 없다.** 확인 전까지 서비스 화면에 쓰지 않는다 (rule.md R-P01).

| 오퍼레이션 | 용도 | 고유 파라미터 |
|---|---|---|
| `galleryList1` | 갤러리 목록 (제목 중복 제거 그룹) | `arrange` (A 촬영일, B 제목, C 수정일) |
| `gallerySearchList1` | 키워드 검색 목록 | `keyword` (필수) |
| `galleryDetailList1` | 제목별 상세 목록 | `title` (필수) |
| `gallerySyncDetailList1` | 동기화 | `title`, `galUseFlag`(1 표출, 0 비표출), `galModifiedTime` |

응답 item 필드 (공통):

| 필드 | 의미 | 샘플 |
|---|---|---|
| `galContentId` | 사진 콘텐츠 ID | 681272 |
| `galContentTypeId` | 콘텐츠 타입 ID (고정 17) | 17 |
| `galTitle` | 제목 | 구룡포항 |
| `galWebImageUrl` | 웹용 이미지 URL | http://tong.visitkorea.or.kr/cms2/website/72/681272.jpg |
| `galCreatedtime`, `galModifiedtime` | 등록·수정 시각 (14자리) | 20090119194219 |
| `galPhotographyMonth` | 촬영월 `YYYYMM` | 200812 |
| `galPhotographyLocation` | 촬영 장소 (시도·시군구 정도의 지역명) | 경북 |
| `galPhotographer` | 촬영자 | 한국관광공사 김지호 |
| `galSearchKeyword` | 검색 키워드 (쉼표 구분) | 구룡포항, 경상북도 포항시, ... |
| `galUseFlag` | 표출 여부 (동기화 오퍼레이션) | 1 |

- `KorService2`의 `contentid`와 연결되는 키가 없다. 제목(`galTitle`)과 지역으로 매칭해야 한다.

---

## 8. 관광실태조사(외래관광객) `TourismAccdtOutService` ✅

- 근거: 한국문화관광연구원 관광실태조사 서비스 외래관광객 활용 가이드 v1.0
- Base URL: `http://openapi.tour.go.kr/openapi/service/TourismAccdtOutService/`
- 공통 요청: `serviceKey`(필수), `numOfRows`, `pageNo`, `YY`(연도, 필수). 응답 껍데기는 §2와 같다.
- 용도: 기준표 전체 평균을 검증하는 공표 통계 비교용 (연 1회). 장소·국적별 데이터는 없다.

| 오퍼레이션 | 필터 파라미터 | 응답 item 필드 |
|---|---|---|
| `getForeignTuristAreaRateList` (지역 비율) | `SIDO_CD` (A 서울권, B 경기권, C 인천권, D 경상권, E 강원권, F 제주권, G 충청권, H 전라권, I 경기+인천, Z 기타) | `ratio`(중복응답 기준 %), `sido`, `sidoCd`, `yy`, `rnum` |
| `getForeignTuristWtrsnRateList` (방한 활동 비율) | `ACTIVITY_CD` (A 쇼핑, B 식도락, C 업무, D 고궁/역사 유적, E 자연경관, F 시티투어, G 유흥/오락, H 회의/학술, I 미용, G 온천/스파) | `activity`, `activityCd`, `ratio`, `yy`, `rnum` |
| `getForeignTuristExpndtrList` (1인 평균 지출) | `TOURTYPE_CD` (Z 전체, I 개별, G 단체, A Air-Tel) | `expense`(1인 평균 지출, **US$**), `tourtype`, `tourtypeCd`, `yy`, `rnum` |

- 가이드의 활동 코드표에서 `G`가 두 번 나온다 (유흥/오락, 온천/스파). 실제 코드는 호출해서 확인한다 ⚠️.
- 샘플 연도는 2011이다. 최신 연도 지원 범위는 호출로 확인한다. 지출은 달러 기준이라 환율 변환이 필요하다.

---

## 9. ODsay 대중교통 길찾기 `searchPubTransPathT` ✅

- 근거: ODsay LAB API Reference (https://lab.odsay.com/guide/releaseReference), 2026-10-13 열람. v1.8 권장.
- URL: `GET|POST https://api.odsay.com/v1/api/searchPubTransPathT` (JSON 또는 XML)
- 서버 플랫폼 키는 등록한 IP에서만 동작한다 (rule.md).

### 9.1 요청 파라미터

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `apiKey` | Y | 발급된 키 |
| `SX`, `SY` | Y | 출발지 경도, 위도 (WGS84) — TourAPI `mapx`, `mapy`와 같은 순서 |
| `EX`, `EY` | Y | 도착지 경도, 위도 |
| `lang` | N | 0 국문, 1 영문, 2 일문, 3 중문(간체), 4 중문(번체), 5 베트남어(수도권만). 기본 0 |
| `output` | N | json(기본), xml |
| `OPT` | N | 0 추천경로, 1 타입별 정렬 |
| `SearchType` | N | 0이면 도시 내 검색 |
| `SearchPathType` | N | 0 전체(기본), 1 지하철, 2 버스 |

출발 시각 파라미터는 없다. 시각 지정은 멀티모달 API `maasRP`(`SearchTime` `yyyyMMddHHmm`)에만 있다.

### 9.2 응답 구조 (도시 내, v1.8)

```
result
├ searchType            0 도시내 (1 도시간 직통, 2 도시간 환승)
├ outTrafficCheck       도시간 직통 결과 유무 (0/1)
├ busCount, subwayCount, subwayBusCount
├ pointDistance         출발-도착 직선거리(m)
├ startRadius, endRadius
└ path[]
   ├ pathType           1 지하철 / 2 버스 / 3 버스+지하철
   ├ info
   │  ├ totalTime(분, int), payment(원, int, 총 요금), totalWalk(m), totalDistance, trafficDistance(도보 제외)
   │  ├ busTransitCount, subwayTransitCount
   │  ├ totalStationCount, busStationCount, subwayStationCount
   │  ├ firstStartStation, lastEndStation  (+ ...Kor 국문, ...JpnKata 일문 가타카나)
   │  ├ checkIntervalTime, checkIntervalTimeOverYn, totalIntervalTime
   │  └ mapObj            (경로 그래픽 호출용 값)
   └ subPath[]
      ├ trafficType       1 지하철 / 2 버스 / 3 도보
      ├ distance(m), sectionTime(분), stationCount, intervalTime(평균 배차간격, 분)
      ├ lane[]            지하철: name, subwayCode, subwayCityCode
      │                   버스: busNo, type, busID, busLocalBlID, busCityCode, busProviderCode
      │                   (+ nameKor / busNoKor 등 다국어 표기)
      ├ startName, startX, startY, startID (+ startNameKor ...)
      ├ endName,   endX,   endY,   endID   (+ endNameKor ...)
      ├ way, wayCode(1 상행, 2 하행), door     (지하철: 방면, 빠른 환승 위치)
      ├ startExitNo/X/Y, endExitNo/X/Y         (지하철 출구, 없을 수 있음)
      ├ startStationCityCode, startLocalStationID, startArsID  (버스, BIS 지역만)
      └ passStopList.stations[]  index, stationID, stationName(+Kor), x(string), y(string),
                                 stationCityCode, localStationID, arsID, isNonStop(Y/N, 버스)
```

- 타입: `totalTime`, `payment`, `sectionTime`은 int, `distance`는 double, `passStopList`의 `x`, `y`는 string.
- 문서상 필수(Y)로 표기돼도 도보 구간에는 정류장 필드가 없을 가능성이 크다. 첫 호출로 확인한다 ⚠️.
- `payment`가 교통카드 기준인지 현금 기준인지, `totalTime`에 도보가 포함되는지는 문서에 명시가 없다 ❓.
- 선택한 경로: 여러 `path[]` 중 `info.totalTime`이 최소인 것을 쓰는 것이 초안 코드(`odsay.py`)의 방식이다.

### 9.3 에러 코드

| 코드 | 의미 |
|---|---|
| 500 | 서버 내부 오류 |
| -8 | 필수 입력값 형식·범위 오류 |
| -9 | 필수 입력값 누락 |
| 3 / 4 / 5 | 출발지 / 도착지 / 출·도착지 정류장 없음 |
| 6 | 서비스 지역이 아님 |
| **-98** | **출·도착지가 700m 이내** — 가까운 구간은 경로 대신 에러가 온다 |
| -99 | 검색 결과 없음 |

에러 응답의 JSON 형태(키 이름)는 이 레퍼런스에 없다 ❓. 초안 코드는 `error` 키를 가정한다.

### 9.4 도보 길찾기 `searchWalkPathV2` ⚠️

- URL: `https://api.odsay.com/v1/api/searchWalkPathV2`. 필수: `opt`(reco 추천, short 최단, wide 큰길), `loc`(`sx,sy,ex,ey`, 여러 구간은 `@`로 연결). 직선 30km 이내.
- 응답 `result.path[]`: `hasPathResult`, `errorCode`(400~414), `speedKMPerHour`, `recommend.summary { start{x,y}, end{x,y}, distance(m), duration(초), ... }`. 이하 필드는 확인한 범위에서 잘렸다.

### 9.5 코드표 (일부)

- 버스 노선 타입 `lane.type`: 1 일반, 2 좌석, 3 마을, 4 직행좌석, 5 공항, 6 간선급행, 10 외곽, 11 간선, 12 지선, 13 순환, 14 광역, 15 급행, 16 관광, 20 농어촌, 22 경기도 시외형, 26 급행간선, 30 한강버스.
- 지하철 `subwayCode`: 1~9 수도권 1~9호선, 91 GTX-A, 101 공항철도, 104 경의중앙선, 108 경춘선, 109 신분당선, 113 우이신설선, 116 수인분당선, 117 신림선 (전체는 레퍼런스 문서 하단).
- 도시코드 `CID`: 1000 서울, 2000 인천 (전체는 문서 하단).

---

## 10. 한국수출입은행 환율 `exchangeJSON` ✅

- 근거: 한국수출입은행 OpenAPI 안내 페이지 (현재환율 AP01)
- URL: `GET https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON` (구 도메인 병행 가동은 2026-04-30 종료)

| 요청 변수 | 필수 | 설명 |
|---|---|---|
| `authkey` | Y | 발급된 인증키 |
| `searchdate` | N | 조회일 (`YYYY-MM-DD` 또는 `YYYYMMDD`). 생략하면 현재일 |
| `data` | Y | AP01 환율, AP02 대출금리, AP03 국제금리 |

응답: 통화별 객체의 **배열**이다. 필드:

| 필드 | 타입 | 의미 |
|---|---|---|
| `RESULT` | Integer | 1 성공, 2 data 코드 오류, 3 인증코드 오류, 4 일일 제한 횟수 마감 |
| `CUR_UNIT` | String | 통화 코드 (예: `JPY(100)`처럼 100단위 표기가 있다) |
| `CUR_NM` | String | 국가·통화명 |
| `TTB`, `TTS` | String | 전신환 받을 때·보낼 때 환율 |
| `DEAL_BAS_R` | String | 매매 기준율 |
| `BKPR` | String | 장부가격 |
| `YY_EFEE_R`, `TEN_DD_EFEE_R` | String | 년·10일 환가료율 |
| `KFTC_DEAL_BAS_R`, `KFTC_BKPR` | String | 서울외국환중개 매매기준율·장부가격 |

- 값은 문자열이고 천 단위 쉼표가 들어간다 (예: `1,234.5`). 숫자 변환 전에 쉼표를 제거한다.
- 필드명 대소문자: 안내 페이지는 대문자로 표기한다. 초안 코드(`fx.py`)는 소문자 키를 읽으므로 실제 응답으로 확인해 통일한다 ⚠️.
- 일 1,000회 호출. 영업일 오전 11시 전후 갱신. 비영업일이나 갱신 전에는 null이 온다 → 최대 7일 전까지 거슬러 조회.
- RESULT 3은 개인정보 보유 기간(2년) 만료로 키가 파기됐을 수 있다는 안내가 있다.

---

## 11. Papago Translation (네이버 클라우드) ✅

- 근거: 네이버 클라우드 API 문서 Papago Translation
- URL: `POST https://papago.apigw.ntruss.com/nmt/v1/translation`
- 헤더: `X-NCP-APIGW-API-KEY-ID`(Client ID), `X-NCP-APIGW-API-KEY`(Client Secret), `Content-Type: application/x-www-form-urlencoded` 또는 `application/json`

| 본문 필드 | 필수 | 설명 |
|---|---|---|
| `source` | Y | 원본 언어 (`auto`, ko, en, ja, zh-CN, zh-TW, vi, th, id, fr, es, ru, de, it) |
| `target` | Y | 번역 언어 (ko, en, ja, zh-CN, zh-TW, vi, th, id, fr, es, ru, de, it) |
| `text` | Y | 최대 5,000자 / 1회 |
| `honorific` | N | 높임말 (기본 false, 언어쌍별 지원 상이) |
| `glossaryKey`, `replaceInfo` | N | 용어집, 문자열 치환 |

응답:

```
message
└ result
   ├ srcLangType      원본 언어 코드
   ├ tarLangType      번역 언어 코드
   └ translatedText   번역 결과
```

- 번역하지 않을 부분은 `<span translate="no">`로 감싼다 (글자 수에서 제외).
- 오류 코드 표는 이 페이지에 없다 (별도 응답 상태 코드 문서) ❓. 과금 단위는 글자 수이고 요금표는 아직 확인하지 못했다.

---

## 12. 서울시 실시간 도시데이터 `citydata` ⚠️

- 근거: 서울 열린데이터광장 데이터셋 OA-22714, 샘플 키로 광화문·덕수궁 호출 응답(2026-10-01 21:20 기준)
- URL 형태: `http://openapi.seoul.go.kr:8088/{인증키}/json/citydata/{시작}/{끝}/{장소명 또는 장소코드}`
- **호출 1회에 장소 1곳**. 장소는 서울 주요 121곳 (명동, 홍대 등). 장소명과 장소코드(예 `POI009`)는 동시에 쓸 수 없다. 샘플 키는 광화문·덕수궁만 가능하다.

응답 구조 (확인한 범위):

```
list_total_count
RESULT { RESULT.CODE "INFO-000", RESULT.MESSAGE }
CITYDATA
├ AREA_NM, AREA_CD
├ LIVE_PPLTN_STTS[]
│   ├ AREA_CONGEST_LVL   ("여유" 등 혼잡도 단계)
│   ├ AREA_CONGEST_MSG   (안내 문구)
│   ├ AREA_PPLTN_MIN, AREA_PPLTN_MAX   (추정 인구 범위, 문자열)
│   ├ MALE_PPLTN_RATE, FEMALE_PPLTN_RATE
│   ├ PPLTN_RATE_0 ~ PPLTN_RATE_70    (연령대별 비율 %)
│   ├ RESNT_PPLTN_RATE, NON_RESNT_PPLTN_RATE
│   ├ REPLACE_YN, PPLTN_TIME ("YYYY-MM-DD HH:mm"), FCST_YN
│   └ FCST_PPLTN[]  { FCST_TIME, FCST_CONGEST_LVL, FCST_PPLTN_MIN, FCST_PPLTN_MAX }  (이후 약 11시간 예측)
└ ROAD_TRAFFIC_STTS { AVG_ROAD_DATA, ROAD_TRAFFIC_STTS[] }  (이후 블록은 열람 범위에서 잘림)
```

- 혼잡도 단계 값의 전체 목록(여유 외 보통·약간 붐빔·붐빔 등)과 그 밖의 블록(교통, 주차, 날씨 등)은 매뉴얼 PDF에서 확인한다 ❓.
- 단위가 장소가 아니라 지역(121곳)이므로, 우리 `place_area` 매핑표와 연결해서 쓴다.

---

## 13. Google Places API (New) 텍스트 검색 ⚠️ (선택, 스파이크 후 결정)

- 근거: Google Maps Platform 문서 Text Search (Places API New)
- URL: `POST https://places.googleapis.com/v1/places:searchText`
- 필수 헤더: `X-Goog-FieldMask` (쉼표로 필드 나열, 공백 불가, 생략하면 오류. 기본 반환 필드 없음)
- 요청 본문: `textQuery`(필수), `languageCode`(기본 en), `locationBias`(circle 또는 rectangle), 그 밖에 `locationRestriction`, `pageSize`, `pageToken`, `minRating`, `openNow`, `priceLevels`, `rankPreference`, `regionCode`, `includedType`
- 응답: `places[]` 배열 (+ `nextPageToken`). 여러 페이지를 합쳐 최대 60개.

| 필드 | SKU 등급 |
|---|---|
| `places.id`, `places.name` | ID Only |
| `places.displayName`, `places.location` | Pro |
| `places.rating`, `places.userRatingCount` | Enterprise |

- 평점·리뷰 수는 가장 비싼 등급(Enterprise)이다. 저장·캐시 허용 범위와 요금은 약관과 가격표에서 확인한다 ❓.
- TourAPI `contentid`와 연결되는 키가 없다. 이름 + 좌표로 매칭하고 오매칭을 검증한다.

---

## 14. 네이버 데이터랩 검색어 트렌드 ❓ (선택)

공식 문서(developers.naver.com)는 이 환경에서 열람이 차단되어 필드 표를 확인하지 못했다. 구현 전에 아래를 문서에서 확인한다.

- 요청: 기간(`startDate`, `endDate`), 집계 단위(`timeUnit`), 키워드 그룹(`keywordGroups`), 기기·성별·연령 필터 여부
- 응답: 키워드 그룹별 기간 값 (상대 지수, 절대 검색량이 아님)
- 한도: 일 호출 수, 요청당 키워드 그룹 수
- 용도: 장소명 키워드로 급상승 여부를 보는 보조 신호. 한국어 검색이라 한국인 신호에 가깝다.

---

## 15. 파일·통계 소스와 키 연결

### 15.1 파일 소스 ❓

| 소스 | 형식 | 확인해야 할 것 |
|---|---|---|
| 서울관광재단「2019~2025년 서울관광 실태조사 통합 Raw Data」 | xlsx | 컬럼명(코드표), 거주권역·체류일수·가중치·지출 항목·방문지 변수의 단위 (`build_cost_bands.py`의 `COLUMN_MAP`을 채우는 단계) |
| 서울시 한국여행중 서울지역 방문지(거주국별) | 통계 파일 | 지역 구분 단위, 국적 구분 |
| 서울시 주요관광지점 입장객 | 통계 파일 | 장소 단위 값, 내·외국인 구분 여부 |
| 한국관광공사 데이터랩 국적별 카드소비 | 다운로드 | 월 단위, 국적 구분, 최신성 보정 계수 산출 |

### 15.2 소스 간 키 연결

| 연결 | 키 | 비고 |
|---|---|---|
| KorService2 ↔ 연관 관광지 | 이름 + 시군구 5자리 | `contentid` 없음. 시군구는 `lDongRegnCd+lDongSignguCd`(예 11110)와 연관 관광지 `signguCd`가 같은 형식 |
| KorService2 ↔ 관광사진 | `galTitle` ↔ `title` + 지역 | `contentid` 없음 |
| KorService2 ↔ DataLab 방문자 수 | 시군구 5자리 (`signguCode`) | 외국인 합계만 |
| KorService2 → ODsay | `mapx` → `SX`/`EX`, `mapy` → `SY`/`EY` | 경도, 위도 순서 동일 |
| KorService2 ↔ 서울시 도시데이터 | 우리가 만드는 `place_area` 매핑 | 121곳은 지역 단위 |
| KorService2 ↔ Google Places | 이름 + 좌표 | 오매칭 검증 필요 |
| 실태조사 `expense`(US$) ↔ 환율 | `CUR_UNIT=USD` | 원화 환산 |

---

## 16. 구현 전에 정리할 것

1. 외국어 TourAPI(§4)를 직접 호출해 오퍼레이션과 `contentid` 연결을 확인한다. `spec.md` F2-5와 Notion 문서가 서로 다르게 적고 있다.
2. ODsay `-98`(700m 이내) 처리 규칙을 정한다 (도보 길찾기 또는 추정). `odsay.py`는 메시지에서 "700" 문자열을 찾는 방식이다.
3. 환율 응답 키 대소문자(대문자/소문자)를 실제 호출로 확인하고 `fx.py`를 맞춘다.
4. `PhotoGalleryService1`은 라이선스 확인 전까지 사용하지 않는다. 사진은 `KorService2`의 `firstimage`와 `cpyrhtDivCd`를 우선한다.
5. TourAPI JSON의 숫자는 문자열이다. 적재 스크립트에서 `mapx`, `mapy`, 시각 필드를 변환한다.
6. 서울시 도시데이터의 혼잡도 단계 값과 호출 방식(장소당 1회)을 확인한다.
