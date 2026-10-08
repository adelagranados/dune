import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HomeIcon, SettingsIcon, StatsIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused, size }) => (
            <HomeIcon color={focused ? colors.primary : colors.textSecondary} size={size} weight="regular" />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ focused, size }) => (
            <StatsIcon color={focused ? colors.primary : colors.textSecondary} size={size} weight="regular" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused, size }) => (
            <SettingsIcon color={focused ? colors.primary : colors.textSecondary} size={size} weight="regular" />
          ),
        }}
      />
      {/* The timer keeps the bottom nav visible but is never a tab of its own. */}
      <Tabs.Screen name="timer" options={{ href: null }} />
    </Tabs>
  );
}
