import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { CaretRightIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

type SettingsRowProps = {
  label: string;
  value: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SettingsRow({ label, value, onPress, style }: SettingsRowProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        },
        style,
      ]}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: fontFamily.bodyMedium,
          fontSize: fontSize.button,
          color: colors.textPrimary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.secondary,
          color: colors.textSecondary,
        }}
      >
        {value}
      </Text>
      <CaretRightIcon color={colors.textSecondary} size={18} weight="regular" />
    </Pressable>
  );
}
