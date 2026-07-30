import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Target, TrendingDown, Flame } from 'lucide-react-native';
import { WvIconButton } from '../../components/ui/WvIconButton.js';
import { WvCard } from '../../components/ui/WvCard.js';
import { WvInput } from '../../components/ui/WvInput.js';
import { WvButton } from '../../components/ui/WvButton.js';
import { useTheme } from '../../theme/index.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types.js';

interface GoalsTargetsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GoalsTargets'>;
}

function parseNumber(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

export function GoalsTargetsScreen({ navigation }: GoalsTargetsScreenProps) {
  const theme = useTheme();
  const [calories, setCalories] = useState('2200');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('250');
  const [weightGoal, setWeightGoal] = useState('68.0');
  const [workouts, setWorkouts] = useState('4');

  const { fatGrams, proteinGrams, carbsGrams, calorieNum } = useMemo(() => {
    const c = parseNumber(calories);
    const p = parseNumber(protein);
    const cb = parseNumber(carbs);
    const fat = Math.max(0, (c - p * 4 - cb * 4) / 9);
    return {
      calorieNum: c,
      proteinGrams: p,
      carbsGrams: cb,
      fatGrams: fat,
    };
  }, [calories, protein, carbs]);

  const totalMacroCalories = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
  const proteinPct = totalMacroCalories > 0 ? (proteinGrams * 4) / totalMacroCalories : 0;
  const carbsPct = totalMacroCalories > 0 ? (carbsGrams * 4) / totalMacroCalories : 0;
  const fatPct = totalMacroCalories > 0 ? (fatGrams * 9) / totalMacroCalories : 0;

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
          Goals & targets
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <WvCard style={styles.summaryCard}>
          {[
            {
              icon: <Target size={20} color={theme.colors.primary} />,
              label: 'Calorie target',
              value: `${Math.round(calorieNum)} kcal`,
            },
            {
              icon: <TrendingDown size={20} color={theme.colors.blue} />,
              label: 'Weight goal',
              value: `${weightGoal} kg`,
            },
            {
              icon: <Flame size={20} color={theme.colors.orange} />,
              label: 'Weekly workouts',
              value: `${workouts}`,
            },
          ].map((item) => (
            <View key={item.label} style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: theme.colors.input },
                  ]}
                >
                  {item.icon}
                </View>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </WvCard>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Macro split
          </Text>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroSegment,
                { flex: proteinPct, backgroundColor: theme.colors.blue },
              ]}
            />
            <View
              style={[
                styles.macroSegment,
                { flex: carbsPct, backgroundColor: theme.colors.orange },
              ]}
            />
            <View
              style={[
                styles.macroSegment,
                { flex: fatPct, backgroundColor: theme.colors.purple },
              ]}
            />
          </View>
          <View style={styles.macroLegend}>
            {[
              { label: 'Protein', value: `${Math.round(proteinGrams)}g`, color: theme.colors.blue },
              { label: 'Carbs', value: `${Math.round(carbsGrams)}g`, color: theme.colors.orange },
              { label: 'Fat', value: `${Math.round(fatGrams)}g`, color: theme.colors.purple },
            ].map((m) => (
              <View key={m.label} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: m.color },
                  ]}
                />
                <Text
                  style={[
                    styles.legendLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {m.label}
                </Text>
                <Text
                  style={[
                    styles.legendValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {m.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Adjust macros
          </Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <WvInput
                label="Calories"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.flex}>
              <WvInput
                label="Protein (g)"
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <WvInput
                label="Carbs (g)"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.flex}>
              <View style={styles.fatField}>
                <Text
                  style={[
                    styles.fatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Fat (g)
                </Text>
                <View
                  style={[
                    styles.fatValueBox,
                    { backgroundColor: theme.colors.input },
                  ]}
                >
                  <Text
                    style={[
                      styles.fatValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {Math.round(fatGrams)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Body & activity
          </Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <WvInput
                label="Weight goal (kg)"
                value={weightGoal}
                onChangeText={setWeightGoal}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.flex}>
              <WvInput
                label="Workouts / week"
                value={workouts}
                onChangeText={setWorkouts}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Save goals"
          onPress={() => navigation.goBack()}
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
  summaryCard: {
    padding: 16,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  macroBar: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  macroSegment: {
    height: '100%',
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  fatField: {
    gap: 6,
  },
  fatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  fatValueBox: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fatValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
