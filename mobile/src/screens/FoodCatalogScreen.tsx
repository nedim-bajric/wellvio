import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { foodApi } from '../api/foodApi';
import { FoodForm } from '../components/FoodForm';
import { FoodListItem } from '../components/FoodListItem';
import { getErrorMessage } from '../utils/errorMessage';
import type { CreateFoodData, Food, UpdateFoodData } from '../types/food';

export function FoodCatalogScreen() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await foodApi.list();
      setFoods(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load foods'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  const handleCreate = async (data: CreateFoodData) => {
    try {
      const created = await foodApi.create(data);
      setFoods((prev) => [...prev, created]);
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Create failed'));
    }
  };

  const handleUpdate = async (data: UpdateFoodData) => {
    if (!editingFood) return;
    try {
      const updated = await foodApi.update(editingFood.id, data);
      setFoods((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingFood(null);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Update failed'));
    }
  };

  const handleDelete = (food: Food) => {
    Alert.alert('Delete food', `Delete "${food.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await foodApi.remove(food.id);
            setFoods((prev) => prev.filter((item) => item.id !== food.id));
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err, 'Delete failed'));
          }
        },
      },
    ]);
  };

  const startEdit = (food: Food) => {
    setEditingFood(food);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingFood(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  if (showForm || editingFood) {
    return (
      <FoodForm
        initial={editingFood ?? undefined}
        onSubmit={editingFood ? handleUpdate : handleCreate}
        onCancel={cancelForm}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food catalog</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Add food" onPress={startCreate} />
        <Button title="Refresh" onPress={loadFoods} />
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodListItem
              food={item}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No foods yet. Add your first one.</Text>
          }
        />
      )}
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
  error: {
    color: 'red',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});
