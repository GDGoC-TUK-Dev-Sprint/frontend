import {
  ApiError,
  request,
  setSession,
  setSessionExpiredHandler,
} from '../api/client';
import { loadTokens } from '../auth/tokenStorage';

const json = (status: number, body?: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response);

const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

beforeEach(() => {
  fetchMock.mockReset();
  setSession({ accessToken: 'old-access', refreshToken: 'old-refresh' });
});

test('401이면 재발급 후 새 토큰으로 다시 보내고, 새 토큰을 저장한다', async () => {
  fetchMock
    .mockResolvedValueOnce(json(401, { code: 'UNAUTHORIZED' }))
    .mockResolvedValueOnce(
      json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }),
    )
    .mockResolvedValueOnce(json(200, { id: 1 }));

  await expect(request('GET', '/api/trips')).resolves.toEqual({ id: 1 });

  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
    refreshToken: 'old-refresh',
  });
  expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(
    'Bearer new-access',
  );
  expect(await loadTokens()).toEqual({
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
  });
});

test('동시에 온 401은 재발급을 한 번만 한다', async () => {
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
    if (url.endsWith('/api/auth/refresh')) {
      return json(200, {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    }
    const auth = (init.headers as Record<string, string>).Authorization;
    return auth === 'Bearer new-access'
      ? json(200, {})
      : json(401, { code: 'UNAUTHORIZED' });
  });

  await Promise.all([request('GET', '/a'), request('GET', '/b')]);

  const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
    url.endsWith('/api/auth/refresh'),
  );
  expect(refreshCalls).toHaveLength(1);
});

test('재발급도 401이면 토큰을 지우고 로그인 화면으로 보낸다', async () => {
  const expired = jest.fn();
  setSessionExpiredHandler(expired);
  fetchMock
    .mockResolvedValueOnce(json(401, { code: 'UNAUTHORIZED' }))
    .mockResolvedValueOnce(json(401, { code: 'UNAUTHORIZED' }));

  await expect(request('GET', '/api/trips')).rejects.toMatchObject({
    status: 401,
  });
  expect(expired).toHaveBeenCalled();
  expect(await loadTokens()).toBeNull();
});

test('서버에 닿지 못하면 status 0', async () => {
  fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
  await expect(request('GET', '/x')).rejects.toEqual(
    new ApiError(0, 'NETWORK'),
  );
});
