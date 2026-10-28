import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { NAME_MAX, validateSignup } from '../auth/validation';
import { colors, shadow, spacing, typography } from '../theme/tokens';

// Figma 색 (토큰 없음)
const TEXT_STRONG = '#1F242E';
const TEXT_HELPER = '#9EA6B2';
const TEXT_NOTICE = '#6B7380';

export default function SignupScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const valid = validateSignup({ name, loginId, password, passwordConfirm });
  const clear = t('common.clear');

  const submit = () => {
    if (!Object.values(valid).every(Boolean)) {
      return;
    }
    // TODO: 아이디 중복 확인(GET /api/auth/login-id/availability)과 가입(POST /api/auth/signup) 연동
  };

  // 키보드가 열리면 하단 버튼을 키보드 위로 올린다
  // Android도 edge-to-edge라 adjustResize가 화면을 줄여 주지 않아 padding을 쓴다
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Field label={t('signup.name')}>
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('signup.namePlaceholder')}
            clearLabel={clear}
            maxLength={NAME_MAX}
            autoComplete="name"
            textContentType="name"
          />
        </Field>
        <Field
          label={t('auth.loginId')}
          helper={t('signup.loginIdRule')}
          error={loginId.length > 0 && !valid.loginId}
        >
          <TextField
            value={loginId}
            onChangeText={setLoginId}
            placeholder={t('auth.loginId')}
            clearLabel={clear}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username-new"
            textContentType="username"
          />
        </Field>
        <Field
          label={t('auth.password')}
          helper={t('signup.passwordRule')}
          error={password.length > 0 && !valid.password}
        >
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.password')}
            clearLabel={clear}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </Field>
        <Field
          label={t('signup.passwordConfirm')}
          // Figma에 오류 문구가 없어 일치하지 않을 때만 보여준다
          helper={
            passwordConfirm.length > 0 && !valid.passwordConfirm
              ? t('signup.passwordMismatch')
              : undefined
          }
          error
        >
          <TextField
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder={t('signup.passwordConfirmPlaceholder')}
            clearLabel={clear}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </Field>
        <Text style={styles.notice}>{t('signup.socialNotice')}</Text>
      </ScrollView>
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: spacing.screenPadding + insets.bottom },
        ]}
      >
        <Button label={t('signup.submit')} onPress={submit} shadow />
      </View>
    </KeyboardAvoidingView>
  );
}

// 라벨 + 입력칸 + 안내 문구. 규칙에 어긋나면 안내 문구를 빨간색으로 바꾼다
function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {helper && (
        <Text style={[styles.helper, error && styles.helperError]}>
          {helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  field: { gap: 6 },
  label: { ...typography.bodyStrong, color: TEXT_STRONG },
  helper: {
    ...typography.captionBase,
    color: TEXT_HELPER,
    paddingHorizontal: 14,
  },
  helperError: { color: colors.text.negative },
  notice: {
    ...typography.bodySubtle,
    color: TEXT_NOTICE,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: colors.surface.default,
    padding: spacing.screenPadding,
    ...shadow.bottomBar,
  },
});
