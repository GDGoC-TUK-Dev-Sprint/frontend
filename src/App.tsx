import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './auth/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import { TripProvider } from './trips/TripContext';
import './i18n';

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
