import { Pressable, Text } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.divider,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.bodyMedium,
          fontSize: fontSize.body,
          color: selected ? colors.onPrimary : colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
