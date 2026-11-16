# db_schema.md — 백엔드 DB 설계 (Figma ERD 기준)

| 항목 | 내용 |
|---|---|
| 근거 | Figma `YYL1dZY386BNWRqi0gSw3N` 페이지 `306:249` "DB" (KOREADY DB ERD, 2026-10-17판) |
| 범위 | 테이블 21개 (사용자 3 · 장소 5 · 찜 1 · 여행 5 · 지출 2 · 경비 통계·환율 5) |
| 주의 | Figma에는 **주요 컬럼만** 있다. 전체 컬럼과 제약은 노션 "KOREADY DB 설계"(백엔드 팀 문서, 이 저장소에서는 아직 확인하지 못함)에 있다 |
| 관계 | 앱은 DB를 직접 보지 않는다. API 응답 필드를 짐작하는 참고용이다. API 목록은 spec §9(Figma `438:1027`과 같음) |

spec §8의 SQL은 이 ERD 이전 초안이라 이름과 구조가 다르다. 서버 구조는 이 문서(Figma)가 최신이다. 차이 중 화면에 영향이 있는 것은 맨 아래 "프론트 영향"에 정리했다.

표기: 키 열 `PK`·`FK`·`UK`. 설명 열의 대문자 값은 허용값(enum)이다.

---

## 1. 사용자 (3)

**users**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| varchar | login_id | UK | 소셜 계정은 NULL |
| varchar | password_hash | | BCrypt 해시. 소셜 계정은 NULL |
| varchar | name | | |
| timestamptz | created_at | | |

**oauth_accounts**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | user_id | FK | UK(user_id, provider) |
| varchar | provider | | GOOGLE APPLE |
| varchar | subject | | 제공자 사용자 ID. UK(provider, subject) |

**refresh_tokens**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | user_id | FK | |
| char | token_hash | UK | SHA-256 해시 |
| timestamptz | expires_at | | 발급 + 14일 |

## 2. 장소 (5)

**places**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | API의 `placeId`로 추정 `[확인 필요]` |
| varchar | content_id | UK | TourAPI contentid |
| smallint | content_type_id | | |
| varchar | class1_code | FK | → place_classes (대분류) |
| varchar | class2_code | FK | 중분류 |
| varchar | class3_code | FK | 소분류 |
| varchar | name_ko | | |
| varchar | name_en | | |
| geography | location | | 좌표 |
| varchar | hours_type | | STRUCTURED ALWAYS_OPEN UNKNOWN |
| varchar | fee_type | | FREE PAID VARIES UNKNOWN |
| smallint | stay_minutes | | 예상 체류 시간 |
| varchar | stay_basis | | TOURAPI CLASS (체류 시간 근거) |
| smallint | signal_count | | |
| boolean | active | | |

**place_classes** (분류체계 코드)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| varchar | code | PK | 예: VE, VE07, VE070600 |
| smallint | level | | |
| varchar | parent_code | FK | |
| varchar | name_ko | | |
| varchar | name_en | | |
| boolean | excluded | | 추천 후보·장소 검색 제외 |

**place_opening_hours**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | place_id | FK | |
| smallint | day_of_week | | 1=월 7=일 |
| char | season_from | | MM-DD |
| char | season_to | | MM-DD |
| time | open_time | | |
| time | close_time | | |
| time | last_entry_time | | 입장 마감 |
| time | break_start | | |
| time | break_end | | |

**place_fees**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | place_id | FK | |
| varchar | audience | | ADULT YOUTH CHILD SENIOR OTHER |
| varchar | label_ko | | |
| int | amount_krw | | 0은 무료 |

**place_signals** (추천 근거 신호)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | place_id | FK | |
| varchar | signal_type | | COURSE FOREIGN_VISITORS ENG_SERVICE VISIT_SEOUL HUB_TOUR |
| bigint | value | | |
| varchar | base_period | | |
| varchar | matched_name | | |

## 3. 찜 (1)

**favorites**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | user_id | FK | UK(user_id, place_id) |
| bigint | place_id | FK | |
| timestamptz | created_at | | 찜한 시각 |

## 4. 여행 (5)

**trips**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | user_id | FK | |
| varchar | status | | DRAFT CONFIRMED |
| varchar | title_ko | | LLM이 만든 제목 |
| char | nationality_code | | CN JP US (국가 코드) |
| date | start_date | | |
| date | end_date | | |
| smallint | party_size | | |
| int | budget_per_person_krw | | |
| varchar | stay_type | | PLACE AREA PIN (숙소 지정 방식) |
| bigint | stay_place_id | FK | → places (숙소) |
| geography | stay_location | | |

**trip_categories** (여행에서 고른 테마)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | trip_id | PK, FK | |
| varchar | class1_code | PK, FK | 대분류 코드 |

**trip_days**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | trip_id | FK | |
| smallint | day_number | | |
| date | trip_date | | |
| time | depart_time | | 숙소 출발 |
| time | return_time | | 숙소 도착 |

**trip_items** (일자별 장소)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | API 24의 `itemId`로 추정 `[확인 필요]` |
| bigint | trip_day_id | FK | |
| smallint | seq | | |
| bigint | place_id | FK | |
| varchar | origin | | SELECTED MEAL (사용자가 고름 / 식사로 끼워 넣음) |
| varchar | meal_type | | LUNCH DINNER |
| time | arrive_time | | |
| time | depart_time | | |
| smallint | stay_minutes | | |

**legs** (구간 이동)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | trip_day_id | FK | |
| smallint | seq | | |
| bigint | from_item_id | FK | NULL은 숙소 |
| bigint | to_item_id | FK | NULL은 숙소 |
| varchar | mode | | WALK TRANSIT |
| int | distance_m | | |
| smallint | duration_minutes | | |
| int | fare_krw | | 1인 운임 (ODsay) |

## 5. 지출·경비 (2)

**trip_cost_estimates** (예상 경비)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | trip_id | FK | UK(trip_id, item) |
| varchar | item | | FOOD TRANSPORT SHOPPING SIGHTSEEING OTHER |
| int | min_krw | | 1인 최소 |
| int | max_krw | | 1인 최대 |

**trip_expenses** (여행 후 실제 지출)

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| bigint | trip_id | FK | |
| varchar | item | | FOOD TRANSPORT SHOPPING SIGHTSEEING OTHER |
| varchar | label | | 기타 항목 이름 |
| int | amount_krw | | 전체(인원 합계) |
| smallint | seq | | 화면 순서 |

## 6. 경비 통계·환율 (5)

통계 테이블끼리는 FK 없이 계산할 때 조인한다.

**datalab_month_totals**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| char | ym | UK | YYYYMM |
| bigint | card_spend_krw | | 전체 외국인 카드 소비액 |
| bigint | visitors | | 전체 외국인 방문자 수 |

**datalab_country_month**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| char | country_code | | UK(country_code, ym) |
| char | ym | | |
| numeric | card_spend_share_pct | | 국가 소비 비율 |
| numeric | visitor_share_pct | | 국가 방문 비율 |

**datalab_country_industry**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| char | country_code | | UK(country_code, ym, industry) |
| char | ym | | |
| varchar | industry | | SHOPPING FOOD LEISURE TRANSPORT LODGING MEDICAL TRAVEL |
| numeric | share_pct | | 업종 비율 |

**datalab_country_region**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| char | country_code | | UK(country_code, period_from, sido_name) |
| char | period_from | | |
| char | period_to | | |
| varchar | sido_name | | |
| numeric | spend_share_pct | | 시도 소비 비율 |
| numeric | visit_share_pct | | 시도 방문 비율 |

**exchange_rates**

| 타입 | 컬럼 | 키 | 설명 |
|---|---|---|---|
| bigint | id | PK | |
| date | rate_date | | UK(rate_date, currency), 영업일만 |
| char | currency | | USD JPY EUR |
| numeric | krw_per_unit | | 매매기준율, JPY는 1엔 기준 |
| timestamptz | fetched_at | | |

---

## 7. 2026-10-09판에서 바뀐 것 (Figma 범례)

- 더함: `oauth_accounts`·`refresh_tokens`(로그인), `favorites`(찜), `trip_cost_estimates`·`trip_expenses`(여행 후 지출)
- 뺌: `courses`·`course_places` (여행코스는 `place_signals`의 COURSE 신호로만 쓴다)
- 컬럼: `places.stay_basis` 더함, `trip_items.origin`의 ADDED 뺌(장소 추가 API 없음과 일치), `users.login_id`·`password_hash`는 소셜 계정이면 NULL

## 8. 프론트 영향 (spec·CLAUDE.md와 다른 점) `[확인 필요]`

API 응답 필드가 정해지면 다시 본다. 지금은 화면을 바꾸지 않는다.

| # | ERD | spec·CLAUDE.md | 영향 |
|---|---|---|---|
| D1 | 예상 경비가 항목별 `min_krw`·`max_krw` 두 값 | 중간값을 크게 + 알뜰/보통/여유 범위 + 근거 배지·출처 (F4-1·F4-2·F4-5·F4-6), §9.6 `low/mid/high`·`basis`·`source` | 경비 화면 구성이 달라질 수 있음. 중간값·근거·출처를 25 응답에서 계산해 주는지 확인 |
| D2 | 경비 통계가 DataLab 카드소비 비율(국가·월·업종·시도) | spec §5는 서울관광재단 설문 기반 p25/p50/p75 기준표(`cost_band`) | 출처 시트 문구("자료: …")와 근거 설명이 바뀜 |
| D3 | 경비 항목 FOOD TRANSPORT SHOPPING SIGHTSEEING OTHER | spec `food shopping attraction transport etc` | 항목 키 이름 |
| D4 | `trips.nationality_code` = 국가 코드(CN JP US) | spec은 권역 코드(JP, CN, TW, HK, AM, EU…) | 02-01 국적 선택지. 8 `/api/meta/options`가 주는 값을 쓰면 됨 |
| D5 | `trips.status` DRAFT CONFIRMED 두 값 | spec draft/planned/ongoing/done, 티켓에 "진행 예정" 배지 | 예정·진행 중·지난 여행은 날짜로 계산하는 것으로 보임 |
| D6 | `trips.title_ko`만 있음 | 앱 언어 영어·한국어 | 영어 화면에서 여행 제목 표시 방법 |
| D7 | `places`에 이미지·저작권·주소·개요 컬럼이 없음 | R-C52 출처, R-K11 Type1/Type3, 07 장소 상세 | Figma에 빠졌을 뿐인지(노션 전체 컬럼) 확인 |
| D8 | `trip_expenses.amount_krw`는 인원 합계, 입력 통화 컬럼 없음 | spec `actual_spend`는 `input_ccy`·`per_person`·`consent_stats` | 08 지출 입력에서 통화·1인/전체 선택, 통계 동의 체크 여부 |
| D9 | 모든 ID가 `bigint` | spec `trip_id` UUID | 화면 파라미터 타입(`string` 유지면 무관) |
| D10 | `trip_items.origin`에 MEAL, `meal_type` | 동선에 식사 자동 삽입은 spec에 명시 약함 | 03 동선 카드에 식사 표시 |
