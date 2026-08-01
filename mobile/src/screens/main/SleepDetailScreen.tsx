import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ArrowLeft, Moon } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface SleepDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SleepDetail'>;
}

const stages = [
  { label: 'Awake', minutes: 18, color: '#FF453A' },
  { label: 'Light', minutes: 180, color: '#BF5AF2' },
  { label: 'Deep', minutes: 82, color: '#5E5CE6' },
  { label: 'REM', minutes: 82, color: '#0A84FF' },
];

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function SleepDetailScreen({ navigation }: SleepDetailScreenProps) {
  const theme = useTheme();
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:22');
  const total = stages.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Sleep
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.durationHeader}>
          <Moon size={32} color={theme.colors.purple} />
          <Text style={[styles.durationValue, { color: theme.colors.purple }]}>
            7h 22m
          </Text>
          <Text
            style={[
              styles.durationMeta,
              { color: theme.colors.textSecondary },
            ]}
          >
            Last night · Goal: 8h
          </Text>
        </View>

        <WvCard style={styles.stagesCard}>
          <Text
            style={[
              styles.cardLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Sleep stages
          </Text>
          <View style={styles.stageBar}>
            {stages.map((s) => (
              <View
                key={s.label}
                style={{
                  width: `${(s.minutes / total) * 100}%`,
                  backgroundColor: s.color,
                  height: '100%',
                }}
              />
            ))}
          </View>
          <View style={styles.stageLegend}>
            {stages.map((s) => (
              <View key={s.label} style={styles.stageLegendItem}>
                <View
                  style={[
                    styles.stageDot,
                    { backgroundColor: s.color },
                  ]}
                />
                <Text
                  style={[
                    styles.stageLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {s.label}
                </Text>
                <Text
                  style={[
                    styles.stageValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {formatMinutes(s.minutes)}
                </Text>
              </View>
            ))}
          </View>
        </WvCard>

        <View style={styles.timesRow}>
          <View style={styles.timeField}>
            <Text
              style={[
                styles.timeLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Bedtime
            </Text>
            <TextInput
              value={bedtime}
              onChangeText={setBedtime}
              style={[
                styles.timeInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.inputFocusedBorder,
                },
              ]}
            />
          </View>
          <View style={styles.timeField}>
            <Text
              style={[
                styles.timeLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Wake time
            </Text>
            <TextInput
              value={wakeTime}
              onChangeText={setWakeTime}
              style={[
                styles.timeInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.inputFocusedBorder,
                },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Save sleep"
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: theme.colors.purple }}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  durationHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  durationValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  durationMeta: {
    fontSize: 14,
  },
  stagesCard: {
    padding: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  stageBar: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 16,
  },
  stageLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stageLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageLabel: {
    fontSize: 12,
  },
  stageValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  timesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
    gap: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeInput: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
