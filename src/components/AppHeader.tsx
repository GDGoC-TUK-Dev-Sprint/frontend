import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/images/logo.svg';
import BellIcon from '../assets/icons/bell.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import ChevronDownIcon from '../assets/icons/chevron-down.svg';
import GlobeIcon from '../assets/icons/globe.svg';
import { colors, fontFamily, typography } from '../theme/tokens';

// Figma 「navi」 컴포넌트. 왼쪽은 로고 또는 뒤로가기, 오른쪽은 언어 버튼(+ 알림)
type Props = {
  title?: string;
  onBack?: () => void;
  showLogo?: boolean;
  showBell?: boolean;
};

export default function AppHeader({
  title,
  onBack,
  showLogo,
  showBell,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.side}>
        {showLogo && <Logo width={84.94} height={36.68} />}
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <ChevronRightIcon width={24} height={24} style={styles.back} />
          </Pressable>
        )}
      </View>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.side, styles.right]}>
        {/* TODO: 언어 및 통화 설정 팝업(F7, Figma 10) */}
        <Pressable style={styles.language} accessibilityRole="button">
          <GlobeIcon width={13.2} height={13.2} style={styles.globe} />
          <Text style={styles.languageText}>{t('language.current')}</Text>
          <ChevronDownIcon width={7} height={4.317} />
        </Pressable>
        {/* TODO: 알림 화면(01a)은 MVP 포함 여부 미정 (spec Q13) */}
        {showBell && (
          <Pressable
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel={t('common.notifications')}
          >
            <BellIcon width={14} height={17.5} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.04)',
    zIndex: 1,
  },
  side: { flexDirection: 'row', alignItems: 'center', minWidth: 76 },
  right: { justifyContent: 'flex-end', gap: 6 },
  back: { transform: [{ rotate: '180deg' }] },
  title: { ...typography.titleBase, color: '#1F242E' },
  language: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(241,245,249,0.9)',
  },
  globe: { margin: -0.6 },
  languageText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 17.6,
    color: '#475569',
  },
  bell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
