import React from 'react';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { useAuth } from '../auth/AuthContext';

export default function MyPageScreen() {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  return (
    <ScreenPlaceholder title={t('tabs.myPage')}>
      {/* TODO: POST /api/auth/logout 연동 전까지 쓰는 임시 버튼 */}
      <Button title={t('auth.tempLogout')} onPress={signOut} />
    </ScreenPlaceholder>
  );
}
