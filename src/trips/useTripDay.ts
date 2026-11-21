import { useCallback, useEffect, useState } from 'react';
import { getTripDay, toTripDay, type TripDayResponse } from '../api/trips';
import type { Trip, TripDay } from '../mocks';

// 동선·지도·계획 확인이 같이 쓰는 일자 일정 (GET /api/trips/{tripId}/days/{dayNumber})
// 일차 탭을 바꾸면 그 일자를 다시 받는다. 순서 변경·삭제 응답은 apply로 바로 넣는다
export function useTripDay(trip: Trip | null) {
  // 동선을 다시 만들면 setTrip이 새 일자 목록을 넣는다. 그때 탭에 떠 있는 화면도 다시 받는다
  const routeDays = trip?.days;
  const days = routeDays ?? [];
  const [dayNumber, setDayNumber] = useState(1);
  const [day, setDay] = useState<TripDay>();
  const [failed, setFailed] = useState(false);
  const tripId = trip?.tripId;

  const load = useCallback(() => {
    if (!tripId) return;
    let stale = false;
    setFailed(false);
    getTripDay(tripId, dayNumber)
      .then(res => !stale && setDay(toTripDay(res)))
      .catch(() => !stale && setFailed(true));
    return () => {
      stale = true;
    };
    // routeDays는 동선을 다시 만들었다는 신호로만 쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, dayNumber, routeDays]);
  useEffect(load, [load]);

  // 다른 일차를 보던 화면이 바뀐 일차 응답을 받아도 덮어쓰지 않는다
  const apply = useCallback(
    (res: TripDayResponse) =>
      setDay(prev =>
        !prev || prev.dayNumber === res.dayNumber ? toTripDay(res) : prev,
      ),
    [],
  );

  return {
    days,
    dayNumber,
    selectDay: setDayNumber,
    // 탭을 바꾼 직후 이전 일자를 잠깐 보여주지 않는다
    day: day?.dayNumber === dayNumber ? day : undefined,
    failed,
    reload: load,
    apply,
    setDay,
  };
}
