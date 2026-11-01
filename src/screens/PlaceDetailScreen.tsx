import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import StateView from '../components/StateView';
import CalendarIcon from '../assets/icons/calendar.svg';
import CheckCalendarIcon from '../assets/icons/check-calendar.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import CopyIcon from '../assets/icons/copy.svg';
import HeartIcon from '../assets/icons/heart.svg';
import PinIcon from '../assets/icons/pin.svg';
import { findMockPlace, type PlaceDetail } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { parseDate } from '../utils/date';
import LocationSection from './placeDetail/LocationSection';
import PhotoSwiper from './placeDetail/PhotoSwiper';
import VisitInfoSection from './placeDetail/VisitInfoSection';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

// Figma 「07 장소 상세」 (spec F2-3). 데이터는 GET /api/places/{placeId} 더미
export default function PlaceDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // TODO: GET /api/places/{placeId} 연동
  const place = findMockPlace(route.params.placeId);
  // TODO: 찜은 PUT·DELETE /api/favorites/{placeId} (F12-3). 지금은 화면 안에서만 바뀐다
  const [favorite, setFavorite] = useState(place?.isFavorite ?? false);
  // TODO: 담기는 장소 선택(02c)의 담기 목록과 같다 (F2-12). 장소 선택 화면이 생기면 그 상태로 옮긴다
  const [added, setAdded] = useState(false);

  if (!place) {
    return <StateView type="empty" message={t('placeDetail.notFound')} />;
  }

  const openPlan = () => navigation.navigate('Main', { screen: 'Plan' });
  // TODO: 지도 탭에 이 장소를 보여줄지, 네이버 지도 앱으로 열지(F10, Q16) 정해지면 바꾼다
  const openMap = () => navigation.navigate('Main', { screen: 'Map' });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PhotoSwiper photos={place.photos} />

        <View style={styles.content}>
          <TitleBlock place={place} />
          {place.schedule && (
            <ScheduleCard schedule={place.schedule} onPress={openPlan} />
          )}
          <VisitInfoSection place={place} />
          <Overview text={place.overview} />
          <LocationSection place={place} onOpenMap={openMap} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.screenPadding) },
        ]}
      >
        <Pressable
          style={styles.favorite}
          onPress={() => setFavorite(!favorite)}
          accessibilityRole="button"
          accessibilityLabel={t(
            favorite ? 'placeDetail.unfavorite' : 'placeDetail.favorite',
          )}
          accessibilityState={{ selected: favorite }}
        >
          <HeartIcon
            width={24}
            height={24}
            color={favorite ? colors.brand.primary : colors.text.muted}
            fill={favorite ? colors.brand.primary : 'none'}
          />
        </Pressable>
        <Button
          label={t(added ? 'placeDetail.added' : 'placeDetail.addToPlan')}
          onPress={() => setAdded(!added)}
          variant={added ? 'tonal' : 'primary'}
          icon={CalendarIcon}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

function TitleBlock({ place }: { place: PlaceDetail }) {
  const { t } = useTranslation();
  return (
    <View style={styles.titleBlock}>
      <View style={styles.metaRow}>
        <Text style={styles.category}>{place.category}</Text>
        <View style={styles.metaDot} />
        <Text style={styles.tagline} numberOfLines={1}>
          {place.tagline}
        </Text>
      </View>
      <Text style={styles.name}>{place.name}</Text>
      {/* TODO: 별점·리뷰는 사용자 입력(팀 결정). Figma에는 자리만 있어 임시 표시 */}
      {place.rating && (
        <Text style={styles.rating}>
          {t('placeDetail.rating', {
            average: place.rating.average.toFixed(1),
            count: place.rating.count,
          })}
        </Text>
      )}
      <View style={styles.address}>
        <View style={styles.addressText}>
          <PinIcon width={24} height={24} color={colors.text.muted} />
          <Text style={styles.addressLabel} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
        {/* TODO: 클립보드 복사. RN 기본 Clipboard는 빠졌고 라이브러리 설치가 필요해 동작 없음 */}
        <Pressable style={styles.copy} accessibilityRole="button">
          <CopyIcon width={20} height={20} color={colors.text.muted} />
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('placeDetail.copy')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ScheduleCard({
  schedule,
  onPress,
}: {
  schedule: NonNullable<PlaceDetail['schedule']>;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const date = parseDate(schedule.date).toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
  return (
    <Pressable
      style={styles.schedule}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.scheduleIcon}>
        <CheckCalendarIcon width={24} height={24} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.scheduleTitle} numberOfLines={1}>
          {t('placeDetail.inPlan', { day: schedule.day })}
        </Text>
        <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
          {t('placeDetail.planVisit', { date, time: schedule.time })}
        </Text>
      </View>
      <View style={styles.link}>
        <Text style={[typography.bodySubtle, { color: colors.brand.primary }]}>
          {t('placeDetail.checkPlan')}
        </Text>
        <ChevronRightIcon width={20} height={20} color={colors.brand.primary} />
      </View>
    </Pressable>
  );
}

// ⑤ 장소 소개: 3줄까지 보여주고 더보기로 펼친다
// Figma는 "더보기"가 문장 끝에 붙지만 RN에서 말줄임 뒤에 글자를 이어 붙일 수 없어 아래 줄에 둔다
function Overview({ text }: { text: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  // 3줄을 넘을 때만 더보기를 보여준다. 줄 수는 잘리지 않은 숨은 글로 잰다
  const [lineCount, setLineCount] = useState(0);
  return (
    <View style={styles.overview}>
      <Text style={styles.sectionTitle}>{t('placeDetail.about')}</Text>
      <View>
        <Text
          style={[styles.overviewText, styles.measure]}
          onTextLayout={e => setLineCount(e.nativeEvent.lines.length)}
          aria-hidden
        >
          {text}
        </Text>
        <Text
          style={styles.overviewText}
          numberOfLines={expanded ? undefined : 3}
        >
          {text}
        </Text>
      </View>
      {lineCount > 3 && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
        >
          <Text style={styles.more}>
            {t(expanded ? 'placeDetail.less' : 'placeDetail.more')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  scroll: { paddingBottom: spacing.sectionGap },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },

  titleBlock: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Figma는 Noto Sans KR Medium. 앱 폰트로 맞춤
  category: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: -0.325,
    color: colors.brand.primary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: '#C1C6D7', // Figma 값
  },
  tagline: {
    flexShrink: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.text.muted,
  },
  name: { ...typography.titleBase, color: colors.text.strong },
  rating: {
    ...typography.bodySubtle,
    lineHeight: 26,
    color: colors.text.muted,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    height: 48,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface.subtle,
  },
  addressText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabel: {
    ...typography.bodyBase,
    flexShrink: 1,
    color: colors.text.base,
  },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface.default,
  },

  schedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.brand.primarySoft,
  },
  scheduleTitle: { ...typography.bodyStrong, color: colors.brand.primary },
  link: { flexDirection: 'row', alignItems: 'center' },

  overview: {
    gap: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  sectionTitle: { ...typography.titleBase, color: colors.text.label },
  overviewText: {
    ...typography.bodyBase,
    textAlign: 'justify',
    color: colors.text.base,
  },
  measure: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  more: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.brand.primary,
  },

  footer: {
    flexDirection: 'row',
    gap: 18,
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
  favorite: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
});
