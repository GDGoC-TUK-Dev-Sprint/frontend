import React from 'react';
import {
  NavigationContainer,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import AppHeader from '../components/AppHeader';
import LoginScreen from '../screens/LoginScreen';
import NoticeDetailScreen from '../screens/NoticeDetailScreen';
import NoticeListScreen from '../screens/NoticeListScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import PlaceSelectScreen from '../screens/PlaceSelectScreen';
import SignupScreen from '../screens/SignupScreen';
import TripConditionScreen from '../screens/TripConditionScreen';
import MainTabs, { type MainTabParamList } from './MainTabs';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  TripCondition: undefined;
  Notices: undefined;
  NoticeDetail: { id: string };
  PlaceDetail: { placeId: string };
  PlaceSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Figma: 로그인은 언어 버튼만, 회원가입·공지사항은 뒤로가기 + 제목 + 언어 버튼
const renderLoginHeader = () => <AppHeader />;
// Figma 「02 조건 입력」: 메인과 같은 로고 + 언어 + 알림 헤더
const renderMainHeader = () => <AppHeader showLogo showBell />;
const renderBackHeader = ({ navigation, options }: NativeStackHeaderProps) => (
  <AppHeader title={options.title} onBack={navigation.goBack} />
);

// 로그인 필수, 게스트 모드 없음 (spec F8-1): 로그인 전에는 온보딩·인증 화면만, 로그인 후에는 메인 탭만 등록한다
export default function RootNavigator() {
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TripCondition"
              component={TripConditionScreen}
              options={{ header: renderMainHeader }}
            />
            <Stack.Screen
              name="PlaceSelect"
              component={PlaceSelectScreen}
              options={{ header: renderMainHeader }}
            />
            {/* Figma 「07 장소 상세」: 메인과 같은 로고 + 언어 + 알림 헤더 */}
            <Stack.Screen
              name="PlaceDetail"
              component={PlaceDetailScreen}
              options={{ header: renderMainHeader }}
            />
            <Stack.Screen
              name="Notices"
              component={NoticeListScreen}
              options={{ title: t('notices.title'), header: renderBackHeader }}
            />
            <Stack.Screen
              name="NoticeDetail"
              component={NoticeDetailScreen}
              options={{ title: t('notices.title'), header: renderBackHeader }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ header: renderLoginHeader }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: t('auth.signup'), header: renderBackHeader }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
