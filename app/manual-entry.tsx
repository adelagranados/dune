import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Project } from '@/data/db/schema';
import { listProjectsWithTotals } from '@/data/repositories/projectRepository';
import { createSession } from '@/data/repositories/sessionRepository';
import { formatDuration } from '@/lib/time';
import { Button } from '@/ui/components/Button';
import { PickerField } from '@/ui/components/PickerField';
import { useTheme } from '@/ui/theme/ThemeProvider';

type OpenPicker = 'date' | 'start' | 'end' | null;

/** Combines the chosen calendar day with the chosen wall-clock time. */
function combine(day: Date, time: Date): number {
  const combined = new Date(day);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined.getTime();
}

export default function ManualEntryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [projectListOpen, setProjectListOpen] = useState(false);

  const [day, setDay] = useState(() => new Date());
  const [startTime, setStartTime] = useState(() => new Date());
  const [endTime, setEndTime] = useState(() => new Date());
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  useEffect(() => {
    listProjectsWithTotals().then((rows) => setProjects(rows.map((row) => row.project)));
  }, []);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const startedAt = combine(day, startTime);
  const endedAt = combine(day, endTime);
  const durationMs = Math.max(0, endedAt - startedAt);
  const canSubmit = durationMs > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    await createSession({
      projectId: selectedProjectId,
      startedAt,
      endedAt,
      durationMs,
      source: 'manual',
    });
    router.replace({ pathname: '/project/[id]', params: { id: selectedProjectId } });
  };

  const formatDay = (value: Date) =>
    value.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (value: Date) =>
    value.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' });

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
          style={{
            fontFamily: fontFamily.bodyMedium,
            fontSize: fontSize.button,
            color: colors.textSecondary,
          }}
        >
          {'‹  ' + (selectedProject?.name ?? '')}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fontFamily.display,
          fontSize: fontSize.heading1,
          color: colors.textPrimary,
          marginTop: spacing.lg,
        }}
      >
        {t('manualEntry.title')}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.button,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        }}
      >
        {t('manualEntry.subtitle')}
      </Text>

      <PickerField
        label={t('manualEntry.project')}
        value={selectedProject?.name ?? ''}
        variant="select"
        onPress={() => setProjectListOpen(!projectListOpen)}
        style={{ marginTop: spacing.xl }}
      />
      {projectListOpen ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            marginTop: spacing.sm,
            paddingVertical: spacing.sm,
          }}
        >
          {projects.map((project) => (
            <Pressable
              key={project.id}
              onPress={() => {
                setSelectedProjectId(project.id);
                setProjectListOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }}
            >
              <View
                style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: project.color }}
              />
              <Text
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: fontSize.body,
                  color: colors.textPrimary,
                }}
              >
                {project.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <PickerField
        label={t('manualEntry.date')}
        value={formatDay(day)}
        onPress={() => setOpenPicker('date')}
        style={{ marginTop: spacing.lg }}
      />

      <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg }}>
        <PickerField
          label={t('manualEntry.startTime')}
          value={formatTime(startTime)}
          onPress={() => setOpenPicker('start')}
          style={{ flex: 1 }}
        />
        <PickerField
          label={t('manualEntry.endTime')}
          value={formatTime(endTime)}
          onPress={() => setOpenPicker('end')}
          style={{ flex: 1 }}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.lg,
          marginTop: spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.bodySemiBold,
            fontSize: fontSize.label,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {t('manualEntry.duration')}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.display,
            fontSize: fontSize.heading2,
            color: colors.textPrimary,
            marginTop: spacing.sm,
          }}
        >
          {formatDuration(durationMs)}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.secondary,
          color: colors.textSecondary,
          marginTop: spacing.xl,
        }}
      >
        {canSubmit ? t('manualEntry.hint') : t('manualEntry.invalidRange')}
      </Text>

      <Button
        label={t('manualEntry.submit')}
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={{ marginTop: spacing['2xl'] }}
      />

      {openPicker !== null ? (
        <DateTimePicker
          value={openPicker === 'date' ? day : openPicker === 'start' ? startTime : endTime}
          mode={openPicker === 'date' ? 'date' : 'time'}
          onValueChange={(_event, selected) => {
            const picker = openPicker;
            setOpenPicker(null);
            if (picker === 'date') {
              setDay(selected);
            } else if (picker === 'start') {
              setStartTime(selected);
            } else {
              setEndTime(selected);
            }
          }}
          onDismiss={() => setOpenPicker(null)}
        />
      ) : null}
    </ScrollView>
  );
}
