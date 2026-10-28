import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import HomeIcon from '../assets/icons/tab-home.svg';
import MapIcon from '../assets/icons/tab-map.svg';
import ChatbotIcon from '../assets/icons/tab-chatbot.svg';
import PlanIcon from '../assets/icons/tab-plan.svg';
import MyPageIcon from '../assets/icons/tab-mypage.svg';
import { colors, fontFamily } from '../theme/tokens';

// Figma 「하단 네비게이션」 값. 디자인시스템 토큰에 없는 색이라 여기에 둔다
const INACTIVE = '#99A1AD';
const CHATBOT_LABEL = '#5C6373';
const BORDER = '#E5E8ED';

const ICONS: Record<string, React.FC<SvgProps>> = {
  Home: HomeIcon,
  Map: MapIcon,
  Plan: PlanIcon,
  MyPage: MyPageIcon,
};

// 하단 네비 5탭 (spec §3.2). 챗봇은 가운데 원형 버튼
export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 22) }]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        const isChatbot = route.name === 'Chatbot';
        const Icon = ICONS[route.name];
        const color = focused ? colors.brand.primary : INACTIVE;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isChatbot && styles.chatbotTab]}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
          >
            {isChatbot ? (
              <View style={styles.chatbotButton}>
                <ChatbotIcon width={24} height={24} />
              </View>
            ) : (
              <Icon width={24} height={24} color={color} />
            )}
            <Text
              style={[
                styles.label,
                { color: isChatbot ? CHATBOT_LABEL : color },
                focused && styles.labelFocused,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: colors.surface.default,
  },
  tab: { width: 69.2, alignItems: 'center', gap: 4, paddingTop: 12 },
  chatbotTab: { paddingTop: 0 },
  chatbotButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    shadowColor: '#004DCC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  label: { fontFamily: fontFamily.medium, fontSize: 11 },
  labelFocused: { fontFamily: fontFamily.bold },
});
