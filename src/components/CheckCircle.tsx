import React from 'react';
import { StyleSheet, View } from 'react-native';
import CheckIcon from '../assets/icons/check.svg';
import { colors } from '../theme/tokens';

// 선택 표시 원: 고르면 파란 원 + 흰 체크, 아니면 테두리만 (테마 타일, 숙소 미정 카드)
type Props = {
  checked: boolean;
  emptyColor?: string; // 빈 원 테두리 색
};

export default function CheckCircle({
  checked,
  emptyColor = colors.surface.subtle,
}: Props) {
  return checked ? (
    <View style={[styles.circle, styles.checked]}>
      <CheckIcon width={12.8} height={12.8} color={colors.surface.default} />
    </View>
  ) : (
    <View style={[styles.circle, { borderColor: emptyColor }]} />
  );
}

const styles = StyleSheet.create({
  circle: { width: 16, height: 16, borderWidth: 1, borderRadius: 999 },
  checked: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: colors.brand.primary,
  },
});
