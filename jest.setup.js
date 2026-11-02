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
