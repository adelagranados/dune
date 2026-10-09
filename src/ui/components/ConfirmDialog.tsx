import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/ui/theme/ThemeProvider';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Renders the confirming action as destructive. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * An in-app replacement for `Alert.alert`.
 *
 * The system alert draws itself in the platform's own style, which on Android
 * means Material green text buttons against Dune's palette — the same mismatch
 * the native date pickers were reported for. This reuses the sheet shape the
 * language and date pickers already use, so a confirmation looks like part of
 * the app rather than something borrowed from the OS.
 *
 * It stays a deliberate step: the confirming action is separated from the
 * cancelling one and never pre-selected. Matching the app's voice should not
 * make destroying something feel casual.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      />
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['2xl'],
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.display,
            fontSize: fontSize.heading3,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.textSecondary,
            marginTop: spacing.sm,
          }}
        >
          {message}
        </Text>

        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          style={{
            alignItems: 'center',
            paddingVertical: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: destructive ? colors.surface : colors.primary,
            marginTop: spacing['2xl'],
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.bodySemiBold,
              fontSize: fontSize.button,
              color: destructive ? colors.danger : colors.onPrimary,
            }}
          >
            {confirmLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={{ alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.sm }}
        >
          <Text
            style={{
              fontFamily: fontFamily.bodyMedium,
              fontSize: fontSize.button,
              color: colors.textSecondary,
            }}
          >
            {cancelLabel}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
