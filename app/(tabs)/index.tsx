import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  listProjectsWithTotals,
  type ProjectWithTotal,
} from '@/data/repositories/projectRepository';
import { formatDuration } from '@/lib/time';
import { Button } from '@/ui/components/Button';
import { Hourglass } from '@/ui/icons';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithTotal[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      listProjectsWithTotals().then(setProjects);
    }, []),
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: insets.top + spacing.lg,
  };

  if (projects === null) {
    return <View style={containerStyle} />;
  }

  return (
    <View style={containerStyle}>
      <Text
        style={{
          fontFamily: fontFamily.wordmark,
          fontSize: fontSize.wordmark,
          letterSpacing: 5.4,
          color: colors.textPrimary,
        }}
      >
        {t('common.appName').toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.displayItalic,
          fontSize: fontSize.display,
          lineHeight: 44,
          color: colors.textPrimary,
          marginTop: spacing['2xl'],
        }}
      >
        {t('home.headline')}
      </Text>

      {projects.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing['2xl'],
            paddingBottom: spacing['4xl'],
            marginTop: spacing['4xl'],
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Hourglass color={colors.primary} />
          </View>
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.heading3,
              color: colors.textPrimary,
              marginTop: spacing.xl,
            }}
          >
            {t('home.emptyTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: fontSize.secondary,
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
              fontFamily: fontFamily.body,
              fontSize: fontSize.body,
              color: colors.textPrimary,
              marginTop: spacing['4xl'],
              marginBottom: spacing.sm,
            }}
          >
            {t('home.projectsLabel')}
          </Text>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.project.id}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.divider }} />
            )}
            ListFooterComponent={
              <Pressable
                onPress={() => router.push('/project/new')}
                style={{ marginTop: spacing['2xl'] }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.bodyMedium,
                    fontSize: fontSize.body,
                    color: colors.primary,
                  }}
                >
                  {t('home.newProject')}
                </Text>
              </Pressable>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/project/[id]', params: { id: item.project.id } })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: item.project.color,
                  }}
                />
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
              </Pressable>
            )}
          />
        </>
      )}

      {projects.length === 0 && (
        <Button
          label={t('home.createFirstProject')}
          onPress={() => router.push('/project/new')}
          style={{ marginTop: spacing['3xl'] }}
        />
      )}
    </View>
  );
}
