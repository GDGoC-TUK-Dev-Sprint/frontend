import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import CloseIcon from '../../assets/icons/close.svg';
import PinIcon from '../../assets/icons/pin.svg';
import {
  reverseGeo,
  searchGeo,
  type GeoItem,
  type LatLng,
} from '../../api/trips';
import { colors, shadow, spacing, typography } from '../../theme/tokens';

// Figma 「02b 지도에서 선택」 (spec F1-3). 지도 가운데 핀 위치를 숙소로 정한다
// 주소·장소명으로 검색해 지도를 옮기고, 지도가 멈추면 핀 위치의 주소와 서울 여부를 받는다
// TODO: 02b는 10/16 이후 시안이 없다. 배치·문구는 초안 (Figma 확인 필요)
type Props = {
  visible: boolean;
  initial?: LatLng;
  onClose: () => void;
  onSelect: (location: LatLng, address: string) => void;
};

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };
const SEARCH_DELAY_MS = 300;
const PIN = 40;

type Pinned = { location: LatLng; address: string | null; inSeoul: boolean };

export default function StayMapPicker({
  visible,
  initial,
  onClose,
  onSelect,
}: Props) {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<NaverMapViewRef>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoItem[]>([]);
  const [pinned, setPinned] = useState<Pinned>();
  const [checking, setChecking] = useState(false);
  const lastIdle = useRef(0);

  // 입력이 멈춘 뒤 검색한다. 늦게 온 이전 응답은 버린다
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let stale = false;
    const timer = setTimeout(() => {
      searchGeo(q)
        .then(res => !stale && setResults(res.items))
        .catch(() => !stale && setResults([]));
    }, SEARCH_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  // 지도가 멈출 때마다 핀 위치 주소를 받는다. 마지막으로 멈춘 위치의 응답만 쓴다
  const onCameraIdle = ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    const id = ++lastIdle.current;
    const location = { lat: latitude, lng: longitude };
    setChecking(true);
    reverseGeo(location)
      .then(res => id === lastIdle.current && setPinned({ location, ...res }))
      .catch(
        () =>
          id === lastIdle.current &&
          setPinned({ location, address: null, inSeoul: false }),
      )
      .finally(() => id === lastIdle.current && setChecking(false));
  };

  const moveTo = (item: GeoItem) => {
    setQuery('');
    mapRef.current?.animateCameraTo({
      latitude: item.location.lat,
      longitude: item.location.lng,
      zoom: 16,
    });
  };

  const start = initial ?? SEOUL_CITY_HALL;
  const canSelect = !checking && !!pinned?.address && pinned.inSeoul;
  const status = checking
    ? t('lodging.mapChecking')
    : !pinned
    ? t('lodging.mapSubtitle')
    : !pinned.address
    ? t('lodging.mapNoAddress')
    : pinned.address;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior="padding" style={styles.screen}>
          <View style={styles.header}>
            <Text
              style={[typography.bodyStrong, { color: colors.text.strong }]}
            >
              {t('lodging.mapTitle')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <CloseIcon width={24} height={24} color={colors.text.muted} />
            </Pressable>
          </View>

          <View style={styles.search}>
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder={t('lodging.mapSearchPlaceholder')}
              clearLabel={t('common.clear')}
              search
              returnKeyType="search"
            />
          </View>

          <View style={styles.mapArea}>
            <NaverMapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialCamera={{
                latitude: start.lat,
                longitude: start.lng,
                zoom: 15,
              }}
              locale={i18n.language}
              isShowZoomControls={false}
              isShowScaleBar={false}
              isShowIndoorLevelPicker={false}
              onCameraIdle={onCameraIdle}
            />
            {/* 핀 끝이 지도 가운데에 오게 핀 높이만큼 올린다 */}
            <View pointerEvents="none" style={styles.pin}>
              <PinIcon width={PIN} height={PIN} color={colors.brand.primary} />
            </View>

            {results.length > 0 && (
              <ScrollView
                style={styles.results}
                keyboardShouldPersistTaps="handled"
              >
                {results.map((item, i) => (
                  <Pressable
                    key={i}
                    style={styles.result}
                    onPress={() => moveTo(item)}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        typography.bodyStrong,
                        { color: colors.text.base },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        typography.captionBase,
                        { color: colors.text.subtle },
                      ]}
                    >
                      {item.address}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
              {status}
            </Text>
            {!checking && pinned?.address && !pinned.inSeoul && (
              <Text style={[typography.bodySubtle, styles.warning]}>
                {t('lodging.mapOutsideSeoul')}
              </Text>
            )}
            <Button
              label={t('lodging.mapConfirm')}
              disabled={!canSelect}
              onPress={() =>
                pinned?.address && onSelect(pinned.location, pinned.address)
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.default },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
  },
  search: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 12,
  },
  mapArea: { flex: 1 },
  pin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -PIN / 2,
    marginTop: -PIN,
  },
  results: {
    position: 'absolute',
    top: 0,
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    maxHeight: 280,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  result: {
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.line,
  },
  footer: {
    gap: 8,
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
  },
  warning: { color: colors.text.negative },
});
