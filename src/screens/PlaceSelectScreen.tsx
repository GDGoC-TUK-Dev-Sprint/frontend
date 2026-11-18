import React, { useEffect, useState } from 'react';
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
import ImageCredit from '../components/ImageCredit';
import ArrowForwardIcon from '../assets/icons/arrow-forward.svg';
import EffectIcon from '../assets/icons/effect.svg';
import WarningIcon from '../assets/icons/warning.svg';
import { ApiError } from '../api/client';
import {
  createRoute,
  getCandidates,
  toCandidate,
  type CandidatePage,
} from '../api/trips';
import type { Candidate } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import { colors, shadow, spacing, typography } from '../theme/tokens';
import ConditionCard from './placeSelect/ConditionCard';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceSelect'>;

const PAGE_SIZE = 5; // spec F2-11, 서버 기본값과 같다
const SEARCH_DELAY_MS = 300;

// Figma 「02c 장소 선택」 (spec F2). 후보는 GET /api/trips/{tripId}/candidates
export default function PlaceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trip, setTrip } = useTrip();
  const [query, setQuery] = useState('');
  const [themeCode, setThemeCode] = useState<string>(); // 없으면 전체
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CandidatePage>();
  const [loadFailed, setLoadFailed] = useState(false);
  // 담은 장소. 저장 API 없이 동선 만들기 요청에 담아 보낸다 (F2-12). 동선에 이미 들어간 장소(inTrip)는 처음에 담아 둔다
  const [picked, setPicked] = useState<Candidate[]>([]);
  const [seen, setSeen] = useState<string[]>([]); // 이미 담아 본 inTrip 장소 (빼면 다시 담지 않는다)
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tripId = trip?.tripId;

  // 검색어는 입력이 멈춘 뒤, 카테고리·페이지는 바로 다시 부른다. 늦게 온 이전 응답은 버린다
  useEffect(() => {
    if (!tripId) return;
    let stale = false;
    const q = query.trim();
    const timer = setTimeout(
      () => {
        setLoadFailed(false);
        getCandidates(tripId, {
          category: q ? undefined : themeCode,
          query: q || undefined,
          page: page - 1,
        })
          .then(res => {
            if (stale) return;
            setResult(res);
            const inTrip = res.items
              .filter(item => item.inTrip)
              .map(toCandidate)
              .filter(c => !seen.includes(c.placeId));
            if (inTrip.length) {
              setSeen(prev => [...prev, ...inTrip.map(c => c.placeId)]);
              setPicked(prev => [...prev, ...inTrip]);
            }
          })
          .catch(() => !stale && setLoadFailed(true));
      },
      q ? SEARCH_DELAY_MS : 0,
    );
    return () => {
      stale = true;
      clearTimeout(timer);
    };
    // seen은 담기 기록이라 다시 부를 이유가 아니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, query, themeCode, page]);

  if (!trip || !tripId) {
    return <StateView type="empty" message={t('placeSelect.noTrip')} />;
  }

  const themes = trip.themes;
  const guide = result?.guide;
  const range = guide
    ? { min: guide.recommendedMin, max: guide.recommendedMax }
    : { min: 0, max: 0 };
  const pageItems = result?.items.map(toCandidate) ?? [];
  const totalPages = Math.max(
    Math.ceil((result?.totalCount ?? 0) / PAGE_SIZE),
    1,
  );
  // 검색어·카테고리가 바뀌면 첫 페이지부터
  const changeFilter = (next: () => void) => {
    next();
    setPage(1);
  };

  const isPicked = (placeId: string) => picked.some(p => p.placeId === placeId);
  const togglePick = (place: Candidate) =>
    setPicked(prev =>
      isPicked(place.placeId)
        ? prev.filter(p => p.placeId !== place.placeId)
        : [...prev, place],
    );

  // 추천 이유 코드를 화면 문구로: "쇼핑 테마", "숙소 가까움"
  const reasonLabel = (code: string, place: Candidate) =>
    code === 'NEAR_STAY'
      ? t('placeSelect.reasonNearStay')
      : t('placeSelect.reasonTheme', {
          name: place.category.split(' · ')[0],
        });

  // 담은 장소로 동선을 만들고(POST .../route), 일자 목록·제목을 여행에 넣은 뒤 동선 화면으로 간다
  const makeRoute = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createRoute(
        tripId,
        picked.map(p => Number(p.placeId)),
      );
      setTrip({
        ...trip,
        title: res.trip.title ?? trip.title,
        days: res.days.map(({ dayNumber, date }) => ({ dayNumber, date })),
        route: {
          thumbnail: picked[0]?.photo?.source,
          thumbnailLabel: picked[0]?.name ?? '',
          stops: picked.map(p => p.name),
        },
      });
      // TODO: 동선에 넣지 못한 장소(unscheduled) 안내는 시안에 없어 이름만 알린다
      if (res.unscheduled.length) {
        setSubmitError(
          t('placeSelect.unscheduled', {
            names: res.unscheduled.map(u => u.place.name).join(', '),
          }),
        );
      }
      setSubmitting(false);
      navigation.navigate('Route');
    } catch (e) {
      const tooMany = e instanceof ApiError && e.code === 'TOO_MANY_PLACES';
      setSubmitError(
        tooMany
          ? t('placeSelect.tooMany', { perDay: guide?.maxPerDay })
          : t('auth.networkError'),
      );
      setSubmitting(false);
    }
  };

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
          <WarningIcon width={20} height={20} color={colors.text.info} />
          <Text style={styles.infoText}>
            {t('placeSelect.recommendInfo', {
              days: guide?.days ?? trip.days?.length ?? 0,
              ...range,
              perDay: guide?.maxPerDay ?? 0,
            })}
          </Text>
        </View>

        {/* R-C52 출처 표시 */}
        <ImageCredit align="right" style={styles.credit} />

        <View style={styles.list}>
          {loadFailed && (
            <Text style={styles.empty}>{t('auth.networkError')}</Text>
          )}
          {!loadFailed && result && pageItems.length === 0 && (
            <Text style={styles.empty}>{t('placeSelect.empty')}</Text>
          )}
          {pageItems.map((place, index) => {
            const added = isPicked(place.placeId);
            // 검색 결과는 순위가 없다(rank null). 그때는 목록 순서를 보여준다
            const rank =
              result?.items[index]?.rank ?? (page - 1) * PAGE_SIZE + index + 1;
            return (
              <PlaceCard
                key={place.placeId}
                rank={rank}
                name={place.name}
                category={place.category}
                distance={t('placeSelect.distance', { km: place.distanceKm })}
                reasons={place.reasons.map(code => reasonLabel(code, place))}
                image={place.photo?.source}
                cropImage={place.photo?.copyright === 'Type1'}
                added={added}
                addLabel={t('placeSelect.add')}
                addedLabel={t('placeSelect.added')}
                onToggleAdd={() => togglePick(place)}
                onPress={() =>
                  navigation.navigate('PlaceDetail', {
                    placeId: place.placeId,
                  })
                }
              />
            );
          })}
        </View>

        {pageItems.length > 0 && (
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
                width: `${
                  range.min ? Math.min(picked.length / range.min, 1) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
        {submitError && <Text style={styles.error}>{submitError}</Text>}
        <Button
          label={t('placeSelect.makeRoute', { count: picked.length })}
          onPress={makeRoute}
          disabled={picked.length === 0 || submitting}
          icon={ArrowForwardIcon}
          iconSize={12}
          shadow={picked.length > 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  credit: { fontSize: 12 }, // Figma: 이 화면만 12px
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
  infoText: { ...typography.bodySubtle, flex: 1, color: colors.text.info },
  list: { gap: 12 },
  empty: {
    ...typography.bodyBase,
    paddingVertical: 40,
    textAlign: 'center',
    color: colors.text.muted,
  },
  error: { ...typography.bodySubtle, color: colors.text.negative },
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
