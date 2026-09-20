import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ fontFamily: fontFamily.display, fontSize: fontSize.heading1, color: colors.textPrimary }}>
        {t('settings.placeholder')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
