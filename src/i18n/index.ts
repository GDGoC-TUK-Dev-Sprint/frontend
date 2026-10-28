import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko.json';
import en from './en.json';

// en.json에 ko.json의 키가 빠지면 타입 오류가 난다
// TODO: Figma에 영어 문구가 없어 en.json은 초안. 확정 문구 받으면 수정
const enResource: typeof ko = en;

// 기기 로케일이 한국어면 ko, 그 밖에는 en (spec F7-1, F7-2)
// Hermes의 Intl로 읽으므로 실행 중에 기기 언어를 바꾸면 앱을 다시 켜야 반영된다
// TODO: 사용자가 고른 언어를 기기에 저장(F7-5)하는 것은 저장소 라이브러리 결정 후
const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: enResource } },
  lng: deviceLocale.startsWith('ko') ? 'ko' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React가 이미 이스케이프한다
});

// t('없는.키')를 타입 오류로 잡는다
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ko };
  }
}

export default i18n;
