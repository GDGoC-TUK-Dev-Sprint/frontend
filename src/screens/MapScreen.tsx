import React, { useEffect, useRef } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import type { TripDay } from '../mocks';
import type { MainTabParamList } from '../navigation/MainTabs';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import { useTripDay } from '../trips/useTripDay';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { regionFor } from '../utils/map';
import { useFormatDuration } from '../components/DayTimeline';

// 탭 화면이지만 마커를 누르면 장소 상세(루트 스택)로 간다
// 동선 화면의 "지도로 보기"는 같은 화면을 루트 스택(RouteMap)에 올린다. 탭으로 가면 동선 화면이 닫혀 예상 경비로 못 간다
type TabProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Map'>,
  NativeStackScreenProps<RootStackParamList>
>;
type Props = TabProps | NativeStackScreenProps<RootStackParamList, 'RouteMap'>;

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

// 여행이 없을 때 현위치를 받기 전(또는 위치 권한이 없을 때) 보여줄 영역: 서울시청을 중심으로 시내가 보이는 크기 (Region은 남서쪽 모서리 기준)
const SEOUL = { lat: 37.5665, lng: 126.978 };
const SEOUL_REGION = {
  latitude: SEOUL.lat - 0.1,
  longitude: SEOUL.lng - 0.125,
  latitudeDelta: 0.2,
  longitudeDelta: 0.25,
};

// Figma 「03a 지도로 보기」 (spec F3-8·F3-9). 지금 여행의 일자 동선을 네이버 지도에 그린다
// 동선을 만든 여행이 없으면 지도만 보여준다
// Client ID가 없으면 지도만 인증 실패로 회색이 된다 (CLAUDE.md 5절)
export default function MapScreen({ navigation, route: screen }: Props) {
  const fromRoute = screen.name === 'RouteMap';
  const nav = navigation as TabProps['navigation'];
  const { t, i18n } = useTranslation();
  const formatDuration = useFormatDuration();
  const { trip } = useTrip();
  const mapRef = useRef<NaverMapViewRef>(null);
  const { days, dayNumber, selectDay, day, failed, reload } = useTripDay(trip);

  // 현위치 점을 띄운다. 여행이 없으면 카메라도 현위치로 옮긴다 (Follow), 있으면 동선 화면을 그대로 둔다 (NoFollow)
  // iOS는 지도 SDK가 권한을 묻고, Android는 SDK가 권한 결과를 받지 못해 여기서 먼저 묻는다
  const showMyLocation = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    mapRef.current?.setLocationTrackingMode(trip?.days ? 'NoFollow' : 'Follow');
  };

  // 일차를 바꿔 그날 일정을 받으면 동선이 다 보이게 카메라를 옮긴다
  useEffect(() => {
    if (day) mapRef.current?.animateRegionTo(regionFor(dayPoints(day)));
  }, [day]);

  // 동선이 있는 여행인데 일정을 받지 못했으면 다시 시도. 받는 동안에는 지도만 보인다
  if (trip?.days && !day && failed) {
    return (
      <StateView
        type="error"
        message={t('auth.networkError')}
        retryLabel={t('common.retry')}
        onRetry={reload}
      />
    );
  }

  // 숙소 → 장소 1~N → 숙소를 방문 순서대로 직선으로 잇는다
  // TODO: Figma는 점선. 라이브러리 2.9.1의 Polyline이 pattern을 네이티브로 넘기지 않아 실선으로 그린다
  const route = day
    ? [
        { latitude: day.lodgingLat, longitude: day.lodgingLng },
        ...day.stops.map(s => ({ latitude: s.lat, longitude: s.lng })),
        { latitude: day.lodgingLat, longitude: day.lodgingLng },
      ]
    : [];

  return (
    <View style={styles.screen}>
      {trip?.days && (
        <View style={styles.top}>
          <TripSummaryCard
            trip={trip}
            right={<TripStatusBadge trip={trip} />}
          />
          <DayTabs days={days} selected={dayNumber} onSelect={selectDay} />
        </View>
      )}

      <View style={styles.mapArea}>
        <NaverMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={day ? regionFor(dayPoints(day)) : SEOUL_REGION}
          locale={i18n.language}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowIndoorLevelPicker={false}
          isShowLocationButton
          onInitialized={showMyLocation}
        >
          {day && day.stops.length > 0 && (
            <NaverMapPolylineOverlay
              coords={route}
              width={3}
              color={colors.brand.primary}
            />
          )}
          {/* 커스텀 뷰 마커는 width·height를 주지 않으면 크기 0으로 안 보인다. 이름표는 지도 SDK 캡션으로 그린다
              TODO: Figma는 흰 상자 이름표. 길이가 바뀌는 상자를 마커 뷰로 그리려면 글자 폭을 재야 해서 캡션으로 대신한다 */}
          {day && (
            <>
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
                  <HouseIcon
                    width={16}
                    height={16}
                    color={colors.brand.primary}
                  />
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
                    nav.navigate('PlaceDetail', {
                      placeId: stop.placeId,
                      preview: stop,
                    })
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
            </>
          )}
        </NaverMapView>

        {day && (
          <View style={styles.summary}>
            <View style={styles.summaryText}>
              <Text
                style={[typography.bodyStrong, { color: colors.text.heading }]}
              >
                {t('map.summary', {
                  day: day.dayNumber,
                  count: day.stops.length,
                  from: day.departAt,
                  to: day.returnAt,
                })}
              </Text>
              <Text
                style={[typography.bodySubtle, { color: colors.text.notice }]}
              >
                {t('map.routeNote', {
                  duration: formatDuration(day.travelMinutes),
                })}
              </Text>
            </View>
            <Button
              label={t(fromRoute ? 'map.backToRoute' : 'map.backToList')}
              variant="secondary"
              onPress={() => (fromRoute ? nav.goBack() : nav.navigate('Plan'))}
            />
          </View>
        )}
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
