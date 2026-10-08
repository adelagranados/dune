import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveTimerMiniBar } from '@/ui/components/ActiveTimerMiniBar';
import { HomeIcon, SettingsIcon, StatsIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

/** Matches the bottom nav height in the design, and anchors the mini bar above it. */
const TAB_BAR_HEIGHT = 76;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ focused, size }) => (
              <HomeIcon
                color={focused ? colors.primary : colors.textSecondary}
                size={size}
                weight="regular"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: t('tabs.stats'),
            tabBarIcon: ({ focused, size }) => (
              <StatsIcon
                color={focused ? colors.primary : colors.textSecondary}
                size={size}
                weight="regular"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ focused, size }) => (
              <SettingsIcon
                color={focused ? colors.primary : colors.textSecondary}
                size={size}
                weight="regular"
              />
            ),
          }}
        />
        {/* The timer keeps the bottom nav visible but is never a tab of its own. */}
        <Tabs.Screen name="timer" options={{ href: null }} />
      </Tabs>

      <ActiveTimerMiniBar bottomOffset={TAB_BAR_HEIGHT + insets.bottom + spacing.md} />
    </View>
  );
}
