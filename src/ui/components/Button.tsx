import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();

  const isPrimary = variant === 'primary';
  const backgroundColor = disabled ? colors.divider : isPrimary ? colors.primary : colors.surface;
  const textColor = isPrimary && !disabled ? colors.onPrimary : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor,
          borderRadius: radius.md,
          paddingVertical: spacing.lg,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.button, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
