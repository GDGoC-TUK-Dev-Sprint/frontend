import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import InfoIcon from '../assets/icons/info.svg';
import { mockNotices, type NoticeBlock } from '../mocks';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';
import { formatDot, parseDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'NoticeDetail'>;

// Figma 「공지사항/하위」
export default function NoticeDetailScreen({ route }: Props) {
  const { t } = useTranslation();
  // TODO: 공지 API 연동 시 id로 상세 조회
  const notice = mockNotices.find(item => item.id === route.params.id);

  if (!notice) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>{t('notices.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.meta}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {t(`notices.tabs.${notice.category}`)}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDot(parseDate(notice.date), '. ')}
        </Text>
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.text}>{notice.summary}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {notice.body.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </View>
    </ScrollView>
  );
}

function Block({ block }: { block: NoticeBlock }) {
  if (block.type === 'text') {
    return <Text style={styles.text}>{block.text}</Text>;
  }
  return (
    <View style={styles.highlight}>
      <View style={styles.highlightIcon}>
        <InfoIcon width={15} height={15} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.highlightTitle}>{block.title}</Text>
        {block.lines.map(line => (
          <Text key={line} style={styles.highlightLine}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { padding: spacing.screenPadding },
  flex: { flex: 1 },
  empty: {
    ...typography.bodyBase,
    paddingTop: 40,
    textAlign: 'center',
    color: colors.text.muted,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  badgeText: { ...typography.bodyBase, color: colors.brand.primary },
  date: { ...typography.bodyBase, color: colors.text.faint },

  heading: { gap: 8, paddingTop: 15 },
  title: { ...typography.titleStrong, color: colors.text.base },
  text: { ...typography.bodyBase, color: colors.text.base },

  divider: {
    height: 1,
    marginVertical: 24,
    backgroundColor: colors.border.light,
  },

  body: { gap: 16 },
  // 강조 상자는 위아래 8px 여백이 더 있다
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.brand.surfaceSubtle,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  highlightIcon: {
    width: 28,
    height: 28,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: colors.brand.primarySoft,
  },
  // Figma는 Inter. 앱 폰트(Pretendard)로 맞춤
  highlightTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
    color: colors.brand.primary,
  },
  highlightLine: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 19.25,
    color: colors.brand.primary,
  },
});
