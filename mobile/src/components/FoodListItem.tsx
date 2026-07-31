import { View, Text, Button, StyleSheet } from 'react-native';
import type { Food } from '../types/food';

interface FoodListItemProps {
  food: Food;
  onEdit: (food: Food) => void;
  onDelete: (food: Food) => void;
}

export function FoodListItem({ food, onEdit, onDelete }: FoodListItemProps) {
  const { calories, protein, carbs, fat } = food.nutrientsPer100g;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.macros}>
          {calories} kcal · P {protein}g · C {carbs}g · F {fat}g
        </Text>
      </View>
      <View style={styles.actions}>
        <Button title="Edit" onPress={() => onEdit(food)} />
        <Button title="Delete" onPress={() => onDelete(food)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  macros: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
