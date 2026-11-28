import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import CheckIcon from '../assets/icons/check.svg';
import CloseIcon from '../assets/icons/close.svg';
import SliderIcon from '../assets/icons/slider.svg';
import {
  applyPreferences,
  CURRENCIES,
  LANGUAGES,
  useCurrency,
  type Currency,
  type Language,
} from '../settings/preferences';
import { colors, fontFamily, shadow, typography } from '../theme/tokens';

// Figma 「10 설정 화면」: 헤더의 언어 버튼 아래에 뜨는 언어·표시 통화 팝업 (spec F7)
// 고른 값은 「적용하기」를 눌러야 반영한다
const FLAGS: Record<Language | Currency, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  JPY: '🇯🇵',
  KRW: '🇰🇷',
  EUR: '🇪🇺',
  USD: '🇺🇸',
};
// 언어 이름은 그 언어로 쓴다 (번역하지 않는다)
const LANGUAGE_NAMES: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
};
// 기기 로케일이 기본 언어다 (i18n/index.ts와 같은 규칙)
const DEVICE_LANGUAGE: Language = Intl.DateTimeFormat()
  .resolvedOptions()
  .locale.startsWith('ko')
  ? 'ko'
  : 'en';

type Props = { visible: boolean; onClose: () => void };

export default function LanguageCurrencySheet({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const currentCurrency = useCurrency();
  const [language, setLanguage] = useState<Language>('ko');
  const [currency, setCurrency] = useState<Currency>(currentCurrency);

  // 열 때마다 지금 설정에서 시작한다
  useEffect(() => {
    if (!visible) return;
    setLanguage(i18n.language === 'ko' ? 'ko' : 'en');
    setCurrency(currentCurrency);
  }, [visible, i18n.language, currentCurrency]);

  const apply = () => {
    applyPreferences(language, currency);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      />
      <View style={styles.popover}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.row6}>
              <SliderIcon
                width={14.25}
                height={14.25}
                color={colors.text.label}
              />
              <Text style={styles.title}>{t('settings.title')}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <CloseIcon width={16} height={16} color={colors.text.muted} />
            </Pressable>
          </View>
          <Text style={styles.caption}>{t('settings.description')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('settings.language')}</Text>
            <Text style={styles.caption}>
              {t('settings.languageCount', { count: LANGUAGES.length })}
            </Text>
          </View>
          {LANGUAGES.map(code => {
            const selected = code === language;
            return (
              <Pressable
                key={code}
                onPress={() => setLanguage(code)}
                style={[styles.tile, selected && styles.tileSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={styles.row8}>
                  <Text style={styles.flag}>{FLAGS[code]}</Text>
                  <Text style={styles.tileText}>{LANGUAGE_NAMES[code]}</Text>
                  {code === DEVICE_LANGUAGE && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {t('settings.default')}
                      </Text>
                    </View>
                  )}
                </View>
                {selected ? (
                  <View style={styles.checked}>
                    <CheckIcon
                      width={12.8}
                      height={12.8}
                      color={colors.surface.default}
                    />
                  </View>
                ) : (
                  <View style={styles.unchecked} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>{t('settings.currency')}</Text>
          <Text style={styles.caption}>{t('settings.currencyNote')}</Text>
          <View style={styles.chips}>
            {CURRENCIES.map(code => {
              const selected = code === currency;
              return (
                <Pressable
                  key={code}
                  onPress={() => setCurrency(code)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {`${FLAGS[code]} ${code}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button label={t('settings.apply')} onPress={apply} icon={CheckIcon} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  popover: {
    position: 'absolute',
    top: 62,
    alignSelf: 'center',
    width: 326,
    gap: 14,
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
    ...shadow.card,
  },
  header: {
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.titleBase, color: colors.text.label },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { ...typography.captionBase, color: colors.text.muted },
  section: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.text.muted,
  },
  tile: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
    marginTop: 2,
  },
  tileSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.surfaceSubtle,
  },
  flag: { fontSize: 16, lineHeight: 20 },
  tileText: { ...typography.bodyBase, color: colors.text.base },
  tag: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primarySoft,
  },
  tagText: { ...typography.bodySubtle, color: colors.brand.primary },
  checked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  unchecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
  },
  divider: { height: 1, backgroundColor: colors.border.line },
  chips: { flexDirection: 'row', gap: 6 },
  // 4개가 팝업 폭을 나눠 쓴다. Android는 국기 이모지가 넓어 고정 여백이면 넘친다
  chip: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surface.subtle,
    backgroundColor: colors.surface.default,
  },
  chipSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  chipText: { ...typography.bodySubtle, color: colors.text.base },
  chipTextSelected: { color: colors.surface.base },
});
