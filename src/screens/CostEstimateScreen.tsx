import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import StateView from '../components/StateView';
import { TripStatusBadge, TripSummaryCard } from '../components/TripHeader';
import CalendarIcon from '../assets/icons/cost-calendar.svg';
import ChartIcon from '../assets/icons/cost-chart.svg';
import PieIcon from '../assets/icons/cost-pie.svg';
import WalletIcon from '../assets/icons/cost-wallet.svg';
import { ApiError } from '../api/client';
import {
  confirmTrip,
  getCostEstimate,
  type CostBreakdown,
  type CostEstimate,
} from '../api/trips';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTrip } from '../trips/TripContext';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { formatMonthDay, parseDate } from '../utils/date';
import { formatMoney, formatRange } from '../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'CostEstimate'>;
type Basis = 'perPerson' | 'total';

// 이 화면에서만 쓰는 Figma 값 (디자인 시스템에 없음, 확인 필요)
const FIGMA = {
  title: '#191F28',
  label: '#6B7684',
  hint: '#8B95A1',
  accent: '#2F70F2',
  accentSoft: '#EDF3FF',
  excludes: '#576071',
  track: '#E5E8EB',
  inner: '#F8F9FB',
  dayBorder: '#EDF0F5',
  peakBg: '#F0F6FF',
  peakBorder: '#D3E3FD',
  rowDivider: '#F2F4F7',
};
// 항목별 막대·글자 색과 아이콘 칸 배경 (Figma 값). 시안의 숙박 색(#4dabf7)은 쇼핑에 쓴다 (숙박은 경비에서 뺀다)
const ITEM_COLORS: Record<string, [string, string]> = {
  FOOD: ['#FF922B', '#FFF4E6'],
  SHOPPING: ['#4DABF7', '#E7F5FF'],
  SIGHTSEEING: ['#20C997', '#E6FCF5'],
  TRANSPORT: ['#339AF0', '#E7F5FF'],
  OTHER: ['#845EF7', '#F3F0FF'],
};
const itemColor = (code: string) =>
  ITEM_COLORS[code] ?? [colors.text.subtle, colors.surface.subtle];

// Figma 「04 예상 경비」 (spec F4). 모든 수치는 GET /api/trips/{tripId}/cost-estimate 응답 하나에서 나온다 (F4-9)
// 시안은 단일 금액·숙박 항목이 있지만 팀 결정대로 범위로 보여주고 숙박은 넣지 않는다 (spec §0)
// 항목 이름은 서버가 코드만 주므로 앱 문구로 바꾼다 (cost.items.*)
export default function CostEstimateScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trip } = useTrip();
  const [estimate, setEstimate] = useState<CostEstimate>();
  const [failed, setFailed] = useState(false);
  const [basis, setBasis] = useState<Basis>('total');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const tripId = trip?.tripId;

  const load = useCallback(() => {
    if (!tripId) return;
    setFailed(false);
    getCostEstimate(tripId)
      .then(setEstimate)
      .catch(() => setFailed(true));
  }, [tripId]);
  useEffect(load, [load]);

  if (!trip || !tripId) {
    return <StateView type="empty" message={t('placeSelect.noTrip')} />;
  }
  if (!estimate) {
    return failed ? (
      <StateView
        type="error"
        message={t('auth.networkError')}
        retryLabel={t('common.retry')}
        onRetry={load}
      />
    ) : (
      <StateView type="loading" />
    );
  }

  // 확정하면 편집할 수 없다 (POST .../confirm). 확정한 여행을 메인 티켓으로 보여준다
  const confirm = async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      await confirmTrip(tripId);
      navigation.navigate('Main', { screen: 'Home' });
    } catch (e) {
      const active = e instanceof ApiError && e.code === 'ACTIVE_TRIP_EXISTS';
      setConfirmError(
        t(active ? 'condition.activeTripExists' : 'auth.networkError'),
      );
      setConfirming(false);
    }
  };

  const view = estimate[basis];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TripSummaryCard
          trip={{ ...trip, title: estimate.trip.title ?? trip.title }}
          right={<TripStatusBadge trip={trip} />}
        />

        {/* 총 예상 경비 */}
        <View style={[styles.card, styles.hero]}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <View style={styles.chartIcon}>
                <ChartIcon width={11.25} height={11.25} />
              </View>
              <Text style={[typography.bodyStrong, { color: FIGMA.accent }]}>
                {t('cost.totalTitle')}
              </Text>
            </View>
            <BasisToggle value={basis} onChange={setBasis} />
          </View>
          <Text style={[typography.captionBase, { color: FIGMA.excludes }]}>
            {t('cost.excludes')}
          </Text>
          <Text style={styles.totalAmount}>{formatRange(view.amount)}</Text>
          <View style={styles.heroFooter}>
            <Text style={[typography.bodyBase, { color: FIGMA.label }]}>
              {basis === 'total'
                ? t('cost.partyBasis', { count: estimate.trip.partySize })
                : t('cost.perPersonBasis')}
            </Text>
            {basis === 'total' && (
              <View style={styles.heroBadge}>
                <Text style={[typography.bodyBase, { color: FIGMA.accent }]}>
                  {t('cost.perPersonRange', {
                    amount: formatRange(estimate.perPerson.amount),
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        <BudgetCard breakdown={view} guidance={estimate.guidance} />

        {/* 항목별 예상 경비. 설명 자리에는 계산 근거 문장을 보여준다 (F4-5) */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <PieIcon width={15} height={15} />
              <Text style={[typography.bodyStrong, { color: FIGMA.title }]}>
                {t('cost.itemsTitle')}
              </Text>
            </View>
            <Text style={[typography.bodySubtle, { color: FIGMA.hint }]}>
              {t('cost.itemsCount', { count: view.items.length })}
            </Text>
          </View>
          <View style={styles.shareBar}>
            {view.items.map(i => (
              <View
                key={i.item}
                style={{
                  flex: i.sharePct,
                  backgroundColor: itemColor(i.item)[0],
                }}
              />
            ))}
          </View>
          <View>
            {view.items.map((i, index) => (
              <View
                key={i.item}
                style={[styles.itemRow, index > 0 && styles.itemDivider]}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: itemColor(i.item)[1] },
                  ]}
                />
                <View style={styles.flex}>
                  <Text style={[typography.bodyBase, { color: FIGMA.title }]}>
                    {t(`cost.items.${i.item}`)}
                  </Text>
                  <Text style={styles.itemSource}>{i.basis}</Text>
                </View>
                <View style={styles.itemAmount}>
                  <Text style={[typography.bodyBase, { color: FIGMA.title }]}>
                    {formatRange(i.amount)}
                  </Text>
                  <Text style={[styles.share, { color: itemColor(i.item)[0] }]}>
                    {`${i.sharePct}%`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 일자별 예상 지출 */}
        <View style={[styles.card, styles.daysCard]}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <CalendarIcon width={13.5} height={15} />
              <Text style={[typography.bodyStrong, { color: FIGMA.title }]}>
                {t('cost.daysTitle')}
              </Text>
            </View>
            <Text style={[typography.bodySubtle, { color: FIGMA.hint }]}>
              {t('cost.daysCount', { count: view.days.length })}
            </Text>
          </View>
          {view.days.map(d => (
            <DayCard key={d.dayNumber} day={d} />
          ))}
        </View>

        <NotesCard estimate={estimate} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.screenPadding) },
        ]}
      >
        {confirmError && <Text style={styles.error}>{confirmError}</Text>}
        <Button
          label={t('cost.confirm')}
          onPress={confirm}
          disabled={confirming || !estimate.trip.editable}
          shadow
        />
      </View>
    </View>
  );
}

// 1인 기준 / 전체 기준 (F4-3). 두 금액이 한 응답에 있어 다시 요청하지 않는다
function BasisToggle({
  value,
  onChange,
}: {
  value: Basis;
  onChange: (next: Basis) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.toggle}>
      {(['perPerson', 'total'] as const).map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.toggleButton, selected && styles.toggleSelected]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
          >
            <Text
              style={[
                typography.captionBase,
                {
                  color: selected ? colors.surface.default : colors.text.subtle,
                },
              ]}
            >
              {t(option === 'total' ? 'cost.totalBasis' : 'cost.perPerson')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 희망 예산과 비교 (F4-4). 희망 예산이 없으면(상관없음) 숨긴다. 안내 문장은 1인 기준이다
function BudgetCard({
  breakdown,
  guidance,
}: {
  breakdown: CostBreakdown;
  guidance: string | null;
}) {
  const { t } = useTranslation();
  const { budget, amount: needed } = breakdown;
  if (!budget) return null;
  const exceeds = budget.status !== 'WITHIN_BUDGET';
  // 막대: 희망 예산(파랑)과 예상 최대가 예산을 넘는 만큼(빨강)
  const set = budget.amount.amount;
  const max = Math.max(needed.max, set);
  const status =
    budget.status === 'WITHIN_BUDGET'
      ? t('cost.budgetWithin')
      : budget.status === 'OVER_BUDGET' && budget.overBy
      ? t('cost.budgetOver', { amount: formatRange(budget.overBy) })
      : t('cost.budgetMayExceed');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <WalletIcon width={14.25} height={13.5} />
          <Text style={[typography.bodyStrong, { color: FIGMA.title }]}>
            {t('cost.budgetTitle')}
          </Text>
        </View>
        <View style={[styles.statusTag, !exceeds && styles.statusTagWithin]}>
          <View
            style={[styles.statusDot, !exceeds && styles.statusDotWithin]}
          />
          <Text
            style={[
              styles.statusText,
              { color: exceeds ? colors.text.negative : colors.brand.primary },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
      <View style={styles.budgetBox}>
        <View style={styles.row}>
          <Text style={[typography.bodyBase, { color: FIGMA.label }]}>
            {t('cost.budgetSet')}
          </Text>
          <Text style={styles.budgetValue}>{formatMoney(budget.amount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyBase, { color: FIGMA.label }]}>
            {t('cost.budgetNeeded')}
          </Text>
          <Text
            style={[
              styles.budgetValue,
              styles.bold,
              { color: exceeds ? colors.text.negative : FIGMA.title },
            ]}
          >
            {formatRange(needed)}
          </Text>
        </View>
        <View style={styles.budgetBar}>
          <View
            style={{ flex: set / max, backgroundColor: colors.brand.primary }}
          />
          {needed.max > set && (
            <View
              style={{
                flex: (needed.max - set) / max,
                backgroundColor: colors.text.negative,
              }}
            />
          )}
        </View>
      </View>
      {guidance && (
        <Text style={[typography.bodySubtle, { color: FIGMA.label }]}>
          {guidance}
        </Text>
      )}
    </View>
  );
}

// 데이터 한계와 근거 출처 (핵심 원칙: 범위와 함께 한계를 보여준다, F4-5·F4-6)
// TODO: 시안의 근거 배지·출처 시트 자리가 정해지지 않아 화면 아래 카드로 둔다 (Figma 확인 필요)
function NotesCard({ estimate }: { estimate: CostEstimate }) {
  const { t } = useTranslation();
  const { limitations, sources } = estimate;
  if (!limitations.length && !sources.length) return null;
  return (
    <View style={styles.card}>
      {limitations.length > 0 && (
        <View style={styles.notes}>
          <Text style={[typography.bodyStrong, { color: FIGMA.title }]}>
            {t('cost.limitationsTitle')}
          </Text>
          {limitations.map(l => (
            <Text
              key={l.code}
              style={[typography.bodySubtle, { color: FIGMA.label }]}
            >
              {`· ${l.message}`}
            </Text>
          ))}
        </View>
      )}
      {sources.length > 0 && (
        <View style={styles.notes}>
          <Text style={[typography.bodyStrong, { color: FIGMA.title }]}>
            {t('cost.sourcesTitle')}
          </Text>
          {sources.map(src => (
            <Text
              key={src.name}
              style={[typography.bodySubtle, { color: FIGMA.hint }]}
            >
              {src.detail ? `· ${src.name} (${src.detail})` : `· ${src.name}`}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function DayCard({ day }: { day: CostBreakdown['days'][number] }) {
  const { t, i18n } = useTranslation();
  const peak = day.highest;
  return (
    <View style={[styles.day, peak && styles.dayPeak]}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          <View style={[styles.dayNumber, peak && styles.dayNumberPeak]}>
            <Text
              style={[
                typography.captionBase,
                { color: peak ? colors.surface.default : colors.text.base },
              ]}
            >
              {day.dayNumber}
            </Text>
          </View>
          <Text style={[typography.bodyBase, { color: FIGMA.title }]}>
            {t('plan.dayTab', { day: day.dayNumber })}
          </Text>
          {peak ? (
            <View style={styles.peakTag}>
              <Text
                style={[
                  typography.captionBase,
                  { color: colors.text.negative },
                ]}
              >
                {t('cost.peak')}
              </Text>
            </View>
          ) : (
            <Text
              style={[typography.bodySubtle, { color: colors.text.subtle }]}
            >
              {formatMonthDay(parseDate(day.date), i18n.language)}
            </Text>
          )}
        </View>
        <Text
          style={[
            typography.bodyBase,
            { color: peak ? colors.brand.primary : FIGMA.title },
          ]}
        >
          {formatRange(day.amount)}
        </Text>
      </View>
      <View style={[styles.chips, peak && styles.chipsPeak]}>
        {day.items.map(item => (
          <View key={item.item} style={styles.chip}>
            <Text
              style={[
                typography.captionBase,
                { color: peak ? colors.brand.primary : colors.text.muted },
              ]}
            >
              {`${t(`cost.items.${item.item}`)} ${formatRange(item.amount)}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: spacing.sectionGap, padding: spacing.screenPadding },
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bold: { fontFamily: fontFamily.bold },
  card: {
    gap: 12,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  hero: { gap: 4, padding: 21, borderColor: colors.brand.surfaceSubtle },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chartIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(47,112,242,0.1)', // Figma 값
  },
  // Figma는 ExtraBold 32. 앱에 ExtraBold 폰트가 없어 Bold로 맞춤. 범위라 글자를 줄였다
  totalAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: FIGMA.title,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 9,
    borderTopWidth: 1,
    borderColor: 'rgba(47,112,242,0.15)', // Figma 값
  },
  heroBadge: {
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: FIGMA.accentSoft,
  },
  toggle: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 9999,
    backgroundColor: '#F8F9FA', // Figma 값
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  toggleSelected: { backgroundColor: colors.brand.primary },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.surface.negativeSoft,
  },
  statusTagWithin: { backgroundColor: colors.brand.surfaceSubtle },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.text.negative,
  },
  statusDotWithin: { backgroundColor: colors.brand.primary },
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    lineHeight: 17.25,
  },
  budgetBox: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: FIGMA.inner,
  },
  budgetValue: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#333D4B', // Figma 값
  },
  budgetBar: {
    flexDirection: 'row',
    height: 12,
    marginTop: 4,
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: FIGMA.track,
  },
  shareBar: {
    flexDirection: 'row',
    gap: 2,
    height: 10,
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: FIGMA.track,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  itemDivider: { borderTopWidth: 1, borderColor: FIGMA.rowDivider },
  itemIcon: { width: 32, height: 32, borderRadius: 8 },
  itemSource: {
    fontFamily: fontFamily.regular,
    fontSize: 11.5,
    lineHeight: 17.25,
    color: FIGMA.hint,
  },
  itemAmount: { alignItems: 'flex-end' },
  share: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 16.5 },
  daysCard: { borderColor: FIGMA.dayBorder, borderRadius: 20 },
  day: {
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: FIGMA.dayBorder,
    borderRadius: 12,
    backgroundColor: FIGMA.inner,
  },
  dayPeak: { borderColor: FIGMA.peakBorder, backgroundColor: FIGMA.peakBg },
  dayNumber: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 999,
    backgroundColor: colors.surface.default,
  },
  dayNumberPeak: { borderWidth: 0, backgroundColor: colors.brand.primary },
  peakTag: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.negativeSoft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 9,
    borderTopWidth: 1,
    borderColor: colors.surface.subtle,
  },
  chipsPeak: { borderColor: '#D9E6FE' }, // Figma 값
  chip: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.default,
  },
  notes: { gap: 4 },
  error: {
    ...typography.bodySubtle,
    color: colors.text.negative,
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    padding: spacing.screenPadding,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
});
