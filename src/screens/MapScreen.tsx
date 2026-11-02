import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapPolylineOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import StateView from '../components/StateView';
import {
  DayTabs,
  TripStatusBadge,
  TripSummaryCard,
} from '../components/TripHeader';
import HouseIcon from '../assets/icons/house.svg';
import { mockTripDays, type TripDay } from '../mocks';
import type { MainTabParamList } from '../navigation/MainTabs';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { regionFor } from '../utils/map';
import { useFormatDuration } from './plan/DayTimeline';

// 탭 화면이지만 마커를 누르면 장소 상세(루트 스택)로 간다
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Map'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Figma 값, 토큰에 없음
const SUMMARY_TITLE = '#1F242E';
const SUMMARY_TEXT = '#6B7380';

const dayPoints = (day: TripDay) => [
  { lat: day.lodgingLat, lng: day.lodgingLng },
  ...day.stops,
];

// Figma 「03a 지도로 보기」 (spec F3-8·F3-9). 지금 여행의 일자 동선을 네이버 지도에 그린다
// Client ID가 없으면 지도만 인증 실패로 회색이 된다 (CLAUDE.md 5절)
export default function MapScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const formatDuration = useFormatDuration();
  const { trip } = useTrip();
  const mapRef = useRef<NaverMapViewRef>(null);
  // TODO: GET /api/trips/{tripId}/days/{dayNumber}로 교체 (계획 확인과 같은 더미)
  const days = mockTripDays;
  const [dayNumber, setDayNumber] = useState(1);
  const day = days.find(d => d.dayNumber === dayNumber) ?? days[0];

  if (!trip) {
    return <StateView type="empty" message={t('plan.empty')} />;
  }

  // 일차를 바꾸면 그날 동선이 다 보이게 카메라를 옮긴다
  const selectDay = (next: number) => {
    setDayNumber(next);
    const target = days.find(d => d.dayNumber === next);
    if (target) mapRef.current?.animateRegionTo(regionFor(dayPoints(target)));
  };

  // 숙소 → 장소 1~N → 숙소를 방문 순서대로 직선으로 잇는다
  // TODO: Figma는 점선. 라이브러리 2.9.1의 Polyline이 pattern을 네이티브로 넘기지 않아 실선으로 그린다
  const route = [
    { latitude: day.lodgingLat, longitude: day.lodgingLng },
    ...day.stops.map(s => ({ latitude: s.lat, longitude: s.lng })),
    { latitude: day.lodgingLat, longitude: day.lodgingLng },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <TripSummaryCard trip={trip} right={<TripStatusBadge trip={trip} />} />
        <DayTabs days={days} selected={day.dayNumber} onSelect={selectDay} />
      </View>

      <View style={styles.mapArea}>
        <NaverMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={regionFor(dayPoints(day))}
          locale={i18n.language}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowIndoorLevelPicker={false}
          isShowLocationButton={false}
        >
          {day.stops.length > 0 && (
            <NaverMapPolylineOverlay
              coords={route}
              width={3}
              color={colors.brand.primary}
            />
          )}
          <NaverMapMarkerOverlay
            latitude={day.lodgingLat}
            longitude={day.lodgingLng}
            anchor={{ x: 0.1, y: 0.5 }}
          >
            <View style={styles.marker}>
              <View style={styles.lodgingPin}>
                <HouseIcon
                  width={16}
                  height={16}
                  color={colors.brand.primary}
                />
              </View>
              <MarkerLabel text={t('map.lodging', { name: day.lodgingName })} />
            </View>
          </NaverMapMarkerOverlay>
          {day.stops.map((stop, index) => (
            <NaverMapMarkerOverlay
              key={stop.id}
              latitude={stop.lat}
              longitude={stop.lng}
              anchor={{ x: 0.1, y: 0.5 }}
              onTap={() =>
                navigation.navigate('PlaceDetail', { placeId: stop.placeId })
              }
            >
              <View style={styles.marker}>
                <View style={styles.numberPin}>
                  <Text
                    style={[
                      typography.captionBase,
                      { color: colors.surface.default },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <MarkerLabel text={stop.name} />
              </View>
            </NaverMapMarkerOverlay>
          ))}
        </NaverMapView>

        <View style={styles.summary}>
          <View style={styles.summaryText}>
            <Text style={[typography.bodyStrong, { color: SUMMARY_TITLE }]}>
              {t('map.summary', {
                day: day.dayNumber,
                count: day.stops.length,
                from: day.departAt,
                to: day.returnAt,
              })}
            </Text>
            <Text style={[typography.bodySubtle, { color: SUMMARY_TEXT }]}>
              {t('map.routeNote', {
                duration: formatDuration(day.travelMinutes),
              })}
            </Text>
          </View>
          <Button
            label={t('map.backToList')}
            variant="secondary"
            onPress={() => navigation.navigate('Plan')}
          />
        </View>
      </View>
    </View>
  );
}

function MarkerLabel({ text }: { text: string }) {
  return (
    <View style={styles.label}>
      <Text style={[typography.captionBase, { color: colors.text.base }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  top: {
    gap: spacing.sectionGap,
    padding: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  mapArea: { flex: 1 },
  marker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numberPin: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  lodgingPin: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.default,
  },
  label: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.surface.default,
  },
  summary: {
    position: 'absolute',
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    bottom: spacing.screenPadding,
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  summaryText: { gap: 4 },
});
