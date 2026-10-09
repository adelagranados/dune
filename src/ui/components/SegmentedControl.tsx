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
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();

  // The selected segment sits one step lighter than its track, which is what
  // `surfaceElevated` means in both themes now that light has a real value for
  // it. This used to branch on colorScheme because light reused `surface`.

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
              backgroundColor: selected ? colors.surfaceElevated : 'transparent',
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
