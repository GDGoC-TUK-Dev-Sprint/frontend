import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

// 화면을 구현하기 전까지 쓰는 임시 화면
export default function ScreenPlaceholder({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {children}
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
  title: { ...typography.titleStrong, color: colors.text.base },
});
