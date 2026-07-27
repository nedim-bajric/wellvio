import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import type { CreateFoodData, Food } from '../types/food.js';

interface FoodFormProps {
  initial?: Food;
  onSubmit: (data: CreateFoodData) => void;
  onCancel: () => void;
}

function parseNumber(value: string): number {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function FoodForm({ initial, onSubmit, onCancel }: FoodFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [calories, setCalories] = useState(
    initial?.nutrientsPer100g.calories.toString() ?? '',
  );
  const [protein, setProtein] = useState(
    initial?.nutrientsPer100g.protein.toString() ?? '',
  );
  const [carbs, setCarbs] = useState(
    initial?.nutrientsPer100g.carbs.toString() ?? '',
  );
  const [fat, setFat] = useState(
    initial?.nutrientsPer100g.fat.toString() ?? '',
  );

  const handleSubmit = () => {
    onSubmit({
      name: name.trim(),
      nutrientsPer100g: {
        calories: parseNumber(calories),
        protein: parseNumber(protein),
        carbs: parseNumber(carbs),
        fat: parseNumber(fat),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initial ? 'Edit food' : 'New food'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Calories per 100g"
        value={calories}
        onChangeText={setCalories}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Protein per 100g"
        value={protein}
        onChangeText={setProtein}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Carbs per 100g"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Fat per 100g"
        value={fat}
        onChangeText={setFat}
        keyboardType="decimal-pad"
      />
      <View style={styles.buttonRow}>
        <Button title="Cancel" onPress={onCancel} />
        <Button title="Save" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
