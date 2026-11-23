import * as Keychain from 'react-native-keychain';

// 토큰은 기기 보안 저장소(iOS Keychain, Android Keystore)에 둔다 (spec F11-7)
export type Tokens = { accessToken: string; refreshToken: string };

const SERVICE = 'koready.auth';

export async function loadTokens(): Promise<Tokens | null> {
  const saved = await Keychain.getGenericPassword({ service: SERVICE });
  if (!saved) {
    return null;
  }
  try {
    return JSON.parse(saved.password) as Tokens;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: Tokens) {
  await Keychain.setGenericPassword('tokens', JSON.stringify(tokens), {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function clearTokens() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

// 마이페이지 프로필: 표시 이름과 로그인 방법. 사용자 정보 API(GET /api/users/me)가 없어 로그인할 때 기기에 남긴다
// TODO: /api/users/me가 생기면 서버에서 받고 이 저장은 지운다
export type Profile = { name: string; method: 'ID' | 'GOOGLE' };
const PROFILE = 'koready.profile';

export async function saveProfile(profile: Profile) {
  await Keychain.setGenericPassword('profile', JSON.stringify(profile), {
    service: PROFILE,
  });
}

export async function loadProfile(): Promise<Profile | null> {
  const saved = await Keychain.getGenericPassword({ service: PROFILE });
  if (!saved) return null;
  try {
    return JSON.parse(saved.password) as Profile;
  } catch {
    return null;
  }
}

export async function clearProfile() {
  await Keychain.resetGenericPassword({ service: PROFILE });
}
