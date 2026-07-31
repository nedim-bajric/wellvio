import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvCard } from '../../components/ui/WvCard';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { useTheme } from '../../theme/index';
import { foodApi } from '../../api/foodApi';
import { logEntryApi } from '../../api/logEntryApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatToday } from '../../utils/date';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Food } from '../../types/food';
import type { MealSlot } from '../../types/logEntry';

interface FoodDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FoodDetail'>;
  route: { params: { foodId: string; mealSlot?: MealSlot } };
}

const meals: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export function FoodDetailScreen({
  navigation,
  route,
}: FoodDetailScreenProps) {
  const theme = useTheme();
  const { foodId, mealSlot: initialMealSlot } = route.params;
  const [food, setFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState(150);
  const [mealSlot, setMealSlot] = useState<MealSlot>(initialMealSlot ?? 'breakfast');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void foodApi
      .list()
      .then((items) => {
        const found = items.find((f) => f.id === foodId);
        if (found) setFood(found);
      })
      .catch(() => {});
  }, [foodId]);

  const base = food?.nutrientsPer100g ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const multiplier = grams / 100;
  const calc = useMemo(
    () => ({
      kcal: Math.round(base.calories * multiplier),
      protein: Math.round(base.protein * multiplier * 10) / 10,
      carbs: Math.round(base.carbs * multiplier * 10) / 10,
      fat: Math.round(base.fat * multiplier * 10) / 10,
    }),
    [base, multiplier],
  );

  const handleAdd = async () => {
    if (!food) return;
    setLoading(true);
    try {
      await logEntryApi.create({
        foodId: food.id,
        grams,
        mealSlot,
        loggedAt: new Date().toISOString(),
      });
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to log food'));
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.headerTitle}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            {food?.name ?? 'Food detail'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textTertiary },
            ]}
          >
            Generic · per 100g
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <WvCard style={styles.nutritionCard}>
          <Text
            style={[
              styles.cardLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Per 100g
          </Text>
          <View style={styles.nutritionRow}>
            {[
              { label: 'Calories', value: `${Math.round(base.calories)} kcal`, color: theme.colors.primary },
              { label: 'Protein', value: `${base.protein}g`, color: theme.colors.blue },
              { label: 'Carbs', value: `${base.carbs}g`, color: theme.colors.orange },
              { label: 'Fat', value: `${base.fat}g`, color: theme.colors.purple },
            ].map((m) => (
              <View key={m.label} style={styles.nutritionItem}>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: m.color },
                  ]}
                >
                  {m.value}
                </Text>
                <Text
                  style={[
                    styles.nutritionUnit,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </WvCard>

        <View style={styles.portionSection}>
          <Text
            style={[
              styles.cardLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Serving size
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setGrams(Math.max(10, grams - 10))}
              style={[
                styles.stepperButton,
                { backgroundColor: theme.colors.input },
              ]}
            >
              <Minus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.gramsDisplay}>
              <Text
                style={[
                  styles.gramsValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {grams}
              </Text>
              <Text
                style={[
                  styles.gramsUnit,
                  { color: theme.colors.textSecondary },
                ]}
              >
                g
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setGrams(grams + 10)}
              style={[
                styles.stepperButton,
                { backgroundColor: theme.colors.input },
              ]}
            >
              <Plus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <WvCard variant="alt" style={styles.calcCard}>
          <Text
            style={[
              styles.cardLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            For {grams}g
          </Text>
          <View style={styles.nutritionRow}>
            {[
              { label: 'kcal', value: calc.kcal, color: theme.colors.primary },
              { label: 'protein', value: `${calc.protein}g`, color: theme.colors.blue },
              { label: 'carbs', value: `${calc.carbs}g`, color: theme.colors.orange },
              { label: 'fat', value: `${calc.fat}g`, color: theme.colors.purple },
            ].map((m) => (
              <View key={m.label} style={styles.nutritionItem}>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: m.color },
                  ]}
                >
                  {m.value}
                </Text>
                <Text
                  style={[
                    styles.nutritionUnit,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </WvCard>

        <View style={styles.mealSection}>
          <Text
            style={[
              styles.cardLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Add to
          </Text>
          <View style={styles.mealGrid}>
            {meals.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMealSlot(m)}
                style={[
                  styles.mealButton,
                  {
                    backgroundColor:
                      mealSlot === m
                        ? theme.colors.primaryLight
                        : theme.colors.input,
                    borderColor:
                      mealSlot === m
                        ? theme.colors.primary
                        : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.mealButtonText,
                    {
                      color:
                        mealSlot === m
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title={loading ? 'Adding...' : `Add to ${mealSlot}`}
          onPress={handleAdd}
          loading={loading}
          icon={<Check size={20} color="#000000" />}
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
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  nutritionCard: {
    padding: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    gap: 4,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  nutritionUnit: {
    fontSize: 10,
  },
  portionSection: {
    gap: 12,
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
  gramsDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  gramsValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  gramsUnit: {
    fontSize: 17,
    marginBottom: 6,
  },
  calcCard: {
    padding: 16,
  },
  mealSection: {
    gap: 12,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  mealButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
