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

const NUMBER_PIN = 20;
const LODGING_PIN = 30;
// 마커 오른쪽에 붙는 이름 (지도 SDK 캡션)
const caption = (text: string) => ({
  text,
  align: 'Right' as const,
  textSize: 11,
  color: colors.text.base,
  haloColor: colors.surface.default,
});

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
          {/* 커스텀 뷰 마커는 width·height를 주지 않으면 크기 0으로 안 보인다. 이름표는 지도 SDK 캡션으로 그린다
              TODO: Figma는 흰 상자 이름표. 길이가 바뀌는 상자를 마커 뷰로 그리려면 글자 폭을 재야 해서 캡션으로 대신한다 */}
          <NaverMapMarkerOverlay
            latitude={day.lodgingLat}
            longitude={day.lodgingLng}
            width={LODGING_PIN}
            height={LODGING_PIN}
            caption={caption(t('map.lodging', { name: day.lodgingName }))}
          >
            <View
              key="lodging"
              collapsable={false}
              style={[styles.pin, styles.lodgingPin]}
            >
              <HouseIcon width={16} height={16} color={colors.brand.primary} />
            </View>
          </NaverMapMarkerOverlay>
          {day.stops.map((stop, index) => (
            <NaverMapMarkerOverlay
              key={stop.id}
              latitude={stop.lat}
              longitude={stop.lng}
              width={NUMBER_PIN}
              height={NUMBER_PIN}
              caption={caption(stop.name)}
              onTap={() =>
                navigation.navigate('PlaceDetail', { placeId: stop.placeId })
              }
            >
              {/* key: 순번이 바뀌면 마커 그림을 다시 만든다 */}
              <View
                key={`${stop.id}/${index}`}
                collapsable={false}
                style={[styles.pin, styles.numberPin]}
              >
                <Text
                  style={[
                    typography.captionBase,
                    { color: colors.surface.default },
                  ]}
                >
                  {index + 1}
                </Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  top: {
    gap: spacing.sectionGap,
    padding: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  mapArea: { flex: 1 },
  pin: { alignItems: 'center', justifyContent: 'center' },
  numberPin: {
    width: NUMBER_PIN,
    height: NUMBER_PIN,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surface.default,
    backgroundColor: colors.brand.primary,
  },
  lodgingPin: {
    width: LODGING_PIN,
    height: LODGING_PIN,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brand.primary,
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
