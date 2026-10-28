import React from 'react';
import { Button } from 'react-native';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { useAuth } from '../auth/AuthContext';

export default function MyPageScreen() {
  const { signOut } = useAuth();
  return (
    <ScreenPlaceholder title="마이페이지">
      {/* TODO: POST /api/auth/logout 연동 전까지 쓰는 임시 버튼 */}
      <Button title="임시 로그아웃" onPress={signOut} />
    </ScreenPlaceholder>
  );
}
