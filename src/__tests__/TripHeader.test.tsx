import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { TripSummaryCard } from '../components/TripHeader';
import { mockTripSample } from '../mocks';
import '../i18n';

const texts = (title: React.ReactNode) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <TripSummaryCard trip={mockTripSample} title={title} right={null} />,
    );
  });
  return renderer.root.findAllByType(Text).map(node => node.props.children);
};

// 계획 확인은 `editing && <TextInput />`처럼 넘겨서, 편집 중이 아닐 때 false가 온다
test('title이 false면 여행 제목을 보여준다', () => {
  expect(texts(false)).toContain(mockTripSample.title);
});

test('title을 주면 여행 제목 대신 그것을 보여준다', () => {
  expect(texts(<Text>편집 중</Text>)).not.toContain(mockTripSample.title);
});
