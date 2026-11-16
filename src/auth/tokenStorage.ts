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
