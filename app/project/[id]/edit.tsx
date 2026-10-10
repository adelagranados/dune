import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project } from '@/data/db/schema';
import { getProjectById, updateProject } from '@/data/repositories/projectRepository';
import { ProjectForm } from '@/ui/components/ProjectForm';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, spacing, fontFamily, fontSize, lineHeight } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProjectById(id).then(setProject);
  }, [id]);

  const containerStyle = { flex: 1, backgroundColor: colors.background };

  // The form seeds its fields from the project, so it may not render before it
  // arrives — otherwise it would mount empty and then jump.
  if (!project) {
    return <View style={containerStyle} />;
  }

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing['3xl'],
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.body,
            color: colors.primaryText,
          }}
        >
          {'‹ ' + project.name}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fontFamily.displayItalic,
          fontSize: fontSize.display,
          lineHeight: lineHeight.display,
          color: colors.textPrimary,
          marginTop: spacing.lg,
        }}
      >
        {t('editProject.title')}
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
        {t('editProject.subtitle')}
      </Text>

      <ProjectForm
        initialValues={{
          name: project.name,
          category: project.category,
          color: project.color,
          estimatedTimeMs: project.estimatedTimeMs,
        }}
        submitLabel={t('editProject.submit')}
        onSubmit={(values) => {
          void updateProject(project.id, values).then(() => router.back());
        }}
      />
    </ScrollView>
  );
}
