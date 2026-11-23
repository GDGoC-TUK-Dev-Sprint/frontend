/* eslint-env jest */
// 네이버 지도는 네이티브 뷰라 Jest에서 그릴 수 없다. 테스트에서는 빈 View로 바꾼다
jest.mock('@mj-studio/react-native-naver-map', () => {
  const { View } = require('react-native');
  return {
    NaverMapView: View,
    NaverMapMarkerOverlay: View,
    NaverMapPolylineOverlay: View,
  };
});

// gesture-handler의 Jest 목이 RN의 deprecated DrawerLayoutAndroid를 읽으며 내는 경고만 숨긴다 (앱 코드와 무관)
const warn = console.warn;
console.warn = (message, ...rest) => {
  if (String(message).includes('DrawerLayoutAndroid is deprecated')) return;
  warn(message, ...rest);
};

// 보안 저장소(Keychain·Keystore)는 네이티브 모듈이라 테스트에서는 메모리로 바꾼다
jest.mock('react-native-keychain', () => {
  let saved = false;
  return {
    ACCESSIBLE: {
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AfterFirstUnlockThisDeviceOnly',
    },
    getGenericPassword: jest.fn(async () => saved),
    setGenericPassword: jest.fn(async (username, password) => {
      saved = { username, password };
      return true;
    }),
    resetGenericPassword: jest.fn(async () => {
      saved = false;
      return true;
    }),
  };
});

// Google 로그인은 네이티브 모듈이라 테스트에서는 빈 함수로 바꾼다 (라이브러리 목은 exports에 없어 불러올 수 없다)
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ type: 'cancelled', data: null })),
    signOut: jest.fn(async () => null),
  },
  isErrorWithCode: () => false,
  statusCodes: {},
}));
