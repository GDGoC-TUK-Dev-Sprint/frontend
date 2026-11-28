import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import Button from '../components/Button';
import StateView from '../components/StateView';
import ArrowRightIcon from '../assets/icons/arrow-right.svg';
import CoinIcon from '../assets/icons/coin.svg';
import EffectIcon from '../assets/icons/effect.svg';
import InsightIcon from '../assets/icons/expense-insight.svg';
import TargetIcon from '../assets/icons/expense-target.svg';
import TrendingDownIcon from '../assets/icons/expense-trending-down.svg';
import { ApiError } from '../api/client';
import { getExpenseReport, type ExpenseReport } from '../api/expenses';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { summaryToTrip } from './tripCondition/useTripCondition';
import {
  BasisToggle,
  ITEM_STYLE,
  ProgressBar,
  type Basis,
} from './expense/shared';
import {
  colors,
  fontFamily,
  shadow,
  spacing,
  typography,
} from '../theme/tokens';
import { formatMonthDay, parseDate } from '../utils/date';
import { formatMoney, formatRange, type Money } from '../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseReport'>;

// 실제 지출 비중 막대·범례 색 (Figma 값, 디자인 시스템에 없음, 확인 필요). 비중이 큰 순서로 칠한다
const SHARE_COLORS = ['#0078FF', '#006FEE', '#D7E3FA', '#D4E0F7', '#B4BBCB'];
const SOFT_BLUE = '#E9EFFB';
const ROW_BG = '#F9F9FB';

const abs = (m: Money) => formatMoney({ ...m, amount: Math.abs(m.amount) });

// Figma 「09 지출 리포트」 (spec F9, API 30). 모든 수치는 리포트 응답 하나에서 나온다 (앱은 계산하지 않는다)
// TODO: 「리포트 이미지 저장 및 공유」는 화면을 이미지로 찍는 네이티브 모듈이 필요해 아직 두지 않았다
export default function ExpenseReportScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<ExpenseReport>();
  const [error, setError] = useState<string>();
  const [basis, setBasis] = useState<Basis>('total');

  const load = useCallback(() => {
    setError(undefined);
    getExpenseReport(tripId)
      .then(setReport)
      .catch(e =>
        setError(
          t(
            e instanceof ApiError && e.code === 'EXPENSES_NOT_SAVED'
              ? 'expense.notSaved'
              : 'auth.networkError',
          ),
        ),
      );
  }, [tripId, t]);
  useEffect(load, [load]);

  if (!report) {
    return error ? (
      <StateView
        type="error"
        message={error}
        retryLabel={t('common.retry')}
        onRetry={load}
      />
    ) : (
      <StateView type="loading" />
    );
  }

  const trip = summaryToTrip(t, report.trip);
  const view = report[basis];
  const saved = view.difference.amount <= 0;
  const pct = (n: number | null) => (n === null ? '-' : `${n}%`);
  const formatDate = (date: string) =>
    formatMonthDay(parseDate(date), i18n.language);
  // 입력한 항목만 비교한다. 비중은 큰 순서
  const items = view.items.filter(i => i.actual);
  const shares = [...items]
    .filter(i => i.sharePct !== null)
    .sort((a, b) => b.sharePct! - a.sharePct!);
  const itemName = (i: (typeof items)[number]) =>
    i.item === 'OTHER' && i.labels.length
      ? i.labels.join(', ')
      : t(`cost.items.${i.item}`);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 여행 요약 */}
        <View style={[styles.card, styles.gap12]}>
          <View style={styles.doneBadge}>
            <View style={styles.dot} />
            <Text
              style={[typography.bodySubtle, { color: colors.brand.primary }]}
            >
              {t('expense.tripDone')}
            </Text>
          </View>
          <View>
            <Text style={[typography.bodyStrong, { color: colors.text.base }]}>
              {trip.title}
            </Text>
            <Text
              style={[typography.captionBase, { color: colors.text.subtle }]}
            >
              {t('expense.tripMeta', {
                period: `${formatDate(trip.startDate)} - ${formatDate(
                  trip.endDate,
                )}`,
                count: trip.travelers,
              })}
            </Text>
          </View>
          <View style={styles.info}>
            <EffectIcon width={20} height={20} color={colors.brand.primary} />
            <View style={styles.flex}>
              <Text
                style={[typography.bodySubtle, { color: colors.text.label }]}
              >
                {t('expense.reportQuestion')}
              </Text>
              <Text
                style={[typography.bodySubtle, { color: colors.text.info }]}
              >
                {t('expense.reportIntro')}
              </Text>
            </View>
          </View>
        </View>

        {/* 총 지출 (09-02·03) */}
        <View style={[styles.card, styles.gap16, styles.pad20]}>
          <BasisToggle
            value={basis}
            onChange={setBasis}
            partySize={report.trip.partySize}
          />
          <View style={styles.gap6}>
            <Text style={styles.label14}>{t('expense.totalSpent')}</Text>
            <View style={styles.between}>
              <Text
                style={[styles.bigAmount, styles.shrink]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(view.actual)}
              </Text>
              <Text style={[typography.bodyBase, { color: colors.text.muted }]}>
                {t('expense.estimateAmount', {
                  amount: formatRange(view.estimate),
                })}
              </Text>
            </View>
          </View>
          <View style={styles.gap8}>
            <View style={[styles.banner, !saved && styles.bannerOver]}>
              <View style={[styles.row8, styles.flex]}>
                <CoinIcon width={24} height={24} />
                <Text
                  style={[
                    typography.bodyBase,
                    styles.flex,
                    { color: colors.text.base },
                  ]}
                >
                  {t(
                    saved
                      ? 'expense.savedVsEstimate'
                      : 'expense.overVsEstimate',
                    {
                      amount: abs(view.difference),
                    },
                  )}
                </Text>
              </View>
              {view.differencePct !== null && (
                <Text
                  style={[
                    typography.bodyStrong,
                    {
                      color: saved
                        ? colors.brand.primary
                        : colors.text.negative,
                    },
                  ]}
                >
                  {`${view.differencePct > 0 ? '+' : ''}${view.differencePct}%`}
                </Text>
              )}
            </View>
            <View style={[styles.between, styles.px4]}>
              <View style={styles.row6}>
                <TargetIcon
                  width={14.667}
                  height={14}
                  color={colors.brand.primary}
                />
                <Text style={[styles.text14, { color: colors.text.label }]}>
                  {t('expense.accuracy', { pct: pct(view.accuracyPct) })}
                </Text>
              </View>
              <Text style={[styles.text14, { color: colors.text.muted }]}>
                {t('expense.errorRate', { pct: pct(view.errorRatePct) })}
              </Text>
            </View>
            <ProgressBar ratio={(view.accuracyPct ?? 0) / 100} />
          </View>
        </View>

        {/* 예상과 비교 (09-04) */}
        <View style={[styles.card, styles.gap16, styles.pad20]}>
          <View style={styles.between}>
            <Text style={styles.sectionTitle}>{t('expense.compareTitle')}</Text>
            <Text style={[typography.bodySubtle, { color: colors.text.muted }]}>
              {t('expense.vsTotal')}
            </Text>
          </View>
          <View style={styles.row10}>
            <View style={styles.pair}>
              <Text style={styles.pairLabel}>{t('expense.estimate')}</Text>
              <Text style={styles.pairAmount}>
                {formatRange(view.estimate)}
              </Text>
              <Text style={styles.pairNote}>{t('expense.planBasis')}</Text>
            </View>
            <View style={styles.pair}>
              <Text style={[styles.pairLabel, { color: colors.brand.primary }]}>
                {t('expense.actual')}
              </Text>
              <Text style={styles.pairAmount}>{formatMoney(view.actual)}</Text>
              <Text style={[styles.pairNote, { color: colors.brand.primary }]}>
                {t('expense.finalAmount')}
              </Text>
            </View>
          </View>
          <View style={[styles.info, styles.center]}>
            <View style={styles.trendIcon}>
              <TrendingDownIcon
                width={24}
                height={24}
                color={saved ? colors.brand.primary : colors.text.negative}
                style={!saved && styles.flipY}
              />
            </View>
            <View style={styles.flex}>
              <Text
                style={[typography.bodySubtle, { color: colors.text.base }]}
              >
                {t(saved ? 'expense.spentLess' : 'expense.spentMore', {
                  amount: abs(view.difference),
                })}
              </Text>
              <Text
                style={[typography.captionBase, { color: colors.text.subtle }]}
              >
                {t(`expense.status.${view.status}`)}
              </Text>
            </View>
          </View>
          <View style={styles.gap6}>
            <View style={styles.between}>
              <Text style={styles.small11}>{t('expense.execution')}</Text>
              <Text style={[styles.small11, styles.strong]}>
                {pct(view.executionPct)}
              </Text>
            </View>
            <ProgressBar ratio={(view.executionPct ?? 0) / 100} />
            <View style={styles.between}>
              <Text style={styles.tiny}>
                {formatMoney({ amount: 0, currency: view.actual.currency })}
              </Text>
              <Text style={styles.tiny}>
                {t('expense.limit', {
                  amount: formatMoney({
                    amount: view.estimate.max,
                    currency: view.estimate.currency,
                  }),
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 항목별 비교 (09-05·06) */}
        <View style={[styles.card, styles.gap16, styles.pad20]}>
          <View style={styles.between}>
            <View style={styles.gap2}>
              <Text style={styles.sectionTitle}>
                {t('expense.byItemTitle')}
              </Text>
              <Text
                style={[typography.bodySubtle, { color: colors.text.muted }]}
              >
                {t('expense.byItemCount', { count: items.length })}
              </Text>
            </View>
            <View style={[styles.softBadge]}>
              <Text
                style={[
                  typography.captionBase,
                  { color: colors.brand.primary },
                ]}
              >
                {t('expense.fields', { count: items.length })}
              </Text>
            </View>
          </View>
          {items.map(i => {
            const style = ITEM_STYLE[i.item];
            const Icon = style.icon;
            const over = i.status === 'ABOVE';
            return (
              <View key={i.item} style={styles.itemRow}>
                <View style={styles.between}>
                  <View style={[styles.row8, styles.flex]}>
                    <Icon
                      width={style.width}
                      height={style.height}
                      color={colors.text.label}
                    />
                    <Text
                      style={[
                        typography.bodySubtle,
                        styles.flex,
                        { color: colors.text.label },
                      ]}
                      numberOfLines={1}
                    >
                      {itemName(i)}
                    </Text>
                  </View>
                  {i.difference && i.difference.amount !== 0 && (
                    <Badge
                      tone={i.difference.amount > 0 ? 'negative' : 'brand'}
                      label={t(
                        i.difference.amount > 0
                          ? 'expense.overBadge'
                          : 'expense.savedBadge',
                        {
                          amount: abs(i.difference),
                        },
                      )}
                    />
                  )}
                </View>
                <View style={styles.between}>
                  <Text
                    style={[typography.bodyBase, { color: colors.text.muted }]}
                  >
                    {i.estimate
                      ? t('expense.estimateAmount', {
                          amount: formatRange(i.estimate),
                        })
                      : t('expense.noEstimate')}
                  </Text>
                  <Text
                    style={[
                      typography.bodyStrong,
                      { color: colors.text.label },
                    ]}
                  >
                    {t('expense.actualAmount', {
                      amount: formatMoney(i.actual!),
                    })}
                  </Text>
                </View>
                <ProgressBar
                  ratio={
                    i.estimate && i.estimate.max > 0
                      ? i.actual!.amount / i.estimate.max
                      : 1
                  }
                  color={over ? colors.text.negative : colors.brand.primary}
                />
              </View>
            );
          })}
          {report.insight && (
            <View style={styles.insight}>
              <InsightIcon
                width={11.25}
                height={17}
                color={colors.brand.primary}
              />
              <Text
                style={[typography.bodySubtle, styles.flex, styles.insightText]}
              >
                {report.insight}
              </Text>
            </View>
          )}
        </View>

        {/* 실제 지출 비중 (09-07) */}
        {shares.length > 0 && (
          <View style={[styles.card, styles.gap12, styles.pad20]}>
            <View style={styles.between}>
              <Text style={styles.sectionTitle}>{t('expense.shareTitle')}</Text>
              <Text
                style={[typography.bodySubtle, { color: colors.text.muted }]}
              >
                {t('expense.shareTotal')}
              </Text>
            </View>
            <View style={styles.stack}>
              {shares.map((i, n) => (
                <View
                  key={i.item}
                  style={{
                    width: `${i.sharePct}%`,
                    backgroundColor: SHARE_COLORS[n],
                  }}
                />
              ))}
            </View>
            <View style={styles.legend}>
              {shares.map((i, n) => (
                <View key={i.item} style={styles.legendItem}>
                  <View style={[styles.row6, styles.flex]}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: SHARE_COLORS[n] },
                      ]}
                    />
                    <Text
                      style={[
                        typography.bodySubtle,
                        styles.flex,
                        { color: colors.text.muted },
                      ]}
                      numberOfLines={1}
                    >
                      {itemName(i)}
                    </Text>
                  </View>
                  <Text
                    style={[typography.bodySubtle, styles.strong]}
                  >{`${i.sharePct}%`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={t('expense.backToTrips')}
          onPress={() => navigation.navigate('Main', { screen: 'MyPage' })}
          icon={ArrowRightIcon}
          shadow
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: 20, padding: spacing.screenPadding },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  center: { alignItems: 'center' },
  gap2: { gap: 2 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  pad20: { padding: 20 },
  px4: { paddingHorizontal: 4 },
  row6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row10: { flexDirection: 'row', gap: 10 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
  },
  doneBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
  },
  info: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface.base,
  },
  label14: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.muted,
  },
  bigAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.65,
    color: colors.text.label,
  },
  text14: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 46,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  bannerOver: { backgroundColor: colors.surface.negativeSoft },
  sectionTitle: { ...typography.titleBase, color: colors.text.label },
  pair: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface.base,
  },
  pairLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text.muted,
    paddingBottom: 4,
  },
  pairAmount: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.label,
  },
  pairNote: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.text.muted,
    paddingTop: 4,
  },
  trendIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primarySoft,
  },
  flipY: { transform: [{ scaleY: -1 }] },
  small11: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.text.muted,
  },
  strong: { fontFamily: fontFamily.semibold, color: colors.text.label },
  tiny: { ...typography.captionSubtle, color: colors.text.muted },
  softBadge: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: SOFT_BLUE,
  },
  itemRow: { gap: 8, padding: 14, borderRadius: 12, backgroundColor: ROW_BG },
  insight: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(212,224,247,0.4)', // Figma 값
  },
  insightText: { lineHeight: 19.5, color: colors.text.label },
  stack: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.surface.subtle,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 },
  legendItem: {
    width: '48.5%',
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: 8,
    borderRadius: 4,
    backgroundColor: ROW_BG,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  footer: {
    padding: 16,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
});
