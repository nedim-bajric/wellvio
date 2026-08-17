import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/index';
import type { MealSlot } from '../types/logEntry';

interface MealLabelSelectorProps {
  selected: MealSlot;
  onSelect: (slot: MealSlot) => void;
}

const labels: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export function MealLabelSelector({ selected, onSelect }: MealLabelSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {labels.map((label) => {
        const isSelected = selected === label;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => onSelect(label)}
            activeOpacity={0.8}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryLight
                  : theme.colors.input,
                borderColor: isSelected
                  ? theme.colors.primary
                  : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
