import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project, Session } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { listSessionsByProject } from '@/data/repositories/sessionRepository';
import { formatDuration, isSameDay } from '@/lib/time';
import { useActiveTimerStore } from '@/state/useActiveTimerStore';
import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);
  const activeTimer = useActiveTimerStore((state) => state.timer);

  useFocusEffect(
    useCallback(() => {
      getProjectById(id).then(setProject);
      listSessionsByProject(id).then((rows) => {
        setSessions(rows);
        // Captured with the data rather than at render time, so "Today" stays
        // stable across re-renders.
        setLoadedAt(Date.now());
      });
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
  const estimateProgress = project.estimatedTimeMs
    ? Math.min(totalDurationMs / project.estimatedTimeMs, 1)
    : null;

  const formatSessionDay = (startedAt: number) => {
    if (isSameDay(startedAt, loadedAt)) {
      return t('projectDetail.today');
    }
    const yesterday = new Date(loadedAt);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(startedAt, yesterday.getTime())) {
      return t('projectDetail.yesterday');
    }
    return new Date(startedAt).toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
  };

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
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.primary,
          }}
        >
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

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}
        >
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.label,
              color: colors.textSecondary,
            }}
          >
            {sessions.length === 0
              ? t('projectDetail.noSessionsYet')
              : t('projectDetail.sessionCount', { count: sessions.length })}
          </Text>
          {project.estimatedTimeMs ? (
            <Text
              style={{
                fontFamily: fontFamily.body,
                fontSize: fontSize.label,
                color: colors.textSecondary,
              }}
            >
              {t('projectDetail.roughEstimate', {
                estimate: formatDuration(project.estimatedTimeMs),
              })}
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
      {sessions.length === 0 ? (
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
      ) : (
        <View style={{ marginTop: spacing.lg }}>
          {sessions.map((session) => (
            <View
              key={session.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                gap: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: project.color }}
                />
                <Text
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: fontSize.secondary,
                    color: colors.textPrimary,
                  }}
                >
                  {formatSessionDay(session.startedAt)}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fontFamily.bodySemiBold,
                  fontSize: fontSize.body,
                  color: colors.textPrimary,
                }}
              >
                {formatDuration(session.durationMs)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Button
        label={activeTimer ? t('projectDetail.openTimer') : t('projectDetail.startTimer')}
        onPress={() =>
          activeTimer
            ? router.push('/timer')
            : router.push({ pathname: '/session-length', params: { projectId: project.id } })
        }
        style={{ marginTop: spacing['4xl'] }}
      />
      <Button
        label={t('projectDetail.addManualEntry')}
        variant="secondary"
        onPress={() =>
          router.push({ pathname: '/manual-entry', params: { projectId: project.id } })
        }
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}
