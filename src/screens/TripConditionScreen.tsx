import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import DateRangeModal from '../components/DateRangeModal';
import LodgingSearchSheet from '../components/LodgingSearchSheet';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import CheckIcon from '../assets/icons/check.svg';
import { mockMetaOptions } from '../mocks';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { useTripCondition } from './tripCondition/useTripCondition';
import ConditionIntro from './tripCondition/ConditionIntro';
import BudgetThemeSection from './tripCondition/BudgetThemeSection';
import ScheduleSection from './tripCondition/ScheduleSection';
import BasicInfoSection from './tripCondition/BasicInfoSection';

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

        <BasicInfoSection form={form} />

        <ScheduleSection form={form} />

        <BudgetThemeSection form={form} themes={themes} />
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

  selectText: { ...typography.bodyBase, color: colors.text.strong },
  flag: { fontSize: 18, marginRight: 8 },

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
