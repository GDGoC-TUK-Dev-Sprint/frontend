import React, { createContext, useContext, useMemo, useState } from 'react';

// 로그인 여부만 들고 있는 틀. 토큰 저장·확인(GET /api/users/me)·재발급은 API 연동 이슈에서 구현한다 (spec F8-1, F11)
type AuthState = {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const value = useMemo(
    () => ({
      isSignedIn,
      signIn: () => setIsSignedIn(true),
      signOut: () => setIsSignedIn(false),
    }),
    [isSignedIn],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다');
  }
  return auth;
}
