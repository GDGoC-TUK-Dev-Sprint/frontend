import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  return (
    <ScreenPlaceholder title="로그인">
      {/* TODO: 로그인 폼과 POST /api/auth/login 연동 전까지 쓰는 임시 버튼 */}
      <Button title="임시 로그인" onPress={signIn} />
      <View style={styles.signup}>
        <Text style={styles.signupText}>아직 계정이 없나요?</Text>
        <Text
          style={[styles.signupText, styles.signupLink]}
          onPress={() => navigation.navigate('Signup')}
          accessibilityRole="link"
        >
          회원가입
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
