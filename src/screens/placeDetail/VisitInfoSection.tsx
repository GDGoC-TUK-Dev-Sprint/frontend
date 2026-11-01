import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import Badge, { StatusBadge } from '../../components/Badge';
import ClockIcon from '../../assets/icons/clock.svg';
import CloseCalendarIcon from '../../assets/icons/close-calendar.svg';
import CoinIcon from '../../assets/icons/coin.svg';
import type { PlaceDetail } from '../../mocks';
import { colors, typography } from '../../theme/tokens';
import { stripHtml } from '../../utils/text';

// ④ 방문 정보: 운영 상태, 운영시간·정기 휴무 카드, 입장 요금 카드 (spec F2-3)
// 값은 TourAPI 자유 텍스트라 태그만 지우고 그대로 보여준다 (R-K09)
export default function VisitInfoSection({ place }: { place: PlaceDetail }) {
  const { t } = useTranslation();
  const { operating, hours, closedDays, fees } = place;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('placeDetail.visitInfo')}</Text>
        <StatusBadge
          status={operating.isOpen ? 'open' : 'closed'}
          label={
            operating.isOpen
              ? operating.lastEntry
                ? t('placeDetail.openUntil', { time: operating.lastEntry })
                : t('placeDetail.open')
              : t('placeDetail.closed')
          }
        />
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <InfoCard
            icon={ClockIcon}
            label={t('placeDetail.hours')}
            value={hours?.value}
            note={hours?.note}
          />
          <InfoCard
            icon={CloseCalendarIcon}
            label={t('placeDetail.closedDays')}
            value={closedDays?.value}
            note={closedDays?.note}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.feeHeader}>
            <CardLabel icon={CoinIcon} label={t('placeDetail.fee')} />
            {fees?.note && <Badge label={fees.note} tone="muted" />}
          </View>
          {fees?.rows.length ? (
            <View style={styles.feeRows}>
              {fees.rows.map(row => (
                <View key={row.label} style={styles.feeRow}>
                  <Text style={styles.feeLabel}>{stripHtml(row.label)}</Text>
                  <Text style={styles.feeValue}>{stripHtml(row.value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>{t('placeDetail.noInfo')}</Text>
          )}
        </View>
        <Text style={styles.disclaimer}>{t('placeDetail.mayDiffer')}</Text>
      </View>
    </View>
  );
}

function CardLabel({
  icon: Icon,
  label,
}: {
  icon: React.FC<SvgProps>;
  label: string;
}) {
  return (
    <View style={styles.cardLabel}>
      <Icon width={16} height={16} />
      <Text style={[typography.bodyBase, { color: colors.text.muted }]}>
        {label}
      </Text>
    </View>
  );
}

function InfoCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.FC<SvgProps>;
  label: string;
  value?: string;
  note?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.card, styles.half]}>
      <CardLabel icon={icon} label={label} />
      <Text style={styles.value}>
        {value ? stripHtml(value) : t('placeDetail.noInfo')}
      </Text>
      {note && <Text style={styles.note}>{stripHtml(note)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { ...typography.titleBase, color: colors.text.label },
  grid: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  card: {
    gap: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
  },
  half: { flex: 1 },
  cardLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { ...typography.bodyStrong, paddingTop: 2, color: colors.text.base },
  note: { ...typography.bodySubtle, color: colors.text.muted },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeRows: { paddingTop: 4 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  feeLabel: {
    ...typography.bodyStrong,
    flexShrink: 1,
    color: colors.text.base,
  },
  feeValue: { ...typography.bodyBase, color: colors.text.base },
  // R-K09: 자유 텍스트라 실제와 다를 수 있음을 알린다
  disclaimer: { ...typography.captionBase, color: colors.text.subtle },
});
