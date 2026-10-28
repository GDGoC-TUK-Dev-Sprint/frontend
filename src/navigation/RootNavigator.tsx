import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import AppHeader from '../components/AppHeader';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignupScreen from '../screens/SignupScreen';
import TripConditionScreen from '../screens/TripConditionScreen';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  TripCondition: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Figma: 로그인은 언어 버튼만, 회원가입은 뒤로가기 + 제목 + 언어 버튼
const renderLoginHeader = () => <AppHeader />;
// Figma 「02 조건 입력」: 메인과 같은 로고 + 언어 + 알림 헤더
const renderMainHeader = () => <AppHeader showLogo showBell />;
const renderSignupHeader = ({
  navigation,
  options,
}: NativeStackHeaderProps) => (
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
            {/* TODO: 메인에서 들어오는 버튼은 디자이너가 정한 뒤 연결 */}
            <Stack.Screen
              name="TripCondition"
              component={TripConditionScreen}
              options={{ header: renderMainHeader }}
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
              options={{ title: t('auth.signup'), header: renderSignupHeader }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
