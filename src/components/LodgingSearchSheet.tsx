import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import Badge from './Badge';
import BottomSheet from './BottomSheet';
import Chip from './Chip';
import TextField from './TextField';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import HanokIcon from '../assets/icons/hanok.svg';
import HotelIcon from '../assets/icons/hotel.svg';
import HouseIcon from '../assets/icons/house.svg';
import PinIcon from '../assets/icons/pin.svg';
import WarningIcon from '../assets/icons/warning.svg';
import {
  searchMockLodgings,
  type Area,
  type Lodging,
  type LodgingType,
} from '../mocks';
import { colors, fontFamily, typography } from '../theme/tokens';

// Figma 「02a 숙소 위치 검색」. 숙소 검색, 지도에서 선택, 숙소 미정 시 지역 선택 (spec F1-3)
type Props = {
  visible: boolean;
  onClose: () => void;
  areas: Area[];
  selectedLodgingId?: string;
  selectedAreaCode?: string;
  onSelectLodging: (lodging: Lodging) => void;
  onSelectArea: (area: Area) => void;
};

const ICONS: Record<LodgingType, React.FC<SvgProps>> = {
  hotel: HotelIcon,
  guesthouse: HouseIcon,
  hanok: HanokIcon,
};

// Figma 값 (토큰 없음)
const HEADING = '#354153';
const DIVIDER = '#F1F5F9';

export default function LodgingSearchSheet({
  visible,
  onClose,
  areas,
  selectedLodgingId,
  selectedAreaCode,
  onSelectLodging,
  onSelectArea,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  // TODO: GET /api/lodgings 연동 시 입력이 멈춘 뒤 요청하도록 바꾼다
  const results = searchMockLodgings(query);

  return (
    <BottomSheet visible={visible} title={t('lodging.title')} onClose={onClose}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.search}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('lodging.searchPlaceholder')}
            clearLabel={t('common.clear')}
            search
            autoCorrect={false}
          />
        </View>

        <View style={styles.resultHeader}>
          <Text style={styles.heading}>
            {t('lodging.resultCount', { count: results.length })}
          </Text>
          {/* R-C52, spec F1-3b 출처 표시 */}
          <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
            {t('lodging.source')}
          </Text>
        </View>
        <View style={styles.results}>
          {results.map(lodging => (
            <LodgingCard
              key={lodging.id}
              lodging={lodging}
              selected={lodging.id === selectedLodgingId}
              onPress={() => onSelectLodging(lodging)}
            />
          ))}
        </View>

        <View style={styles.info}>
          <WarningIcon width={20} height={20} color={colors.text.muted} />
          <Text style={styles.infoText}>{t('lodging.privateNotice')}</Text>
        </View>

        <View style={styles.divider} />

        {/* TODO: 지도에서 선택(02b). 네이버 지도 SDK 연동 이슈에서 구현 */}
        <Pressable style={styles.mapCard} accessibilityRole="button">
          <View style={styles.mapIcon}>
            <PinIcon width={24} height={24} color={colors.brand.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
              {t('lodging.mapTitle')}
            </Text>
            <Text
              style={[typography.captionBase, { color: colors.text.subtle }]}
            >
              {t('lodging.mapSubtitle')}
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={colors.text.muted} />
        </Pressable>

        <View style={styles.areaSection}>
          <View style={styles.areaText}>
            <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
              {t('lodging.undecidedTitle')}
            </Text>
            <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
              {t('lodging.undecidedSubtitle')}
            </Text>
          </View>
          <View style={styles.areas}>
            {areas.map(area => (
              <Chip
                key={area.code}
                label={area.name}
                selected={area.code === selectedAreaCode}
                onPress={() => onSelectArea(area)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function LodgingCard({
  lodging,
  selected,
  onPress,
}: {
  lodging: Lodging;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = ICONS[lodging.type];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.cardIcon, selected && styles.cardIconSelected]}>
        <Icon
          width={20}
          height={20}
          color={selected ? colors.brand.primary : colors.text.muted}
        />
      </View>
      <View style={styles.flex}>
        <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
          {lodging.name}
        </Text>
        <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
          {lodging.nameEn}
        </Text>
        <Text style={[typography.captionBase, { color: colors.text.subtle }]}>
          {lodging.address}
        </Text>
      </View>
      {selected ? (
        <View style={styles.typeSelected}>
          <Text
            style={[typography.bodySubtle, { color: colors.brand.primary }]}
          >
            {lodging.typeName}
          </Text>
        </View>
      ) : (
        <Badge label={lodging.typeName} tone="neutral" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 12, paddingHorizontal: 16, paddingBottom: 40 },
  search: { paddingTop: 4 },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { ...typography.bodyStrong, color: HEADING },
  results: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  cardSelected: {
    borderColor: colors.brand.primarySoft,
    backgroundColor: colors.brand.surfaceSubtle,
    boxShadow: '0px 2px 8px rgba(0, 120, 255, 0.06)',
  },
  cardIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surface.subtle,
  },
  cardIconSelected: { backgroundColor: colors.brand.primarySoft },
  typeSelected: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.6)', // Figma 값
    borderRadius: 9999,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  info: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.base,
  },
  infoText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B', // Figma 값
  },
  divider: { height: 1, marginVertical: 16, backgroundColor: DIVIDER },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 70,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  mapIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  areaSection: { gap: 10 },
  areaText: { gap: 2 },
  areas: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 4 },
});
