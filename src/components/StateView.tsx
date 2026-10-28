import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors, spacing, typography } from '../theme/tokens';

// 로딩·빈 화면·오류 화면
// TODO: Figma에 디자인이 없어 토큰과 공통 버튼으로 만든 임시 화면. 디자이너 확인 후 수정
type Props =
  | { type: 'loading' }
  | { type: 'empty'; message: string }
  | {
      type: 'error';
      message: string;
      retryLabel: string; // "다시 시도"
      onRetry: () => void;
    };

export default function StateView(props: Props) {
  return (
    <View style={styles.container}>
      {props.type === 'loading' ? (
        <ActivityIndicator size="large" color={colors.brand.primary} />
      ) : (
        <Text style={styles.message}>{props.message}</Text>
      )}
      {props.type === 'error' && (
        <Button
          label={props.retryLabel}
          onPress={props.onRetry}
          variant="secondary"
          size="compact"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.groupGap,
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.base,
  },
  message: {
    ...typography.bodyBase,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
