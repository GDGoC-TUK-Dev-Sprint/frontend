import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import PenIcon from '../assets/icons/pen.svg';
import { colors, typography } from '../theme/tokens';

// 1인 희망 예산 칩 (Figma 「02 조건 입력」). 하나만 고르는 라디오 역할
type Props = {
  label: string;
  icon?: boolean; // "직접입력" 칩의 펜 아이콘
  selected: boolean;
  onPress: () => void;
};

export default function BudgetChip({ label, icon, selected, onPress }: Props) {
  const color = selected ? colors.surface.default : colors.text.muted;
  return (
    <Pressable
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      {icon && <PenIcon width={20} height={20} color={color} />}
      <Text style={[typography.bodySubtle, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  selected: { backgroundColor: colors.brand.primary },
});
