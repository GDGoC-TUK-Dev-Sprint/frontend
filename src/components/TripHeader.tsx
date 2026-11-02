import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PinIcon from '../assets/icons/pin.svg';
import type { Trip, TripDay } from '../mocks';
import { colors, fontFamily, typography } from '../theme/tokens';
import { formatMonthDay, nightsBetween, parseDate } from '../utils/date';

// 계획 확인·동선·지도 화면 위쪽의 여행 요약 카드와 일차 탭 (Figma 「Selection Card」·「toggle-m」)

export function TripSummaryCard({
  trip,
  title,
  right,
}: {
  trip: Trip;
  title?: React.ReactNode; // 제목 자리를 바꿀 때 (계획 확인의 이름 변경)
  right: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const formatDate = (date: string) =>
    formatMonthDay(parseDate(date), i18n.language);
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <PinIcon width={24} height={24} color={colors.brand.primary} />
      </View>
      <View style={styles.flex}>
        {title ?? (
          <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
            {trip.title}
          </Text>
        )}
        <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
          {t('plan.tripMeta', {
            period: `${formatDate(trip.startDate)} - ${formatDate(
              trip.endDate,
            )}`,
            count: trip.travelers,
          })}
        </Text>
      </View>
      {right}
    </View>
  );
}

// "진행 예정 · D-12"
// TODO: 여행 상태(진행 예정·진행 중)는 GET /api/trips 응답의 status로 바꾼다. 지금은 시작 전이라고 본다
export function TripStatusBadge({ trip }: { trip: Trip }) {
  const { t } = useTranslation();
  const dDay = t('home.dDay', {
    count: nightsBetween(new Date(), parseDate(trip.startDate)),
  });
  return (
    <View style={styles.status}>
      <Text style={[typography.captionBase, { color: colors.brand.primary }]}>
        {`${t('home.upcoming')} · ${dDay}`}
      </Text>
    </View>
  );
}

export function DayTabs({
  days,
  selected,
  onSelect,
}: {
  days: TripDay[];
  selected: number;
  onSelect: (dayNumber: number) => void;
}) {
  return (
    <View style={styles.tabs}>
      {days.map(day => (
        <DayTab
          key={day.dayNumber}
          day={day}
          selected={day.dayNumber === selected}
          onPress={() => onSelect(day.dayNumber)}
        />
      ))}
    </View>
  );
}

function DayTab({
  day,
  selected,
  onPress,
}: {
  day: TripDay;
  selected: boolean;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const date = parseDate(day.date);
  const weekday = date.toLocaleDateString(i18n.language, { weekday: 'short' });
  return (
    <Pressable
      style={[styles.tab, selected && styles.tabSelected]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text
        style={
          selected
            ? [typography.bodyStrong, { color: colors.surface.default }]
            : [typography.bodyBase, { color: colors.text.muted }]
        }
      >
        {t('plan.dayTab', { day: day.dayNumber })}
      </Text>
      <Text
        style={[
          styles.tabDate,
          { color: selected ? colors.brand.primarySoft : colors.text.subtle },
        ]}
      >
        {`${date.getMonth() + 1}.${date.getDate()} (${weekday})`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.surfaceSubtle,
  },
  status: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  tabs: {
    flexDirection: 'row',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: colors.brand.primary,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  tabDate: { fontFamily: fontFamily.regular, fontSize: 10.5 },
});
