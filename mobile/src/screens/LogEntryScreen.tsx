import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { foodApi } from '../api/foodApi.js';
import { logEntryApi } from '../api/logEntryApi.js';
import { getErrorMessage } from '../utils/errorMessage.js';
import { formatToday } from '../utils/date.js';
import type { Food } from '../types/food.js';
import type { LogEntry, MealSlot } from '../types/logEntry.js';
import { MEAL_SLOTS } from '../types/logEntry.js';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../App.js';

type LogNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Log'>;

interface LogEntryScreenProps {
  navigation: LogNavigationProp;
}

export function LogEntryScreen({ navigation }: LogEntryScreenProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [recentEntries, setRecentEntries] = useState<LogEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState('');
  const [mealSlot, setMealSlot] = useState<MealSlot>('breakfast');
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFoods = useCallback(async () => {
    try {
      const items = await foodApi.list();
      setFoods(items);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to load foods'));
    }
  }, []);

  const loadRecentEntries = useCallback(async () => {
    try {
      const entries = await logEntryApi.list(formatToday());
      setRecentEntries(entries);
    } catch (err) {
      // Silently ignore recent-entries failures; the user can still pick from catalog.
    }
  }, []);

  useEffect(() => {
    void loadFoods();
    void loadRecentEntries();
  }, [loadFoods, loadRecentEntries]);

  const recentFoods = recentEntries
    .map((entry) => foods.find((food) => food.id === entry.foodId))
    .filter((food): food is Food => Boolean(food));

  const uniqueRecentFoods = Array.from(
    new Map(recentFoods.map((food) => [food.id, food])).values(),
  );

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setShowFoodPicker(false);
  };

  const handleQuickReLog = (food: Food) => {
    setSelectedFood(food);
    setGrams('100');
  };

  const handleSubmit = async () => {
    if (!selectedFood) {
      Alert.alert('Select a food');
      return;
    }
    const parsedGrams = parseFloat(grams);
    if (Number.isNaN(parsedGrams) || parsedGrams <= 0) {
      Alert.alert('Enter a valid amount in grams');
      return;
    }

    setLoading(true);
    try {
      await logEntryApi.create({
        foodId: selectedFood.id,
        grams: parsedGrams,
        mealSlot,
        loggedAt: new Date().toISOString(),
      });
      setSelectedFood(null);
      setGrams('');
      setMealSlot('breakfast');
      await loadRecentEntries();
      navigation.navigate('Dashboard');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to log food'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log food</Text>

      <TouchableOpacity
        style={styles.foodSelector}
        onPress={() => setShowFoodPicker(true)}
      >
        <Text style={selectedFood ? styles.selectedFood : styles.placeholder}>
          {selectedFood ? selectedFood.name : 'Tap to choose a food'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Grams"
        value={grams}
        onChangeText={setGrams}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Meal slot</Text>
      <View style={styles.slotRow}>
        {MEAL_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slotButton,
              mealSlot === slot && styles.slotButtonActive,
            ]}
            onPress={() => setMealSlot(slot)}
          >
            <Text
              style={[
                styles.slotButtonText,
                mealSlot === slot && styles.slotButtonTextActive,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.submitRow}>
        <Button title={loading ? 'Saving...' : 'Log food'} onPress={handleSubmit} disabled={loading} />
      </View>

      {uniqueRecentFoods.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recently logged</Text>
          <FlatList
            data={uniqueRecentFoods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentItem}
                onPress={() => handleQuickReLog(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <Modal visible={showFoodPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose a food</Text>
          <FlatList
            data={foods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.foodItem}
                onPress={() => handleSelectFood(item)}
              >
                <Text style={styles.foodItemName}>{item.name}</Text>
                <Text style={styles.foodItemMacros}>
                  {item.nutrientsPer100g.calories} kcal / 100g
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No foods in your catalog.</Text>
            }
          />
          <Button title="Cancel" onPress={() => setShowFoodPicker(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  foodSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  placeholder: {
    color: '#999',
  },
  selectedFood: {
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  slotButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  slotButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  slotButtonText: {
    textTransform: 'capitalize',
  },
  slotButtonTextActive: {
    color: '#fff',
  },
  submitRow: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  foodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodItemName: {
    fontSize: 16,
  },
  foodItemMacros: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});
