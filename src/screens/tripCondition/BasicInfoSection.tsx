import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CheckCircle from '../../components/CheckCircle';
import Field from '../../components/Field';
import Section from '../../components/Section';
import BedIcon from '../../assets/icons/bed.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import HelpIcon from '../../assets/icons/help.svg';
import PinIcon from '../../assets/icons/pin.svg';
import PlaneIcon from '../../assets/icons/plane.svg';
import { colors, typography } from '../../theme/tokens';
import type { TripConditionForm } from './useTripCondition';

// ① 기본 정보: 출발 국가, 서울 고정 표시, 숙소 선택 / 숙소 미정 (spec F1-1~F1-3)
export default function BasicInfoSection({
  form,
}: {
  form: TripConditionForm;
}) {
  const { t } = useTranslation();
  return (
    <Section
      number={1}
      title={t('condition.basicInfo')}
      requiredLabel={t('condition.required')}
    >
      <Field label={t('condition.country')} hint={t('condition.countryHint')}>
        <Pressable
          style={styles.select}
          onPress={() => form.openPicker('country')}
          accessibilityRole="button"
        >
          <View style={styles.row}>
            {form.country && (
              <Text style={styles.flag}>{form.country.flag}</Text>
            )}
            <Text style={[styles.selectText, !form.country && styles.muted]}>
              {form.country
                ? `${form.country.name} (${form.country.nameEn})`
                : t('condition.countryPlaceholder')}
            </Text>
          </View>
          <ChevronRightIcon
            width={16}
            height={16}
            color={colors.text.muted}
            style={styles.down}
          />
        </Pressable>
      </Field>

      <Field label={t('condition.region')} hint={t('condition.regionHint')}>
        <View style={styles.select}>
          <View style={[styles.row, styles.gap4]}>
            <PinIcon width={16} height={16} color={colors.brand.primary} />
            <Text style={styles.selectText}>{t('condition.seoul')}</Text>
          </View>
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('condition.seoulOnly')}
          </Text>
        </View>
      </Field>

      <View style={styles.lodging}>
        <View style={styles.fieldHeader}>
          <Text style={[typography.bodySubtle, { color: colors.text.label }]}>
            {t('condition.lodgingQuestion')}
          </Text>
          {/* TODO: 지도에서 선택(02b). 네이버 지도 SDK 연동 이슈에서 구현 */}
          <Pressable style={styles.mapLink} accessibilityRole="button">
            <PlaneIcon width={16} height={16} color={colors.brand.primary} />
            <Text
              style={[typography.bodySubtle, { color: colors.brand.primary }]}
            >
              {t('condition.selectOnMap')}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.lodgingCard}
          onPress={() => form.openPicker('lodging')}
          accessibilityRole="button"
        >
          <View style={styles.bed}>
            <BedIcon width={24} height={24} color={colors.surface.default} />
          </View>
          <View style={styles.flex}>
            <View style={[styles.row, styles.gap4]}>
              <Text style={styles.lodgingTitle} numberOfLines={1}>
                {form.stayTitle}
              </Text>
              {!form.stay && <View style={styles.dot} />}
            </View>
            <Text
              style={[typography.captionBase, { color: colors.text.subtle }]}
            >
              {t('condition.lodgingSubtitle')}
            </Text>
          </View>
          <ChevronRightIcon
            width={20}
            height={20}
            color={colors.brand.primary}
          />
        </Pressable>

        <Pressable
          style={styles.undecided}
          onPress={form.chooseUndecided}
          accessibilityRole="radio"
          accessibilityState={{ checked: form.stay?.kind === 'undecided' }}
        >
          <View style={styles.helpIcon}>
            <HelpIcon width={24} height={24} color={colors.text.muted} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.bodySubtle, { color: colors.text.base }]}>
              {t('condition.undecided')}
            </Text>
            <Text
              style={[typography.captionBase, { color: colors.text.subtle }]}
            >
              {t('condition.undecidedSubtitle')}
            </Text>
          </View>
          <CheckCircle
            checked={form.stay?.kind === 'undecided'}
            emptyColor={colors.text.subtle}
          />
        </Pressable>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gap4: { gap: 4 },
  muted: { color: colors.text.muted },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  selectText: { ...typography.bodyBase, color: colors.text.strong },
  flag: { fontSize: 18, marginRight: 8 },
  down: { transform: [{ rotate: '90deg' }] },
  lodging: { gap: 8 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  lodgingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.brand.primarySoft,
    borderRadius: 12,
    backgroundColor: colors.brand.surfaceSubtle,
    boxShadow: '0px 2px 4px rgba(0, 120, 255, 0.06)',
  },
  bed: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.brand.primary,
  },
  lodgingTitle: {
    ...typography.bodyStrong,
    flexShrink: 1,
    color: colors.brand.primary,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
    backgroundColor: colors.brand.primary,
  },
  undecided: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  helpIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
