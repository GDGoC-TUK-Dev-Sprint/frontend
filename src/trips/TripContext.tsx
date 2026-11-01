import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Trip } from '../mocks';

// 준비 중인 여행 하나를 들고 있는 틀. 없으면 메인에 빈 상태를 보여준다
// TODO: GET /api/trips(spec API 17)·POST /api/trips(API 16) 연동 시 서버 응답으로 교체. 지금은 앱을 끄면 사라진다
type TripState = {
  trip: Trip | null;
  setTrip: (trip: Trip) => void;
};

const TripContext = createContext<TripState | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const value = useMemo(() => ({ trip, setTrip }), [trip]);
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const state = useContext(TripContext);
  if (!state) {
    throw new Error('useTrip은 TripProvider 안에서만 쓸 수 있습니다');
  }
  return state;
}
