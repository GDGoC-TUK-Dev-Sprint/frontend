import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Chip from '../components/Chip';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import WarningIcon from '../assets/icons/warning.svg';
import { mockNotices, type Notice, type NoticeCategory } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Notices'>;

const TABS = ['all', 'service', 'update', 'event'] as const;
type Tab = 'all' | NoticeCategory;

// Figma 「공지사항」. 공지 API가 없어 더미 데이터로 보여준다
export default function NoticeListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');
  // TODO: 공지 API 연동
  const notices = mockNotices;

  const inTab = (key: Tab) =>
    notices.filter(notice => key === 'all' || notice.category === key);
  const visible = inTab(tab);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        {TABS.map(key => (
          <Chip
            key={key}
            size="large"
            label={t('notifications.tab', {
              name: t(`notices.tabs.${key}`),
              count: inTab(key).length,
            })}
            selected={tab === key}
            onPress={() => setTab(key)}
          />
        ))}
      </View>

      <View style={styles.list}>
        {visible.length === 0 && (
          <Text style={styles.empty}>{t('notices.empty')}</Text>
        )}
        {visible.map(notice => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onPress={() =>
              navigation.navigate('NoticeDetail', { id: notice.id })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

function NoticeCard({
  notice,
  onPress,
}: {
  notice: Notice;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.icon}>
        <WarningIcon width={20} height={20} color={colors.text.muted} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.title} numberOfLines={1}>
          {t('notices.listTitle', {
            category: t(`notices.tabs.${notice.category}`),
            title: notice.title,
          })}
        </Text>
        <Text style={styles.summary} numberOfLines={1}>
          {notice.summary}
        </Text>
      </View>
      <ChevronRightIcon width={20} height={20} color={colors.text.subtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  // 알림 시트(NotificationSheet)의 탭과 같은 모양
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(229,232,239,0.4)', // Figma 값
  },
  list: { gap: 10 },
  empty: {
    ...typography.bodyBase,
    paddingTop: 40,
    textAlign: 'center',
    color: colors.text.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9', // Figma 값
  },
  cardText: { flex: 1, gap: 3 },
  title: { ...typography.bodySubtle, color: colors.text.base },
  summary: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.muted,
  },
});
