import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

// Figma 「button」 컴포넌트
// large 50 · medium 42 · compact 40 · small 32(담기/복사 같은 작은 버튼)
type Variant = 'primary' | 'secondary' | 'outline' | 'tonal' | 'ghost';
type Size = 'large' | 'medium' | 'compact' | 'small';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.FC<SvgProps>;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  shadow?: boolean; // 화면 하단 주요 버튼(로그인, 다음)에만 있는 그림자
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: colors.brand.primary, text: colors.surface.default },
  secondary: { bg: colors.surface.subtle, text: colors.text.base },
  outline: { bg: colors.surface.default, text: colors.brand.primary },
  tonal: { bg: colors.brand.surfaceSubtle, text: colors.brand.primary },
  ghost: { bg: colors.surface.default, text: colors.text.muted },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon: Icon,
  iconPosition = 'right',
  iconSize = 20,
  shadow,
  disabled,
  style,
}: Props) {
  const { bg, text } = VARIANTS[variant];
  const icon = Icon && <Icon width={iconSize} height={iconSize} color={text} />;
  // compact는 Figma에서 tonal만 SemiBold, 나머지는 Regular
  const textStyle =
    size === 'small'
      ? typography.bodySubtle
      : size === 'compact'
      ? variant === 'tonal'
        ? typography.bodyStrong
        : typography.bodyBase
      : typography.titleBase;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        styles[size],
        { backgroundColor: bg },
        variant === 'outline' && size !== 'small' && styles.border,
        shadow && styles.shadow,
        style,
      ]}
    >
      {iconPosition === 'left' && icon}
      <Text style={[textStyle, { color: text }]}>{label}</Text>
      {iconPosition === 'right' && icon}
    </Pressable>
  );
}

// Figma 「button」의 46px 정사각 아이콘 버튼 (보내기, 찜)
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = 'primary',
  style,
}: {
  icon: React.FC<SvgProps>;
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}) {
  const { bg, text } = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.iconButton, { backgroundColor: bg }, style]}
    >
      <Icon
        width={24}
        height={24}
        color={variant === 'secondary' ? colors.text.muted : text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  large: { height: 50 },
  medium: { height: 42 },
  compact: { height: 40 },
  small: { height: 32, gap: 2, paddingHorizontal: 10, borderRadius: 8 },
  border: { borderWidth: 1, borderColor: colors.surface.subtle },
  shadow: { boxShadow: '0px 4px 12px rgba(0, 120, 255, 0.25)' },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 11.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
