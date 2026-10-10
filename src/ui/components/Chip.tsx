import { Pressable, Text, View } from 'react-native';

import { CheckIcon } from '@/ui/icons';
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
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingLeft: selected ? spacing.md : spacing.lg,
        paddingRight: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.divider,
      }}
    >
      {/*
        The fill alone carries selection at 2.66:1 in light, under the 3:1 a
        state indicator needs — and it says nothing to anyone who cannot
        separate terracotta from sand. The check is the actual indicator; the
        fill is reinforcement.
      */}
      {selected ? (
        <View accessible={false}>
          <CheckIcon color={colors.onPrimary} size={14} weight="bold" />
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: selected ? fontFamily.bodySemiBold : fontFamily.bodyMedium,
          fontSize: fontSize.body,
          color: selected ? colors.onPrimary : colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
