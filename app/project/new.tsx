import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createProject, getDistinctCategories } from '@/data/repositories/projectRepository';
import { Button } from '@/ui/components/Button';
import { Chip } from '@/ui/components/Chip';
import { TextField } from '@/ui/components/TextField';
import { useTheme } from '@/ui/theme/ThemeProvider';

const PROJECT_COLORS = ['#C86F52', '#8175C7', '#A8C7B1', '#E5A47F', '#6D625B'];
const DEFAULT_CATEGORY_SUGGESTIONS = ['Coding', 'Creative', 'Learning'];

export default function CreateProjectScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [estimatedHours, setEstimatedHours] = useState('');
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

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    const hours = Number.parseFloat(estimatedHours);
    await createProject({
      name: name.trim(),
      category: category.trim() || null,
      color,
      estimatedTimeMs:
        Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60 * 60 * 1000) : null,
    });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing['3xl'],
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Text
          style={{ fontFamily: fontFamily.body, fontSize: fontSize.body, color: colors.primary }}
        >
          {'‹ ' + t('tabs.home')}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fontFamily.display,
          fontSize: fontSize.display,
          color: colors.textPrimary,
          marginTop: spacing.lg,
        }}
      >
        {t('createProject.title')}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.body,
          color: colors.textSecondary,
          marginTop: spacing.xs,
          marginBottom: spacing.xl,
        }}
      >
        {t('createProject.subtitle')}
      </Text>

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
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {PROJECT_COLORS.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setColor(swatch)}
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                backgroundColor: swatch,
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
        label={t('createProject.submit')}
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={{ marginTop: spacing['2xl'] }}
      />
    </ScrollView>
  );
}
