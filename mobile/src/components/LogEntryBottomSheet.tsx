import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Search, Plus, Minus, X, Utensils } from 'lucide-react-native';
import { useTheme } from '../theme/index';
import { useNavigation } from '@react-navigation/native';
import { foodApi } from '../api/foodApi';
import { logEntryApi, isToday } from '../api/logEntryApi';
import { getErrorMessage } from '../utils/errorMessage';
import { formatToday } from '../utils/date';
import { scaleNutrients } from '../utils/diet';
import { getFoodIcon } from '../utils/foodIcon';
import { WvButton } from './ui/WvButton';
import { MealLabelSelector } from './MealLabelSelector';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Food, Nutrients } from '../types/food';
import type { LogEntry, MealSlot } from '../types/logEntry';
import type { RootStackParamList } from '../navigation/types';

export interface LogEntryBottomSheetRef {
  present: () => void;
  presentForEdit: (entry: LogEntry) => void;
  dismiss: () => void;
}

interface LogEntryBottomSheetProps {
  onSaved?: () => void;
}

type Tab = 'foods' | 'quick';

const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

function defaultMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snacks';
}

function emptyNutrients(): Nutrients {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export const LogEntryBottomSheet = forwardRef<
  LogEntryBottomSheetRef,
  LogEntryBottomSheetProps
>(({ onSaved }, ref) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const isEditMode = editingEntry != null;
  const [activeTab, setActiveTab] = useState<Tab>('foods');
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Foods path state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState(150);
  const [foodMealSlot, setFoodMealSlot] = useState<MealSlot>(defaultMealSlot());
  const [addingFood, setAddingFood] = useState(false);

  // Quick-add path state
  const [title, setTitle] = useState('');
  const [quickValues, setQuickValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    grams: '',
  });
  const [quickMealSlot, setQuickMealSlot] = useState<MealSlot>(defaultMealSlot());
  const [addingQuick, setAddingQuick] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [deletingFood, setDeletingFood] = useState(false);

  const snapPoints = useMemo(() => ['75%'], []);

  useImperativeHandle(ref, () => ({
    present: () => {
      setEditingEntry(null);
      sheetRef.current?.present();
    },
    presentForEdit: (entry: LogEntry) => {
      setEditingEntry(entry);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const loadFoods = useCallback(async () => {
    setLoadingFoods(true);
    setError(null);
    try {
      const items = await foodApi.list();
      setFoods(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load foods'));
    } finally {
      setLoadingFoods(false);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const list = await logEntryApi.list(formatToday());
      setEntries(list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (sheetRef.current) {
      loadFoods();
      loadRecent();
    }
  }, [loadFoods, loadRecent]);

  const recentFoods = useMemo(() => {
    const seen = new Set<string>();
    const recent: Food[] = [];
    for (const entry of entries) {
      const food = foods.find((f) => f.id === entry.foodId);
      if (food && !seen.has(food.id)) {
        seen.add(food.id);
        recent.push(food);
      }
    }
    return recent;
  }, [entries, foods]);

  const displayedFoods = useMemo(() => {
    const source = query ? foods : recentFoods.length > 0 ? recentFoods : foods;
    if (!query) return source;
    return source.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [foods, recentFoods, query]);

  const calculatedFoodNutrients = useMemo(() => {
    if (!selectedFood) return emptyNutrients();
    return scaleNutrients(selectedFood.nutrientsPer100g, grams);
  }, [selectedFood, grams]);

  const resetFoodPath = useCallback(() => {
    setSelectedFood(null);
    setGrams(150);
    setFoodMealSlot(defaultMealSlot());
    setQuery('');
  }, []);

  const resetQuickPath = useCallback(() => {
    setTitle('');
    setQuickValues({ calories: '', protein: '', carbs: '', fat: '', grams: '' });
    setQuickMealSlot(defaultMealSlot());
  }, []);

  useEffect(() => {
    if (!editingEntry) {
      resetFoodPath();
      resetQuickPath();
      setActiveTab('foods');
      return;
    }

    if (editingEntry.foodId) {
      setActiveTab('foods');
      const food = foods.find((f) => f.id === editingEntry.foodId) ?? null;
      setSelectedFood(food);
      setGrams(editingEntry.grams);
      setFoodMealSlot(editingEntry.mealSlot);
    } else {
      setActiveTab('quick');
      setTitle(editingEntry.foodName);
      setQuickValues({
        calories: String(editingEntry.nutrients.calories),
        protein: String(editingEntry.nutrients.protein),
        carbs: String(editingEntry.nutrients.carbs),
        fat: String(editingEntry.nutrients.fat),
        grams: String(editingEntry.grams),
      });
      setQuickMealSlot(editingEntry.mealSlot);
    }
  }, [editingEntry, foods, resetFoodPath, resetQuickPath]);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      resetFoodPath();
      resetQuickPath();
      setActiveTab('foods');
      setEditingEntry(null);
    }
  }, [resetFoodPath, resetQuickPath]);

  const handleSaveFood = async () => {
    if (!selectedFood) return;
    setAddingFood(true);
    try {
      if (editingEntry) {
        await logEntryApi.update(editingEntry.id, {
          grams,
          mealSlot: foodMealSlot,
        });
      } else {
        await logEntryApi.create({
          foodId: selectedFood.id,
          grams,
          mealSlot: foodMealSlot,
        });
      }
      sheetRef.current?.dismiss();
      onSaved?.();
      resetFoodPath();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, editingEntry ? 'Failed to update entry' : 'Failed to log food'));
    } finally {
      setAddingFood(false);
    }
  };

  const handleSaveQuick = async () => {
    const calories = parseFloat(quickValues.calories);
    if (Number.isNaN(calories) || calories <= 0) {
      Alert.alert('Enter calories');
      return;
    }
    const protein = parseFloat(quickValues.protein) || 0;
    const carbs = parseFloat(quickValues.carbs) || 0;
    const fat = parseFloat(quickValues.fat) || 0;
    const gramsValue = parseFloat(quickValues.grams) || 0;

    if (!editingEntry && gramsValue <= 0) {
      Alert.alert('Enter grams');
      return;
    }

    setAddingQuick(true);
    try {
      if (editingEntry) {
        await logEntryApi.update(editingEntry.id, {
          grams: gramsValue,
          mealSlot: quickMealSlot,
          nutrients: { calories, protein, carbs, fat },
          title: title.trim(),
        });
      } else {
        await logEntryApi.create({
          grams: gramsValue,
          mealSlot: quickMealSlot,
          nutrients: { calories, protein, carbs, fat },
          title: title.trim(),
        });
      }
      sheetRef.current?.dismiss();
      onSaved?.();
      resetQuickPath();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, editingEntry ? 'Failed to update entry' : 'Failed to quick add'));
    } finally {
      setAddingQuick(false);
    }
  };

  const handleDelete = () => {
    if (!editingEntry) return;
    Alert.alert('Delete entry', `Delete "${editingEntry.foodName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingEntry(true);
          try {
            await logEntryApi.remove(editingEntry.id);
            sheetRef.current?.dismiss();
            onSaved?.();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err, 'Failed to delete entry'));
          } finally {
            setDeletingEntry(false);
          }
        },
      },
    ]);
  };

  const handleDeleteSelectedFood = () => {
    if (!selectedFood) return;
    Alert.alert(
      'Delete food',
      `Remove "${selectedFood.name}" from your food catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingFood(true);
            try {
              await foodApi.remove(selectedFood.id);
              setFoods((prev) => prev.filter((f) => f.id !== selectedFood.id));
              setSelectedFood(null);
              setQuery('');
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err, 'Failed to delete food'));
            } finally {
              setDeletingFood(false);
            }
          },
        },
      ],
    );
  };

  const handleManageFoods = () => {
    sheetRef.current?.dismiss();
    navigation.navigate('FoodCatalog');
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const renderFoodsTab = () => {
    if (selectedFood) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.portionHeader}>
            <Text style={[styles.foodTitle, { color: theme.colors.textPrimary }]}>
              {selectedFood.name}
            </Text>
            <Text style={[styles.foodSubtitle, { color: theme.colors.textTertiary }]}>
              {Math.round(selectedFood.nutrientsPer100g.calories)} kcal / 100g
            </Text>
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setGrams(Math.max(10, grams - 10))}
              style={[styles.stepperButton, { backgroundColor: theme.colors.input }]}
            >
              <Minus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.gramsDisplay}>
              <Text style={[styles.gramsValue, { color: theme.colors.textPrimary }]}>
                {grams}
              </Text>
              <Text style={[styles.gramsUnit, { color: theme.colors.textSecondary }]}>g</Text>
            </View>
            <TouchableOpacity
              onPress={() => setGrams(grams + 10)}
              style={[styles.stepperButton, { backgroundColor: theme.colors.input }]}
            >
              <Plus size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.nutritionCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>
              For {grams}g
            </Text>
            <View style={styles.nutritionRow}>
              {[
                { label: 'kcal', value: Math.round(calculatedFoodNutrients.calories), color: theme.colors.primary },
                { label: 'protein', value: `${calculatedFoodNutrients.protein}g`, color: theme.colors.blue },
                { label: 'carbs', value: `${calculatedFoodNutrients.carbs}g`, color: theme.colors.orange },
                { label: 'fat', value: `${calculatedFoodNutrients.fat}g`, color: theme.colors.purple },
              ].map((m) => (
                <View key={m.label} style={styles.nutritionItem}>
                  <Text style={[styles.nutritionValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={[styles.nutritionUnit, { color: theme.colors.textTertiary }]}>
                    {m.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.mealSection}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>
              {isEditMode ? 'Meal' : 'Add to'}
            </Text>
            <MealLabelSelector selected={foodMealSlot} onSelect={setFoodMealSlot} />
          </View>

          <View style={styles.footer}>
            <WvButton
              title={addingFood ? 'Saving...' : isEditMode ? 'Save changes' : `Add ${selectedFood.name}`}
              onPress={handleSaveFood}
              loading={addingFood}
            />
            {isEditMode && editingEntry && isToday(editingEntry.loggedAt) && (
              <WvButton
                title={deletingEntry ? 'Deleting...' : 'Delete entry'}
                variant="danger"
                onPress={handleDelete}
                loading={deletingEntry}
                style={{ marginTop: 12 }}
              />
            )}
            {!isEditMode && (
              <WvButton
                title="Back"
                variant="secondary"
                onPress={() => setSelectedFood(null)}
                style={{ marginTop: 12 }}
              />
            )}
            {!isEditMode && (
              <WvButton
                title={deletingFood ? 'Deleting...' : 'Delete from catalog'}
                variant="danger"
                onPress={handleDeleteSelectedFood}
                loading={deletingFood}
                style={{ marginTop: 12 }}
              />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.input }]}>
          <Search size={16} color={theme.colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {loadingFoods ? (
            <ActivityIndicator style={styles.loader} />
          ) : displayedFoods.length === 0 ? (
            <View style={styles.empty}>
              <Utensils size={32} color={theme.colors.border} />
              <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                {query ? `No results for "${query}"` : 'No foods yet'}
              </Text>
            </View>
          ) : (
            displayedFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                onPress={() => {
                  setSelectedFood(food);
                  setGrams(150);
                }}
                style={[styles.foodRow, { borderBottomColor: theme.colors.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.colors.input }]}>
                  <Text style={styles.icon}>{getFoodIcon(food.name)}</Text>
                </View>
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, { color: theme.colors.textPrimary }]}>
                    {food.name}
                  </Text>
                  <Text style={[styles.foodMeta, { color: theme.colors.textTertiary }]}>
                    {Math.round(food.nutrientsPer100g.calories)} kcal / 100g
                  </Text>
                </View>
                <Plus size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        <TouchableOpacity
          onPress={handleManageFoods}
          style={[styles.manageFoodsRow, { borderTopColor: theme.colors.border }]}
        >
          <Text style={[styles.manageFoodsText, { color: theme.colors.primary }]}>
            Manage my foods
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Quick add"
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.inputFocusedBorder,
            },
          ]}
        />
      </View>

      <View style={styles.quickGrid}>
        {[
          { key: 'calories', label: 'Calories', unit: 'kcal' },
          { key: 'protein', label: 'Protein', unit: 'g' },
          { key: 'carbs', label: 'Carbs', unit: 'g' },
          { key: 'fat', label: 'Fat', unit: 'g' },
          { key: 'grams', label: 'Grams', unit: 'g' },
        ].map((field) => (
          <View key={field.key} style={styles.quickField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
              {field.label}
            </Text>
            <TextInput
              value={quickValues[field.key as keyof typeof quickValues]}
              onChangeText={(value) =>
                setQuickValues((prev) => ({ ...prev, [field.key]: value }))
              }
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
              style={[
                styles.textInput,
                styles.quickInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.inputFocusedBorder,
                },
              ]}
            />
            <Text style={[styles.unitLabel, { color: theme.colors.textTertiary }]}>
              {field.unit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.mealSection}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          {isEditMode ? 'Meal' : 'Add to'}
        </Text>
        <MealLabelSelector selected={quickMealSlot} onSelect={setQuickMealSlot} />
      </View>

      <View style={styles.footer}>
        <WvButton
          title={addingQuick ? 'Saving...' : isEditMode ? 'Save changes' : 'Quick add'}
          onPress={handleSaveQuick}
          loading={addingQuick}
        />
        {isEditMode && editingEntry && isToday(editingEntry.loggedAt) && (
          <WvButton
            title={deletingEntry ? 'Deleting...' : 'Delete entry'}
            variant="danger"
            onPress={handleDelete}
            loading={deletingEntry}
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </ScrollView>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChange}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textTertiary }}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
    >
      <BottomSheetView style={styles.sheetContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {isEditMode ? 'Edit entry' : 'Log food'}
          </Text>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!isEditMode && (
          <View style={styles.tabs}>
            {(['foods', 'quick'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      activeTab === tab ? theme.colors.primary : theme.colors.input,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? '#000000' : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {tab === 'foods' ? 'Foods' : 'Quick add'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}

        {activeTab === 'foods' ? renderFoodsTab() : renderQuickTab()}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

LogEntryBottomSheet.displayName = 'LogEntryBottomSheet';

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  list: {
    paddingBottom: 12,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
  },
  foodMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  portionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  foodSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 40,
    fontWeight: '700',
  },
  gramsUnit: {
    fontSize: 16,
    marginBottom: 8,
  },
  nutritionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '700',
  },
  nutritionUnit: {
    fontSize: 10,
  },
  mealSection: {
    marginBottom: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    borderWidth: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  quickField: {
    width: '30%',
    flex: 1,
    minWidth: 90,
  },
  quickInput: {
    height: 52,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  unitLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  error: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  manageFoodsRow: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  manageFoodsText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
