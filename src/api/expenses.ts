import { request } from './client';
import type { CostItemCode, TripSummary } from './trips';
import type { Money, MoneyRange } from '../utils/money';

// 실제 지출 입력·리포트 (API 명세 28~30). 끝난 확정 여행만 받는다 (아니면 409 TRIP_NOT_COMPLETED)
// 금액은 표시 통화로 환산해 준다. 1인(perPerson)과 인원 합계(total)가 둘 다 와서 기준을 바꿔도 다시 부르지 않는다

export type ExpenseSheet = {
  trip: TripSummary;
  estimates: {
    item: CostItemCode;
    perPerson: MoneyRange;
    total: MoneyRange;
  }[]; // 확정할 때 저장한 항목별 예상
  estimateTotal: { perPerson: MoneyRange; total: MoneyRange };
  budget: { perPerson: Money; total: Money } | null; // 희망 예산이 없으면 null
  expenses: {
    item: CostItemCode;
    label: string | null; // 기타(OTHER) 항목 이름
    perPerson: Money;
    total: Money;
  }[]; // 저장한 실제 지출 (보낸 순서)
  saved: boolean;
};

export type ExpenseBasis = 'PER_PERSON' | 'TOTAL';
export type ExpenseInput = {
  item: CostItemCode;
  label?: string; // OTHER만 (50자 이하)
  amount: Money;
};

export function getExpenses(tripId: number) {
  return request<ExpenseSheet>('GET', `/api/trips/${tripId}/expenses`);
}

// 그 여행의 지출을 통째로 덮어쓴다. 입력하지 않은 항목은 보내지 않는다 (0원과 다르다)
export function saveExpenses(
  tripId: number,
  basis: ExpenseBasis,
  items: ExpenseInput[],
) {
  return request<ExpenseSheet>('PUT', `/api/trips/${tripId}/expenses`, {
    body: { basis, items },
  });
}

// 예상 범위와 비교: BELOW 예상 최소보다 적음 / WITHIN 범위 안 / ABOVE 예상 최대보다 많음
export type Comparison = 'BELOW' | 'WITHIN' | 'ABOVE';

export type ReportBreakdown = {
  estimate: MoneyRange;
  actual: Money;
  status: Comparison;
  difference: Money; // 음수면 절약
  differencePct: number | null; // 비교 기준이 0원이면 null (아래 % 모두)
  accuracyPct: number | null; // 예측 일치도
  errorRatePct: number | null; // 오차율
  executionPct: number | null; // 예산 집행률 (실제 ÷ 예상)
  items: {
    item: CostItemCode;
    labels: string[]; // 기타 항목 이름들 (OTHER만)
    estimate: MoneyRange | null; // 확정 때 예상이 없던 항목이면 null
    actual: Money | null; // 입력하지 않은 항목이면 null
    status: Comparison | null;
    difference: Money | null;
    sharePct: number | null; // 실제 지출 비중
  }[];
};

export type ExpenseReport = {
  trip: TripSummary;
  perPerson: ReportBreakdown;
  total: ReportBreakdown;
  insight: string | null; // 가장 크게 절약·초과한 항목 문장 (1인 기준)
};

// 지출을 저장하기 전이면 409 EXPENSES_NOT_SAVED
export function getExpenseReport(tripId: number) {
  return request<ExpenseReport>('GET', `/api/trips/${tripId}/expense-report`);
}
