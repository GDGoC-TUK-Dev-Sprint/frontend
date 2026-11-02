import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ImageCredit from '../../components/ImageCredit';
import CameraIcon from '../../assets/icons/camera.svg';
import type { PlacePhoto } from '../../mocks';
import { colors, fontFamily } from '../../theme/tokens';

const HEIGHT = 288;

// ① 사진 넘겨보기 + 출처 문구 (R-C52)
// R-K11: Type3 사진은 자르지 않고(contain) 원본 그대로 보여준다. 개수·점 표시는 사진 위의 UI라 사진을 가공하지 않는다
export default function PhotoSwiper({ photos }: { photos: PlacePhoto[] }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View>
      <View style={styles.visual}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
        >
          {photos.map((photo, i) => (
            <Image
              key={i}
              source={photo.source}
              resizeMode={photo.copyright === 'Type3' ? 'contain' : 'cover'}
              style={{ width, height: HEIGHT }}
            />
          ))}
        </ScrollView>
        <View style={styles.gradient} pointerEvents="none" />

        <View style={styles.counter}>
          <CameraIcon width={11.667} height={10.5} />
          <Text style={styles.counterText}>
            {t('placeDetail.photoCount', {
              index: index + 1,
              total: photos.length,
            })}
          </Text>
        </View>

        {photos.length > 1 && (
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
      {/* Figma는 Noto Sans KR Medium. 앱 폰트(Pretendard)로 맞춤 */}
      <ImageCredit align="right" style={styles.credit} />
    </View>
  );
}

const styles = StyleSheet.create({
  credit: { paddingTop: 6, paddingHorizontal: 16 },
  visual: { height: HEIGHT, backgroundColor: '#EEEEEE' }, // Figma 값
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 50%, rgba(0,0,0,0.2))',
  },
  // Figma는 배경 블러(6px)가 있지만 RN에 backdrop 블러가 없어 반투명 배경만 둔다
  counter: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // Figma는 Inter. 앱 폰트로 맞춤
  counterText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.surface.default,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
});
