import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import BudgetChip from '../../components/BudgetChip';
import CheckCircle from '../../components/CheckCircle';
import Section from '../../components/Section';
import TextField from '../../components/TextField';
import type { Theme } from '../../mocks';
import { colors, fontFamily, typography } from '../../theme/tokens';
import { BUDGET_PRESETS, type TripConditionForm } from './useTripCondition';

// ③ 희망 예산 & 여행 테마: 1인 예산 칩·직접입력, 테마 다중 선택 (spec F1-6, F1-7)
export default function BudgetThemeSection({
  form,
  themes,
}: {
  form: TripConditionForm;
  themes: Theme[];
}) {
  const { t } = useTranslation();
  return (
    <Section
      number={3}
      title={t('condition.budgetAndTheme')}
      subtitle={t('condition.budgetNotice')}
    >
      <View style={styles.budget}>
        <Text style={styles.subLabel}>{t('condition.budget')}</Text>
        <View style={styles.budgetChips}>
          {BUDGET_PRESETS.map(amount => (
            <BudgetChip
              key={amount}
              label={t('condition.budgetAmount', {
                man: amount / 10000,
                won: amount.toLocaleString('en-US'),
              })}
              selected={!form.customBudget && form.budget === amount}
              onPress={() => form.selectBudgetPreset(amount)}
            />
          ))}
          <BudgetChip
            label={t('condition.budgetCustom')}
            icon
            selected={form.customBudget}
            onPress={form.startCustomBudget}
          />
        </View>
        {form.customBudget && (
          <TextField
            value={form.budget ? String(form.budget) : ''}
            onChangeText={form.changeCustomBudget}
            placeholder={t('condition.budgetCustomPlaceholder')}
            clearLabel={t('common.clear')}
            keyboardType="number-pad"
          />
        )}
      </View>

      <View style={styles.themesSection}>
        <View style={styles.fieldHeader}>
          <Text style={styles.subLabel}>{t('condition.themes')}</Text>
          <Text style={[typography.captionBase, { color: colors.text.muted }]}>
            {t('condition.multiSelect')}
          </Text>
        </View>
        <View style={styles.themes}>
          {themes.map(theme => {
            const selected = form.themeCodes.includes(theme.code);
            return (
              <Pressable
                key={theme.code}
                style={[styles.theme, selected && styles.themeSelected]}
                onPress={() => form.toggleTheme(theme.code)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                <Text
                  style={[
                    typography.bodySubtle,
                    {
                      color: selected ? colors.text.strong : colors.text.base,
                    },
                  ]}
                >
                  {theme.name}
                </Text>
                <CheckCircle checked={selected} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.text.label,
  },
  budget: { gap: 10 },
  budgetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  themesSection: { gap: 8, paddingTop: 8 },
  themes: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  theme: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
    flexBasis: '40%', // 2열
    height: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  themeSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.surfaceSubtle,
  },
});
