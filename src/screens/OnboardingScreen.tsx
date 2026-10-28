import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, shadow, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// Figma 「00 온보딩」 3장. 일러스트 크기는 1장 300, 2·3장 335
const SLIDES = [
  {
    key: 'place',
    image: require('../assets/images/onboarding-1.png'),
    size: 300,
  },
  {
    key: 'route',
    image: require('../assets/images/onboarding-2.png'),
    size: 335,
  },
  {
    key: 'cost',
    image: require('../assets/images/onboarding-3.png'),
    size: 335,
  },
] as const;

// TODO: 온보딩을 본 사용자는 건너뛰기. 기기 저장소 라이브러리 결정 후 구현
export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.title}>
          <Text style={styles.eyebrow}>
            {t(`onboarding.${slide.key}.eyebrow`)}
          </Text>
          <Text style={styles.heading}>
            {t(`onboarding.${slide.key}.heading`)}
          </Text>
        </View>
        <View style={styles.imageArea}>
          <Image
            source={slide.image}
            style={{ width: slide.size, height: slide.size }}
          />
        </View>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: spacing.screenPadding + insets.bottom },
        ]}
      >
        <Button
          label={t(isLast ? 'onboarding.start' : 'onboarding.next')}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow
          onPress={() =>
            isLast ? navigation.replace('Login') : setIndex(index + 1)
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 배경 #FCFEFE (토큰 없음)
  container: { flex: 1, backgroundColor: '#FCFEFE' },
  main: { flex: 1, paddingTop: 105, paddingBottom: 55 },
  title: { alignItems: 'center', gap: 19, paddingHorizontal: 24 },
  // Figma 18 Bold / 28 SemiBold, 행간 1.3 (typography 토큰에 같은 조합 없음)
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.brand.primary,
  },
  heading: {
    fontFamily: fontFamily.semibold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.text.base,
    textAlign: 'center',
  },
  imageArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  // Figma 비활성 점 #E5E8EF (토큰 없음)
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E8EF' },
  dotActive: { width: 24, backgroundColor: colors.brand.primary },
  bottomBar: {
    backgroundColor: colors.surface.default,
    padding: spacing.screenPadding,
    ...shadow.bottomBar,
  },
});
