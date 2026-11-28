import { useSyncExternalStore } from 'react';
import * as Keychain from 'react-native-keychain';
import i18n from '../i18n';

// 언어·표시 통화 설정 (spec F7). 서버가 아니라 기기에만 저장한다 (F7-5)
// 저장소는 이미 쓰는 Keychain을 쓴다. 비밀값은 아니지만 새 네이티브 모듈을 들이지 않으려고
export const LANGUAGES = ['ko', 'en'] as const;
export const CURRENCIES = ['JPY', 'KRW', 'EUR', 'USD'] as const;
export type Language = (typeof LANGUAGES)[number];
export type Currency = (typeof CURRENCIES)[number];

const SERVICE = 'koready.settings';
let currency: Currency = 'KRW';
const listeners = new Set<() => void>();

export const getCurrency = () => currency;

// 통화가 바뀌면 다시 그린다 (언어는 react-i18next가 다시 그린다)
export function useCurrency() {
  return useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, getCurrency);
}

export async function applyPreferences(language: Language, next: Currency) {
  currency = next;
  listeners.forEach(listener => listener());
  await i18n.changeLanguage(language);
  await Keychain.setGenericPassword(
    'settings',
    JSON.stringify({ language, currency }),
    { service: SERVICE },
  ).catch(() => {}); // 저장에 실패해도 이번 실행에는 적용된다
}

// 앱 시작 때 저장한 설정을 읽는다. 없으면 기기 로케일 언어와 KRW (i18n/index.ts)
export async function loadPreferences() {
  try {
    const saved = await Keychain.getGenericPassword({ service: SERVICE });
    if (!saved) return;
    const { language, currency: c } = JSON.parse(saved.password);
    if (CURRENCIES.includes(c)) currency = c;
    if (LANGUAGES.includes(language)) await i18n.changeLanguage(language);
    listeners.forEach(listener => listener());
  } catch {}
}
