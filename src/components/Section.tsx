import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, typography } from '../theme/tokens';

// Figma 「02 조건 입력」의 번호 붙은 카드: 번호 + 제목 (+ 필수 배지) + 구분선 + 내용
type Props = {
  number: number;
  title: string;
  subtitle?: string; // 제목 아래 안내 (번호 너비만큼 들여씀)
  requiredLabel?: string; // 있으면 오른쪽에 "필수 입력" 배지
  children: React.ReactNode;
};

export default function Section({
  number,
  title,
  subtitle,
  requiredLabel,
  children,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{number}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          {requiredLabel && (
            <View style={styles.required}>
              <Text style={styles.requiredText}>{requiredLabel}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
  },
  header: { gap: 3 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  number: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.brand.primary,
  },
  numberText: { ...typography.captionBase, color: colors.surface.default },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.strong,
  },
  subtitle: {
    ...typography.captionBase,
    paddingLeft: 28,
    color: colors.text.muted,
  },
  required: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primarySoft,
  },
  requiredText: { ...typography.captionBase, color: colors.brand.primary },
  // Figma는 구분선이 섹션 간격 안쪽으로 4px 올라가 있다
  divider: {
    height: 1,
    marginVertical: -4,
    backgroundColor: colors.border.divider,
  },
});
