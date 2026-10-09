import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LanguagePreference, ThemePreference } from '@/data/kv/settings.store';
import { useSettingsStore } from '@/state/useSettingsStore';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { SettingsRow } from '@/ui/components/SettingsRow';
import { CheckIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGE_OPTIONS: LanguagePreference[] = ['system', 'en', 'es'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize, lineHeight } = useTheme();
  const insets = useSafeAreaInsets();

  const themePreference = useSettingsStore((state) => state.themePreference);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing['3xl'],
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.display,
          fontSize: fontSize.heading1,
          lineHeight: lineHeight.heading1,
          color: colors.textPrimary,
        }}
      >
        {t('settings.title')}
      </Text>

      <Text
        style={{
          fontFamily: fontFamily.bodySemiBold,
          fontSize: fontSize.label,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: spacing['2xl'],
          marginBottom: spacing.sm,
        }}
      >
        {t('settings.theme')}
      </Text>
      <SegmentedControl
        options={THEME_OPTIONS.map((option) => ({
          value: option,
          label: t(`settings.themeOptions.${option}`),
        }))}
        value={themePreference}
        onChange={setThemePreference}
      />

      <SettingsRow
        label={t('settings.language')}
        value={t(`settings.languageOptions.${language}`)}
        onPress={() => setLanguageSheetOpen(true)}
        style={{ marginTop: spacing.lg }}
      />

      <Modal
        visible={languageSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageSheetOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
          onPress={() => setLanguageSheetOpen(false)}
        />
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.bodySemiBold,
              fontSize: fontSize.label,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingHorizontal: spacing.xl,
              marginBottom: spacing.sm,
            }}
          >
            {t('settings.language')}
          </Text>
          {LANGUAGE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setLanguage(option);
                setLanguageSheetOpen(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: option === language }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.lg,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: fontFamily.body,
                  fontSize: fontSize.body,
                  color: colors.textPrimary,
                }}
              >
                {t(`settings.languageOptions.${option}`)}
              </Text>
              {option === language ? (
                <CheckIcon color={colors.primary} size={18} weight="regular" />
              ) : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
}
