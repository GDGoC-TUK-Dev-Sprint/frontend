import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import PinIcon from '../assets/icons/pin.svg';
import PlusIcon from '../assets/icons/plus.svg';
import CheckIcon from '../assets/icons/check.svg';
import Badge from './Badge';
import Button from './Button';
import { colors, typography } from '../theme/tokens';

// Figma 「Sortable Card」(02c 장소 선택). 표시 항목은 spec F2-8
// Figma 값, 토큰에 없음
const TITLE = '#191F28';
const CATEGORY_TEXT = '#475569';
const RANK_BG = 'rgba(26,28,28,0.85)';

type Props = {
  rank: number;
  name: string;
  category: string; // "대분류 · 중분류"
  distance: string; // "숙소에서 1.3km · 직선거리"
  reasons: string[]; // 추천 이유 태그, 최대 2개 (spec §5A.4)
  imageUri?: string;
  // R-K11: Type3 이미지는 자르지 않는다. Type1처럼 잘라도 되는 이미지만 true
  cropImage?: boolean;
  added: boolean;
  addLabel: string; // "담기"
  addedLabel: string; // "담김"
  onToggleAdd: () => void;
  onPress?: () => void;
};

export default function PlaceCard({
  rank,
  name,
  category,
  distance,
  reasons,
  imageUri,
  cropImage,
  added,
  addLabel,
  addedLabel,
  onToggleAdd,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.image}>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              resizeMode={cropImage ? 'cover' : 'contain'}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.rank}>
            <Text style={[typography.captionBase, styles.rankText]}>
              {rank}
            </Text>
          </View>
        </View>
        <View style={styles.info}>
          <View style={styles.category}>
            <Text style={[typography.captionBase, { color: CATEGORY_TEXT }]}>
              {category}
            </Text>
          </View>
          <Text style={[typography.bodyStrong, { color: TITLE }]}>{name}</Text>
          <View style={styles.distance}>
            <PinIcon width={16} height={16} color={colors.text.subtle} />
            <Text style={[typography.captionBase, styles.distanceText]}>
              {distance}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.reasons}>
          {reasons.slice(0, 2).map(reason => (
            <Badge key={reason} label={reason} tone="muted" />
          ))}
        </View>
        <Button
          label={added ? addedLabel : addLabel}
          onPress={onToggleAdd}
          variant={added ? 'primary' : 'ghost'}
          size="small"
          icon={added ? CheckIcon : PlusIcon}
          iconPosition="left"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  image: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface.subtle,
  },
  rank: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RANK_BG,
  },
  rankText: { color: colors.surface.default },
  info: { flex: 1, alignItems: 'flex-start', gap: 4 },
  category: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.subtle,
  },
  distance: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { color: colors.text.subtle },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasons: { flexDirection: 'row', gap: 6, flexShrink: 1, overflow: 'hidden' },
});
