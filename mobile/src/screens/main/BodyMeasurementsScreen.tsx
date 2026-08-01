import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface BodyMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BodyMeasurements'>;
}

const measurements = [
  { label: 'Weight', value: '70.2 kg', color: '#00D09C' },
  { label: 'Body fat', value: '18.5%', color: '#FF9F0A' },
  { label: 'Muscle mass', value: '57.3 kg', color: '#0A84FF' },
  { label: 'Waist', value: '82 cm', color: '#BF5AF2' },
  { label: 'Hips', value: '96 cm', color: '#FF453A' },
  { label: 'Chest', value: '98 cm', color: '#34C759' },
];

export function BodyMeasurementsScreen({
  navigation,
}: BodyMeasurementsScreenProps) {
  const theme = useTheme();

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Body measurements
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.lastLogged, { color: theme.colors.textTertiary }]}>
          Last logged: Jul 28
        </Text>
        <View style={styles.grid}>
          {measurements.map((m) => (
            <WvCard key={m.label} style={styles.measurementCard}>
              <Text
                style={[
                  styles.measurementLabel,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {m.label}
              </Text>
              <Text
                style={[
                  styles.measurementValue,
                  { color: m.color },
                ]}
              >
                {m.value}
              </Text>
            </WvCard>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Log measurement"
          onPress={() => navigation.goBack()}
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
  },
  lastLogged: {
    fontSize: 13,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measurementCard: {
    width: '47%',
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  measurementLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  measurementValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
