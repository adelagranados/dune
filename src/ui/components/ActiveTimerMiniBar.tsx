import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Pressable, Text, View } from 'react-native';

import type { Project } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { computeActiveElapsedMs } from '@/domain/timer/timerEngine';
import { formatTimerClock } from '@/lib/time';
import { useActiveTimerStore } from '@/state/useActiveTimerStore';
import { Hourglass } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

const TIMER_ROUTE = '/timer';

type ActiveTimerMiniBarProps = {
  bottomOffset: number;
};

/**
 * Floats above the bottom nav whenever a session is running, so leaving the
 * timer screen never hides the fact that time is still being tracked.
 */
export function ActiveTimerMiniBar({ bottomOffset }: ActiveTimerMiniBarProps) {
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const timer = useActiveTimerStore((state) => state.timer);
  const pause = useActiveTimerStore((state) => state.pause);
  const resume = useActiveTimerStore((state) => state.resume);

  const [project, setProject] = useState<Project | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const projectId = timer?.projectId;
  const isRunning = timer !== null && timer.pausedAt === null;

  useEffect(() => {
    if (!projectId) {
      return;
    }
    getProjectById(projectId).then(setProject);
  }, [projectId]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isRunning]);

  if (!timer || pathname === TIMER_ROUTE) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push(TIMER_ROUTE)}
      style={{
        position: 'absolute',
        left: spacing.xl,
        right: spacing.xl,
        bottom: bottomOffset,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      <Hourglass color={colors.primary} width={24} />

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.secondary, color: colors.textPrimary }}>
          {project && project.id === projectId ? project.name : ''}
        </Text>
        <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.body, color: colors.textPrimary }}>
          {formatTimerClock(computeActiveElapsedMs(timer, now))}
        </Text>
      </View>

      <Pressable
        onPress={isRunning ? pause : resume}
        style={{
          backgroundColor: colors.background,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        }}
      >
        <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.secondary, color: colors.primary }}>
          {isRunning ? t('activeTimer.pause') : t('activeTimer.resume')}
        </Text>
      </Pressable>
    </Pressable>
  );
}
