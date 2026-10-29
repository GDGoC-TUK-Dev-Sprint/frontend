import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import DateRangeModal, { type DateRange } from '../components/DateRangeModal';
import LodgingSearchSheet from '../components/LodgingSearchSheet';
import TextField from '../components/TextField';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import BedIcon from '../assets/icons/bed.svg';
import CalendarSolidIcon from '../assets/icons/calendar-solid.svg';
import CheckIcon from '../assets/icons/check.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import EffectIcon from '../assets/icons/effect.svg';
import HelpIcon from '../assets/icons/help.svg';
import MinusIcon from '../assets/icons/minus.svg';
import PenIcon from '../assets/icons/pen.svg';
import PinIcon from '../assets/icons/pin.svg';
import PlaneIcon from '../assets/icons/plane.svg';
import PlusSmallIcon from '../assets/icons/plus-small.svg';
import {
  mockMetaOptions,
  type Area,
  type Country,
  type Lodging,
} from '../mocks';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { formatDateRange, nightsBetween } from '../utils/date';

// Figma 「02 조건 입력」 (spec F1). 선택지는 GET /api/meta/options 더미
// TODO: 메인에서 들어오는 버튼은 디자이너가 정한 뒤 연결
// TODO: 추천 모드 "상관없음" 토글은 Figma에 없어 넣지 않음 (spec Q14)

// 1인 희망 예산 프리셋 (원, spec F1-6)
const BUDGET_PRESETS = [300000, 500000, 1000000];
// TODO: Figma에 인원 상한이 없다. 기존 안 10명 (spec F1-5 확인 필요)
const MAX_TRAVELERS = 10;

// 숙소는 검색으로 고른 숙소 또는 "아직 못 정함"(지역 선택은 선택 사항)
type Stay =
  | { kind: 'lodging'; lodging: Lodging }
  | { kind: 'undecided'; area?: Area };

export default function TripConditionScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // TODO: GET /api/meta/options 연동
  const { countries, themes, areas } = mockMetaOptions;

  const [country, setCountry] = useState<Country>();
  const [stay, setStay] = useState<Stay>();
  const [dates, setDates] = useState<DateRange>();
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState<number>();
  const [customBudget, setCustomBudget] = useState(false);
  const [themeCodes, setThemeCodes] = useState<string[]>([]);
  const [sheet, setSheet] = useState<'country' | 'lodging' | 'dates'>();
  const closeSheet = () => setSheet(undefined);

  const canSubmit = !!country && !!stay && !!dates && themeCodes.length > 0;

  const toggleTheme = (code: string) =>
    setThemeCodes(codes =>
      codes.includes(code) ? codes.filter(c => c !== code) : [...codes, code],
    );

  // "2박 3일", 같은 날이면 "당일치기"
  const nights = dates && nightsBetween(dates.start, dates.end);
  const nightsLabel = nights
    ? t('condition.nights', { nights, days: nights + 1 })
    : t('condition.dayTrip');

  const stayTitle =
    stay?.kind === 'lodging'
      ? stay.lodging.name
      : stay?.area
      ? t('condition.areaCenter', { area: stay.area.name })
      : t('condition.lodgingPlaceholder');

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Badge
            label={t('condition.badge')}
            tone="highlight"
            icon={EffectIcon}
          />
          <Text style={styles.heading}>{t('condition.heading')}</Text>
          <Text style={styles.description}>{t('condition.description')}</Text>
        </View>

        {/* ① 기본 정보 */}
        <Section number={1} title={t('condition.basicInfo')} required>
          <Field
            label={t('condition.country')}
            hint={t('condition.countryHint')}
          >
            <Pressable
              style={styles.select}
              onPress={() => setSheet('country')}
              accessibilityRole="button"
            >
              <View style={styles.row}>
                {country && <Text style={styles.flag}>{country.flag}</Text>}
                <Text style={[styles.selectText, !country && styles.muted]}>
                  {country
                    ? `${country.name} (${country.nameEn})`
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
              onPress={() => setSheet('lodging')}
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
                    {stayTitle}
                  </Text>
                  {!stay && <View style={styles.dot} />}
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
              onPress={() => setStay({ kind: 'undecided' })}
              accessibilityRole="radio"
              accessibilityState={{ checked: stay?.kind === 'undecided' }}
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
                checked={stay?.kind === 'undecided'}
                emptyColor={colors.text.subtle}
              />
            </Pressable>
          </View>
        </Section>

        {/* ② 일정 & 동반 인원 */}
        <Section number={2} title={t('condition.schedule')}>
          <Pressable
            style={styles.dateCard}
            onPress={() => setSheet('dates')}
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
                  {dates
                    ? formatDateRange(dates.start, dates.end)
                    : t('condition.datePlaceholder')}
                </Text>
                {dates && <Text style={styles.nights}>{nightsLabel}</Text>}
              </View>
            </View>
            <View style={styles.row}>
              <Text
                style={[typography.bodySubtle, { color: colors.brand.primary }]}
              >
                {dates ? t('condition.change') : t('condition.select')}
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
            <View style={styles.stepper}>
              <Pressable
                style={[
                  styles.stepButton,
                  styles.minus,
                  travelers <= 1 && styles.disabled,
                ]}
                onPress={() => setTravelers(n => n - 1)}
                disabled={travelers <= 1}
                accessibilityRole="button"
                accessibilityLabel={t('condition.decrease')}
              >
                <MinusIcon
                  width={10.5}
                  height={1.5}
                  color={colors.icon.strong}
                />
              </Pressable>
              <Text style={styles.count}>
                {t('condition.travelerCount', { count: travelers })}
              </Text>
              <Pressable
                style={[
                  styles.stepButton,
                  styles.plus,
                  travelers >= MAX_TRAVELERS && styles.disabled,
                ]}
                onPress={() => setTravelers(n => n + 1)}
                disabled={travelers >= MAX_TRAVELERS}
                accessibilityRole="button"
                accessibilityLabel={t('condition.increase')}
              >
                <PlusSmallIcon
                  width={10.5}
                  height={10.5}
                  color={colors.surface.default}
                />
              </Pressable>
            </View>
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
                  selected={!customBudget && budget === amount}
                  onPress={() => {
                    setCustomBudget(false);
                    setBudget(amount);
                  }}
                />
              ))}
              <BudgetChip
                label={t('condition.budgetCustom')}
                icon
                selected={customBudget}
                onPress={() => {
                  setCustomBudget(true);
                  setBudget(undefined);
                }}
              />
            </View>
            {customBudget && (
              <TextField
                value={budget ? String(budget) : ''}
                onChangeText={text => {
                  const n = Number(text.replace(/\D/g, ''));
                  setBudget(n > 0 ? n : undefined);
                }}
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
                const selected = themeCodes.includes(theme.code);
                return (
                  <Pressable
                    key={theme.code}
                    style={[styles.theme, selected && styles.themeSelected]}
                    onPress={() => toggleTheme(theme.code)}
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
          disabled={!canSubmit}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow={canSubmit}
        />
      </View>

      <BottomSheet
        visible={sheet === 'country'}
        title={t('condition.country')}
        onClose={closeSheet}
        height="auto"
      >
        <ScrollView contentContainerStyle={styles.countryList}>
          {countries.map(c => (
            <Pressable
              key={c.code}
              style={styles.countryRow}
              onPress={() => {
                setCountry(c);
                closeSheet();
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: c.code === country?.code }}
            >
              <Text style={styles.flag}>{c.flag}</Text>
              <Text style={[styles.selectText, styles.flex]}>
                {`${c.name} (${c.nameEn})`}
              </Text>
              {c.code === country?.code && (
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
        visible={sheet === 'lodging'}
        onClose={closeSheet}
        areas={areas}
        selectedLodgingId={
          stay?.kind === 'lodging' ? stay.lodging.id : undefined
        }
        selectedAreaCode={
          stay?.kind === 'undecided' ? stay.area?.code : undefined
        }
        onSelectLodging={lodging => {
          setStay({ kind: 'lodging', lodging });
          closeSheet();
        }}
        onSelectArea={area => {
          setStay({ kind: 'undecided', area });
          closeSheet();
        }}
      />

      <DateRangeModal
        visible={sheet === 'dates'}
        initial={dates}
        onApply={range => {
          setDates(range);
          closeSheet();
        }}
        onClose={closeSheet}
      />
    </View>
  );
}

function Section({
  number,
  title,
  subtitle,
  required,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.row, styles.gap8]}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{number}</Text>
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {required && (
            <View style={styles.required}>
              <Text
                style={[
                  typography.captionBase,
                  { color: colors.brand.primary },
                ]}
              >
                {t('condition.required')}
              </Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={[typography.bodyBase, { color: colors.text.label }]}>
          {label}
        </Text>
        <Text style={[typography.captionBase, { color: colors.text.muted }]}>
          {hint}
        </Text>
      </View>
      {children}
    </View>
  );
}

function BudgetChip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const color = selected ? colors.surface.default : colors.text.muted;
  return (
    <Pressable
      style={[styles.budgetChip, selected && styles.budgetChipSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      {icon && <PenIcon width={20} height={20} color={color} />}
      <Text style={[typography.bodySubtle, { color }]}>{label}</Text>
    </Pressable>
  );
}

// 테마 타일·숙소 미정 카드의 선택 표시
function CheckCircle({
  checked,
  emptyColor = colors.surface.subtle,
}: {
  checked: boolean;
  emptyColor?: string;
}) {
  return checked ? (
    <View style={[styles.circle, styles.circleChecked]}>
      <CheckIcon width={12.8} height={12.8} color={colors.surface.default} />
    </View>
  ) : (
    <View style={[styles.circle, { borderColor: emptyColor }]} />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  muted: { color: colors.text.muted },
  disabled: { opacity: 0.4 },

  intro: { alignItems: 'flex-start', gap: 10 },
  heading: { ...typography.titleStrong, color: colors.text.strong },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -6, // Figma 제목과 설명 간격 4
    color: colors.text.muted,
  },

  section: {
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: { gap: 3 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  number: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.brand.primary,
  },
  numberText: { ...typography.captionBase, color: colors.surface.default },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.strong,
  },
  sectionSubtitle: {
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
  // Figma는 구분선이 섹션 간격 안쪽으로 4px 올라가 있다
  sectionDivider: {
    height: 1,
    marginVertical: -4,
    backgroundColor: colors.border.divider,
  },

  field: { gap: 6 },
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 132,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: colors.surface.subtle,
  },
  stepButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  minus: { backgroundColor: colors.surface.default },
  plus: { backgroundColor: colors.brand.primary },
  count: { ...typography.bodyStrong, color: colors.text.emphasis },

  subLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.text.label,
  },
  budget: { gap: 10 },
  budgetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  budgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  budgetChipSelected: { backgroundColor: colors.brand.primary },
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
  circle: { width: 16, height: 16, borderWidth: 1, borderRadius: 999 },
  circleChecked: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: colors.brand.primary,
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
