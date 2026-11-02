import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable, { type SortableGridRenderItem } from 'react-native-sortables';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import StateView from '../components/StateView';
import {
  DayTabs,
  TripStatusBadge,
  TripSummaryCard,
} from '../components/TripHeader';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import CalendarIcon from '../assets/icons/calendar.svg';
import CloseIcon from '../assets/icons/close.svg';
import DragIcon from '../assets/icons/drag.svg';
import { mockTripDays, type TripDay, type TripStop } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import DayTimeline, {
  StopCard,
  useFormatDuration,
} from '../components/DayTimeline';
import ImageCredit from '../components/ImageCredit';

type Props = NativeStackScreenProps<RootStackParamList, 'Route'>;

// Figma 「03 동선」 (spec F3). 장소 선택에서 만든 동선을 일자별로 확인하고 순서 변경·삭제한다
export default function RouteScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trip } = useTrip();
  // 끄는 동안 화면 끝에 닿으면 자동 스크롤한다
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // TODO: POST .../route 응답과 GET .../days/{dayNumber}로 교체. 지금은 계획 확인과 같은 더미를 고쳐 쓴다
  const [days, setDays] = useState<TripDay[]>(mockTripDays);
  const [dayNumber, setDayNumber] = useState(1);
  const day = days.find(d => d.dayNumber === dayNumber) ?? days[0];

  if (!trip) {
    return <StateView type="empty" message={t('placeSelect.noTrip')} />;
  }

  // TODO: 순서 변경은 PUT .../days/{dayNumber}/order(API 23), 삭제는 DELETE .../items/{itemId}(API 24)
  // 서버가 이동시간·운임·도착 시각을 다시 계산해 돌려준다. 지금은 순서만 바뀌고 시각은 그대로다
  const setStops = (stops: TripStop[]) =>
    setDays(prev =>
      prev.map(d => (d.dayNumber === day.dayNumber ? { ...d, stops } : d)),
    );

  const openPlace = (stop: TripStop) =>
    navigation.navigate('PlaceDetail', { placeId: stop.placeId });

  // 핸들로만 끌 수 있게 해서(customHandle) 카드 누르기·스크롤과 겹치지 않게 한다
  const renderStop: SortableGridRenderItem<TripStop> = ({ item, index }) => (
    <StopCard
      stop={item}
      order={index + 1}
      onPress={() => openPlace(item)}
      actions={
        <View style={styles.actions}>
          <Pressable
            hitSlop={8}
            onPress={() => setStops(day.stops.filter(s => s.id !== item.id))}
            accessibilityRole="button"
            accessibilityLabel={t('route.remove', { name: item.name })}
          >
            <CloseIcon width={16} height={16} color={colors.text.subtle} />
          </Pressable>
          <Sortable.Handle>
            <View accessibilityLabel={t('route.reorder')}>
              <DragIcon width={16} height={16} color={colors.text.subtle} />
            </View>
          </Sortable.Handle>
        </View>
      }
    />
  );

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
      >
        <TripSummaryCard trip={trip} right={<TripStatusBadge trip={trip} />} />
        <DayTabs days={days} selected={day.dayNumber} onSelect={setDayNumber} />
        <RouteSummary day={day} />

        <View style={styles.group}>
          <DayTimeline
            day={day}
            onPressStop={openPlace}
            stops={
              // key: 일차를 바꾸면 그 일차의 목록으로 새로 그린다
              <Sortable.Grid
                key={day.dayNumber}
                data={day.stops}
                keyExtractor={stop => stop.id}
                renderItem={renderStop}
                onDragEnd={({ data }) => setStops(data)}
                columns={1}
                rowGap={16}
                customHandle
                scrollableRef={scrollRef}
              />
            }
          />
          <Button
            label={t('plan.addPlace')}
            onPress={() => navigation.navigate('PlaceSelect')}
            variant="outline"
            size="medium"
            icon={CalendarIcon}
            iconPosition="left"
          />
        </View>

        <Button
          label={t('plan.viewRouteOnMap')}
          variant="secondary"
          onPress={() => navigation.navigate('Main', { screen: 'Map' })}
        />

        {/* R-C52 출처 표시 */}
        <ImageCredit />
      </Animated.ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.screenPadding) },
        ]}
      >
        {/* TODO: 예상 경비 화면(04)이 아직 없어 동작 없음 */}
        <Button
          label={t('route.estimate')}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow
        />
      </View>
    </View>
  );
}

function RouteSummary({ day }: { day: TripDay }) {
  const { t } = useTranslation();
  const formatDuration = useFormatDuration();
  return (
    <View style={styles.summary}>
      <View style={styles.row}>
        <View style={styles.dayTag}>
          <Text
            style={[typography.captionBase, { color: colors.brand.primary }]}
          >
            {t('plan.daySchedule', { day: day.dayNumber })}
          </Text>
        </View>
        <Text
          style={[typography.captionBase, { color: colors.text.secondary }]}
        >
          {`${day.departAt} - ${day.returnAt}`}
        </Text>
      </View>
      <Text style={[typography.bodyStrong, { color: colors.text.emphasis }]}>
        {t('plan.daySummary', {
          count: day.stops.length,
          duration: formatDuration(day.travelMinutes),
        })}
      </Text>
      <View style={[styles.pill, styles.pillMuted]}>
        <View style={styles.dot} />
        <Text style={styles.pillText}>{t('route.recalcNotice')}</Text>
      </View>
      <View style={[styles.pill, styles.row, styles.pillBrand]}>
        <Text style={styles.pillText}>{t('plan.transitFare')}</Text>
        <Text style={[typography.bodySubtle, { color: colors.brand.primary }]}>
          {t('plan.farePerPerson', { amount: day.transitFarePerPerson })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  group: { gap: spacing.groupGap },
  actions: { alignItems: 'center', gap: 13 },
  summary: {
    gap: 9,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  dayTag: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primarySoft,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillMuted: { backgroundColor: colors.surface.subtle },
  pillBrand: { backgroundColor: colors.brand.surfaceSubtle },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand.primary,
  },
  pillText: {
    fontFamily: fontFamily.regular,
    fontSize: 11.5,
    color: colors.text.secondary,
  },
  footer: {
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
});
