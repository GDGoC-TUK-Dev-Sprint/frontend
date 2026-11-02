// Jest에서는 SVG 파일을 변환하지 않아 빈 컴포넌트로 바꾼다 (앱에서는 react-native-svg-transformer가 처리)
const React = require('react');
const { View } = require('react-native');

module.exports = props => React.createElement(View, props);
