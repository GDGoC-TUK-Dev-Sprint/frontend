import React from 'react';
import { LogBox, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './auth/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import { TripProvider } from './trips/TripContext';
import './i18n';

// react-native-sortables(동선 화면 드래그) 내부에서 나는 개발용 경고. 동작과 무관하고 개발 중 하단 버튼을 가려서 숨긴다
LogBox.ignoreLogs(['[Reanimated] Dependencies should only be used on the web']);

export default function App() {
  return (
    // 동선 화면의 드래그(gesture-handler)가 동작하려면 앱 전체를 감싼다
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AuthProvider>
          <TripProvider>
            <RootNavigator />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
