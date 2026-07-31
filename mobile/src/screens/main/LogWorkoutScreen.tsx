import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ArrowLeft, Plus, Minus, Flame } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface LogWorkoutScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LogWorkout'>;
}

const activities = [
  'Running',
  'Cycling',
  'Swimming',
  'Strength',
  'HIIT',
  'Yoga',
  'Walking',
  'Other',
];

export function LogWorkoutScreen({ navigation }: LogWorkoutScreenProps) {
  const theme = useTheme();
  const [type, setType] = useState('Running');
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('');

  const calories = Math.round(duration * 8.5);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Log workout
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Activity type
          </Text>
          <View style={styles.activityGrid}>
            {activities.map((a) => (
              <TouchableOpacity
                key={a}
                onPress={() => setType(a)}
                style={[
                  styles.activityButton,
                  {
                    backgroundColor:
                      type === a
                        ? `${theme.colors.activityOrange}20`
                        : theme.colors.input,
                    borderColor:
                      type === a
                        ? theme.colors.activityOrange
                        : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    {
                      color:
                        type === a
                          ? theme.colors.activityOrange
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Duration
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setDuration(Math.max(5, duration - 5))}
              style={[
                styles.stepperButton,
                { backgroundColor: theme.colors.input },
              ]}
            >
              <Minus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.durationDisplay}>
              <Text
                style={[
                  styles.durationValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {duration}
              </Text>
              <Text
                style={[
                  styles.durationUnit,
                  { color: theme.colors.textSecondary },
                ]}
              >
                min
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDuration(duration + 5)}
              style={[
                styles.stepperButton,
                { backgroundColor: theme.colors.input },
              ]}
            >
              <Plus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <WvCard style={styles.caloriesCard}>
          <Text
            style={[
              styles.caloriesLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Estimated calories burned
          </Text>
          <Text
            style={[
              styles.caloriesValue,
              { color: theme.colors.activityOrange },
            ]}
          >
            {calories}
          </Text>
          <Text
            style={[
              styles.caloriesUnit,
              { color: theme.colors.textTertiary },
            ]}
          >
            kcal · Based on {type}
          </Text>
        </WvCard>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Notes (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go?"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.inputFocusedBorder,
              },
            ]}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Save workout"
          onPress={() => navigation.goBack()}
          icon={<Flame size={20} color="#000000" />}
          style={{ backgroundColor: theme.colors.activityOrange }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  field: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    width: '23%',
    minWidth: 72,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  durationValue: {
    fontSize: 40,
    fontWeight: '700',
  },
  durationUnit: {
    fontSize: 17,
    marginBottom: 6,
  },
  caloriesCard: {
    padding: 16,
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  caloriesUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  notesInput: {
    height: 80,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
