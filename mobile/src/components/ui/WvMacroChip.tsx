import { View, Text, StyleSheet } from 'react-native';
import { WvProgressRing } from './WvProgressRing.js';
import { useTheme } from '../../theme/index.js';

interface WvMacroChipProps {
  label: string;
  value: number;
  target: number;
  color: string;
}

export function WvMacroChip({ label, value, target, color }: WvMacroChipProps) {
  const theme = useTheme();
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <WvProgressRing size={48} strokeWidth={5} progress={pct / 100} color={color}>
        <Text style={[styles.percent, { color }]}>{Math.round(pct)}%</Text>
      </WvProgressRing>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
        {value}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  percent: {
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
});
