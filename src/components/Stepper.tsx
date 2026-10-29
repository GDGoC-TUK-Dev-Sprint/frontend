import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MinusIcon from '../assets/icons/minus.svg';
import PlusSmallIcon from '../assets/icons/plus-small.svg';
import { colors, typography } from '../theme/tokens';

// − 값 + 스테퍼 (Figma 「02 조건 입력」 인원). 최소·최대에 닿으면 버튼을 흐리게 막는다
type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  valueLabel: string; // 가운데 표시 문구 (예: "2명")
  decreaseLabel: string; // 접근성 라벨
  increaseLabel: string;
};

export default function Stepper({
  value,
  min,
  max,
  onChange,
  valueLabel,
  decreaseLabel,
  increaseLabel,
}: Props) {
  const canDecrease = value > min;
  const canIncrease = value < max;
  return (
    <View style={styles.stepper}>
      <Pressable
        style={[styles.button, styles.minus, !canDecrease && styles.disabled]}
        onPress={() => onChange(value - 1)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel={decreaseLabel}
      >
        <MinusIcon width={10.5} height={1.5} color={colors.icon.strong} />
      </Pressable>
      <Text style={styles.value}>{valueLabel}</Text>
      <Pressable
        style={[styles.button, styles.plus, !canIncrease && styles.disabled]}
        onPress={() => onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
      >
        <PlusSmallIcon
          width={10.5}
          height={10.5}
          color={colors.surface.default}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 132,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: colors.surface.subtle,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  minus: { backgroundColor: colors.surface.default },
  plus: { backgroundColor: colors.brand.primary },
  disabled: { opacity: 0.4 },
  value: { ...typography.bodyStrong, color: colors.text.emphasis },
});
