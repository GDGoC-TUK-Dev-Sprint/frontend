module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // reanimated 4(동선 화면 드래그)용. 플러그인 목록의 마지막에 둔다
  plugins: ['react-native-worklets/plugin'],
};
