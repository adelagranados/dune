import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  suffix?: string;
};

export function TextField({ label, value, onChangeText, placeholder, keyboardType, suffix }: TextFieldProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();

  return (
    <View>
      <Text
        style={{
          fontFamily: fontFamily.bodySemiBold,
          fontSize: fontSize.label,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: spacing.sm,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.surface,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.textPrimary,
          }}
        />
        {suffix ? (
          <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.body, color: colors.textSecondary }}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
