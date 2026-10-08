import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { countSessionsByProject, createSession } from '@/data/repositories/sessionRepository';
import { computeActiveElapsedMs } from '@/domain/timer/timerEngine';
import { formatTimerClock } from '@/lib/time';
import { useActiveTimerStore } from '@/state/useActiveTimerStore';
import { CheckIcon, Hourglass, PauseIcon, PlayIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function ActiveTimerScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const timer = useActiveTimerStore((state) => state.timer);
  const pause = useActiveTimerStore((state) => state.pause);
  const resume = useActiveTimerStore((state) => state.resume);
  const finish = useActiveTimerStore((state) => state.finish);

  const [project, setProject] = useState<Project | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const projectId = timer?.projectId;
  const isRunning = timer !== null && timer.pausedAt === null;

  useEffect(() => {
    if (!projectId) {
      return;
    }
    getProjectById(projectId).then(setProject);
    countSessionsByProject(projectId).then((count) => setSessionNumber(count + 1));
  }, [projectId]);

  // The clock is only a view of the timestamps: this re-renders every second
  // while the screen is up, and resyncs on foreground since JS timers are
  // throttled in the background.
  useFocusEffect(
    useCallback(() => {
      if (!isRunning) {
        setNow(Date.now());
        return;
      }
      setNow(Date.now());
      const interval = setInterval(() => setNow(Date.now()), 1000);
      const subscription = AppState.addEventListener('change', (status) => {
        if (status === 'active') setNow(Date.now());
      });
      return () => {
        clearInterval(interval);
        subscription.remove();
      };
    }, [isRunning]),
  );

  if (!timer) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.xl,
          paddingTop: insets.top + spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.textSecondary,
          }}
        >
          {t('activeTimer.noTimer')}
        </Text>
      </View>
    );
  }

  const elapsedMs = computeActiveElapsedMs(timer, now);
  const startedAtLabel = new Date(timer.startedAt).toLocaleTimeString(i18n.language, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleFinish = async () => {
    const finished = finish();
    if (!finished) {
      return;
    }
    await createSession({ ...finished, source: 'timer' });
    router.replace({
      pathname: '/session-saved',
      params: { projectId: finished.projectId, durationMs: String(finished.durationMs) },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.textPrimary,
          }}
        >
          {project?.name ?? ''}
        </Text>
        {sessionNumber !== null ? (
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.label,
              color: colors.textSecondary,
            }}
          >
            {t('activeTimer.sessionNumber', { number: sessionNumber })}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          marginTop: spacing['3xl'],
          paddingVertical: spacing['2xl'],
          alignItems: 'center',
        }}
      >
        <Hourglass color={colors.primary} width={90} />
        <Text
          style={{
            fontFamily: fontFamily.displayItalic,
            fontSize: fontSize.displayLarge,
            color: colors.textPrimary,
            marginTop: spacing['2xl'],
          }}
        >
          {formatTimerClock(elapsedMs)}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textSecondary,
            marginTop: spacing.sm,
          }}
        >
          {isRunning ? t('activeTimer.running') : t('activeTimer.paused')}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            marginTop: spacing['2xl'],
          }}
        >
          {t('activeTimer.startedAt', { time: startedAtLabel })}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.lg,
          marginTop: 'auto',
          marginBottom: spacing['2xl'],
        }}
      >
        <Pressable
          onPress={isRunning ? pause : resume}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            paddingVertical: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          }}
        >
          {isRunning ? (
            <PauseIcon color={colors.textPrimary} size={18} weight="regular" />
          ) : (
            <PlayIcon color={colors.textPrimary} size={18} weight="regular" />
          )}
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.button,
              color: colors.textPrimary,
            }}
          >
            {isRunning ? t('activeTimer.pause') : t('activeTimer.resume')}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleFinish}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            paddingVertical: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
          }}
        >
          <CheckIcon color={colors.onPrimary} size={18} weight="regular" />
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.button,
              color: colors.onPrimary,
            }}
          >
            {t('activeTimer.finish')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
