import * as Notifications from 'expo-notifications';
import { t } from 'i18next';
import { Platform } from 'react-native';

import { readTargetNotificationId, writeTargetNotificationId } from '@/data/kv/activeTimer.store';
import { getProjectById } from '@/data/repositories/projectRepository';
import { computeTargetFireAt, type ActiveTimer } from '@/domain/timer/timerEngine';
import { formatDuration } from '@/lib/time';

const CHANNEL_ID = 'session-target';

/**
 * Has to run before the first permission request: on Android 13+ the system
 * prompt never appears until the app has declared at least one channel.
 */
export async function configureTargetNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      // User-visible in the Android settings app, so it goes through i18n.
      name: t('notifications.channelName'),
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** True only when the user denied permission for good — not on a first run. */
export async function isNotificationPermissionBlocked(): Promise<boolean> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return !granted && !canAskAgain;
}

/**
 * Asked lazily, the first time a session actually has a target to announce,
 * instead of on launch where the request would have no context.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  if (granted) {
    return true;
  }
  if (!canAskAgain) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelTargetNotification(): Promise<void> {
  const id = readTargetNotificationId();
  if (id === null) {
    return;
  }
  // Cleared first so a failing cancel cannot leave a stale id behind.
  writeTargetNotificationId(null);
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Brings the scheduled notification in line with the timer's current state.
 *
 * Always cancels before scheduling, because every transition invalidates the
 * pending notification: a pause removes its fire time entirely, and a resume
 * needs a new one computed from the remaining *active* time. Nothing about the
 * notification is ever trusted as state — it is re-derived from the timer.
 */
export async function syncTargetNotification(
  timer: ActiveTimer | null,
  now: number,
): Promise<void> {
  await cancelTargetNotification();

  if (timer === null) {
    return;
  }
  const fireAt = computeTargetFireAt(timer, now);
  if (fireAt === null) {
    return;
  }
  if (!(await hasNotificationPermission())) {
    return;
  }

  const project = await getProjectById(timer.projectId);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifications.targetReached.title'),
      body: t('notifications.targetReached.body', {
        project: project?.name ?? '',
        target: formatDuration(timer.targetDurationMs ?? 0),
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
      channelId: CHANNEL_ID,
    },
  });
  writeTargetNotificationId(id);
}
