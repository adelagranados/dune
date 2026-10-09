import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors, colorScheme, radius, spacing, fontFamily, fontSize } = useTheme();

  // The selected segment sits one step lighter than the track it rides on. In
  // light that lighter surface is the page background; in dark it is the
  // elevated surface.
  const selectedBackground = colorScheme === 'dark' ? colors.surfaceElevated : colors.background;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.xs,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              backgroundColor: selected ? selectedBackground : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: selected ? fontFamily.bodySemiBold : fontFamily.bodyMedium,
                fontSize: fontSize.secondary,
                color: selected ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
