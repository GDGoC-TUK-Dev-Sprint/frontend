import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Badge from '../../components/Badge';
import EffectIcon from '../../assets/icons/effect.svg';
import { colors, fontFamily, typography } from '../../theme/tokens';

// 조건 입력 맨 위: "데이터 기반 맞춤 추천" 배지 + 제목 + 설명
export default function ConditionIntro() {
  const { t } = useTranslation();
  return (
    <View style={styles.intro}>
      <Badge label={t('condition.badge')} tone="highlight" icon={EffectIcon} />
      <Text style={styles.heading}>{t('condition.heading')}</Text>
      <Text style={styles.description}>{t('condition.description')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'flex-start', gap: 10 },
  heading: { ...typography.titleStrong, color: colors.text.strong },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -6, // Figma 제목과 설명 간격 4
    color: colors.text.muted,
  },
});
