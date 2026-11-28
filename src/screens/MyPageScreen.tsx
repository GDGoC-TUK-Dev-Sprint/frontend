import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { listTrips, type TripListItem } from '../api/trips';
import type { RootStackParamList } from '../navigation/RootNavigator';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import { useAuth } from '../auth/AuthContext';
import LanguageCurrencySheet from '../components/LanguageCurrencySheet';
import { useCurrency } from '../settings/preferences';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

// Figma 「12 마이페이지」 (spec F12)
// TODO: 찜 목록 조회·회원 탈퇴 API가 서버에 없어 찜은 빈 상태, 탈퇴는 안내만 띄운다
// 이전 여행(GET /api/trips?period=PAST)을 누르면 지출 입력, 이미 입력했으면 리포트로 간다
export default function MyPageScreen() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const currency = useCurrency();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pastTrips, setPastTrips] = useState<TripListItem[]>([]);

  // 탭을 다시 열 때마다 받는다 (지출을 저장하면 리포트로 바뀐다)
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        listTrips('PAST')
          .then(res => setPastTrips(res.items))
          .catch(() => {}); // 못 받으면 빈 상태로 둔다
      }),
    [navigation],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t('tabs.myPage')}</Text>

      <View style={[styles.card, styles.profile]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.name ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.gap2}>
          <Text style={styles.title}>{profile?.name ?? '-'}</Text>
          <Text style={styles.sub}>
            {t(
              profile?.method === 'GOOGLE'
                ? 'myPage.googleLogin'
                : 'myPage.idLogin',
            )}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.row6}>
            <Text style={styles.title}>{t('myPage.favorites')}</Text>
            <Text style={styles.count}>0</Text>
          </View>
        </View>
        <Text style={styles.empty}>{t('myPage.noFavorites')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('myPage.pastTrips')}</Text>
        {pastTrips.length === 0 ? (
          <Text style={styles.empty}>{t('myPage.noPastTrips')}</Text>
        ) : (
          pastTrips.map(trip => (
            <Row
              key={trip.tripId}
              label={trip.title ?? trip.ticketNo}
              value={t(
                trip.expenseSaved
                  ? 'expense.viewReport'
                  : 'expense.writeExpense',
              )}
              onPress={() =>
                navigation.navigate(
                  trip.expenseSaved ? 'ExpenseReport' : 'ExpenseInput',
                  { tripId: trip.tripId },
                )
              }
            />
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('myPage.settings')}</Text>
        <Row
          label={t('myPage.languageCurrency')}
          value={`${t('language.current')} · ${currency}`}
          onPress={() => setSettingsOpen(true)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('myPage.account')}</Text>
        <Row label={t('myPage.logout')} onPress={signOut} />
        <Row
          label={t('myPage.withdraw')}
          negative
          onPress={() => Alert.alert(t('myPage.withdrawPending'))}
        />
      </View>
      <LanguageCurrencySheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  negative,
  onPress,
}: {
  label: string;
  value?: string;
  negative?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
    >
      <Text
        style={[
          typography.bodyBase,
          { color: negative ? colors.text.negative : colors.text.base },
        ]}
      >
        {label}
      </Text>
      <View style={styles.row6}>
        {value && <Text style={styles.value}>{value}</Text>}
        <ChevronRightIcon width={16} height={16} color={colors.text.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: {
    gap: 14,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 24,
  },
  pageTitle: { ...typography.titleBase, color: colors.text.base },
  card: {
    gap: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.surfaceSubtle,
  },
  // Figma는 Noto Sans KR Bold. 앱 폰트(Pretendard)로 맞춤
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.brand.primary,
  },
  gap2: { gap: 2 },
  title: { ...typography.titleBase, color: colors.text.base },
  sub: { ...typography.bodySubtle, color: colors.text.subtle },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  row6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  count: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.brand.primary,
  },
  empty: {
    ...typography.bodySubtle,
    color: colors.text.subtle,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  value: { ...typography.bodySubtle, color: colors.text.muted },
});
