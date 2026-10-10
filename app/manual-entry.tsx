import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const { colors, projectColors, colorScheme, radius, spacing, fontFamily, fontSize, lineHeight } =
    useTheme();
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
    router.dismissTo({ pathname: '/project/[id]', params: { id: selectedProjectId } });
  };

  const applySelection = (selected: Date) => {
    if (openPicker === 'date') {
      setDay(selected);
    } else if (openPicker === 'start') {
      setStartTime(selected);
    } else {
      setEndTime(selected);
    }
  };

  /**
   * The picker is a modal dialog on Android but a plain inline view on iOS, so
   * iOS needs a sheet of its own to put it in — and a Done button, since an
   * inline picker has nothing to confirm with.
   */
  const renderPicker = () => (
    <DateTimePicker
      value={openPicker === 'date' ? day : openPicker === 'start' ? startTime : endTime}
      mode={openPicker === 'date' ? 'date' : 'time'}
      display={Platform.OS === 'ios' ? (openPicker === 'date' ? 'inline' : 'spinner') : 'default'}
      // Without these the native picker draws itself in the iOS system blue,
      // which is the one part of the sheet the app's own styles cannot reach.
      // They are iOS-only props, so Android is left untouched.
      {...(Platform.OS === 'ios'
        ? {
            accentColor: colors.primary,
            textColor: colors.textPrimary,
            themeVariant: colorScheme === 'dark' ? ('dark' as const) : ('light' as const),
          }
        : {})}
      onValueChange={(_event, selected) => {
        applySelection(selected);
        // On Android the component is the dialog, so picking closes it. On iOS
        // it lives inside our sheet and stays until Done.
        if (Platform.OS !== 'ios') {
          setOpenPicker(null);
        }
      }}
      onDismiss={() => setOpenPicker(null)}
    />
  );

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
          lineHeight: lineHeight.heading1,
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
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: projectColors[project.color],
                }}
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
            lineHeight: lineHeight.heading2,
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

      {Platform.OS === 'ios' ? (
        <Modal
          visible={openPicker !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setOpenPicker(null)}
        >
          {/* Fills the modal, so the sheet's rounded corners dim what they reveal. */}
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
              onPress={() => setOpenPicker(null)}
            />
            <View
              style={{
                backgroundColor: colors.surfaceElevated,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                paddingBottom: insets.bottom + spacing.lg,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                }}
              >
                <Pressable onPress={() => setOpenPicker(null)} hitSlop={spacing.md}>
                  <Text
                    style={{
                      fontFamily: fontFamily.bodySemiBold,
                      fontSize: fontSize.button,
                      color: colors.primaryText,
                    }}
                  >
                    {t('common.done')}
                  </Text>
                </Pressable>
              </View>
              <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg }}>
                {openPicker !== null ? renderPicker() : null}
              </View>
            </View>
          </View>
        </Modal>
      ) : openPicker !== null ? (
        renderPicker()
      ) : null}
    </ScrollView>
  );
}
