import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { listSessionsByProject } from '@/data/repositories/sessionRepository';
import { formatDuration } from '@/lib/time';
import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function SessionSavedScreen() {
  const { projectId, durationMs } = useLocalSearchParams<{
    projectId: string;
    durationMs: string;
  }>();
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize, lineHeight } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [totals, setTotals] = useState<{ totalDurationMs: number; count: number } | null>(null);

  useEffect(() => {
    getProjectById(projectId).then(setProject);
    listSessionsByProject(projectId).then((sessions) => {
      setTotals({
        totalDurationMs: sessions.reduce((total, session) => total + session.durationMs, 0),
        count: sessions.length,
      });
    });
  }, [projectId]);

  const addedDurationMs = Number.parseInt(durationMs, 10) || 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing['3xl'],
        paddingBottom: insets.bottom + spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.secondary,
          color: colors.textSecondary,
        }}
      >
        {t('sessionSaved.label')}
      </Text>

      <Text
        style={{
          fontFamily: fontFamily.displayItalic,
          fontSize: fontSize.displayLarge,
          lineHeight: lineHeight.displayLarge,
          color: colors.textPrimary,
          marginTop: spacing.xl,
        }}
      >
        {formatDuration(addedDurationMs)}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.displayItalic,
          fontSize: fontSize.display,
          lineHeight: lineHeight.display,
          color: colors.textPrimary,
        }}
      >
        {t('sessionSaved.added')}
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginTop: spacing['3xl'],
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {project?.name ?? ''}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.heading2,
            color: colors.textPrimary,
            marginTop: spacing.md,
          }}
        >
          {t('sessionSaved.total', { total: formatDuration(totals?.totalDurationMs ?? 0) })}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textSecondary,
            marginTop: spacing.md,
          }}
        >
          {t('projectDetail.sessionCount', { count: totals?.count ?? 0 })}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.primaryText,
            marginTop: spacing.lg,
          }}
        >
          {t('sessionSaved.microcopy')}
        </Text>
      </View>

      <View style={{ marginTop: 'auto', gap: spacing.lg }}>
        <Button
          label={t('sessionSaved.done')}
          onPress={() => router.dismissTo({ pathname: '/project/[id]', params: { id: projectId } })}
        />
        <Button
          label={t('sessionSaved.addManualEntry')}
          variant="secondary"
          onPress={() => router.replace({ pathname: '/manual-entry', params: { projectId } })}
        />
      </View>
    </View>
  );
}
