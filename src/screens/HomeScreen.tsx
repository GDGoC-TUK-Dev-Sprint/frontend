import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ArrowRightIcon from '../assets/icons/arrow-right.svg';
import CalendarFillIcon from '../assets/icons/calendar-fill.svg';
import ChatIcon from '../assets/icons/chat.svg';
import ChevronSmallIcon from '../assets/icons/chevron-small.svg';
import FlightIcon from '../assets/icons/flight.svg';
import MapIcon from '../assets/icons/map.svg';
import TicketIcon from '../assets/icons/ticket.svg';
import { mockFeaturedCourse, mockTrip } from '../mocks';
import type { MainTabParamList } from '../navigation/MainTabs';
import { formatMonthDay, parseDate } from '../utils/date';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

// Figma 색 (토큰 없음)
const TEXT_STRONG = '#0F172A';
const TEXT_SECONDARY = '#475569';
const STOP_COLORS = [colors.brand.primary, '#6366F1'];

// Figma 「01 메인」. 서버 데이터는 src/mocks 더미
export default function HomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const formatDate = (date: string) =>
    formatMonthDay(parseDate(date), i18n.language);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <View style={styles.introText}>
          <Text style={styles.heading}>{t('home.heading')}</Text>
          <Text style={styles.description} lineBreakStrategyIOS="hangul-word">
            {t('home.description')}
          </Text>
        </View>

        {/* TODO: 코스 상세 화면이 없어 「자세히」는 동작 없음 */}
        <Pressable style={styles.banner} accessibilityRole="button">
          <Image source={mockFeaturedCourse.image} style={styles.bannerImage} />
          <View style={styles.bannerGradient} />
          <View style={styles.bannerBadge}>
            <Badge label={t('home.popularCourse')} tone="muted" />
          </View>
          <View style={styles.bannerFooter}>
            <View style={styles.flex}>
              <Text style={styles.bannerTitle}>{mockFeaturedCourse.title}</Text>
              <Text style={styles.bannerDescription}>
                {mockFeaturedCourse.description}
              </Text>
            </View>
            <View style={styles.more}>
              <Text style={styles.moreText}>{t('home.detail')}</Text>
              <ChevronSmallIcon
                width={4.933}
                height={8}
                color={colors.surface.default}
              />
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.chatCard}>
        <View style={styles.chatIcon}>
          <ChatIcon width={24} height={24} color={colors.surface.default} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodySubtle, { color: colors.text.base }]}>
            {t('home.chatTitle')}
          </Text>
          <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
            {t('home.chatSubtitle')}
          </Text>
        </View>
        <Button
          label={t('home.chatStart')}
          onPress={() => navigation.navigate('Chatbot')}
          variant="outline"
          size="small"
          icon={ArrowRightIcon}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <TicketIcon
              width={16.667}
              height={13.333}
              color={colors.brand.primary}
            />
            <Text style={styles.sectionTitle}>{t('home.myTrips')}</Text>
          </View>
          {/* TODO: 이전·예정 여행 목록 화면(F12-6)이 없어 동작 없음 */}
          <Pressable style={styles.viewAll} accessibilityRole="button">
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            <ChevronSmallIcon
              width={4.625}
              height={7.5}
              color={TEXT_SECONDARY}
            />
          </Pressable>
        </View>

        <View style={styles.ticket}>
          <View style={styles.ticketHeader}>
            <View style={styles.row}>
              <View style={styles.status}>
                <Text style={styles.statusText}>{t('home.upcoming')}</Text>
              </View>
              <Text style={styles.dDay}>
                {t('home.dDay', { count: mockTrip.dDay })}
              </Text>
            </View>
            <View style={styles.tripNumber}>
              <FlightIcon
                width={13.786}
                height={12.1}
                color={colors.text.subtle}
              />
              <Text style={styles.tripNumberText}>
                {t('home.tripNumber', { number: mockTrip.tripNumber })}
              </Text>
            </View>
          </View>
          {/* RN은 한쪽 테두리만 점선으로 그릴 수 없어 점선 상자의 윗변만 보이게 자른다 */}
          <View style={styles.dashClip}>
            <View style={styles.dash} />
          </View>

          <View style={styles.ticketBody}>
            <View style={styles.tripInfo}>
              <Text style={styles.tripTitle}>{mockTrip.title}</Text>
              <View style={styles.row}>
                <CalendarFillIcon
                  width={10.5}
                  height={11.667}
                  color={colors.brand.primary}
                />
                <Text style={styles.tripMeta}>
                  {t('home.tripMeta', {
                    region: mockTrip.region,
                    period: `${formatDate(mockTrip.startDate)} - ${formatDate(
                      mockTrip.endDate,
                    )}`,
                    count: mockTrip.travelers,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.route}>
              {/* R-K11: Type3 이미지는 자르지 않는다. 더미는 정사각형이라 cover */}
              <View style={styles.thumbnail}>
                <Image
                  source={mockTrip.thumbnail}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.thumbnailLabel}>
                  <Text style={styles.thumbnailText}>
                    {mockTrip.thumbnailLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.stops}>
                <View style={styles.stopLine} />
                {mockTrip.stops.slice(0, 2).map((stop, index) => (
                  <View key={stop} style={styles.stop}>
                    <View
                      style={[
                        styles.stopDot,
                        { backgroundColor: STOP_COLORS[index] },
                      ]}
                    >
                      <Text style={styles.stopNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stopText} numberOfLines={1}>
                      {stop}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                label={t('home.viewSchedule')}
                onPress={() => navigation.navigate('Plan')}
                variant="secondary"
                size="compact"
                style={styles.flex}
              />
              <Button
                label={t('home.viewOnMap')}
                onPress={() => navigation.navigate('Map')}
                variant="tonal"
                size="compact"
                icon={MapIcon}
                iconPosition="left"
                style={styles.flex}
              />
            </View>
          </View>

          {/* 보딩패스 모양 양옆 홈 */}
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>
      </View>

      {/* R-C52 출처 표시 */}
      <Text style={styles.source}>{t('home.imageSource')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  intro: { gap: 12, paddingTop: 8 },
  introText: { gap: 6 },
  heading: { ...typography.titleStrong, color: '#1A1C1C' }, // Figma 값
  description: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.muted,
  },

  banner: {
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface.default,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  bannerImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  bannerGradient: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2) 50%, rgba(0,0,0,0))',
  },
  bannerBadge: { position: 'absolute', top: 12, left: 12 },
  bannerFooter: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bannerTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 20,
    color: colors.surface.default,
  },
  bannerDescription: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: '#F3F3F4', // Figma 값
  },
  // Figma는 배경 블러(2px)가 있지만 RN에 backdrop 블러가 없어 반투명 배경만 둔다
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  moreText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.surface.default,
  },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: -0.45,
    color: TEXT_STRONG,
  },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 19.5,
    color: TEXT_SECONDARY,
  },

  ticket: {
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundImage:
      'linear-gradient(to right, #EFF6FF, rgba(238,242,255,0.5), #FFFFFF)',
  },
  dashClip: { height: 1, overflow: 'hidden' },
  dash: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0', // Figma 값
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.brand.primary,
  },
  // Figma는 ExtraBold. 앱에 없는 굵기라 Bold로 맞춤
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 0.275,
    color: colors.surface.default,
  },
  dDay: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.brand.primary,
  },
  tripNumber: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripNumberText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.subtle,
  },

  ticketBody: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
  },
  tripInfo: { gap: 2 },
  tripTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 25.5,
    letterSpacing: -0.425,
    color: TEXT_STRONG,
  },
  tripMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_SECONDARY,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F1F5F9', // Figma 값
    borderRadius: 12,
    backgroundColor: 'rgba(248,250,252,0.9)', // Figma 값
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  thumbnailLabel: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  thumbnailText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.surface.default,
  },
  stops: { flex: 1, justifyContent: 'center', paddingLeft: 4 },
  stopLine: {
    position: 'absolute',
    left: 7,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: '#BFDBFE', // Figma 값
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  stopDot: {
    width: 14,
    height: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 0px 0px 2px #FFFFFF',
  },
  stopNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.surface.default,
  },
  stopText: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    lineHeight: 18.75,
    color: TEXT_STRONG,
  },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  notch: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC', // Figma 값
  },
  notchLeft: {
    left: -10,
    boxShadow: 'inset -2px 0px 3px rgba(0, 0, 0, 0.04)',
  },
  notchRight: {
    right: -10,
    boxShadow: 'inset 2px 0px 3px rgba(0, 0, 0, 0.04)',
  },

  // Figma는 Noto Sans KR Medium. 앱 폰트(Pretendard)로 맞춤
  source: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    textAlign: 'right',
    color: '#737A87', // Figma 값
  },
});
