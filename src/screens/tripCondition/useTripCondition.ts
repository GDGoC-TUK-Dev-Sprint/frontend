import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateRange } from '../../components/DateRangeModal';
import type { Area, Country, Lodging } from '../../mocks';
import { nightsBetween } from '../../utils/date';

// 조건 입력 화면(Figma 「02 조건 입력」, spec F1)의 입력 상태와 규칙

// 1인 희망 예산 프리셋 (원, spec F1-6)
export const BUDGET_PRESETS = [300000, 500000, 1000000];
// TODO: Figma에 인원 상한이 없다. 기존 안 10명 (spec F1-5 확인 필요)
export const MIN_TRAVELERS = 1;
export const MAX_TRAVELERS = 10;

// 숙소는 검색으로 고른 숙소 또는 "아직 못 정함"(지역 선택은 선택 사항)
export type Stay =
  | { kind: 'lodging'; lodging: Lodging }
  | { kind: 'undecided'; area?: Area };

// 한 번에 하나만 열리는 선택 창: 국적 시트, 숙소 검색 시트, 날짜 선택
export type Picker = 'country' | 'lodging' | 'dates';

export function useTripCondition() {
  const { t } = useTranslation();
  const [country, setCountry] = useState<Country>();
  const [stay, setStay] = useState<Stay>();
  const [dates, setDates] = useState<DateRange>();
  const [travelers, setTravelers] = useState(MIN_TRAVELERS);
  const [budget, setBudget] = useState<number>();
  const [customBudget, setCustomBudget] = useState(false);
  const [themeCodes, setThemeCodes] = useState<string[]>([]);
  const [picker, setPicker] = useState<Picker>();
  const closePicker = () => setPicker(undefined);

  // 국적·숙소(또는 미정)·날짜·테마가 모두 있어야 생성 버튼이 켜진다. 예산은 선택 사항
  const canSubmit = !!country && !!stay && !!dates && themeCodes.length > 0;

  // "2박 3일", 같은 날이면 "당일치기"
  const nights = dates && nightsBetween(dates.start, dates.end);
  const nightsLabel = nights
    ? t('condition.nights', { nights, days: nights + 1 })
    : t('condition.dayTrip');

  // 숙소 카드 제목: 고른 숙소 이름, 지역만 고르면 "○○ 중심", 아무것도 안 고르면 안내 문구
  const stayTitle =
    stay?.kind === 'lodging'
      ? stay.lodging.name
      : stay?.area
      ? t('condition.areaCenter', { area: stay.area.name })
      : t('condition.lodgingPlaceholder');

  return {
    country,
    stay,
    dates,
    travelers,
    budget,
    customBudget,
    themeCodes,
    picker,
    canSubmit,
    nightsLabel,
    stayTitle,

    openPicker: setPicker,
    closePicker,
    setTravelers,
    chooseUndecided: () => setStay({ kind: 'undecided' }),

    // 선택 창에서 고르면 값을 넣고 창을 닫는다
    selectCountry: (value: Country) => {
      setCountry(value);
      closePicker();
    },
    selectLodging: (lodging: Lodging) => {
      setStay({ kind: 'lodging', lodging });
      closePicker();
    },
    selectArea: (area: Area) => {
      setStay({ kind: 'undecided', area });
      closePicker();
    },
    applyDates: (range: DateRange) => {
      setDates(range);
      closePicker();
    },

    selectBudgetPreset: (amount: number) => {
      setCustomBudget(false);
      setBudget(amount);
    },
    // "직접입력"을 고르면 프리셋 선택을 지우고 입력칸을 연다
    startCustomBudget: () => {
      setCustomBudget(true);
      setBudget(undefined);
    },
    // 숫자만 남기고, 0이나 빈 값은 미입력으로 본다
    changeCustomBudget: (text: string) => {
      const amount = Number(text.replace(/\D/g, ''));
      setBudget(amount > 0 ? amount : undefined);
    },

    toggleTheme: (code: string) =>
      setThemeCodes(codes =>
        codes.includes(code) ? codes.filter(c => c !== code) : [...codes, code],
      ),
  };
}

// 구역 컴포넌트가 받는 입력 상태와 동작
export type TripConditionForm = ReturnType<typeof useTripCondition>;
