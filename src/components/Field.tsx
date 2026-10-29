import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/tokens';

// 입력 항목: 왼쪽 라벨 + 오른쪽 안내 + 아래 내용 (Figma 「02 조건 입력」)
type Props = {
  label: string;
  hint: string;
  children: React.ReactNode;
};

export default function Field({ label, hint, children }: Props) {
  return (
    <View style={styles.field}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { ...typography.bodyBase, color: colors.text.label },
  hint: { ...typography.captionBase, color: colors.text.muted },
});
