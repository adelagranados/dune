import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveTimerMiniBar } from '@/ui/components/ActiveTimerMiniBar';
import { HomeIcon, SettingsIcon, StatsIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

/**
 * Height of the bar's *content* — icon, label and their padding. The bottom
 * safe area is added on top of this, never baked into it.
 *
 * The design's 76 is the whole bar on an iPhone 14 Pro frame, so it already
 * contained a 19pt allowance for the home indicator. Treating that number as
 * content height and adding the inset again counted the safe area twice, which
 * is what made the bar render at 100dp. 49 is the height iOS uses for its own
 * tab bars, so the result feels native on both platforms.
 */
const TAB_BAR_CONTENT_HEIGHT = 49;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primaryText,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIconStyle: { height: 22 },
          tabBarLabelStyle: { fontSize: fontSize.label, marginTop: 2 },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
            paddingTop: 6,
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
                color={focused ? colors.primaryText : colors.textSecondary}
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
                color={focused ? colors.primaryText : colors.textSecondary}
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
                color={focused ? colors.primaryText : colors.textSecondary}
                size={size}
                weight="regular"
              />
            ),
          }}
        />
        {/* The timer keeps the bottom nav visible but is never a tab of its own. */}
        <Tabs.Screen name="timer" options={{ href: null }} />
      </Tabs>

      <ActiveTimerMiniBar bottomOffset={TAB_BAR_CONTENT_HEIGHT + insets.bottom + spacing.md} />
    </View>
  );
}
