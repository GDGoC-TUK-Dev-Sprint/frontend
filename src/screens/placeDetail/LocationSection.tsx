import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import type { PlaceDetail } from '../../mocks';
import { colors, typography } from '../../theme/tokens';

// ⑦ 위치 및 주변 교통: 네이버 지도 미리보기 + 가까운 역 카드
// Client ID가 없으면 지도만 인증 실패로 회색이 된다 (CLAUDE.md 5절)
export default function LocationSection({
  place,
  onOpenMap,
}: {
  place: PlaceDetail;
  onOpenMap: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { transit } = place;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('placeDetail.location')}</Text>
        {transit && <Text style={styles.summary}>{transit.summary}</Text>}
      </View>

      <View style={styles.mapBox}>
        {/* 미리보기라 지도 조작은 막는다 */}
        <NaverMapView
          style={StyleSheet.absoluteFill}
          initialCamera={{
            latitude: place.lat,
            longitude: place.lng,
            zoom: 16,
          }}
          locale={i18n.language}
          isScrollGesturesEnabled={false}
          isZoomGesturesEnabled={false}
          isTiltGesturesEnabled={false}
          isRotateGesturesEnabled={false}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowCompass={false}
          isShowIndoorLevelPicker={false}
          isShowLocationButton={false}
        >
          <NaverMapMarkerOverlay
            latitude={place.lat}
            longitude={place.lng}
            tintColor={colors.brand.primary}
          />
        </NaverMapView>

        {transit && (
          <View style={styles.station}>
            <View style={styles.stationInfo}>
              <View
                style={[styles.line, { backgroundColor: transit.lineColor }]}
              >
                <Text style={styles.lineText}>{transit.line}</Text>
              </View>
              <Text style={styles.stationText} numberOfLines={1}>
                {transit.station}
              </Text>
            </View>
            <Pressable
              style={styles.viewMap}
              onPress={onOpenMap}
              accessibilityRole="button"
            >
              <Text style={[typography.bodySubtle, styles.brand]}>
                {t('placeDetail.viewMap')}
              </Text>
              <ChevronRightIcon
                width={20}
                height={20}
                color={colors.brand.primary}
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { ...typography.titleBase, color: colors.text.label },
  summary: { ...typography.bodyStrong, color: colors.text.muted },
  mapBox: {
    height: 176,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface.subtle,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  station: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  stationInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  lineText: { ...typography.captionBase, color: colors.surface.default },
  stationText: {
    ...typography.bodyStrong,
    flexShrink: 1,
    color: colors.text.label,
  },
  viewMap: { flexDirection: 'row', alignItems: 'center' },
  brand: { color: colors.brand.primary },
});
