import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CaretDownIcon, CaretRightIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

type PickerFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  /** `select` opens a list, `step` opens a picker — matching the carets in the design. */
  variant?: 'select' | 'step';
  style?: StyleProp<ViewStyle>;
};

export function PickerField({ label, value, onPress, variant = 'step', style }: PickerFieldProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const Caret = variant === 'select' ? CaretDownIcon : CaretRightIcon;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.md,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fontFamily.bodySemiBold,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.bodyMedium,
            fontSize: fontSize.body,
            color: colors.textPrimary,
            marginTop: spacing.xs,
          }}
        >
          {value}
        </Text>
      </View>
      <Caret color={colors.textSecondary} size={18} weight="regular" />
    </Pressable>
  );
}
