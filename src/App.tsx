import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './auth/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import { TripProvider } from './trips/TripContext';
import './i18n';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <TripProvider>
          <RootNavigator />
        </TripProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
