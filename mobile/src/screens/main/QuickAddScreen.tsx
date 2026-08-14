import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { logEntryApi } from '../../api/logEntryApi';
import { getErrorMessage } from '../../utils/errorMessage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { MealSlot } from '../../types/logEntry';

interface QuickAddScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuickAdd'>;
  route: { params?: { mealSlot?: MealSlot } };
}

const meals: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

interface FieldDef {
  key: 'calories' | 'protein' | 'carbs' | 'fat';
  label: string;
  unit: string;
  color: string;
}

const fields: FieldDef[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#00D09C' },
  { key: 'protein', label: 'Protein', unit: 'g', color: '#0A84FF' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#FF9F0A' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#BF5AF2' },
];

export function QuickAddScreen({ navigation, route }: QuickAddScreenProps) {
  const theme = useTheme();
  const [values, setValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [mealSlot, setMealSlot] = useState<MealSlot>(
    route.params?.mealSlot ?? 'lunch',
  );
  const [loading, setLoading] = useState(false);

  const updateValue = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickAdd = async () => {
    const calories = parseFloat(values.calories);
    if (Number.isNaN(calories) || calories <= 0) {
      Alert.alert('Enter calories');
      return;
    }
    const protein = parseFloat(values.protein) || 0;
    const carbs = parseFloat(values.carbs) || 0;
    const fat = parseFloat(values.fat) || 0;

    setLoading(true);
    try {
      await logEntryApi.create({
        foodId: 'quick-add',
        grams: 0,
        mealSlot,
        loggedAt: new Date().toISOString(),
        nutrients: {
          calories,
          protein,
          carbs,
          fat,
        },
      });
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to quick add'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Quick add
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {fields.map((field) => (
          <View key={field.key} style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: field.color },
                ]}
              />
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {field.label} ({field.unit})
              </Text>
            </View>
            <TextInput
              value={values[field.key]}
              onChangeText={(value) => updateValue(field.key, value)}
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.inputFocusedBorder,
                },
              ]}
            />
          </View>
        ))}

        <View style={styles.mealSection}>
          <Text
            style={[
              styles.fieldLabel,
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
          title={loading ? 'Adding...' : 'Quick add'}
          onPress={handleQuickAdd}
          loading={loading}
          disabled={!values.calories}
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
  field: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 2,
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
