import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Search, X, Barcode, Mic, Plus } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { useTheme } from '../../theme/index';
import { foodApi } from '../../api/foodApi';
import { logEntryApi } from '../../api/logEntryApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatToday } from '../../utils/date';
import { getFoodIcon } from '../../utils/foodIcon';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Food } from '../../types/food';
import type { MealSlot } from '../../types/logEntry';

interface AddFoodScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddFood'>;
  route: { params?: { mealSlot?: MealSlot } };
}

type FoodTab = 'Recent' | 'Frequent' | 'My Foods' | 'Database';

const tabs: FoodTab[] = ['Recent', 'Frequent', 'My Foods', 'Database'];

function foodBrand(food: Food): string {
  return 'Generic';
}

export function AddFoodScreen({ navigation, route }: AddFoodScreenProps) {
  const theme = useTheme();
  const initialMealSlot = route.params?.mealSlot;
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FoodTab>('Recent');
  const [foods, setFoods] = useState<Food[]>([]);
  const [recentEntries, setRecentEntries] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFoods = useCallback(async () => {
    try {
      const items = await foodApi.list();
      setFoods(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load foods'));
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const entries = await logEntryApi.list(formatToday());
      const seen = new Set<string>();
      const recent: Food[] = [];
      for (const entry of entries) {
        const food = foods.find((f) => f.id === entry.foodId);
        if (food && !seen.has(food.id)) {
          seen.add(food.id);
          recent.push(food);
        }
      }
      setRecentEntries(recent);
    } catch {
      // ignore
    }
  }, [foods]);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    if (foods.length > 0) {
      void loadRecent();
    }
  }, [foods, loadRecent]);

  const frequentFoods = useMemo(() => {
    return [...recentEntries].slice(0, 10);
  }, [recentEntries]);

  const displayFoods = useMemo(() => {
    const source =
      activeTab === 'Recent'
        ? recentEntries
        : activeTab === 'Frequent'
          ? frequentFoods
          : foods;
    if (!query) return source;
    return source.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [activeTab, recentEntries, frequentFoods, foods, query]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvIconButton
          icon={<X size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.input },
          ]}
        >
          <Search size={16} color={theme.colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods, brands..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[
              styles.searchInput,
              { color: theme.colors.textPrimary },
            ]}
            autoFocus
          />
        </View>
        <WvIconButton
          icon={<Barcode size={20} color={theme.colors.textSecondary} />}
          onPress={() => {}}
        />
        <WvIconButton
          icon={<Mic size={20} color={theme.colors.textSecondary} />}
          onPress={() => {}}
        />
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
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
                  color:
                    activeTab === tab ? '#000000' : theme.colors.textSecondary,
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('QuickAdd', { mealSlot: initialMealSlot })}
        activeOpacity={0.8}
        style={[
          styles.quickAdd,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <Plus size={18} color={theme.colors.primary} />
        <Text style={[styles.quickAddText, { color: theme.colors.textSecondary }]}>
          Quick add calories & macros
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.list}>
        {displayFoods.length === 0 ? (
          <View style={styles.empty}>
            <Search size={32} color={theme.colors.border} />
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              {query ? `No results for "${query}"` : 'No foods found'}
            </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.createText, { color: theme.colors.primary }]}>
                Create custom food
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayFoods.map((food) => (
            <TouchableOpacity
              key={food.id}
              onPress={() =>
                navigation.navigate('FoodDetail', {
                  foodId: food.id,
                  mealSlot: initialMealSlot,
                })
              }
              style={[
                styles.foodRow,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.input },
                ]}
              >
                <Text style={styles.icon}>{getFoodIcon(food.name)}</Text>
              </View>
              <View style={styles.foodInfo}>
                <Text
                  style={[
                    styles.foodName,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {food.name}
                </Text>
                <Text
                  style={[
                    styles.foodBrand,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {foodBrand(food)}
                </Text>
              </View>
              <View style={styles.foodRight}>
                <Text
                  style={[
                    styles.foodKcal,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {Math.round(food.nutrientsPer100g.calories)}
                </Text>
                <Text
                  style={[
                    styles.foodKcalUnit,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  kcal/100g
                </Text>
              </View>
              <Plus size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  quickAddText: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
  },
  createText: {
    fontSize: 13,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
  },
  foodBrand: {
    fontSize: 12,
    marginTop: 2,
  },
  foodRight: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  foodKcal: {
    fontSize: 15,
    fontWeight: '600',
  },
  foodKcalUnit: {
    fontSize: 10,
  },
  error: {
    padding: 16,
    fontSize: 14,
  },
});
