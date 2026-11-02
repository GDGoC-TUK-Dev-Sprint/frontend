import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily } from '../theme/tokens';

// 한국관광공사 이미지 출처 문구. TourAPI 사진을 보여주는 화면에는 꼭 둔다 (rule.md R-C52)
export default function ImageCredit({
  align = 'left',
  style,
}: {
  align?: 'left' | 'right';
  style?: StyleProp<TextStyle>;
}) {
  const { t } = useTranslation();
  return (
    <Text style={[styles.text, { textAlign: align }, style]}>
      {t('common.imageSource')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.text.caption,
  },
});
