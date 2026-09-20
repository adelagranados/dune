import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project, Session } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { listSessionsByProject } from '@/data/repositories/sessionRepository';
import { formatDuration } from '@/lib/time';
import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProjectById(id).then(setProject);
      listSessionsByProject(id).then(setSessions);
    }, [id]),
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (!project || sessions === null) {
    return <View style={containerStyle} />;
  }

  const totalDurationMs = sessions.reduce((total, session) => total + session.durationMs, 0);
  const estimateProgress = project.estimatedTimeMs ? Math.min(totalDurationMs / project.estimatedTimeMs, 1) : null;

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing['3xl'],
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.secondary, color: colors.primary }}>
          {'‹ ' + t('projectDetail.back')}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fontFamily.displayItalic,
          fontSize: fontSize.display,
          color: colors.textPrimary,
          marginTop: spacing.xl,
        }}
      >
        {project.name}
      </Text>
      {project.category ? (
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {project.category}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.xl,
          marginTop: spacing['2xl'],
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
          {t('projectDetail.timeAccumulated')}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.displayItalic,
            fontSize: fontSize.display,
            color: colors.textPrimary,
            marginTop: spacing.sm,
          }}
        >
          {formatDuration(totalDurationMs)}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.label, color: colors.textSecondary }}>
            {sessions.length === 0
              ? t('projectDetail.noSessionsYet')
              : t('projectDetail.sessionCount', { count: sessions.length })}
          </Text>
          {project.estimatedTimeMs ? (
            <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.label, color: colors.textSecondary }}>
              {t('projectDetail.roughEstimate', { estimate: formatDuration(project.estimatedTimeMs) })}
            </Text>
          ) : null}
        </View>

        {estimateProgress !== null ? (
          <View
            style={{
              flexDirection: 'row',
              height: 7,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: colors.divider,
              marginTop: spacing.lg,
            }}
          >
            <View style={{ flex: estimateProgress, backgroundColor: project.color }} />
            <View style={{ flex: 1 - estimateProgress }} />
          </View>
        ) : null}
      </View>

      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.body,
          color: colors.textPrimary,
          marginTop: spacing['4xl'],
        }}
      >
        {t('projectDetail.yourSessions')}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.secondary,
          color: colors.textSecondary,
          marginTop: spacing.lg,
        }}
      >
        {t('projectDetail.sessionsEmpty')}
      </Text>

      <Button
        label={t('projectDetail.startTimer')}
        // Wired up in the next slice, together with the Choose Session Length screen.
        onPress={() => {}}
        style={{ marginTop: spacing['4xl'] }}
      />
    </ScrollView>
  );
}
