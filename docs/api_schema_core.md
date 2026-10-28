# 핵심 API 스키마: 국문 관광정보(KorService2) · ODsay (api_schema_core.md)

우리 앱이 실제로 쓰는 두 API만 따로 정리했다. 다른 API(환율, Papago, 연관 관광지 등)와 상세 전체 표는 `api_schema.md`, 요청·응답 전체 필드는 `KorService2_데이터_명세서.xlsx`에 있다.
작성일 2026-10-13. 근거: TourAPI 국문 활용 매뉴얼 v4.4, 활용신청 매뉴얼 v3.3, ODsay LAB API Reference(v1.8), 팀 Notion 실측 문서(KorService2, 2026-10-13). 실제 호출 응답은 이 환경에서 확인하지 못했다.

표시: ✅ 사용 · 🔶 보조 · ⬜ 미사용 · ❓ 문서로 확인 못 함

---

# Part 1. 한국관광공사 국문 관광정보 `KorService2`

## 1.1 개요

| 항목 | 값 |
|---|---|
| Base URL | `https://apis.data.go.kr/B551011/KorService2/{오퍼레이션}` |
| 인증 | `serviceKey` (공공데이터포털 일반 인증키). 이미 URL 인코딩된 키를 다시 인코딩하지 않는다 |
| 공통 요청 | `MobileOS`(필수: IOS/AND/WEB/ETC), `MobileApp`(필수), `serviceKey`(필수), `_type=json`(기본은 XML), `numOfRows`, `pageNo` |
| 응답 껍데기 | `response.header { resultCode "0000", resultMsg "OK" }` + `response.body { items { item[] }, numOfRows, pageNo, totalCount }` |
| 개발계정 한도 | 활용신청 매뉴얼 "오퍼레이션별 일 1,000건", 활용 매뉴얼 "일 1,000건". 표현이 달라 첫 대량 호출에서 확인 |
| 삭제된 것 | `areaCode2`, `categoryCode2`, `cat1~3` (v4.4에서 삭제). 지역은 법정동 코드, 분류는 분류체계 코드 |

## 1.2 오퍼레이션

| 오퍼레이션 | 용도 | 필수 파라미터 (공통 3개 제외) | 우리 사용 |
|---|---|---|---|
| `areaBasedList2` | 지역 기반 목록 | - | ✅ 서울 장소 수집 (타입별) |
| `areaBasedSyncList2` | 동기화 목록 | - | ✅ 일 1회 변경분 (수정일, 표출 여부) |
| `detailCommon2` | 공통 상세 | `contentId` | ✅ 개요, 홈페이지 |
| `detailIntro2` | 소개 정보 (타입별 필드) | `contentId`, `contentTypeId` | ✅ 운영시간, 휴무, 요금 |
| `detailInfo2` | 반복 정보 | `contentId`, `contentTypeId` | ✅ 관광지 입장료 |
| `detailImage2` | 이미지 목록 | `contentId` | 🔶 장소 상세 이미지 |
| `ldongCode2` | 법정동 코드 | - | ✅ 시군구 코드 (서울 `11`) |
| `lclsSystmCode2` | 분류체계 코드 | - | ✅ 테마 매핑 |
| `locationBasedList2` | 위치 기반 목록 | `mapX`, `mapY`, `radius` | 🔶 DB 누락 점검·보충 (순위에는 쓰지 않음) |
| `searchKeyword2` | 키워드 검색 | `keyword` | ⬜ (v4.3부터 관광타입 필터 없음) |
| `searchStay2` | 숙박 목록 | - | 🔶 숙소 검색용 DB 적재 |
| `searchFestival2` | 행사 | `eventStartDate` | ⬜ MVP 제외 |
| `detailPetTour2` | 반려동물 | - | ⬜ |

## 1.3 요청 파라미터 (사용하는 것)

| 파라미터 | 값 | 쓰는 오퍼레이션 | 비고 |
|---|---|---|---|
| `lDongRegnCd` | 법정동 시도 코드. 서울 `11` | 목록·동기화·위치기반·검색 | 반경이 경기도로 넘어가도 서울만 받음 |
| `lDongSignguCd` | 시군구 코드 (예: 종로구 `110`) | 목록 등 | `lDongRegnCd`가 필수 |
| `lclsSystm1~3` | 분류체계 대·중·소 | 목록 등 | 중분류는 대분류 필수, 소분류는 대·중 필수 |
| `contentTypeId` | 12 관광지, 14 문화시설, 15 축제공연행사, 25 여행코스, 28 레포츠, 32 숙박, 38 쇼핑, 39 음식점 | 목록, `detailIntro2`, `detailInfo2` | 상세 호출은 필수 |
| `contentId` | 콘텐츠 ID | 상세 계열 | |
| `modifiedtime` | `YYYYMMDD` | 목록, 동기화 | 변경분 수집 |
| `showflag` | 1 표출, 0 비표출 | 동기화 | |
| `arrange` | A 제목, C 수정일, D 생성일, O·Q·R은 대표 이미지 있는 것만 | 목록 등 | |
| `mapX`, `mapY`, `radius` | 경도, 위도, 거리(m, 최대 20,000) | 위치 기반 | **요청은 대문자 `mapX`/`mapY`, 응답은 소문자 `mapx`/`mapy`** |
| `lDongListYn`, `lclsSystmListYn` | Y면 전체 목록 | 코드 조회 | |

## 1.4 목록 응답 item (목록·동기화·위치기반·상세 공통)

| 필드 | 의미 | 샘플(매뉴얼) | 사용 | → 우리 컬럼 (`place`) |
|---|---|---|---|---|
| `contentid` | 콘텐츠 ID | 127974 | ✅ | `content_id` (PK) |
| `contenttypeid` | 관광타입 | 12 | ✅ | `content_type` |
| `title` | 제목 | 을숙도 공원 | ✅ | `name_i18n.ko` |
| `addr1` | 주소 | 부산광역시 사하구 낙동남로 1240 (하단동) | ✅ | **없음, 컬럼 추가 필요** (장소 상세에 주소 표시) |
| `addr2` | 상세 주소 | (빈 값 56%) | 🔶 | 위와 같음 |
| `mapx` | 경도 (문자열) | 128.9460030322 | ✅ | `lng` |
| `mapy` | 위도 (문자열) | 35.1045320626 | ✅ | `lat` |
| `lDongRegnCd` | 시도 코드 | 26 | ✅ | `sigungu_cd` 앞 2자리 |
| `lDongSignguCd` | 시군구 코드 | 380 | ✅ | `sigungu_cd` 뒤 3자리 (합쳐 5자리) |
| `lclsSystm1` | 분류 대분류 | NA | ✅ | `lcls1` |
| `lclsSystm2` | 분류 중분류 | NA04 | ✅ | `lcls2` |
| `lclsSystm3` | 분류 소분류 | NA040500 | ✅ | `lcls3` (테마 매핑) |
| `firstimage` | 대표 이미지 원본 | http://tong.visitkorea.or.kr/... | ✅ | `image_url` |
| `firstimage2` | 대표 이미지 썸네일 | 위와 같음 | 🔶 | 목록 썸네일 후보 |
| `cpyrhtDivCd` | 이미지 저작권 유형 | Type1 | ✅ | `image_cpyrht` |
| `modifiedtime` | 수정일 (14자리) | 20250618095454 | ✅ | `tour_modified` |
| `createdtime` | 등록일 | 20031208090000 | ⬜ | |
| `tel` | 전화 | (2.4%만 채워짐) | 🔶 | 컬럼 없음 |
| `mlevel` | 지도 레벨 | 6 | ⬜ | |
| `zipcode` | 우편번호 | 49435 | ⬜ | |
| `dist` | 중심 좌표까지 거리 (위치기반만, 문서상 m) | 676.69... | 🔶 | 단위·정렬은 프로파일러로 확인 |
| `showflag` | 표출 여부 (동기화만) | 1 | ✅ | `is_visible` (0이면 삭제하지 않고 숨김) |
| `eventstartdate`, `eventenddate` | 행사 기간 `YYYYMMDD` (행사만) | 20260101 | ✅ | 컬럼 추가 필요 (기간 밖 행사 제외) |
| `overview` | 개요 (`detailCommon2`만) | 동촌유원지는 대구시 동쪽 금호강변에… | ✅ | `overview_i18n.ko` |
| `homepage` | 홈페이지 (`detailCommon2`만, `<a>` 태그가 섞임) | `<a href="https://...">` | 🔶 | 태그를 벗겨 URL만 저장 |
| `telname` | 전화번호명 | | ⬜ | |

- 목록 응답에 옛 필드(`areacode`, `sigungucode`, `cat1~3`)가 섞여 올 수 있다. 실측 채움률 24~25%이고 사용하지 않는다.
- 응답 원문은 `place.raw`(JSONB)에 그대로 보존한다 (스키마 변경 대응).

## 1.5 `detailIntro2` 소개 정보: 타입별로 필드명이 다르다

핵심은 운영시간, 휴무, 요금, 소요시간이다. 파서는 타입별 필드 매핑표를 설정으로 둔다.

| 타입 | 이용·영업시간 | 쉬는 날 | 요금 | 소요시간 | 기타 |
|---|---|---|---|---|---|
| 12 관광지 | `usetime` | `restdate` | **없음** (→ `detailInfo2`) | 없음 | `useseason`, `opendate`, `parking`, `chkpet` |
| 14 문화시설 | `usetimeculture` | `restdateculture` | `usefee` | **`spendtime`** | `discountinfo`, `parkingfee` |
| 15 행사·축제 | `playtime` | 없음 | **`usetimefestival`** (이름과 달리 "이용요금") | **`spendtimefestival`** | `eventstartdate`, `eventenddate`, `eventplace` |
| 28 레포츠 | `usetimeleports` | `restdateleports` | `usefeeleports` | 없음 | `openperiod`, `reservation` |
| 32 숙박 | `checkintime`, `checkouttime` | 없음 | 없음 (객실 요금은 `detailInfo2`) | 없음 | `roomcount`, `reservationurl`, `refundregulation` |
| 38 쇼핑 | `opentime` | `restdateshopping` | `saleitemcost` (판매품목별) | 없음 | `opendateshopping`, `saleitem` |
| 39 음식점 | `opentimefood` | `restdatefood` | 없음 | 없음 | `firstmenu`, `treatmenu`, `reservationfood`, `packing` |
| 25 여행코스 | `schedule` 등 | | | `taketime` | `distance`, `theme` |

- 값은 대부분 **자유 텍스트**다. 예: 경복궁 `[1월~2월/11월~12월]09:00~17:00 (입장마감 16:00)...`. HTML 줄바꿈(`<br>`)이 섞인다.
- 실측: 운영시간이 `09:00~18:00` 단순형인 장소는 관광지 12%, 레포츠 14%, 음식점 26%, 문화시설 32%, 쇼핑 26%. 나머지는 파서가 필요하다.
- 채움률: 관광지 `usetime` 96.4%, `restdate` 95.1%. 문화시설 `usetimeculture` 98.4%, `restdateculture` 97.9%, `usefee` 89%. 음식점 `opentimefood` 99.8%. 레포츠 `usefeeleports`는 1.3%이고 125건 중 45건은 소개정보 응답 자체가 비어 있다.
- 문화시설 `spendtime`(관람소요시간)의 채움률은 확인하지 못했다. 체류시간 계산의 2단계 입력이므로 프로파일러로 확인한다.

## 1.6 `detailInfo2` 반복 정보

| 타입 | 필드 |
|---|---|
| 숙박·여행코스 제외 | `fldgubun`, `infoname`, `infotext`, `serialnum` |
| 25 여행코스 | `subcontentid`, `subname`, `subnum`, `subdetailoverview`, `subdetailimg`, `subdetailalt` |
| 32 숙박 (객실) | `roomtitle`, `roomsize1`(평), `roomsize2`(㎡), `roombasecount`, `roommaxcount`, `roomoffseasonminfee1·2`, `roompeakseasonminfee1·2`, `roomimg1~5` 등 |

- **관광지 입장료는 여기에만 있다.** `infoname`이 `입장료`, `입 장 료`(공백 변형 9종), `관람료`, `시설이용료`, `주차요금` 등으로 와서 **공백을 제거하고 비교**한다. 관광지 `infoname`은 19종.
- 실측(관광지 778곳): 입장료 항목이 있는 곳 566, 그중 무료만 502, 금액 표기 51, 무료+별도 13. 65곳은 빈 응답.
- 예: `{ "fldgubun":"3", "infoname":"입 장 료", "infotext":"무료", "serialnum":"0" }`. `fldgubun` 의미는 문서에 없다 ❓.
- `place.entrance_fee`(INTEGER)는 금액이 명확할 때만 채우고 파싱 실패 시 NULL로 둔다. 원문 텍스트를 보존할 컬럼(`fee_raw`)을 추가하면 화면에서 "원문 + 요금은 변동될 수 있습니다"로 폴백할 수 있다.

## 1.7 `detailImage2`, 코드 조회

| 오퍼레이션 | 응답 필드 |
|---|---|
| `detailImage2` | `contentid`, `imgname`, `originimgurl`, `smallimageurl`, `serialnum`, `cpyrhtDivCd` (이미지마다 저작권 유형이 따로 옴) |
| `ldongCode2` | `code`, `name`, `rnum`, `lDongRegnCd`/`lDongRegnNm`(시도), `lDongSignguCd`/`lDongSignguNm`(시군구). 서울 `11`, 시군구 25개 (예: `110` 종로구) |
| `lclsSystmCode2` | `lclsSystm1Cd/Nm`, `lclsSystm2Cd/Nm`, `lclsSystm3Cd/Nm`, `code`, `name`, `rnum`. 실측 대분류 10, 중분류 59, 소분류 246 (정의서는 240으로 표기) |

## 1.8 수집 흐름과 호출 규모

```
1. ldongCode2 (lDongRegnCd=11)          → 시군구 25개 코드표
2. lclsSystmCode2 (lclsSystmListYn=Y)   → 분류체계 코드표
3. areaBasedList2 (lDongRegnCd=11, contentTypeId별, 페이지 반복)
                                        → 서울 8,003건 목록 (좌표·분류·이미지·수정일)
4. 장소마다 detailCommon2 + detailIntro2 (+ 관광지·숙박은 detailInfo2)
                                        → 개요·운영시간·요금
5. 매일 areaBasedSyncList2 (modifiedtime, showflag) → 변경분만 갱신
```
- 상세 호출은 장소당 최대 3종이라 개발계정 한도(오퍼레이션별 일 1,000건)에서는 첫 수집에 며칠이 걸린다. 서울 8,003건은 이미 목록·상세(8,083건)·반복정보(858건) 수집이 끝난 상태다 (Notion 실측). 이후에는 동기화 목록으로 변경분만 갱신하므로 호출이 적다.
- 서울 타입별 건수: 관광지 778, 문화시설 573, 축제 189, 레포츠 125, 숙박 383, 쇼핑 4,356(사후면세점 4,104 포함), 음식점 1,599.
- 사후면세점(`SH04` 계열)은 추천 후보에서 제외한다 (설계서 §4.1, 팀 결정 대기). 제외 후 추천 가능 후보는 약 3,507건(Notion 실측).

## 1.9 파싱·품질 주의

| 항목 | 내용 | 처리 |
|---|---|---|
| 모든 값이 문자열 | 숫자도 문자열 (JSON에서도) | 적재 때 변환 (`mapx`, `mapy`는 float) |
| 빈 결과 | `items`가 빈 문자열이거나 `item`이 배열이 아닌 단일 객체일 수 있음 ⚠️ | 파서에서 방어 |
| 포털 오류 | 코드 01·04·12·20·22·30·31·32·99는 **XML로만** 출력 | JSON 파싱 실패 시 XML 오류인지 확인 |
| 좌표 이상치 | 10건 (9건은 동일 기본값 117.99/19.69, 1건은 강원 좌표) | 서울 범위 밖은 제외 |
| 이미지 | `http://` 이미지 23%. 음식점 이미지 보유율 69%, 숙박 49% | https 지원 확인 후 변환, 없으면 완성도 점수로만 낮춤 |
| 중복 이름 | 29건 | 이름만으로 매칭하지 않음 (좌표·시군구 병행) |
| 운영 상태 | 폐업·영업 상태 필드가 **없음** | 한계로 명시, 사용자 신고·갱신일로 보완 |
| 축제 | 서울 축제 중 152건이 이미 종료 (Notion 실측) | 기간으로 필터 |
| 이미지 저작권 | 응답마다 `cpyrhtDivCd` (Type1 출처표시, Type3 출처표시+변경금지) | Type3은 자르기·필터 금지, 출처 표기 |

---

# Part 2. ODsay 대중교통 길찾기 `searchPubTransPathT`

## 2.1 개요

| 항목 | 값 |
|---|---|
| URL | `GET\|POST https://api.odsay.com/v1/api/searchPubTransPathT` (JSON 또는 XML, v1.8 권장) |
| 인증 | `apiKey`. 서버 플랫폼 키는 **등록한 IP에서만** 동작 (EC2 탄력적 IP 등록) |
| 사용 시점 | 순위·순서 결정 중에는 호출하지 않고(추정식 사용), **순서 확정 후 구간별로만** 호출 |
| 출발 시각 | 지정할 수 없다. 시각 지정은 멀티모달 API `maasRP`(`SearchTime` `yyyyMMddHHmm`)에만 있음 |

## 2.2 요청 파라미터

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `apiKey` | Y | 발급 키 |
| `SX`, `SY` | Y | 출발 **경도, 위도** (WGS84) — TourAPI `mapx`, `mapy` 순서와 같음 |
| `EX`, `EY` | Y | 도착 경도, 위도 |
| `lang` | N | 0 국문(기본), 1 영문, 2 일문, 3 중문(간체), 4 중문(번체), 5 베트남어(수도권만) |
| `output` | N | `json`(기본), `xml` |
| `OPT` | N | 0 추천 경로, 1 타입별 정렬 |
| `SearchType` | N | 0이면 도시 내 검색 |
| `SearchPathType` | N | 0 전체(기본), 1 지하철, 2 버스 |

`lang`에 따라 정류장·노선 이름 필드가 바뀐다. **캐시 키에 `lang`을 포함**해야 한다 (현재 `odsay.py`의 캐시 키는 좌표 4개뿐).

## 2.3 응답 구조 (도시 내)

```
result
├ searchType            0 도시내 (1 도시간 직통, 2 도시간 환승)
├ outTrafficCheck       도시간 직통 결과 유무 (0/1)
├ busCount, subwayCount, subwayBusCount
├ pointDistance         출발-도착 직선거리(m)
├ startRadius, endRadius
└ path[]                (후보 경로 여러 개)
   ├ pathType           1 지하철 / 2 버스 / 3 버스+지하철
   ├ info
   │  ├ totalTime       총 소요시간 (분, int)
   │  ├ payment         총 요금 (원, int)
   │  ├ totalWalk       총 도보 거리 (m)
   │  ├ totalDistance, trafficDistance(도보 제외)
   │  ├ busTransitCount, subwayTransitCount   탑승 횟수
   │  ├ totalStationCount, busStationCount, subwayStationCount
   │  ├ firstStartStation, lastEndStation (+ ...Kor 국문, ...JpnKata 일문 가타카나)
   │  ├ checkIntervalTime, checkIntervalTimeOverYn, totalIntervalTime
   │  └ mapObj          (경로 그래픽 호출용 값)
   └ subPath[]          (구간 순서대로)
      ├ trafficType     1 지하철 / 2 버스 / 3 도보
      ├ distance(m, double), sectionTime(분, int), stationCount, intervalTime(평균 배차, 분)
      ├ lane[]          지하철: name, subwayCode, subwayCityCode
      │                 버스:   busNo, type, busID, busLocalBlID, busCityCode, busProviderCode
      │                 (+ nameKor / busNoKor 등 다국어 표기)
      ├ startName, startX, startY, startID (+ startNameKor ...)
      ├ endName,   endX,   endY,   endID   (+ endNameKor ...)
      ├ way, wayCode(1 상행, 2 하행), door      지하철 방면, 빠른 환승 위치
      ├ startExitNo/X/Y, endExitNo/X/Y          지하철 출구 (없을 수 있음)
      ├ startStationCityCode, startLocalStationID, startArsID   버스 (BIS 지역만)
      └ passStopList.stations[]  index, stationID, stationName(+Kor), x(string), y(string),
                                 stationCityCode, localStationID, arsID, isNonStop(Y/N, 버스)
```

- 타입: `totalTime`, `payment`, `sectionTime`은 int, `distance`는 double, `passStopList`의 `x`, `y`는 string.
- 도보 구간(`trafficType=3`)에는 정류장·노선 필드가 없을 가능성이 크다 ⚠️. 첫 호출로 확인한다.
- `payment`가 교통카드 기준인지 현금 기준인지, `totalTime`에 도보가 포함되는지는 문서에 명시가 없다 ❓.

## 2.4 에러 코드

| 코드 | 의미 | 처리 |
|---|---|---|
| **-98** | 출·도착이 **700m 이내** | 경로 대신 에러가 온다 → 도보 추정 또는 `searchWalkPathV2` |
| -99 | 검색 결과 없음 | 추정식으로 대체, 경고 |
| 3 / 4 / 5 | 출발 / 도착 / 출·도착 정류장 없음 | 추정식 대체 |
| 6 | 서비스 지역 아님 | 서울 밖 좌표 오류 가능 |
| -8 / -9 | 필수 입력값 형식 오류 / 누락 | 개발 오류 |
| 500 | 서버 내부 오류 | 재시도 후 추정식 |

에러 응답의 JSON 키 이름은 이 레퍼런스에 없다 ❓. `odsay.py`는 `error` 키가 리스트 또는 객체인 경우를 모두 처리하게 작성했으니 첫 실제 응답으로 확인한다.

## 2.5 우리 앱에서 쓰는 값 → 저장·표시

> 주의: Figma 「03 동선」에는 구간 카드가 없어 현재 화면에서는 쓰지 않는다 (spec F3-2). 구간 표시를 추가할 때 사용한다.

| 용도 | 값 | 저장 위치 | 화면 |
|---|---|---|---|
| 구간 이동수단 | `subPath[].trafficType` (1 지하철, 2 버스, 3 도보)의 집합 | `trip_item.leg_mode` | 동선의 구간 칩 아이콘 |
| 구간 소요시간 | `info.totalTime` | `leg_minutes` | "지하철 · 약 25분" |
| 구간 운임 (1인) | `info.payment` | `leg_fare` | 구간 운임, 교통비 합산 |
| 하루 도보 거리 | `info.totalWalk` 합계 | **컬럼 추가 필요** (`leg_walk_m`) | 체력 상한 검사 (이동 중 도보만, 장소 안 걷기는 제외) |
| 환승 횟수 | `busTransitCount + subwayTransitCount − 1` (탑승 0이면 0으로 처리) | 컬럼 추가 필요 | "빠른 환승" 등 보조 문구 |
| 노선·하차 정보 | `lane[0].name`/`busNo`, `endName`, 출구 | 컬럼 추가 필요 (`leg_summary` JSONB) | "3호선 안국역 하차" |
| 선택 규칙 | 여러 `path[]` 중 `info.totalTime` 최소 | | |

- 경로 그래픽(`mapObj`)과 정차 정류장(`passStopList`)은 저장하지 않는다. 지도는 네이버지도로 넘긴다.
- 호출 규모: 하루 6곳이면 구간이 최대 7개(장소 간 5 + 숙소 왕복 2)다. 같은 구간은 캐시한다 (캐시 키: 좌표 4개 + `lang`).
- 도보 길찾기 `searchWalkPathV2` ⚠️: 필수 `opt`(reco/short/wide), `loc`(`sx,sy,ex,ey`), 직선 30km 이내. 응답 `result.path[].recommend.summary { distance(m), duration(초) }`. 700m 이내 구간의 대체 후보다. 이하 필드는 확인한 범위에서 잘렸다.

## 2.6 코드표 (일부)

- 버스 `lane.type`: 1 일반, 2 좌석, 3 마을, 4 직행좌석, 5 공항, 6 간선급행, 10 외곽, 11 간선, 12 지선, 13 순환, 14 광역, 15 급행, 16 관광, 20 농어촌, 22 경기도 시외형, 26 급행간선, 30 한강버스.
- 지하철 `subwayCode`: 1~9 수도권 1~9호선, 91 GTX-A, 101 공항철도, 104 경의중앙선, 108 경춘선, 109 신분당선, 113 우이신설선, 116 수인분당선, 117 신림선 (전체는 레퍼런스 하단).

---

# Part 3. 두 API를 잇는 키와 후속 점검

| 연결 | 방법 |
|---|---|
| KorService2 → ODsay | `mapx`(경도) → `SX`/`EX`, `mapy`(위도) → `SY`/`EY`. 같은 순서 |
| 숙소 → ODsay | `trip.lodging_lat/lng`(소수 3자리 반올림)을 출발·도착 좌표로 사용 |
| ODsay 결과 → 동선 | `trip_item`에 `leg_*` 컬럼으로 저장 (구간 = 현재 장소 → 다음 장소) |

**`spec.md` §8 `place`·`trip_item`에 추가를 제안하는 컬럼**

| 테이블 | 컬럼 | 이유 |
|---|---|---|
| `place` | `addr` | 장소 상세·카드의 주소 표시 |
| `place` | `fee_raw` | 입장료 원문 폴백 |
| `place` | `event_start`, `event_end` | 행사 기간 필터 |
| `place` | `spend_min` (파싱한 관람소요시간) | 체류시간 계산 |
| `trip_item` | `leg_walk_m`, `leg_transfers`, `leg_summary`(JSONB) | 체력 규칙, 동선 구간 문구 |

**실제 호출로 확인할 것**
1. KorService2: `dist` 단위와 정렬, 개발계정 한도 표현의 차이, 문화시설 `spendtime` 채움률, `fldgubun` 의미.
2. ODsay: 에러 응답 JSON 키, `payment`의 기준, `totalTime`에 도보 포함 여부, 도보 구간 필드, 700m 이내 처리.
3. 두 API 모두: 빈 결과와 단일 item 응답 형태.
