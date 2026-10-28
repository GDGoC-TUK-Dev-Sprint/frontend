import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import PlanScreen from '../screens/PlanScreen';
import MyPageScreen from '../screens/MyPageScreen';
import AppHeader from '../components/AppHeader';
import TabBar from './TabBar';

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Chatbot: undefined;
  Plan: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: React.ComponentProps<typeof TabBar>) => (
  <TabBar {...props} />
);
const renderHeader = () => <AppHeader showLogo showBell />;

// 하단 네비 5탭 (spec §3.2)
export default function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ header: renderHeader }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('tabs.home') }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: t('tabs.map') }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: t('tabs.chatbot') }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{ title: t('tabs.plan') }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ title: t('tabs.myPage') }}
      />
    </Tab.Navigator>
  );
}
