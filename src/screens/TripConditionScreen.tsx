import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import DateRangeModal from '../components/DateRangeModal';
import LodgingSearchSheet from '../components/LodgingSearchSheet';
import StateView from '../components/StateView';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import CheckIcon from '../assets/icons/check.svg';
import { ApiError } from '../api/client';
import { createTrip, getMetaOptions, type MetaOptions } from '../api/trips';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import { flagEmoji } from '../utils/text';
import { useTripCondition } from './tripCondition/useTripCondition';
import ConditionIntro from './tripCondition/ConditionIntro';
import BasicInfoSection from './tripCondition/BasicInfoSection';
import ScheduleSection from './tripCondition/ScheduleSection';
import BudgetThemeSection from './tripCondition/BudgetThemeSection';

// Figma 「02 조건 입력」 (spec F1). 선택지는 GET /api/meta/options, 만들기는 POST /api/trips
// 구역은 tripCondition/ 폴더, 입력 상태는 useTripCondition 훅. 이 파일은 배치와 선택 창(시트·달력)만 맡는다
// TODO: 추천 모드 "상관없음" 토글은 Figma에 없어 넣지 않음 (spec Q14)

type Props = NativeStackScreenProps<RootStackParamList, 'TripCondition'>;

export default function TripConditionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { setTrip } = useTrip();
  const insets = useSafeAreaInsets();
  const form = useTripCondition();
  const [options, setOptions] = useState<MetaOptions>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOptions = useCallback(() => {
    setLoadFailed(false);
    getMetaOptions()
      .then(setOptions)
      .catch(() => setLoadFailed(true));
  }, []);
  useEffect(loadOptions, [loadOptions]);

  // 서버에 여행을 만든 뒤 장소 선택(02c)으로 간다. 뒤로 가면 조건 입력이 아니라 메인으로 돌아간다
  // TODO: 메인 티켓에는 확정한 여행만 나와야 한다(F4-10). 확정 흐름이 생기기 전까지는 만든 여행을 바로 저장한다
  const submit = async () => {
    const body = form.toRequest();
    if (!body) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setTrip(form.toTrip(await createTrip(body)));
      navigation.replace('PlaceSelect');
    } catch (e) {
      // 끝나지 않은 확정 여행은 하나만 둔다. 삭제 버튼은 여행 삭제 API(31)가 생기면 붙인다
      const active = e instanceof ApiError && e.code === 'ACTIVE_TRIP_EXISTS';
      setSubmitError(
        t(active ? 'condition.activeTripExists' : 'auth.networkError'),
      );
      setSubmitting(false);
    }
  };

  if (!options) {
    return loadFailed ? (
      <StateView
        type="error"
        message={t('auth.networkError')}
        retryLabel={t('common.retry')}
        onRetry={loadOptions}
      />
    ) : (
      <StateView type="loading" />
    );
  }
  const { nationalities, categories: themes, areas } = options;

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
        {submitError && <Text style={styles.error}>{submitError}</Text>}
        <Button
          label={t('condition.submit')}
          onPress={submit}
          disabled={!form.canSubmit || submitting}
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
          {nationalities.map(c => (
            <Pressable
              key={c.code}
              style={styles.countryRow}
              onPress={() => form.selectCountry(c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: c.code === form.country?.code }}
            >
              <Text style={styles.flag}>{flagEmoji(c.code)}</Text>
              <Text style={[styles.selectText, styles.flex]}>{c.name}</Text>
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
          form.stay?.kind === 'lodging' ? form.stay.lodging.placeId : undefined
        }
        selectedAreaCode={
          form.stay?.kind === 'area' ? form.stay.area.code : undefined
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

  error: {
    ...typography.bodySubtle,
    color: colors.text.negative,
    textAlign: 'center',
    marginBottom: 8,
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
