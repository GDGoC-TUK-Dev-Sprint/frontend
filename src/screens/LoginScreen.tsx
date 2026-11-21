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
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 오류 문구는 Figma에 없어 초안 (TODO: Figma 확인 필요)
  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signIn(loginId, password);
    } catch (e) {
      const failed = e instanceof ApiError && e.status === 401;
      setError(t(failed ? 'auth.loginFailed' : 'auth.networkError'));
      setSubmitting(false);
    }
  };

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
            keyboardType="ascii-capable" // 아이디는 영문 소문자·숫자·_ (iOS는 영문 키보드로 연다)
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
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          label={t('auth.login')}
          onPress={submit}
          disabled={submitting || !loginId || !password}
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
        {/* TODO: Google 로그인(POST /api/auth/oauth/google)은 별도 이슈. Apple 로그인은 넣지 않는다 (2026-11-18) */}
        <View style={styles.social}>
          <SocialButton
            icon={GoogleIcon}
            label={t('auth.google')}
            style={styles.google}
            textColor={colors.text.heading}
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
  welcome: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.text.heading,
  },
  fields: { alignSelf: 'stretch', gap: 12 },
  notice: { ...typography.bodySubtle, color: colors.text.notice },
  error: { ...typography.bodySubtle, color: colors.text.negative },
  signup: { flexDirection: 'row', gap: 6 },
  signupLink: { color: colors.brand.primary },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 326,
    paddingVertical: 8,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border.line }, // Figma 값
  or: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.text.helper,
  }, // Figma 값
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
});
