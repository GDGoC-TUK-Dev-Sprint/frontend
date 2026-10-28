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
import SignupScreen from '../screens/SignupScreen';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Figma: 로그인은 언어 버튼만, 회원가입은 뒤로가기 + 제목 + 언어 버튼
const renderLoginHeader = () => <AppHeader />;
const renderSignupHeader = ({
  navigation,
  options,
}: NativeStackHeaderProps) => (
  <AppHeader title={options.title} onBack={navigation.goBack} />
);

// 로그인 필수, 게스트 모드 없음 (spec F8-1): 로그인 전에는 인증 화면만, 로그인 후에는 메인 탭만 등록한다
export default function RootNavigator() {
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn ? (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <>
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
