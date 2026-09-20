import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';

import { listProjectsWithTotals, type ProjectWithTotal } from '@/data/repositories/projectRepository';
import { formatDuration } from '@/lib/time';
import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithTotal[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      listProjectsWithTotals().then(setProjects);
    }, []),
  );

  if (projects === null) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
      <Text style={{ fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.label, color: colors.textSecondary }}>
        {t('common.appName').toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.display,
          fontSize: fontSize.heading1,
          color: colors.textPrimary,
          marginTop: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {t('home.headline')}
      </Text>

      {projects.length === 0 ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl }}>
          <Text style={{ fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.heading2, color: colors.textPrimary }}>
            {t('home.emptyTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.body,
              color: colors.textSecondary,
              marginTop: spacing.sm,
            }}
          >
            {t('home.emptyDescription')}
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={{
              fontFamily: fontFamily.bodySemiBold,
              fontSize: fontSize.heading2,
              color: colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {t('home.projectsLabel')}
          </Text>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.project.id}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.divider }} />}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: item.project.color }} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fontFamily.body,
                    fontSize: fontSize.body,
                    color: colors.textPrimary,
                  }}
                >
                  {item.project.name}
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamily.bodySemiBold,
                    fontSize: fontSize.body,
                    color: colors.textPrimary,
                  }}
                >
                  {formatDuration(item.totalDurationMs)}
                </Text>
              </View>
            )}
          />
        </>
      )}

      {projects.length === 0 ? (
        <Button label={t('common.continue')} onPress={() => router.push('/project/new')} style={{ marginTop: spacing.xl }} />
      ) : (
        <Pressable onPress={() => router.push('/project/new')} style={{ marginTop: spacing.lg }}>
          <Text style={{ fontFamily: fontFamily.bodyMedium, fontSize: fontSize.body, color: colors.primary }}>
            {t('home.newProject')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
