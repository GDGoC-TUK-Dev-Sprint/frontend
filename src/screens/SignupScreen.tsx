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
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { isLoginIdAvailable } from '../api/auth';
import { colors, shadow, spacing, typography } from '../theme/tokens';

export default function SignupScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { signUp } = useAuth();
  // 중복으로 확인된 아이디. 아이디를 고치면 안내가 사라진다
  const [takenId, setTakenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const valid = validateSignup({ name, loginId, password, passwordConfirm });
  const clear = t('common.clear');
  const idTaken = takenId !== null && takenId === loginId;

  // Figma에 중복 확인 버튼이 없어 가입하기를 누를 때 확인한다. 가입이 끝나면 바로 로그인한다
  // 오류 문구는 Figma에 없어 초안 (TODO: Figma 확인 필요)
  const submit = async () => {
    if (!Object.values(valid).every(Boolean)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!(await isLoginIdAvailable(loginId))) {
        setTakenId(loginId);
        setSubmitting(false);
        return;
      }
      await signUp({ name: name.trim(), loginId, password });
    } catch (e) {
      // 확인과 가입 사이에 같은 아이디가 먼저 가입한 경우 409
      if (e instanceof ApiError && e.status === 409) {
        setTakenId(loginId);
      } else {
        setError(t('auth.networkError'));
      }
      setSubmitting(false);
    }
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
          helper={idTaken ? t('auth.loginIdTaken') : t('signup.loginIdRule')}
          error={idTaken || (loginId.length > 0 && !valid.loginId)}
        >
          <TextField
            value={loginId}
            onChangeText={setLoginId}
            placeholder={t('auth.loginId')}
            clearLabel={clear}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username-new"
            keyboardType="ascii-capable" // 아이디는 영문 소문자·숫자·_ (iOS는 영문 키보드로 연다)
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
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          label={t('signup.submit')}
          onPress={submit}
          disabled={submitting}
          shadow
        />
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
  label: { ...typography.bodyStrong, color: colors.text.heading },
  helper: {
    ...typography.captionBase,
    color: colors.text.helper,
    paddingHorizontal: 14,
  },
  helperError: { color: colors.text.negative },
  notice: {
    ...typography.bodySubtle,
    color: colors.text.notice,
    textAlign: 'center',
  },
  error: {
    ...typography.bodySubtle,
    color: colors.text.negative,
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomBar: {
    backgroundColor: colors.surface.default,
    padding: spacing.screenPadding,
    ...shadow.bottomBar,
  },
});
