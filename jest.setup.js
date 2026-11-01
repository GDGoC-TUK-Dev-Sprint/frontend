/* eslint-env jest */
// 네이버 지도는 네이티브 뷰라 Jest에서 그릴 수 없다. 테스트에서는 빈 View로 바꾼다
jest.mock('@mj-studio/react-native-naver-map', () => {
  const { View } = require('react-native');
  return { NaverMapView: View, NaverMapMarkerOverlay: View };
});
