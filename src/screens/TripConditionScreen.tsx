import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../components/BottomSheet';
import BudgetChip from '../components/BudgetChip';
import Button from '../components/Button';
import CheckCircle from '../components/CheckCircle';
import DateRangeModal from '../components/DateRangeModal';
import Field from '../components/Field';
import LodgingSearchSheet from '../components/LodgingSearchSheet';
import Section from '../components/Section';
import Stepper from '../components/Stepper';
import TextField from '../components/TextField';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import BedIcon from '../assets/icons/bed.svg';
import CalendarSolidIcon from '../assets/icons/calendar-solid.svg';
import CheckIcon from '../assets/icons/check.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import HelpIcon from '../assets/icons/help.svg';
import PinIcon from '../assets/icons/pin.svg';
import PlaneIcon from '../assets/icons/plane.svg';
import { mockMetaOptions } from '../mocks';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { formatDateRange } from '../utils/date';
import {
  BUDGET_PRESETS,
  MAX_TRAVELERS,
  MIN_TRAVELERS,
  useTripCondition,
} from './tripCondition/useTripCondition';
import ConditionIntro from './tripCondition/ConditionIntro';

// Figma 「02 조건 입력」 (spec F1). 선택지는 GET /api/meta/options 더미
// TODO: 메인에서 들어오는 버튼은 디자이너가 정한 뒤 연결
// TODO: 추천 모드 "상관없음" 토글은 Figma에 없어 넣지 않음 (spec Q14)

export default function TripConditionScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // TODO: GET /api/meta/options 연동
  const { countries, themes, areas } = mockMetaOptions;
  const form = useTripCondition();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ConditionIntro />

        {/* ① 기본 정보 */}
        <Section
          number={1}
          title={t('condition.basicInfo')}
          requiredLabel={t('condition.required')}
        >
          <Field
            label={t('condition.country')}
            hint={t('condition.countryHint')}
          >
            <Pressable
              style={styles.select}
              onPress={() => form.openPicker('country')}
              accessibilityRole="button"
            >
              <View style={styles.row}>
                {form.country && (
                  <Text style={styles.flag}>{form.country.flag}</Text>
                )}
                <Text
                  style={[styles.selectText, !form.country && styles.muted]}
                >
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
              <Text
                style={[typography.bodySubtle, { color: colors.text.muted }]}
              >
                {t('condition.seoulOnly')}
              </Text>
            </View>
          </Field>

          <View style={styles.lodging}>
            <View style={styles.fieldHeader}>
              <Text
                style={[typography.bodySubtle, { color: colors.text.label }]}
              >
                {t('condition.lodgingQuestion')}
              </Text>
              {/* TODO: 지도에서 선택(02b). 네이버 지도 SDK 연동 이슈에서 구현 */}
              <Pressable style={styles.mapLink} accessibilityRole="button">
                <PlaneIcon
                  width={16}
                  height={16}
                  color={colors.brand.primary}
                />
                <Text
                  style={[
                    typography.bodySubtle,
                    { color: colors.brand.primary },
                  ]}
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
                <BedIcon
                  width={24}
                  height={24}
                  color={colors.surface.default}
                />
              </View>
              <View style={styles.flex}>
                <View style={[styles.row, styles.gap4]}>
                  <Text style={styles.lodgingTitle} numberOfLines={1}>
                    {form.stayTitle}
                  </Text>
                  {!form.stay && <View style={styles.dot} />}
                </View>
                <Text
                  style={[
                    typography.captionBase,
                    { color: colors.text.subtle },
                  ]}
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
                <Text
                  style={[typography.bodySubtle, { color: colors.text.base }]}
                >
                  {t('condition.undecided')}
                </Text>
                <Text
                  style={[
                    typography.captionBase,
                    { color: colors.text.subtle },
                  ]}
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

        {/* ② 일정 & 동반 인원 */}
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
                <Text
                  style={[typography.bodyBase, { color: colors.text.strong }]}
                >
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
              <Text
                style={[typography.bodyStrong, { color: colors.text.strong }]}
              >
                {t('condition.travelers')}
              </Text>
              <Text
                style={[typography.bodySubtle, { color: colors.text.muted }]}
              >
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

        {/* ③ 희망 예산 & 여행 테마 */}
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
              <Text
                style={[typography.captionBase, { color: colors.text.muted }]}
              >
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
                          color: selected
                            ? colors.text.strong
                            : colors.text.base,
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
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.screenPadding) },
        ]}
      >
        {/* TODO: POST /api/trips 후 장소 선택(02c)으로 이동 */}
        <Button
          label={t('condition.submit')}
          disabled={!form.canSubmit}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow={form.canSubmit}
        />
      </View>

      <BottomSheet
        visible={form.picker === 'country'}
        title={t('condition.country')}
        onClose={form.closePicker}
        height="auto"
      >
        <ScrollView contentContainerStyle={styles.countryList}>
          {countries.map(c => (
            <Pressable
              key={c.code}
              style={styles.countryRow}
              onPress={() => form.selectCountry(c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: c.code === form.country?.code }}
            >
              <Text style={styles.flag}>{c.flag}</Text>
              <Text style={[styles.selectText, styles.flex]}>
                {`${c.name} (${c.nameEn})`}
              </Text>
              {c.code === form.country?.code && (
                <CheckIcon
                  width={20}
                  height={20}
                  color={colors.brand.primary}
                />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>

      <LodgingSearchSheet
        visible={form.picker === 'lodging'}
        onClose={form.closePicker}
        areas={areas}
        selectedLodgingId={
          form.stay?.kind === 'lodging' ? form.stay.lodging.id : undefined
        }
        selectedAreaCode={
          form.stay?.kind === 'undecided' ? form.stay.area?.code : undefined
        }
        onSelectLodging={form.selectLodging}
        onSelectArea={form.selectArea}
      />

      <DateRangeModal
        visible={form.picker === 'dates'}
        initial={form.dates}
        onApply={form.applyDates}
        onClose={form.closePicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gap4: { gap: 4 },
  gap12: { gap: 12 },
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

  footer: {
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },

  countryList: { paddingHorizontal: 16, paddingBottom: 40 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.surface.subtle,
  },
});
