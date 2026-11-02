module.exports = {
  preset: '@react-native/jest-preset',
  // reanimated 4와 worklets를 네이티브 없이 JS 구현으로 읽게 한다 (동선 화면 드래그)
  resolver: 'react-native-reanimated/jest/resolver',
  // SVG 아이콘은 Jest에서 빈 View로 그린다
  moduleNameMapper: { '\\.svg$': '<rootDir>/__mocks__/svgMock.js' },
  setupFiles: ['react-native-gesture-handler/jestSetup.js', './jest.setup.js'],
  // React Navigation·reanimated 계열은 ESM·TS 원본으로 배포되어 변환이 필요하다
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native-(reanimated|worklets|sortables)|@react-native(-community)?|@react-navigation)/)',
  ],
};
