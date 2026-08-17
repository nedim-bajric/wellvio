import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/index';
import type { LogEntry } from '../types/logEntry';

interface LogEntryListItemProps {
  entry: LogEntry;
  compact?: boolean;
  onPress?: (entry: LogEntry) => void;
  onLongPress?: (entry: LogEntry) => void;
}

export function LogEntryListItem({
  entry,
  compact = false,
  onPress,
  onLongPress,
}: LogEntryListItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress || onLongPress ? 0.7 : 1}
      onPress={() => onPress?.(entry)}
      onLongPress={() => onLongPress?.(entry)}
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.left}>
        <Text
          style={[styles.name, { color: theme.colors.textPrimary }]}
          numberOfLines={1}
        >
          {entry.foodName}
        </Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.chip,
              { backgroundColor: theme.colors.input },
            ]}
          >
            <Text style={[styles.chipText, { color: theme.colors.textSecondary }]}>
              {entry.mealSlot.charAt(0).toUpperCase() + entry.mealSlot.slice(1)}
            </Text>
          </View>
          {!compact && (
            <Text style={[styles.meta, { color: theme.colors.textTertiary }]}>
              {entry.grams > 0 ? `${Math.round(entry.grams)}g · ` : ''}
              P{Math.round(entry.nutrients.protein)} C
              {Math.round(entry.nutrients.carbs)} F
              {Math.round(entry.nutrients.fat)}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.calories, { color: theme.colors.textPrimary }]}>
        {Math.round(entry.nutrients.calories)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
  },
  calories: {
    fontSize: 15,
    fontWeight: '600',
  },
});
