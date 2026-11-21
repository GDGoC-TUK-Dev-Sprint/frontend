import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authApi from '../api/auth';
import {
  refreshSession,
  setSession,
  setSessionExpiredHandler,
} from '../api/client';
import {
  clearLoginId,
  clearTokens,
  loadLoginId,
  loadTokens,
  saveLoginId,
  saveTokens,
} from './tokenStorage';

// loading: 앱 시작 때 저장된 토큰을 확인하는 중
type Status = 'loading' | 'signedOut' | 'signedIn';

type AuthState = {
  status: Status;
  loginId: string | null; // 마이페이지 프로필
  signIn: (loginId: string, password: string) => Promise<void>;
  signUp: (form: {
    name: string;
    loginId: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [loginId, setLoginId] = useState<string | null>(null);

  useEffect(() => {
    setSessionExpiredHandler(() => setStatus('signedOut'));
    restore().then(setStatus);
    loadLoginId()
      .then(setLoginId)
      .catch(() => {});
  }, []);

  const value = useMemo(() => {
    const signIn = async (id: string, password: string) => {
      const tokens = await authApi.login(id, password);
      await saveTokens(tokens);
      await saveLoginId(id).catch(() => {});
      setSession(tokens);
      setLoginId(id);
      setStatus('signedIn');
    };
    return {
      status,
      loginId,
      signIn,
      // 가입 응답에는 토큰이 없어 같은 아이디·비밀번호로 바로 로그인한다
      signUp: async (form: {
        name: string;
        loginId: string;
        password: string;
      }) => {
        await authApi.signup(form);
        await signIn(form.loginId, form.password);
      },
      // 서버의 리프레시 토큰도 폐기한다 (F11-5). 서버가 응답하지 않아도 기기에서는 로그아웃한다
      signOut: async () => {
        const tokens = await loadTokens().catch(() => null);
        if (tokens) {
          await authApi.logout(tokens.refreshToken).catch(() => {});
        }
        setSession(null);
        await clearTokens();
        await clearLoginId().catch(() => {});
        setLoginId(null);
        setStatus('signedOut');
      },
    };
  }, [status, loginId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 앱 시작 때 저장된 토큰이 살아 있는지 확인한다 (spec F8-1)
// TODO: GET /api/users/me(6)가 생기면 그것으로 확인하고, 실패할 때만 재발급한다
async function restore(): Promise<Status> {
  const tokens = await loadTokens().catch(() => null);
  if (!tokens) {
    return 'signedOut';
  }
  setSession(tokens);
  try {
    if (await refreshSession()) {
      return 'signedIn';
    }
  } catch {
    // 통신·서버 오류는 토큰이 틀렸다는 뜻이 아니다. 저장된 토큰으로 들어가고, 이후 요청의 401에서 다시 확인한다
    return 'signedIn';
  }
  setSession(null);
  await clearTokens();
  return 'signedOut';
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다');
  }
  return auth;
}
