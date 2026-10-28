import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

// Figma 「Badge」 컴포넌트. 경비 절약·초과, 장소 정보 등에 쓰는 26px 알약 모양
// highlight는 아이콘이 붙는 강조 배지(예: 데이터 기반 맞춤 추천)
type Tone = 'brand' | 'negative' | 'muted' | 'neutral' | 'highlight';

const TONES: Record<Tone, { bg: string; text: string }> = {
  brand: { bg: colors.brand.surfaceSubtle, text: colors.brand.primary },
  negative: { bg: colors.surface.negativeSoft, text: colors.text.negative },
  muted: { bg: colors.surface.subtle, text: colors.text.muted },
  neutral: { bg: colors.surface.subtle, text: colors.text.base },
  highlight: { bg: colors.brand.primarySoft, text: colors.brand.primary },
};

export default function Badge({
  label,
  tone = 'brand',
  icon: Icon,
}: {
  label: string;
  tone?: Tone;
  icon?: React.FC<SvgProps>;
}) {
  const { bg, text } = TONES[tone];
  const highlight = tone === 'highlight';

  return (
    <View
      style={[
        styles.base,
        highlight && styles.highlight,
        { backgroundColor: bg },
      ]}
    >
      {Icon && <Icon width={20} height={20} color={text} />}
      <Text
        style={[
          highlight ? typography.bodySubtle : typography.captionBase,
          { color: text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// 장소 상세(Figma 07) 「방문 정보」의 운영 상태. 예: "운영 중 · 18:00에 입장마감"
// TODO: Figma에는 운영 중만 있음. closed 색은 임시값이라 디자이너 확인 후 수정
export function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: 'open' | 'closed';
}) {
  const color = status === 'open' ? colors.brand.primary : colors.text.muted;
  return (
    <View style={styles.status}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[typography.bodyStrong, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 9999 },
  base: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  highlight: { gap: 4, paddingHorizontal: 10 },
});
