import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import HouseIcon from '../../assets/icons/house.svg';
import type { TripDay, TripStop } from '../../mocks';
import { colors, typography } from '../../theme/tokens';
import { minutesBetween } from '../../utils/date';

// Figma 값, 토큰에 없음
const TIMELINE = '#BCD3F5';
const CATEGORY_TEXT = '#475569';

// 분 → "1시간 30분" · "1h 30m"
export function useFormatDuration() {
  const { t } = useTranslation();
  return (total: number) => {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (!hours) return t('plan.durationM', { minutes });
    if (!minutes) return t('plan.durationH', { hours });
    return t('plan.durationHM', { hours, minutes });
  };
}

// 동선 타임라인: 숙소 출발 → 장소 1~N → 숙소 도착. 세로선은 첫·마지막 숙소 카드 가운데를 잇는다
export default function DayTimeline({
  day,
  onPressStop,
}: {
  day: TripDay;
  onPressStop: (stop: TripStop) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.timeline}>
      <View style={styles.line} />
      <LodgingCard
        label={t('plan.lodgingDepart')}
        time={day.departAt}
        name={day.lodgingName}
      />
      {day.stops.map((stop, index) => (
        <StopCard
          key={stop.id}
          stop={stop}
          order={index + 1}
          onPress={() => onPressStop(stop)}
        />
      ))}
      <LodgingCard
        label={t('plan.lodgingArrive')}
        time={day.returnAt}
        name={day.lodgingName}
      />
    </View>
  );
}

function LodgingCard({
  label,
  time,
  name,
}: {
  label: string;
  time: string;
  name: string;
}) {
  return (
    <View style={styles.lodging}>
      <View style={styles.lodgingIcon}>
        <HouseIcon width={24} height={24} color={colors.surface.default} />
      </View>
      <View>
        <View style={styles.row}>
          <View style={styles.lodgingTag}>
            <Text
              style={[typography.captionBase, { color: colors.brand.primary }]}
            >
              {label}
            </Text>
          </View>
          <Text style={[typography.bodySubtle, { color: colors.text.base }]}>
            {time}
          </Text>
        </View>
        <Text style={[typography.bodySubtle, { color: colors.text.base }]}>
          {name}
        </Text>
      </View>
    </View>
  );
}

function StopCard({
  stop,
  order,
  onPress,
}: {
  stop: TripStop;
  order: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const formatDuration = useFormatDuration();
  return (
    <Pressable style={styles.stop} onPress={onPress} accessibilityRole="button">
      <View style={styles.image}>
        {/* R-K11: Type3은 자르지 않는다 */}
        <Image
          source={stop.photo.source}
          resizeMode={stop.photo.copyright === 'Type3' ? 'contain' : 'cover'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.order}>
          <Text style={[typography.captionBase, styles.orderText]}>
            {order}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.category}>
          <Text style={[typography.captionBase, { color: CATEGORY_TEXT }]}>
            {stop.category}
          </Text>
        </View>
        <Text
          style={[typography.bodyStrong, { color: colors.text.emphasis }]}
          numberOfLines={1}
        >
          {stop.name}
        </Text>
        <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
          {t('plan.stopTime', {
            from: stop.arriveAt,
            to: stop.departAt,
            duration: formatDuration(
              minutesBetween(stop.arriveAt, stop.departAt),
            ),
          })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 16 },
  line: {
    position: 'absolute',
    left: 27,
    top: 35,
    bottom: 35,
    width: 2,
    backgroundColor: TIMELINE,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lodging: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand.primarySoft,
    borderRadius: 12,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  lodgingIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  lodgingTag: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.surface.default,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface.subtle,
  },
  order: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  orderText: { color: colors.surface.default },
  info: { flex: 1, alignItems: 'flex-start', gap: 4 },
  category: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.subtle,
  },
});
