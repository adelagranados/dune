import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { ProjectColor } from '@/data/db/schema';
import { getDistinctCategories } from '@/data/repositories/projectRepository';
import { Button } from '@/ui/components/Button';
import { Chip } from '@/ui/components/Chip';
import { TextField } from '@/ui/components/TextField';
import { useTheme } from '@/ui/theme/ThemeProvider';

export const PROJECT_COLORS: ProjectColor[] = ['terracotta', 'dusk', 'sage', 'sunset', 'ochre'];
const DEFAULT_CATEGORY_SUGGESTIONS = ['Coding', 'Creative', 'Learning'];

const HOUR_MS = 60 * 60 * 1000;

export type ProjectFormValues = {
  name: string;
  category: string | null;
  color: ProjectColor;
  estimatedTimeMs: number | null;
};

type ProjectFormProps = {
  initialValues?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => void;
};

/**
 * The fields shared by creating and editing a project.
 *
 * Both screens ask for exactly the same things, so they ask with the same
 * component — a second copy would drift, and the category merging and the
 * swatches are the kind of detail that only gets fixed in one of two copies.
 */
export function ProjectForm({ initialValues, submitLabel, onSubmit }: ProjectFormProps) {
  const { t } = useTranslation();
  const { colors, projectColors, spacing, fontFamily, fontSize } = useTheme();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [color, setColor] = useState<ProjectColor>(initialValues?.color ?? PROJECT_COLORS[0]);
  const [estimatedHours, setEstimatedHours] = useState(
    initialValues?.estimatedTimeMs ? String(initialValues.estimatedTimeMs / HOUR_MS) : '',
  );
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>(
    DEFAULT_CATEGORY_SUGGESTIONS,
  );

  useEffect(() => {
    getDistinctCategories().then((existing) => {
      // Merged, not replaced: categories already in use come first because they
      // are the likeliest next pick, and the defaults stay available behind
      // them. Replacing made the list shrink as the app got used.
      const merged = [...existing];
      for (const suggestion of DEFAULT_CATEGORY_SUGGESTIONS) {
        if (!merged.includes(suggestion)) {
          merged.push(suggestion);
        }
      }
      setCategorySuggestions(merged);
    });
  }, []);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    const hours = Number.parseFloat(estimatedHours);
    onSubmit({
      name: name.trim(),
      category: category.trim() || null,
      color,
      estimatedTimeMs: Number.isFinite(hours) && hours > 0 ? Math.round(hours * HOUR_MS) : null,
    });
  };

  return (
    <>
      <TextField
        label={t('createProject.nameLabel')}
        value={name}
        onChangeText={setName}
        placeholder={t('createProject.namePlaceholder')}
      />

      <View style={{ marginTop: spacing.xl }}>
        <TextField
          label={t('createProject.categoryLabel')}
          value={category}
          onChangeText={setCategory}
          placeholder={t('createProject.categoryPlaceholder')}
        />
        {/* The chips are shortcuts into the field, not a closed set of choices. */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginTop: spacing.md,
          }}
        >
          {categorySuggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              selected={category.trim() === suggestion}
              onPress={() => setCategory(category.trim() === suggestion ? '' : suggestion)}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
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
          {t('createProject.colorLabel')}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          {PROJECT_COLORS.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setColor(swatch)}
              accessibilityRole="button"
              accessibilityState={{ selected: color === swatch }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: projectColors[swatch],
                borderWidth: color === swatch ? 2 : 0,
                borderColor: colors.textPrimary,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <TextField
          label={t('createProject.estimatedLabel')}
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          placeholder={t('createProject.estimatedPlaceholder')}
          keyboardType="decimal-pad"
          suffix="h"
        />
      </View>

      <Text
        style={{
          marginTop: spacing.sm,
          fontFamily: fontFamily.body,
          fontSize: fontSize.secondary,
          color: colors.textSecondary,
        }}
      >
        {t('createProject.estimatedHint')}
      </Text>

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={{ marginTop: spacing['2xl'] }}
      />
    </>
  );
}
