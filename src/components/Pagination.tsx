import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SvgProps } from 'react-native-svg';
import ChevronDoubleRightIcon from '../assets/icons/chevron-double-right.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import { colors, typography } from '../theme/tokens';
import { pageItems } from '../utils/pagination';

// Figma 「Pagination」: 처음 · 이전 · 번호 · 다음 · 끝 (spec F2-11)
const DISABLED_BG = '#F9F9FB'; // Figma 값, 토큰에 없음

type Props = { page: number; total: number; onChange: (page: number) => void };

export default function Pagination({ page, total, onChange }: Props) {
  const { t } = useTranslation();
  const arrow = (
    key: 'first' | 'prev' | 'next' | 'last',
    Icon: React.FC<SvgProps>,
    target: number,
    flip: boolean,
  ) => {
    const disabled = target === page;
    return (
      <Pressable
        key={key}
        onPress={() => onChange(target)}
        disabled={disabled}
        style={[styles.item, disabled ? styles.disabled : styles.active]}
        accessibilityRole="button"
        accessibilityLabel={t(`pagination.${key}`)}
        accessibilityState={{ disabled }}
      >
        <Icon
          width={16}
          height={16}
          color={colors.text.muted}
          style={flip && styles.flip}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.row}>
      {arrow('first', ChevronDoubleRightIcon, 1, true)}
      {arrow('prev', ChevronRightIcon, Math.max(page - 1, 1), true)}
      {pageItems(page, total).map((item, i) =>
        item === '…' ? (
          <Text key={`gap${i}`} style={[styles.number, styles.gap]}>
            …
          </Text>
        ) : (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[
              styles.item,
              item === page ? styles.selected : styles.active,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: item === page }}
          >
            <Text
              style={[
                styles.number,
                item === page && { color: colors.surface.default },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ),
      )}
      {arrow('next', ChevronRightIcon, Math.min(page + 1, total), false)}
      {arrow('last', ChevronDoubleRightIcon, total, false)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  item: {
    minWidth: 32,
    height: 36,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  active: {
    backgroundColor: colors.surface.default,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  selected: {
    backgroundColor: colors.brand.primary,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  disabled: { backgroundColor: DISABLED_BG },
  flip: { transform: [{ rotate: '180deg' }] },
  gap: { width: 21, textAlign: 'center', color: colors.text.muted },
  number: { ...typography.bodyBase, color: colors.text.base },
});
