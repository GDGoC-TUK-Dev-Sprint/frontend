import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../assets/icons/close.svg';
import { colors, typography } from '../theme/tokens';

// Figma 「01a 알림 확인」·「02a 숙소 위치 검색」의 바텀시트
// 손잡이·헤더를 아래로 끌어서 닫는다. 목록 스크롤과 겹치지 않게 끌기는 그 부분에서만 받는다
type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  headerRight?: React.ReactNode; // 닫기 버튼 왼쪽 (예: 모두 읽음)
  children: React.ReactNode;
};

// 이만큼 끌거나 이 속도보다 빠르게 놓으면 닫는다
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 1;

export default function BottomSheet({
  visible,
  title,
  onClose,
  headerRight,
  children,
}: Props) {
  const { t } = useTranslation();
  const dragY = useRef(new Animated.Value(0)).current;
  // onClose가 바뀌어도 PanResponder를 다시 만들지 않도록 ref로 최신 값을 읽는다
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const panResponder = useRef(
    PanResponder.create({
      // 터치 시작부터 받는다. 이동 때 넘겨받는 방식(onMoveShouldSet)은 Modal 안에서 호출되지 않았다
      // 닫기·모두 읽음 버튼은 더 안쪽이라 먼저 터치를 가져가므로 그대로 눌린다
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
          onCloseRef.current();
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () =>
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;

  // 끌어서 닫은 위치가 남지 않게 다시 열 때 제자리로
  useEffect(() => {
    if (visible) dragY.setValue(0);
  }, [visible, dragY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t('common.close')}
        />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: dragY }] }]}
        >
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.headerRight}>
                {headerRight}
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                >
                  <CloseIcon width={20} height={20} color={colors.text.muted} />
                </Pressable>
              </View>
            </View>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)', // Figma 값
  },
  // Figma 시트 높이 860 / 화면 973
  sheet: {
    height: '88%',
    gap: 16,
    borderTopWidth: 1,
    borderColor: '#F1F5F9', // Figma 값
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  dragArea: { gap: 16 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 6,
    marginTop: 16,
    marginBottom: 4, // Figma 손잡이 아래 여백 20 = 4 + gap 16
    borderRadius: 9999,
    backgroundColor: 'rgba(226,232,240,0.8)', // Figma 값
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: { ...typography.titleBase, color: '#354153' }, // Figma 값
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
