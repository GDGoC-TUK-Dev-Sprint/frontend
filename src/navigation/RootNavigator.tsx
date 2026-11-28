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
import CostEstimateScreen from '../screens/CostEstimateScreen';
import ExpenseInputScreen from '../screens/ExpenseInputScreen';
import ExpenseReportScreen from '../screens/ExpenseReportScreen';
import RouteScreen from '../screens/RouteScreen';
import SignupScreen from '../screens/SignupScreen';
import TripConditionScreen from '../screens/TripConditionScreen';
import MapScreen from '../screens/MapScreen';
import MainTabs, { type MainTabParamList } from './MainTabs';
import type { PlacePhoto } from '../mocks';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  // tripId가 있으면 그 여행의 조건을 채워 열고 저장할 때 고친다 (장소 선택의 「변경」)
  TripCondition: { tripId?: number } | undefined;
  Notices: undefined;
  NoticeDetail: { id: string };
  // preview: 상세(GET /api/places/{placeId})를 받는 동안 목록에서 아는 정보로 먼저 그린다
  PlaceDetail: {
    placeId: string;
    preview?: { name: string; category: string; photo?: PlacePhoto };
  };
  PlaceSelect: undefined;
  Route: undefined;
  RouteMap: undefined;
  CostEstimate: undefined;
  ExpenseInput: { tripId: number };
  ExpenseReport: { tripId: number };
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
  const { status } = useAuth();
  const { t } = useTranslation();

  // 저장된 토큰을 확인하는 동안에는 아무 화면도 보여주지 않는다 (로그인 화면이 잠깐 보였다 사라지지 않게)
  if (status === 'loading') {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {status === 'signedIn' ? (
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
            <Stack.Screen
              name="Route"
              component={RouteScreen}
              options={{ header: renderMainHeader }}
            />
            {/* 동선 화면에서 연 지도. 지도 탭과 같은 화면이고, 돌아가면 동선 화면이 남아 있다 */}
            <Stack.Screen
              name="RouteMap"
              component={MapScreen}
              options={{ title: t('tabs.map'), header: renderBackHeader }}
            />
            {/* Figma 「04 예상 경비」: 메인과 같은 로고 + 언어 + 알림 헤더 */}
            <Stack.Screen
              name="CostEstimate"
              component={CostEstimateScreen}
              options={{ header: renderMainHeader }}
            />
            {/* Figma 「08 지출 입력」·「09 지출 리포트」: 메인과 같은 헤더 */}
            <Stack.Screen
              name="ExpenseInput"
              component={ExpenseInputScreen}
              options={{ header: renderMainHeader }}
            />
            <Stack.Screen
              name="ExpenseReport"
              component={ExpenseReportScreen}
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
