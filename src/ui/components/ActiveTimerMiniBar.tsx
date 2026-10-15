import { usePathname, useRouter } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { Project } from '@/data/db/schema';
import { getProjectById } from '@/data/repositories/projectRepository';
import { formatTimerClock } from '@/lib/time';
import { useActiveTimerStore } from '@/state/useActiveTimerStore';
import { useElapsedClock } from '@/ui/hooks/useElapsedClock';
import { Hourglass, PauseIcon, PlayIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

const TIMER_ROUTE = '/timer';

const MiniBarInsetContext = createContext(0);
const MiniBarInsetMeasureContext = createContext<(inset: number) => void>(() => {});

/**
 * Publishes how much room the mini bar is taking at the bottom of the screen.
 *
 * The bar floats above the content rather than taking space from it, so a
 * scrollable screen has no way of knowing its end is covered. Padding each
 * screen by hand would mean copying a number that drifts the moment the bar's
 * padding or type size changes, so the bar measures itself instead and screens
 * read the measurement.
 */
export function MiniBarInsetProvider({ children }: { children: ReactNode }) {
  const [inset, setInset] = useState(0);

  return (
    <MiniBarInsetContext.Provider value={inset}>
      <MiniBarInsetMeasureContext.Provider value={setInset}>
        {children}
      </MiniBarInsetMeasureContext.Provider>
    </MiniBarInsetContext.Provider>
  );
}

/**
 * The space a scrollable screen should leave below its content, so the end of
 * a list clears the mini bar. Zero while no session is running.
 */
export function useMiniBarInset() {
  return useContext(MiniBarInsetContext);
}

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
  const reportInset = useContext(MiniBarInsetMeasureContext);

  const [project, setProject] = useState<Project | null>(null);
  const elapsedMs = useElapsedClock(timer);

  const projectId = timer?.projectId;
  const isRunning = timer !== null && timer.pausedAt === null;
  const hidden = !timer || pathname === TIMER_ROUTE;

  useEffect(() => {
    if (!projectId) {
      return;
    }
    getProjectById(projectId).then(setProject);
  }, [projectId]);

  // The screens below need the inset released as soon as the bar goes, not
  // when it next happens to lay out — otherwise a finished session leaves a
  // gap at the end of every list.
  useEffect(() => {
    if (hidden) {
      reportInset(0);
    }
  }, [hidden, reportInset]);

  if (hidden) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push(TIMER_ROUTE)}
      onLayout={(event) => reportInset(event.nativeEvent.layout.height + spacing.md)}
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
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textPrimary,
          }}
        >
          {project && project.id === projectId ? project.name : ''}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.textPrimary,
          }}
        >
          {formatTimerClock(elapsedMs)}
        </Text>
      </View>

      {/*
        The icon alone. With no label to read, the action is carried entirely
        by `accessibilityLabel` — a screen reader would otherwise announce an
        unnamed button — and the square keeps a 44pt target that the old
        text pill never actually reached.
      */}
      <Pressable
        onPress={isRunning ? pause : resume}
        accessibilityRole="button"
        accessibilityLabel={isRunning ? t('activeTimer.pause') : t('activeTimer.resume')}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          borderRadius: radius.sm,
        }}
      >
        {isRunning ? (
          <PauseIcon color={colors.primaryText} size={20} weight="regular" />
        ) : (
          <PlayIcon color={colors.primaryText} size={20} weight="regular" />
        )}
      </Pressable>
    </Pressable>
  );
}
