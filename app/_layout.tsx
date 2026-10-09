import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
  useFonts as useDisplayFonts,
} from '@expo-google-fonts/dm-serif-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts as useBodyFonts,
} from '@expo-google-fonts/manrope';
import {
  PlayfairDisplay_400Regular,
  useFonts as useWordmarkFont,
} from '@expo-google-fonts/playfair-display';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { db, migrations } from '@/data/db/client';
import { configureTargetNotifications } from '@/data/notifications/targetNotifications';
import { initI18n } from '@/i18n';
import { useSettingsStore } from '@/state/useSettingsStore';
import { ThemeProvider, useTheme } from '@/ui/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { colors, colorScheme } = useTheme();
  const { success, error } = useMigrations(db, migrations);

  // `contentStyle` only covers a screen's own content. During a transition
  // react-native-screens shows the native window background underneath, which
  // on Android is still the splash drawable - a bright flash between screens,
  // worst in dark mode. This paints the root view itself.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.textPrimary }}>
          Database migration failed: {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return null;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const language = useSettingsStore((state) => state.language);
  const [displayFontsLoaded] = useDisplayFonts({
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
  });
  const [bodyFontsLoaded] = useBodyFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [wordmarkFontLoaded] = useWordmarkFont({ PlayfairDisplay_400Regular });
  useEffect(() => {
    initI18n(language);
    // After initI18n so the Android channel gets its localized name, and
    // re-run on a language change so renaming it follows the app.
    void configureTargetNotifications();
  }, [language]);

  const ready = displayFontsLoaded && bodyFontsLoaded && wordmarkFontLoaded;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
