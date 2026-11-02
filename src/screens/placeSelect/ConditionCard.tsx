import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import HotelIcon from '../../assets/icons/hotel.svg';
import SliderIcon from '../../assets/icons/slider.svg';
import type { Theme, Trip } from '../../mocks';
import { colors, typography } from '../../theme/tokens';
import { parseDate } from '../../utils/date';

// 여행 조건 요약: 숙소(기준점) · 지역 · 기간 · 인원 · 1인 예산, 선택한 테마
export default function ConditionCard({
  trip,
  themes,
  onChange,
}: {
  trip: Trip;
  themes: Theme[];
  onChange: () => void;
}) {
  const { t, i18n } = useTranslation();
  const shortDate = (date: string) => {
    const d = parseDate(date);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };
  // TODO: 표시 통화(F4-8)로 환산할지 확인 필요. 예산은 원화로 입력받는다
  const budget =
    trip.budgetPerPerson === undefined
      ? t('condition.budgetAny')
      : new Intl.NumberFormat(i18n.language, {
          style: 'currency',
          currency: 'KRW',
        }).format(trip.budgetPerPerson);
  const meta = [
    trip.region,
    `${shortDate(trip.startDate)}~${shortDate(trip.endDate)}`,
    t('placeSelect.travelers', { count: trip.travelers }),
    t('placeSelect.budget', { amount: budget }),
  ].join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <HotelIcon width={20} height={20} color={colors.text.muted} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text
              style={[typography.bodyStrong, styles.shrink]}
              numberOfLines={1}
            >
              {trip.stayName}
            </Text>
            <View style={styles.tag}>
              <Text
                style={[typography.bodySubtle, { color: colors.brand.primary }]}
              >
                {t('placeSelect.basePoint')}
              </Text>
            </View>
          </View>
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {meta}
          </Text>
        </View>
        <Pressable
          style={styles.change}
          onPress={onChange}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text
            style={[typography.bodySubtle, { color: colors.brand.primary }]}
          >
            {t('placeSelect.change')}
          </Text>
          <ChevronRightIcon
            width={20}
            height={20}
            color={colors.brand.primary}
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rack}
        contentContainerStyle={styles.rackContent}
      >
        <View style={styles.rackLabel}>
          <SliderIcon width={16} height={16} color={colors.text.muted} />
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('placeSelect.conditions')}
          </Text>
        </View>
        {themes.map(theme => (
          <View key={theme.code} style={styles.pill}>
            <Text style={[typography.captionBase, { color: colors.text.base }]}>
              {theme.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.iconBg,
  },
  info: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1, color: colors.text.base },
  tag: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primarySoft,
  },
  change: { flexDirection: 'row', alignItems: 'center' },
  rack: { borderRadius: 8, backgroundColor: colors.surface.subtle },
  rackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rackLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pill: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: colors.surface.default,
  },
});
