import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { TrashIcon } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

type SessionRowProps = {
  /** Date and duration as one line — "Oct 8 · 1h 24m". */
  label: string;
  deleteLabel: string;
  /** True while this is the row the swipe belongs to. */
  swiped: boolean;
  onSwipedChange: (swiped: boolean) => void;
  onDelete: () => void;
};

/**
 * A recorded session, deleted by swiping left.
 *
 * Only the swiped row takes the sand surface; every other row keeps the page
 * background. The highlight belongs to the gesture, not to the row — it is
 * never a selected state that outlives the swipe, which is why the row closes
 * itself as soon as the confirmation has been asked for.
 *
 * Which row is swiped is owned by the list, so opening one closes any other.
 * Two rows showing a delete action at once would read as a selection.
 */
export function SessionRow({
  label,
  deleteLabel,
  swiped,
  onSwipedChange,
  onDelete,
}: SessionRowProps) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);

  // Another row took the swipe, so this one gives it up.
  useEffect(() => {
    if (!swiped) {
      swipeable.current?.close();
    }
  }, [swiped]);

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => onSwipedChange(true)}
      onSwipeableWillClose={() => onSwipedChange(false)}
      containerStyle={{ marginBottom: spacing.xs }}
      renderRightActions={() => (
        <View style={{ justifyContent: 'center', paddingLeft: spacing.sm }}>
          <Pressable
            onPress={() => {
              swipeable.current?.close();
              onDelete();
            }}
            accessibilityRole="button"
            accessibilityLabel={deleteLabel}
            hitSlop={spacing.sm}
            style={{
              width: 38,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.sm,
              backgroundColor: colors.swipeAction,
            }}
          >
            <TrashIcon color={colors.danger} size={20} weight="regular" />
          </Pressable>
        </View>
      )}
    >
      <View
        style={{
          height: 52,
          justifyContent: 'center',
          paddingHorizontal: spacing.md,
          borderRadius: radius.sm,
          backgroundColor: swiped ? colors.surface : colors.background,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.secondary,
            color: colors.textPrimary,
          }}
        >
          {label}
        </Text>
      </View>
    </ReanimatedSwipeable>
  );
}
