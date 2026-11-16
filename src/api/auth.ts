import { request } from './client';
import type { Tokens } from '../auth/tokenStorage';

// 인증 API (spec §9 1·2·32). 로그인 없이 부른다
export function login(loginId: string, password: string) {
  return request<Tokens>('POST', '/api/auth/login', {
    body: { loginId, password },
    auth: false,
  });
}

export function signup(body: {
  name: string;
  loginId: string;
  password: string;
}) {
  return request<void>('POST', '/api/auth/signup', { body, auth: false });
}

export async function isLoginIdAvailable(loginId: string) {
  const res = await request<{ available: boolean }>(
    'GET',
    `/api/auth/login-id/availability?loginId=${encodeURIComponent(loginId)}`,
    { auth: false },
  );
  return res.available;
}
