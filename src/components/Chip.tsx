import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../theme/tokens';

// Figma 「Chip」 컴포넌트. 필터·카테고리 선택용
// medium 32 · large 36. 선택 안 된 large는 글자색이 text-muted
type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'medium' | 'large';
};

export default function Chip({
  label,
  selected,
  onPress,
  size = 'medium',
}: Props) {
  const textColor = selected
    ? colors.surface.default
    : size === 'large'
    ? colors.text.muted
    : colors.text.base;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.base, styles[size], selected && styles.selected]}
    >
      <Text style={[typography.bodySubtle, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 999,
    backgroundColor: colors.surface.default,
  },
  medium: { height: 32, paddingHorizontal: 13 },
  large: { height: 36, paddingHorizontal: 15 },
  selected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
});
