module.exports = {
  preset: '@react-native/jest-preset',
  // React Navigation은 ESM으로 배포되어 변환이 필요하다
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)',
  ],
};
