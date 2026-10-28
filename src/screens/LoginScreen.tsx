import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Logo from '../assets/images/logo.svg';
import GoogleIcon from '../assets/icons/google.svg';
import AppleIcon from '../assets/icons/apple.svg';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Figma 색 (토큰 없음)
const TEXT_STRONG = '#1F242E';
const TEXT_NOTICE = '#6B7380';

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // 키보드가 열려도 로그인 버튼까지 스크롤할 수 있게 한다 (SignupScreen과 같은 방식)
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Logo width={158.4} height={68.4} />
        <Text style={styles.welcome}>{t('auth.welcome')}</Text>
        <View style={styles.fields}>
          <TextField
            value={loginId}
            onChangeText={setLoginId}
            placeholder={t('auth.loginId')}
            clearLabel={t('common.clear')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
          />
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.password')}
            clearLabel={t('common.clear')}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />
        </View>
        {/* TODO: POST /api/auth/login 연동 전까지는 바로 로그인 상태로 바꾼다 */}
        <Button
          label={t('auth.login')}
          onPress={signIn}
          shadow
          style={styles.stretch}
        />
        <Text style={styles.notice}>{t('auth.loginNotice')}</Text>
        <View style={styles.signup}>
          <Text style={styles.notice}>{t('auth.noAccount')}</Text>
          <Text
            style={[styles.notice, styles.signupLink]}
            onPress={() => navigation.navigate('Signup')}
            accessibilityRole="link"
          >
            {t('auth.signup')}
          </Text>
        </View>
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>{t('auth.or')}</Text>
          <View style={styles.line} />
        </View>
        {/* TODO: Google·Apple 로그인(POST /api/auth/oauth/{provider})은 별도 이슈 */}
        <View style={styles.social}>
          <SocialButton
            icon={GoogleIcon}
            label={t('auth.google')}
            style={styles.google}
            textColor={TEXT_STRONG}
          />
          <SocialButton
            icon={AppleIcon}
            label={t('auth.apple')}
            style={styles.apple}
            textColor={colors.surface.default}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SocialButton({
  icon: Icon,
  label,
  style,
  textColor,
}: {
  icon: React.FC<SvgProps>;
  label: string;
  style: object;
  textColor: string;
}) {
  return (
    <Pressable accessibilityRole="button" style={[styles.socialButton, style]}>
      <Icon width={20} height={20} />
      <Text style={[typography.bodyBase, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: {
    alignItems: 'center',
    gap: spacing.sectionGap,
    padding: spacing.screenPadding,
  },
  stretch: { alignSelf: 'stretch' },
  // Figma는 Noto Sans KR Bold 26. 앱 폰트(Pretendard)로 맞춤
  welcome: { fontFamily: fontFamily.bold, fontSize: 26, color: TEXT_STRONG },
  fields: { alignSelf: 'stretch', gap: 12 },
  notice: { ...typography.bodySubtle, color: TEXT_NOTICE },
  signup: { flexDirection: 'row', gap: 6 },
  signupLink: { color: colors.brand.primary },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 326,
    paddingVertical: 8,
  },
  line: { flex: 1, height: 1, backgroundColor: '#E5E8ED' }, // Figma 값
  or: { fontFamily: fontFamily.medium, fontSize: 12, color: '#9EA6B2' }, // Figma 값
  social: { alignSelf: 'stretch', gap: 8 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
  },
  google: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.brand.surfaceSubtle,
  },
  apple: { backgroundColor: '#000000' },
});
