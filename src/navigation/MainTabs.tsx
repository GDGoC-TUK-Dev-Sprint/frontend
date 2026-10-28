import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

// 하단 네비 5탭 (spec §3.2). TODO: 문자열 i18n
export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ header: renderHeader }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: '지도' }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: '챗봇' }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{ title: '계획 확인' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}
