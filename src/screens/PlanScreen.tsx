import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import StateView from '../components/StateView';
import CalendarIcon from '../assets/icons/calendar.svg';
import CheckIcon from '../assets/icons/check.svg';
import PenIcon from '../assets/icons/pen.svg';
import PinIcon from '../assets/icons/pin.svg';
import { mockTripDays, type TripDay } from '../mocks';
import type { MainTabParamList } from '../navigation/MainTabs';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { formatMonthDay, parseDate } from '../utils/date';
import DayTimeline, { useFormatDuration } from './plan/DayTimeline';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plan'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Figma 값, 토큰에 없음
const TEXT_SECONDARY = '#475569';
const SOURCE_TEXT = '#737A87';

// Figma 「11 계획 확인」 (spec F3-7·F3-9). 지금 여행(GET /api/trips)의 일자 일정을 보여준다
export default function PlanScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { trip, setTrip } = useTrip();
  const [editingTitle, setEditingTitle] = useState(false);
  // TODO: GET /api/trips/{tripId}/days/{dayNumber}로 교체. 지금은 여행과 상관없이 같은 더미
  const days = mockTripDays;
  const [dayNumber, setDayNumber] = useState(1);
  const day = days.find(d => d.dayNumber === dayNumber) ?? days[0];

  if (!trip) {
    return <StateView type="empty" message={t('plan.empty')} />;
  }

  const formatDate = (date: string) =>
    formatMonthDay(parseDate(date), i18n.language);

  // 빈 이름은 저장하지 않는다
  // TODO: 이름 변경 API가 spec §9에 없다. PUT /api/trips/{tripId}(API 19)에 title을 넣을지 백엔드 확인 필요
  const saveTitle = (text: string) => {
    const title = text.trim();
    if (title) setTrip({ ...trip, title });
    setEditingTitle(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tripCard}>
        <View style={styles.tripIcon}>
          <PinIcon width={24} height={24} color={colors.brand.primary} />
        </View>
        <View style={styles.flex}>
          {editingTitle ? (
            <TextInput
              defaultValue={trip.title}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onEndEditing={e => saveTitle(e.nativeEvent.text)}
              style={[styles.titleInput, { color: colors.text.base }]}
              accessibilityLabel={t('plan.editTitle')}
            />
          ) : (
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
        {/* 여행 이름 변경. Figma에 편집 UI가 없어 제목 자리에서 바로 고친다 */}
        <Pressable
          hitSlop={8}
          onPress={() => setEditingTitle(true)}
          accessibilityRole="button"
          accessibilityLabel={t('plan.editTitle')}
        >
          <PenIcon width={20} height={20} color={colors.text.muted} />
        </Pressable>
      </View>

      <View style={styles.dayTabs}>
        {days.map(d => (
          <DayTab
            key={d.dayNumber}
            day={d}
            selected={d.dayNumber === day.dayNumber}
            onPress={() => setDayNumber(d.dayNumber)}
          />
        ))}
      </View>

      <DaySummary day={day} />

      <View style={styles.group}>
        <DayTimeline
          day={day}
          onPressStop={stop =>
            navigation.navigate('PlaceDetail', { placeId: stop.placeId })
          }
        />
        {/* TODO: 장소 추가 API가 없다 (spec F3-3, §2.2). 고른 장소를 이 일정에 넣는 방식은 동선 연동 때 정한다 */}
        <Button
          label={t('plan.addPlace')}
          onPress={() => navigation.navigate('PlaceSelect')}
          variant="outline"
          size="medium"
          icon={CalendarIcon}
          iconPosition="left"
        />
      </View>

      {/* R-C52 출처 표시 */}
      <Text style={styles.source}>{t('home.imageSource')}</Text>

      <Button
        label={t('plan.viewRouteOnMap')}
        variant="secondary"
        onPress={() => navigation.navigate('Map')}
      />
    </ScrollView>
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
      style={[styles.dayTab, selected && styles.dayTabSelected]}
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
          styles.dayTabDate,
          {
            color: selected ? colors.brand.primarySoft : colors.text.subtle,
          },
        ]}
      >
        {`${date.getMonth() + 1}.${date.getDate()} (${weekday})`}
      </Text>
    </Pressable>
  );
}

function DaySummary({ day }: { day: TripDay }) {
  const { t } = useTranslation();
  const formatDuration = useFormatDuration();
  return (
    <View style={styles.summary}>
      <View style={styles.summaryHeader}>
        <View style={styles.row}>
          <View style={styles.dayTag}>
            <Text
              style={[typography.bodySubtle, { color: colors.brand.primary }]}
            >
              {t('plan.daySchedule', { day: day.dayNumber })}
            </Text>
          </View>
          <Text style={styles.timeRange}>
            {`${day.departAt} - ${day.returnAt}`}
          </Text>
        </View>
        <Text style={styles.summaryText}>
          {t('plan.daySummary', {
            count: day.stops.length,
            duration: formatDuration(day.travelMinutes),
          })}
        </Text>
      </View>
      <View style={styles.notes}>
        <View style={[styles.row, styles.fare]}>
          <Text style={[typography.bodyBase, { color: colors.text.base }]}>
            {t('plan.transitFare')}
          </Text>
          <Text style={[typography.bodyStrong, { color: colors.brand.primary }]}>
            {t('plan.farePerPerson', { amount: day.transitFarePerPerson })}
          </Text>
        </View>
        {/* 계획 확인 탭은 확정한 여행만 보여준다 (spec F4-10) */}
        <View style={styles.readOnly}>
          <View style={styles.check}>
            <CheckIcon width={16} height={16} color={colors.surface.default} />
          </View>
          <Text
            style={[
              typography.bodyBase,
              styles.flex,
              { color: colors.text.base },
            ]}
          >
            {t('plan.readOnly')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  group: { gap: spacing.groupGap },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.surfaceSubtle,
  },
  // 편집 중에도 줄 높이가 그대로이게 글자 스타일만 쓰고 기본 여백을 없앤다
  titleInput: {
    ...typography.bodyStrong,
    padding: 0,
    borderBottomWidth: 1,
    borderColor: colors.brand.primary,
  },
  dayTabs: {
    flexDirection: 'row',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayTabSelected: {
    backgroundColor: colors.brand.primary,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  dayTabDate: { fontFamily: fontFamily.regular, fontSize: 10.5 },
  summary: {
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  summaryHeader: { gap: 8 },
  dayTag: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primarySoft,
  },
  timeRange: { ...typography.bodySubtle, color: TEXT_SECONDARY },
  summaryText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: colors.text.emphasis,
  },
  notes: { gap: 10 },
  fare: {
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface.subtle,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  source: { fontFamily: fontFamily.medium, fontSize: 11, color: SOURCE_TEXT },
});
