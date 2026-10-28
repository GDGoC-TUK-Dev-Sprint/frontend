import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import CalendarSolidIcon from '../assets/icons/calendar-solid.svg';
import CheckIcon from '../assets/icons/check.svg';
import ChevronRightIcon from '../assets/icons/chevron-right.svg';
import CloseBoldIcon from '../assets/icons/close-bold.svg';
import { colors, fontFamily, typography } from '../theme/tokens';

// Figma 「Date Selection Card」(02 조건 입력의 날짜 선택). 지난 날짜는 고를 수 없다 (spec F1-4)
// Figma 달력 글꼴은 SF Pro. 앱 폰트(Pretendard)로 맞춤
export type DateRange = { start: Date; end: Date };

type Props = {
  visible: boolean;
  initial?: DateRange;
  onApply: (range: DateRange) => void;
  onClose: () => void;
};

// Figma 값 (토큰 없음)
const TEXT_STRONG = '#1A1C1C';
const BOX = '#F8F9FC';

export default function DateRangeModal({
  visible,
  initial,
  onApply,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const today = startOfDay(new Date());
  const [start, setStart] = useState<Date | undefined>(initial?.start);
  const [end, setEnd] = useState<Date | undefined>(initial?.end);
  const [month, setMonth] = useState(firstOfMonth(initial?.start ?? today));

  // 열 때마다 마지막으로 적용한 값에서 다시 시작
  useEffect(() => {
    if (visible) {
      setStart(initial?.start);
      setEnd(initial?.end);
      setMonth(firstOfMonth(initial?.start ?? new Date()));
    }
  }, [visible, initial]);

  const onPressDay = (day: Date) => {
    const next = pickDay({ start, end }, day);
    setStart(next.start);
    setEnd(next.end);
  };

  const canGoBack = month > firstOfMonth(today);
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    // 2023-01-01은 일요일
    new Date(2023, 0, 1 + i).toLocaleDateString(i18n.language, {
      weekday: 'short',
    }),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[typography.bodyBase, { color: TEXT_STRONG }]}>
                {t('condition.dateTitle')}
              </Text>
              <Text style={styles.subtitle}>{t('condition.dateSubtitle')}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <CloseBoldIcon
                width={10.5}
                height={10.5}
                color={colors.text.muted}
              />
            </Pressable>
          </View>

          <View style={styles.selected}>
            <DateBox label={t('condition.startDate')} date={start} />
            <Text style={[typography.bodyBase, { color: TEXT_STRONG }]}>~</Text>
            <DateBox label={t('condition.endDate')} date={end} />
          </View>

          <View style={styles.calendar}>
            <View style={styles.monthRow}>
              <View style={styles.monthPill}>
                <Text style={styles.monthText}>
                  {month.toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </View>
              <View style={styles.arrows}>
                <Pressable
                  onPress={() => setMonth(addMonths(month, -1))}
                  disabled={!canGoBack}
                  style={[styles.arrow, !canGoBack && styles.disabled]}
                  accessibilityRole="button"
                  accessibilityLabel={t('condition.prevMonth')}
                >
                  <ChevronRightIcon
                    width={18}
                    height={18}
                    color={colors.text.base}
                    style={styles.flip}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setMonth(addMonths(month, 1))}
                  style={styles.arrow}
                  accessibilityRole="button"
                  accessibilityLabel={t('condition.nextMonth')}
                >
                  <ChevronRightIcon
                    width={18}
                    height={18}
                    color={colors.text.base}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.week}>
              {weekdays.map(day => (
                <Text key={day} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>

            {chunk(monthGrid(month), 7).map((week, w) => (
              <View key={w} style={styles.week}>
                {week.map((day, d) => {
                  if (!day) return <View key={d} style={styles.cell} />;
                  const past = day < today;
                  const isStart = sameDay(day, start);
                  const isEnd = sameDay(day, end);
                  const inRange = !!start && !!end && day > start && day < end;
                  // 시작~끝 사이를 잇는 띠. 시작·끝 칸은 반쪽만 칠한다
                  const band =
                    start && end && !sameDay(start, end)
                      ? inRange
                        ? styles.bandFull
                        : isStart
                        ? styles.bandRight
                        : isEnd
                        ? styles.bandLeft
                        : undefined
                      : undefined;
                  return (
                    <Pressable
                      key={d}
                      style={styles.cell}
                      disabled={past}
                      onPress={() => onPressDay(day)}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: past,
                        selected: isStart || isEnd,
                      }}
                    >
                      {band && <View style={[styles.band, band]} />}
                      <View
                        style={[
                          styles.day,
                          sameDay(day, today) && styles.today,
                          (isStart || isEnd) && styles.daySelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            past && styles.dayPast,
                            (isStart || isEnd) && styles.dayTextSelected,
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Button
            label={t('condition.apply')}
            onPress={() => start && end && onApply({ start, end })}
            disabled={!start || !end}
            size="medium"
            icon={CheckIcon}
            style={(!start || !end) && styles.disabled}
          />
        </View>
      </View>
    </Modal>
  );
}

function DateBox({ label, date }: { label: string; date?: Date }) {
  return (
    <View style={styles.dateBox}>
      <View style={styles.dateIcon}>
        <CalendarSolidIcon
          width={13.5}
          height={15}
          color={colors.brand.primary}
        />
      </View>
      <View>
        <Text style={[typography.captionBase, { color: colors.text.muted }]}>
          {label}
        </Text>
        <Text style={styles.dateValue}>{date ? formatDot(date) : '-'}</Text>
      </View>
    </View>
  );
}

// 2026.10.21 (sep '. ' 이면 2026. 10. 21)
export const formatDot = (date: Date, sep = '.') =>
  [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(sep);

const pad = (n: number) => String(n).padStart(2, '0');
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const firstOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);
const sameDay = (a: Date, b?: Date) => !!b && a.getTime() === b.getTime();
const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

// 달력 칸: 1일 앞은 요일만큼 빈칸(null), 마지막 주는 7칸을 채운다
export function monthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const days = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = Array(new Date(year, m, 1).getDay()).fill(
    null,
  );
  for (let d = 1; d <= days; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

// 첫 탭은 시작, 두 번째 탭은 끝. 시작보다 앞을 누르면 시작을 바꾸고, 다 고른 뒤 누르면 새로 시작
export function pickDay(
  { start, end }: { start?: Date; end?: Date },
  day: Date,
): { start?: Date; end?: Date } {
  if (!start || end || day < start) return { start: day, end: undefined };
  return { start, end: day };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', // BottomSheet와 같은 값
  },
  card: {
    gap: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderColor: colors.surface.subtle,
  },
  headerText: { gap: 2 },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.muted,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: BOX,
  },
  dateIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: colors.surface.default,
  },
  dateValue: { ...typography.bodySubtle, color: TEXT_STRONG },
  calendar: { gap: 5 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthPill: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  monthText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.text.base,
  },
  arrows: { flexDirection: 'row', gap: 12 },
  arrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flip: { transform: [{ rotate: '180deg' }] },
  disabled: { opacity: 0.4 },
  week: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    paddingVertical: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: fontFamily.semibold,
    fontSize: 9,
    color: colors.text.subtle,
  },
  cell: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center' },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  bandFull: { left: 0, right: 0 },
  bandLeft: { left: 0, right: '50%' },
  bandRight: { left: '50%', right: 0 },
  day: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  today: { backgroundColor: colors.surface.subtle },
  daySelected: { backgroundColor: colors.brand.primary },
  dayText: {
    fontFamily: fontFamily.regular,
    fontSize: 11.5,
    color: colors.text.base,
  },
  dayPast: { color: colors.text.subtle },
  dayTextSelected: { color: colors.surface.default },
});
