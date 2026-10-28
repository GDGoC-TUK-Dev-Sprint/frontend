import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  return (
    <ScreenPlaceholder title={t('auth.login')}>
      {/* TODO: 로그인 폼과 POST /api/auth/login 연동 전까지 쓰는 임시 버튼 */}
      <Button title={t('auth.tempLogin')} onPress={signIn} />
      <View style={styles.signup}>
        <Text style={styles.signupText}>{t('auth.noAccount')}</Text>
        <Text
          style={[styles.signupText, styles.signupLink]}
          onPress={() => navigation.navigate('Signup')}
          accessibilityRole="link"
        >
          {t('auth.signup')}
        </Text>
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  signup: { flexDirection: 'row', gap: 6 },
  signupText: { ...typography.bodySubtle, color: '#6B7380' },
  signupLink: { color: colors.brand.primary },
});
