import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SvgProps } from 'react-native-svg';
import BottomSheet from './BottomSheet';
import Chip from './Chip';
import ArrowRightIcon from '../assets/icons/arrow-right.svg';
import CalendarIcon from '../assets/icons/calendar.svg';
import WarningIcon from '../assets/icons/warning.svg';
import {
  mockNotifications,
  type AppNotification,
  type NotificationCategory,
} from '../mocks';
import { colors, fontFamily, typography } from '../theme/tokens';
import { formatMonthDay, isSameDay, timeAgo } from '../utils/date';

// Figma 「01a 알림 확인」. 알림은 API가 없어 더미 데이터로 보여준다 (spec F14, Q13)
const TABS = ['all', 'schedule', 'visit', 'notice'] as const;
type Tab = (typeof TABS)[number];

const ICONS: Record<NotificationCategory, React.FC<SvgProps>> = {
  schedule: CalendarIcon,
  visit: WarningIcon,
  notice: WarningIcon,
};
const HEADING = '#354153'; // Figma 값

type Props = { visible: boolean; onClose: () => void };

export default function NotificationSheet({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');
  // TODO: 알림 API가 생기면 읽음 처리를 서버에 보낸다
  const [items, setItems] = useState(mockNotifications);

  const now = new Date();
  const count = (key: Tab) =>
    key === 'all'
      ? items.length
      : items.filter(item => item.category === key).length;
  const visibleItems = items.filter(
    item => tab === 'all' || item.category === tab,
  );
  const groups = [
    {
      key: 'today',
      items: visibleItems.filter(item =>
        isSameDay(new Date(item.createdAt), now),
      ),
    },
    {
      key: 'earlier',
      items: visibleItems.filter(
        item => !isSameDay(new Date(item.createdAt), now),
      ),
    },
  ] as const;

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const { key, count: n } = timeAgo(date, now);
    return key === 'date'
      ? formatMonthDay(date, i18n.language)
      : t(`notifications.${key}`, { count: n });
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('notifications.title')}
      onClose={onClose}
      headerRight={
        <Pressable
          style={styles.readAll}
          onPress={() => setItems(items.map(item => ({ ...item, read: true })))}
          accessibilityRole="button"
        >
          <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
            {t('notifications.readAll')}
          </Text>
        </Pressable>
      }
    >
      <View style={styles.tabsBorder}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map(key => (
            <Chip
              key={key}
              size="large"
              label={t('notifications.tab', {
                name: t(`notifications.tabs.${key}`),
                count: count(key),
              })}
              selected={tab === key}
              onPress={() => setTab(key)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {visibleItems.length === 0 && (
          <Text style={styles.empty}>{t('notifications.empty')}</Text>
        )}
        {groups.map(
          group =>
            group.items.length > 0 && (
              <View key={group.key} style={styles.group}>
                <Text style={styles.groupTitle}>
                  {t(`notifications.${group.key}`)}
                </Text>
                {group.items.map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    time={formatTime(item.createdAt)}
                    linkLabel={t(`notifications.links.${item.category}`)}
                  />
                ))}
              </View>
            ),
        )}
      </ScrollView>
    </BottomSheet>
  );
}

function NotificationCard({
  item,
  time,
  linkLabel,
}: {
  item: AppNotification;
  time: string;
  linkLabel: string;
}) {
  const Icon = ICONS[item.category];
  const unread = !item.read;
  return (
    <View style={[styles.card, unread && styles.cardUnread]}>
      <View style={[styles.icon, unread && styles.iconUnread]}>
        <Icon
          width={20}
          height={20}
          color={unread ? colors.brand.primary : colors.text.muted}
        />
      </View>
      <View style={styles.cardBody}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text
              style={[typography.captionBase, { color: colors.text.subtle }]}
            >
              {time}
            </Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </View>
        {/* TODO: 장소 상세·일정·공지 화면으로 이동. 알림 API에서 이동 대상이 정해지면 연결 */}
        <Pressable style={styles.link} accessibilityRole="link">
          <Text style={styles.linkText}>{linkLabel}</Text>
          <ArrowRightIcon width={16} height={16} color={colors.brand.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readAll: { paddingHorizontal: 6, paddingVertical: 4 },
  tabsBorder: {
    borderBottomWidth: 1,
    borderColor: 'rgba(229,232,239,0.4)', // Figma 값
  },
  tabs: { gap: 4, paddingHorizontal: 16, paddingVertical: 10 },
  list: { gap: 20, paddingHorizontal: 16, paddingBottom: 32 },
  empty: {
    ...typography.bodyBase,
    paddingTop: 40,
    textAlign: 'center',
    color: colors.text.muted,
  },
  group: { gap: 8 },
  groupTitle: { ...typography.bodyStrong, marginBottom: 4, color: HEADING },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  cardUnread: {
    borderColor: colors.brand.primarySoft,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9', // Figma 값
  },
  iconUnread: { backgroundColor: colors.brand.primarySoft },
  cardBody: { flex: 1, gap: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cardTitle: { ...typography.bodyBase, flexShrink: 1, color: colors.text.base },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.muted,
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.brand.primary,
  },
});
