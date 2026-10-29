import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Section from '../../components/Section';
import Stepper from '../../components/Stepper';
import CalendarSolidIcon from '../../assets/icons/calendar-solid.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import { colors, fontFamily, typography } from '../../theme/tokens';
import { formatDateRange } from '../../utils/date';
import {
  MAX_TRAVELERS,
  MIN_TRAVELERS,
  type TripConditionForm,
} from './useTripCondition';

// ② 일정 & 동반 인원: 여행 날짜 카드, 인원 (spec F1-4, F1-5)
export default function ScheduleSection({ form }: { form: TripConditionForm }) {
  const { t } = useTranslation();
  return (
    <Section number={2} title={t('condition.schedule')}>
      <Pressable
        style={styles.dateCard}
        onPress={() => form.openPicker('dates')}
        accessibilityRole="button"
      >
        <View style={[styles.row, styles.gap12]}>
          <View style={styles.dateIcon}>
            <CalendarSolidIcon
              width={15}
              height={16.667}
              color={colors.brand.primary}
            />
          </View>
          <View>
            <Text style={[typography.bodyBase, { color: colors.text.strong }]}>
              {form.dates
                ? formatDateRange(form.dates.start, form.dates.end)
                : t('condition.datePlaceholder')}
            </Text>
            {form.dates && (
              <Text style={styles.nights}>{form.nightsLabel}</Text>
            )}
          </View>
        </View>
        <View style={styles.row}>
          <Text
            style={[typography.bodySubtle, { color: colors.brand.primary }]}
          >
            {form.dates ? t('condition.change') : t('condition.select')}
          </Text>
          <ChevronRightIcon
            width={20}
            height={20}
            color={colors.brand.primary}
          />
        </View>
      </Pressable>

      <View style={styles.travelers}>
        <View>
          <Text style={[typography.bodyStrong, { color: colors.text.strong }]}>
            {t('condition.travelers')}
          </Text>
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('condition.travelersHint')}
          </Text>
        </View>
        <Stepper
          value={form.travelers}
          min={MIN_TRAVELERS}
          max={MAX_TRAVELERS}
          onChange={form.setTravelers}
          valueLabel={t('condition.travelerCount', {
            count: form.travelers,
          })}
          decreaseLabel={t('condition.decrease')}
          increaseLabel={t('condition.increase')}
        />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  gap12: { gap: 12 },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface.base,
  },
  dateIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  nights: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.muted,
  },
  travelers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
