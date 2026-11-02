import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import PlaceCard from '../components/PlaceCard';
import StateView from '../components/StateView';
import TextField from '../components/TextField';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import EffectIcon from '../assets/icons/effect.svg';
import WarningIcon from '../assets/icons/warning.svg';
import { mockMetaOptions, searchMockCandidates } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { nightsBetween, parseDate } from '../utils/date';
import ConditionCard from './placeSelect/ConditionCard';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceSelect'>;

const PAGE_SIZE = 5; // spec F2-11
const MAX_PER_DAY = 6; // spec F2-10, F3-1
// Figma 값, 토큰에 없음
const INFO_TEXT = '#64748B';
const SOURCE_TEXT = '#737A87';

// Figma 「02c 장소 선택」 (spec F2). 후보는 GET /api/trips/{tripId}/candidates 더미
export default function PlaceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trip } = useTrip();
  const [query, setQuery] = useState('');
  const [themeCode, setThemeCode] = useState<string>(); // 없으면 전체
  const [page, setPage] = useState(1);
  // 담은 장소. 저장 API 없이 동선 만들기 요청에 담아 보낸다 (F2-12)
  // TODO: 장소 상세의 「일정에 담기」와 같은 목록이다. 동선 만들기 연동 때 공용 상태로 옮긴다
  const [picked, setPicked] = useState<string[]>([]);

  if (!trip) {
    return <StateView type="empty" message={t('placeSelect.noTrip')} />;
  }

  // TODO: GET /api/meta/options 연동
  const themes = mockMetaOptions.themes.filter(theme =>
    trip.themeCodes.includes(theme.code),
  );
  const days =
    nightsBetween(parseDate(trip.startDate), parseDate(trip.endDate)) + 1;
  const range = { min: days * 3, max: days * 5 }; // 권장 = 일수 × 3~5곳

  const results = searchMockCandidates(query, themeCode);
  const totalPages = Math.max(Math.ceil(results.length / PAGE_SIZE), 1);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // 검색어·카테고리가 바뀌면 첫 페이지부터
  const changeFilter = (next: () => void) => {
    next();
    setPage(1);
  };

  const togglePick = (placeId: string) =>
    setPicked(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId],
    );

  // TODO: POST /api/trips/{tripId}/route(API 21)에 picked를 담아 보내고, 응답 동선으로 동선 화면을 그린다
  const makeRoute = () => navigation.navigate('Route');

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Badge
            label={t('placeSelect.badge')}
            tone="highlight"
            icon={EffectIcon}
          />
          <Text style={styles.heading}>{t('placeSelect.title')}</Text>
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('placeSelect.description')}
          </Text>
        </View>

        {/* TODO: 「변경」은 조건 입력을 지금 조건으로 채워 열고 PUT /api/trips/{tripId}(API 19)로 저장한다. 지금은 빈 조건 입력을 연다 */}
        <ConditionCard
          trip={trip}
          themes={themes}
          onChange={() => navigation.navigate('TripCondition')}
        />

        <View style={styles.filters}>
          <TextField
            value={query}
            onChangeText={text => changeFilter(() => setQuery(text))}
            placeholder={t('placeSelect.searchPlaceholder')}
            clearLabel={t('common.clear')}
            search
            returnKeyType="search"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              label={t('placeSelect.all')}
              selected={!themeCode}
              onPress={() => changeFilter(() => setThemeCode(undefined))}
            />
            {themes.map(theme => (
              <Chip
                key={theme.code}
                label={theme.name}
                selected={themeCode === theme.code}
                onPress={() => changeFilter(() => setThemeCode(theme.code))}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.info}>
          <WarningIcon width={20} height={20} color={INFO_TEXT} />
          <Text style={styles.infoText}>
            {t('placeSelect.recommendInfo', {
              days,
              ...range,
              perDay: MAX_PER_DAY,
            })}
          </Text>
        </View>

        {/* R-C52 출처 표시 */}
        <Text style={styles.source}>{t('home.imageSource')}</Text>

        <View style={styles.list}>
          {pageItems.length === 0 && (
            <Text style={styles.empty}>{t('placeSelect.empty')}</Text>
          )}
          {pageItems.map((place, index) => {
            const added = picked.includes(place.placeId);
            return (
              <PlaceCard
                key={place.placeId}
                rank={(page - 1) * PAGE_SIZE + index + 1}
                name={place.name}
                category={place.category}
                distance={t('placeSelect.distance', { km: place.distanceKm })}
                reasons={place.reasons}
                image={place.photo.source}
                cropImage={place.photo.copyright === 'Type1'}
                added={added}
                addLabel={t('placeSelect.add')}
                addedLabel={t('placeSelect.added')}
                onToggleAdd={() => togglePick(place.placeId)}
                onPress={() =>
                  navigation.navigate('PlaceDetail', {
                    placeId: place.placeId,
                  })
                }
              />
            );
          })}
        </View>

        {results.length > 0 && (
          <Pagination page={page} total={totalPages} onChange={setPage} />
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.screenPadding) },
        ]}
      >
        <View style={styles.status}>
          <Text style={[typography.bodyBase, { color: colors.text.strong }]}>
            {t('placeSelect.selected', { count: picked.length })}
          </Text>
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('placeSelect.recommendRange', range)}
          </Text>
        </View>
        <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(picked.length / range.min, 1) * 100}%`,
              },
            ]}
          />
        </View>
        {/* TODO: 권장보다 적게 골랐을 때 추천순으로 채우는 옵션 (spec F2-10, Q11) */}
        <Button
          label={t('placeSelect.makeRoute', { count: picked.length })}
          onPress={makeRoute}
          disabled={picked.length === 0}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow={picked.length > 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  intro: { gap: 12 },
  heading: {
    ...typography.titleStrong,
    paddingTop: 4,
    color: colors.text.strong,
  },
  filters: { gap: 10 },
  chips: { gap: 6 },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  infoText: { ...typography.bodySubtle, flex: 1, color: INFO_TEXT },
  source: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    textAlign: 'right',
    color: SOURCE_TEXT,
  },
  list: { gap: 12 },
  empty: {
    ...typography.bodyBase,
    paddingVertical: 40,
    textAlign: 'center',
    color: colors.text.muted,
  },
  footer: {
    gap: 8,
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progress: {
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.border.divider,
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.brand.primary,
  },
});
