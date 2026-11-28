import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import Button from '../components/Button';
import StateView from '../components/StateView';
import { TripSummaryCard } from '../components/TripHeader';
import CloseIcon from '../assets/icons/close.svg';
import EffectIcon from '../assets/icons/effect.svg';
import PlusCircleIcon from '../assets/icons/plus-circle.svg';
import TrendDownIcon from '../assets/icons/expense-trend-down-small.svg';
import { ApiError } from '../api/client';
import {
  getExpenses,
  saveExpenses,
  type ExpenseInput,
  type ExpenseSheet,
} from '../api/expenses';
import type { CostItemCode } from '../api/trips';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { summaryToTrip } from './tripCondition/useTripCondition';
import {
  BasisToggle,
  FIXED_ITEMS,
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
import { formatMoney, formatRange } from '../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseInput'>;

// 입력 칸 하나. 기타(OTHER)는 이름도 받는다
type Row = { key: string; item: CostItemCode; label: string; amount: string };

const decimalsOf = (currency: string) =>
  currency === 'USD' || currency === 'EUR' ? 2 : 0;
// 쉼표·공백을 빼고 숫자로. 비었거나 숫자가 아니면 null (입력하지 않은 항목)
const parse = (text: string) => {
  const n = Number(text.replace(/[,\s]/g, ''));
  return text.trim() && Number.isFinite(n) && n >= 0 ? n : null;
};
const round = (n: number, decimals: number) =>
  Math.round(n * 10 ** decimals) / 10 ** decimals;

// Figma 「08 지출 입력」 (spec F8, API 28·29). 끝난 확정 여행의 실제 지출을 항목별로 받는다
// 1인/전체 기준을 바꾸면 적은 금액을 인원수로 곱하거나 나눈다. 서버에는 지금 기준과 함께 보낸다
export default function ExpenseInputScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<ExpenseSheet>();
  const [error, setError] = useState<string>();
  const [basis, setBasis] = useState<Basis>('perPerson');
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const load = useCallback(() => {
    setError(undefined);
    getExpenses(tripId)
      .then(res => {
        setSheet(res);
        // 저장한 지출이 있으면 1인 기준으로 채운다
        const saved = (item: CostItemCode) =>
          res.expenses.find(e => e.item === item);
        setRows([
          ...FIXED_ITEMS.map(item => ({
            key: item,
            item,
            label: '',
            amount: saved(item) ? String(saved(item)!.perPerson.amount) : '',
          })),
          ...res.expenses
            .filter(e => e.item === 'OTHER')
            .map((e, i) => ({
              key: `other-${i}`,
              item: 'OTHER' as const,
              label: e.label ?? '',
              amount: String(e.perPerson.amount),
            })),
        ]);
      })
      .catch(e =>
        setError(
          t(
            e instanceof ApiError && e.code === 'TRIP_NOT_COMPLETED'
              ? 'expense.notCompleted'
              : 'auth.networkError',
          ),
        ),
      );
  }, [tripId, t]);
  useEffect(load, [load]);

  if (!sheet) {
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

  const trip = summaryToTrip(t, sheet.trip);
  const party = sheet.trip.partySize;
  const currency = sheet.estimateTotal.perPerson.currency;
  const decimals = decimalsOf(currency);
  const money = (amount: number) => formatMoney({ amount, currency });

  const changeBasis = (next: Basis) => {
    if (next === basis) return;
    const factor = next === 'total' ? party : 1 / party;
    setRows(prev =>
      prev.map(r => {
        const n = parse(r.amount);
        return n === null
          ? r
          : { ...r, amount: String(round(n * factor, decimals)) };
      }),
    );
    setBasis(next);
  };
  const update = (key: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
  const addOther = () =>
    setRows(prev => [
      ...prev,
      { key: `other-${Date.now()}`, item: 'OTHER', label: '', amount: '' },
    ]);
  const removeRow = (key: string) =>
    setRows(prev => prev.filter(r => r.key !== key));

  const entered = rows.filter(r => parse(r.amount) !== null);
  const sum = round(
    entered.reduce((acc, r) => acc + (parse(r.amount) ?? 0), 0),
    decimals,
  );
  const estimateTotal = sheet.estimateTotal[basis];
  const budget = sheet.budget?.[basis];
  // 기타 항목은 이름이 있어야 보낼 수 있다
  const canSave =
    entered.length > 0 &&
    entered.every(r => r.item !== 'OTHER' || r.label.trim());

  const save = async () => {
    setSaving(true);
    setSaveError(undefined);
    const items: ExpenseInput[] = entered.map(r => ({
      item: r.item,
      ...(r.item === 'OTHER' && { label: r.label.trim() }),
      amount: { amount: parse(r.amount)!, currency },
    }));
    try {
      await saveExpenses(
        tripId,
        basis === 'total' ? 'TOTAL' : 'PER_PERSON',
        items,
      );
      navigation.replace('ExpenseReport', { tripId });
    } catch (e) {
      // 항목 수·이름 길이 등 서버 검사에 걸리면 첫 사유를 보여준다
      setSaveError(
        e instanceof ApiError && e.fields[0]
          ? e.fields[0].reason
          : t('auth.networkError'),
      );
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TripSummaryCard
          trip={trip}
          right={<Badge label={t('expense.completed')} tone="muted" />}
        />

        <View style={styles.intro}>
          <Text style={styles.heading}>{t('expense.heading')}</Text>
          <Text style={[typography.bodyBase, { color: colors.text.muted }]}>
            {t('expense.description')}
          </Text>
        </View>

        <BasisToggle value={basis} onChange={changeBasis} partySize={party} />

        <View style={styles.list}>
          {rows.map(row => {
            const estimate = sheet.estimates.find(e => e.item === row.item)?.[
              basis
            ];
            const n = parse(row.amount);
            // 예상 범위를 벗어난 만큼만 보여준다 (리포트의 BELOW·ABOVE와 같은 기준)
            const over =
              estimate && n !== null && n > estimate.max ? n - estimate.max : 0;
            const under =
              estimate && n !== null && n < estimate.min ? estimate.min - n : 0;
            const style = ITEM_STYLE[row.item];
            const Icon = style.icon;
            return (
              <View key={row.key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.row8}>
                    <View
                      style={[styles.itemIcon, { backgroundColor: style.bg }]}
                    >
                      <Icon
                        width={style.width}
                        height={style.height}
                        color={style.color}
                      />
                    </View>
                    {row.item === 'OTHER' ? (
                      <TextInput
                        value={row.label}
                        onChangeText={label => update(row.key, { label })}
                        placeholder={t('expense.otherPlaceholder')}
                        placeholderTextColor={colors.text.subtle}
                        maxLength={50}
                        style={[styles.itemName, styles.labelInput]}
                      />
                    ) : (
                      <View style={styles.gap2}>
                        <Text style={styles.itemName}>
                          {t(`cost.items.${row.item}`)}
                        </Text>
                        {estimate && (
                          <Text
                            style={[
                              typography.bodySubtle,
                              { color: colors.text.subtle },
                            ]}
                          >
                            {t('expense.estimated', {
                              amount: formatRange(estimate),
                            })}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {over > 0 && (
                    <Text
                      style={[
                        typography.bodyBase,
                        { color: colors.text.negative },
                      ]}
                    >
                      {`+${money(round(over, decimals))}`}
                    </Text>
                  )}
                  {under > 0 && (
                    <Text
                      style={[
                        typography.bodyBase,
                        { color: colors.brand.primary },
                      ]}
                    >
                      {`-${money(round(under, decimals))}`}
                    </Text>
                  )}
                  {row.item === 'OTHER' && (
                    <Pressable
                      onPress={() => removeRow(row.key)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('expense.removeOther')}
                    >
                      <CloseIcon
                        width={16}
                        height={16}
                        color={colors.text.subtle}
                      />
                    </Pressable>
                  )}
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.symbol}>
                    {money(0).replace(/[\d.,\s]/g, '')}
                  </Text>
                  <TextInput
                    value={row.amount}
                    onChangeText={amount => update(row.key, { amount })}
                    keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
                    placeholder="0"
                    placeholderTextColor={colors.text.subtle}
                    style={styles.amountInput}
                    accessibilityLabel={
                      row.item === 'OTHER'
                        ? row.label
                        : t(`cost.items.${row.item}`)
                    }
                  />
                </View>
              </View>
            );
          })}

          <Pressable
            onPress={addOther}
            style={styles.addButton}
            accessibilityRole="button"
          >
            <PlusCircleIcon width={15} height={15} color={colors.text.label} />
            <Text style={[typography.bodyBase, styles.addText]}>
              {t('expense.addOther')}
            </Text>
          </Pressable>

          <View style={styles.info}>
            <EffectIcon width={20} height={20} color={colors.brand.primary} />
            <Text
              style={[
                typography.bodySubtle,
                styles.flex,
                { color: colors.text.muted },
              ]}
            >
              {t('expense.tip')}
            </Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryTop}>
            {/* 금액이 길어도 한 줄에 들어가게 글자를 줄인다. 예상 경비 칸은 밀려나지 않는다 */}
            <View style={styles.flexShrink}>
              <Text style={styles.summaryLabel}>{t('expense.actualSum')}</Text>
              <Text
                style={styles.summaryAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {money(sum)}
              </Text>
            </View>
            <View style={styles.alignEnd}>
              <Text style={[styles.summaryLabel, { color: colors.text.faint }]}>
                {t('expense.estimate')}
              </Text>
              <Text style={styles.estimateAmount}>
                {formatRange(estimateTotal)}
              </Text>
            </View>
          </View>
          {/* 희망 예산이 없으면(상관없음) 소진율을 숨긴다 */}
          {budget && budget.amount > 0 && (
            <View style={styles.gap8}>
              <ProgressBar ratio={sum / budget.amount} />
              <View style={[styles.cardHeader, styles.wrap]}>
                <Text style={[styles.usage]}>
                  {t('expense.budgetUsage', {
                    pct: ((sum / budget.amount) * 100).toFixed(1),
                  })}
                </Text>
                <View style={styles.pill}>
                  {sum <= budget.amount && (
                    <TrendDownIcon
                      width={11.667}
                      height={7}
                      color={PILL_TEXT}
                    />
                  )}
                  <Text style={[typography.bodySubtle, { color: PILL_TEXT }]}>
                    {sum <= budget.amount
                      ? t('expense.underBudget', {
                          amount: money(round(budget.amount - sum, decimals)),
                        })
                      : t('expense.overBudget', {
                          amount: money(round(sum - budget.amount, decimals)),
                        })}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        {saveError && (
          <Text
            style={[typography.bodySubtle, { color: colors.text.negative }]}
          >
            {saveError}
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={t('expense.createReport')}
          onPress={save}
          disabled={!canSave || saving}
          icon={EffectIcon}
          shadow
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Figma 값 (디자인 시스템에 없음, 확인 필요)
const PILL_BG = '#D4E0F7';
const PILL_TEXT = '#576377';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.base },
  content: { gap: 20, padding: spacing.screenPadding },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  wrap: { flexWrap: 'wrap' },
  gap2: { gap: 2 },
  gap8: { gap: 8 },
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  alignEnd: { alignItems: 'flex-end' },
  intro: { gap: 5 },
  heading: { ...typography.titleStrong, color: colors.text.base },
  list: { gap: 16 },
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { ...typography.bodyStrong, color: colors.text.label },
  labelInput: { flex: 1, padding: 0 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 8,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  symbol: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.muted,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 10,
    textAlign: 'right',
    ...typography.bodyStrong,
    color: colors.text.label,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface.subtle,
  },
  addText: { fontFamily: fontFamily.medium, color: colors.text.label },
  info: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.base,
  },
  summary: {
    gap: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.muted,
  },
  summaryAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 42,
    letterSpacing: -0.7,
    color: colors.text.label,
    paddingTop: 4,
  },
  estimateAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.muted,
    paddingTop: 4,
  },
  usage: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.text.muted,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: PILL_BG,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface.default,
    ...shadow.bottomBar,
  },
});
