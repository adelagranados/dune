import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { readLastTargetDurationMs, writeLastTargetDurationMs } from '@/data/kv/activeTimer.store';
import type { Project } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { useActiveTimerStore } from '@/state/useActiveTimerStore';
import { useTheme } from '@/ui/theme/ThemeProvider';

const MINUTE_MS = 60_000;

type DurationOption = {
  key: string;
  targetDurationMs: number | null;
};

const DURATION_OPTIONS: DurationOption[] = [
  { key: 'noLimit', targetDurationMs: null },
  { key: 'fifteen', targetDurationMs: 15 * MINUTE_MS },
  { key: 'thirty', targetDurationMs: 30 * MINUTE_MS },
  { key: 'fortyFive', targetDurationMs: 45 * MINUTE_MS },
  { key: 'oneHour', targetDurationMs: 60 * MINUTE_MS },
];

const CUSTOM_KEY = 'custom';

export default function SessionLengthScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const start = useActiveTimerStore((state) => state.start);

  const [project, setProject] = useState<Project | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    const remembered = readLastTargetDurationMs();
    if (remembered === null) {
      return 'noLimit';
    }
    return DURATION_OPTIONS.find((option) => option.targetDurationMs === remembered)?.key ?? CUSTOM_KEY;
  });
  const [customMinutes, setCustomMinutes] = useState(() => {
    const remembered = readLastTargetDurationMs();
    const isPreset = DURATION_OPTIONS.some((option) => option.targetDurationMs === remembered);
    return remembered !== null && !isPreset ? String(remembered / MINUTE_MS) : '';
  });

  useEffect(() => {
    getProjectById(projectId).then(setProject);
  }, [projectId]);

  const parsedCustomMinutes = Number.parseInt(customMinutes, 10);
  const customDurationMs =
    Number.isFinite(parsedCustomMinutes) && parsedCustomMinutes > 0 ? parsedCustomMinutes * MINUTE_MS : null;
  const isCustom = selectedKey === CUSTOM_KEY;
  const canStart = !isCustom || customDurationMs !== null;

  const handleStart = () => {
    if (!canStart) {
      return;
    }
    const target = isCustom
      ? customDurationMs
      : (DURATION_OPTIONS.find((option) => option.key === selectedKey)?.targetDurationMs ?? null);

    writeLastTargetDurationMs(target);
    start(projectId, target);
    router.replace('/timer');
  };

  const pillStyle = (selected: boolean) => ({
    flexGrow: 1,
    flexBasis: '45%' as const,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center' as const,
    backgroundColor: selected ? colors.primary : colors.background,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }}
    >
      <View style={{ paddingHorizontal: spacing.xl }}>
        <Text style={{ fontFamily: fontFamily.bodyMedium, fontSize: fontSize.secondary, color: colors.textSecondary }}>
          {project?.name ?? ''}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.display,
            fontSize: fontSize.heading1,
            color: colors.textPrimary,
            marginTop: spacing.lg,
          }}
        >
          {t('sessionLength.title')}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {t('sessionLength.subtitle')}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius['2xl'],
          marginHorizontal: spacing.lg,
          marginTop: spacing.xl,
          padding: spacing.xl,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.bodySemiBold,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {t('sessionLength.label')}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.lg }}>
          {DURATION_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSelectedKey(option.key)}
              style={pillStyle(selectedKey === option.key)}
            >
              <Text
                style={{
                  fontFamily: fontFamily.bodyMedium,
                  fontSize: fontSize.secondary,
                  color: selectedKey === option.key ? colors.onPrimary : colors.textPrimary,
                }}
              >
                {t(`sessionLength.options.${option.key}`)}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setSelectedKey(CUSTOM_KEY)} style={pillStyle(isCustom)}>
            <Text
              style={{
                fontFamily: fontFamily.bodyMedium,
                fontSize: fontSize.secondary,
                color: isCustom ? colors.onPrimary : colors.textPrimary,
              }}
            >
              {t('sessionLength.options.custom')}
            </Text>
          </Pressable>
        </View>

        {isCustom ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              paddingHorizontal: spacing.lg,
              marginTop: spacing.lg,
            }}
          >
            <TextInput
              value={customMinutes}
              onChangeText={setCustomMinutes}
              placeholder={t('sessionLength.customPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                fontFamily: fontFamily.body,
                fontSize: fontSize.body,
                color: colors.textPrimary,
              }}
            />
            <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.body, color: colors.textSecondary }}>
              {t('sessionLength.minutesSuffix')}
            </Text>
          </View>
        ) : null}

        <Text
          style={{
            fontFamily: fontFamily.bodyMedium,
            fontSize: fontSize.secondary,
            color: colors.textPrimary,
            marginTop: spacing['2xl'],
          }}
        >
          {t('sessionLength.reminderTitle')}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {t('sessionLength.reminderHint')}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: 'auto' }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              flex: 1,
              paddingVertical: spacing.lg,
              borderRadius: radius.full,
              alignItems: 'center',
              backgroundColor: colors.background,
            }}
          >
            <Text
              style={{ fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.secondary, color: colors.textPrimary }}
            >
              {t('sessionLength.cancel')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleStart}
            disabled={!canStart}
            style={{
              flex: 1,
              paddingVertical: spacing.lg,
              borderRadius: radius.full,
              alignItems: 'center',
              backgroundColor: canStart ? colors.primary : colors.divider,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamily.bodySemiBold,
                fontSize: fontSize.secondary,
                color: canStart ? colors.onPrimary : colors.textPrimary,
              }}
            >
              {t('sessionLength.start')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
