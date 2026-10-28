import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import SearchIcon from '../assets/icons/search.svg';
import CloseIcon from '../assets/icons/close.svg';
import { colors, typography } from '../theme/tokens';

// Figma 「Input Field」 컴포넌트. 포커스되면 흰 배경 + 파란 테두리
// 값이 있으면 오른쪽에 지우기 버튼
const PLACEHOLDER = '#99A1AD'; // Figma 값, 토큰에 없음

type Props = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
  clearLabel: string; // 지우기 버튼의 접근성 라벨
  search?: boolean; // 왼쪽 검색 아이콘
};

export default function TextField({
  value,
  onChangeText,
  clearLabel,
  search,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      {search && (
        <SearchIcon width={20} height={20} color={colors.brand.primary} />
      )}
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={PLACEHOLDER}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          style={styles.clear}
        >
          <CloseIcon width={14} height={14} color={colors.text.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 46,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.base,
  },
  focused: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.default,
  },
  input: {
    ...typography.bodyBase,
    flex: 1,
    padding: 0, // Android 기본 padding 제거
    color: colors.text.base,
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.subtle,
  },
});
