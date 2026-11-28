import i18n from '../i18n';
import { getCurrency } from '../settings/preferences';
import { clearTokens, saveTokens, type Tokens } from '../auth/tokenStorage';

// 배포 서버 (backend develop이 자동 배포된다)
// 맥에서 띄운 백엔드를 쓸 때는 iOS 'http://localhost:8080', Android 에뮬레이터 'http://10.0.2.2:8080'으로 바꾼다
export const API_BASE_URL = 'https://api.koready.store';

// 서버 오류 본문 {code, message, fields}. status 0은 서버에 닿지 못한 경우(통신 오류)
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly fields: { field: string; reason: string }[] = [],
  ) {
    super(`${status} ${code}`);
  }
}

// 메모리에 둔 현재 토큰. 기기 저장은 tokenStorage가 한다
let session: Tokens | null = null;
let onSessionExpired: () => void = () => {};

export function setSession(tokens: Tokens | null) {
  session = tokens;
}

// 재발급까지 실패해 로그인 화면으로 보내야 할 때 부른다 (AuthContext가 등록)
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

type Options = { body?: unknown; auth?: boolean };

async function send(
  method: string,
  path: string,
  { body, auth = true }: Options,
) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': i18n.language === 'ko' ? 'ko' : 'en',
    'X-Currency': getCurrency(),
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth && session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  try {
    return await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK');
  }
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined; // 프록시 오류 페이지(HTML) 등 JSON이 아닌 본문
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code ?? `HTTP_${res.status}`,
      data?.fields,
    );
  }
  return data as T;
}

// 리프레시 토큰은 쓸 때마다 바뀌므로(F11-4) 동시에 여러 401이 와도 재발급은 한 번만 한다
let refreshing: Promise<boolean> | null = null;

// 성공하면 true, 리프레시 토큰이 틀리거나 만료되면 false. 통신 오류는 ApiError(0)로 던진다
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh() {
  if (!session) {
    return false;
  }
  const res = await send('POST', '/api/auth/refresh', {
    body: { refreshToken: session.refreshToken },
    auth: false,
  });
  if (res.status === 401) {
    return false;
  }
  const tokens = await parse<Tokens>(res);
  session = tokens;
  await saveTokens(tokens);
  return true;
}

// 401이면 한 곳에서 재발급 후 한 번 다시 보낸다. 재발급도 실패하면 토큰을 지우고 로그인 화면으로 (spec F11-4)
export async function request<T>(
  method: string,
  path: string,
  options: Options = {},
): Promise<T> {
  const res = await send(method, path, options);
  if (res.status !== 401 || options.auth === false || !session) {
    return parse<T>(res);
  }
  if (!(await refreshSession())) {
    session = null;
    await clearTokens();
    onSessionExpired();
    return parse<T>(res);
  }
  return parse<T>(await send(method, path, options));
}
