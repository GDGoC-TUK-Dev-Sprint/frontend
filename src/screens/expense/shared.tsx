import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import FoodIcon from '../../assets/icons/expense-food.svg';
import TransportIcon from '../../assets/icons/expense-transport.svg';
import ShoppingIcon from '../../assets/icons/expense-shopping.svg';
import SightseeingIcon from '../../assets/icons/expense-sightseeing.svg';
import PlusCircleIcon from '../../assets/icons/plus-circle.svg';
import type { CostItemCode } from '../../api/trips';
import { colors, shadow, typography } from '../../theme/tokens';

// 08 지출 입력·09 지출 리포트가 같이 쓰는 항목 아이콘·색, 1인/전체 토글

// 입력 화면에 고정으로 보이는 항목 (Figma 순서). 기타(OTHER)는 「기타 항목 추가」로 늘린다
export const FIXED_ITEMS = [
  'FOOD',
  'TRANSPORT',
  'SHOPPING',
  'SIGHTSEEING',
] as const;

// 아이콘 색·칸 배경 (Figma 값, 디자인 시스템에 없는 색은 확인 필요)
export const ITEM_STYLE: Record<
  CostItemCode,
  {
    icon: React.FC<SvgProps>;
    width: number;
    height: number;
    color: string;
    bg: string;
  }
> = {
  FOOD: {
    icon: FoodIcon,
    width: 11.25,
    height: 15,
    color: colors.text.negative,
    bg: colors.surface.negativeSoft,
  },
  TRANSPORT: {
    icon: TransportIcon,
    width: 12,
    height: 14.25,
    color: colors.brand.primary,
    bg: colors.brand.surfaceSubtle,
  },
  SHOPPING: {
    icon: ShoppingIcon,
    width: 12,
    height: 15,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  SIGHTSEEING: {
    icon: SightseeingIcon,
    width: 15,
    height: 12,
    color: '#A855F7',
    bg: '#F3E8FF',
  },
  OTHER: {
    icon: PlusCircleIcon,
    width: 15,
    height: 15,
    color: colors.text.muted,
    bg: colors.surface.subtle,
  },
};

export type Basis = 'perPerson' | 'total';

// Figma 「Toggle」: 회색 칸 안의 흰 선택 버튼
export function BasisToggle({
  value,
  onChange,
  partySize,
}: {
  value: Basis;
  onChange: (next: Basis) => void;
  partySize: number;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.toggle}>
      {(['perPerson', 'total'] as const).map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.button, selected && styles.selected]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
          >
            <Text
              style={[
                selected ? typography.bodyStrong : typography.bodyBase,
                { color: selected ? colors.brand.primary : colors.text.muted },
              ]}
            >
              {option === 'perPerson'
                ? t('cost.perPerson')
                : t('expense.totalBasis', { count: partySize })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 막대 그래프 (Figma 「Progress Bar」). ratio는 0~1, 넘으면 1로 자른다
export function ProgressBar({
  ratio,
  color = colors.brand.primary,
}: {
  ratio: number;
  color?: string;
}) {
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%` as const;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  selected: { backgroundColor: colors.surface.default, ...shadow.card },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.surface.subtle,
  },
  fill: { height: '100%', borderRadius: 999 },
});
