import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { DotsThreeIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ProjectActionsMenuProps = {
  accessibilityLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * The ••• at the top of a project, and the two actions behind it.
 *
 * The trigger carries no background of its own — it is the dots and nothing
 * else — but keeps a 49pt target so it stays reachable. The menu itself is a
 * plain overlay rather than a sheet: it belongs to the corner it opened from,
 * not to the bottom of the screen.
 */
export function ProjectActionsMenu({
  accessibilityLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: ProjectActionsMenuProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const [open, setOpen] = useState(false);

  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{ width: 49, height: 49, alignItems: 'center', justifyContent: 'center' }}
      >
        <DotsThreeIcon color={colors.textSecondary} size={24} weight="bold" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} accessible={false}>
          <View
            style={{
              position: 'absolute',
              top: 112,
              right: spacing.xl,
              width: 193,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              paddingVertical: spacing.sm,
            }}
          >
            <Pressable
              onPress={() => choose(onEdit)}
              accessibilityRole="button"
              style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
            >
              <Text
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: fontSize.secondary,
                  color: colors.textPrimary,
                }}
              >
                {editLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => choose(onDelete)}
              accessibilityRole="button"
              style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
            >
              {/*
                `danger` rather than the sheet's lighter red: this sits on a
                surface, which is what `danger` is for, and reaches 4.79:1
                where the sheet tone would give 3.31:1 here.
              */}
              <Text
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: fontSize.secondary,
                  color: colors.danger,
                }}
              >
                {deleteLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
