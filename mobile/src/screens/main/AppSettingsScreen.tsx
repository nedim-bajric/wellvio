import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  Moon,
  Ruler,
  Volume2,
  Vibrate,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { WvIconButton } from '../../components/ui/WvIconButton.js';
import { WvCard } from '../../components/ui/WvCard.js';
import { WvToggle } from '../../components/ui/WvToggle.js';
import { WvPill } from '../../components/ui/WvPill.js';
import { useTheme } from '../../theme/index.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types.js';

interface AppSettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppSettings'>;
}

interface ToggleItem {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function AppSettingsScreen({ navigation }: AppSettingsScreenProps) {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(theme.mode === 'dark');
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const toggles: ToggleItem[] = [
    {
      icon: <Moon size={20} color={theme.colors.purple} />,
      label: 'Dark mode',
      value: darkMode,
      onValueChange: setDarkMode,
    },
    {
      icon: <Volume2 size={20} color={theme.colors.blue} />,
      label: 'Sound',
      value: sound,
      onValueChange: setSound,
    },
    {
      icon: <Vibrate size={20} color={theme.colors.orange} />,
      label: 'Haptics',
      value: haptics,
      onValueChange: setHaptics,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          App settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <WvCard style={styles.card}>
          {toggles.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.row,
                index !== toggles.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.input },
                  ]}
                >
                  {item.icon}
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <WvToggle value={item.value} onValueChange={item.onValueChange} />
            </View>
          ))}
        </WvCard>

        <WvCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.input },
                ]}
              >
                <Ruler size={20} color={theme.colors.primary} />
              </View>
              <Text
                style={[styles.label, { color: theme.colors.textPrimary }]}
              >
                Units
              </Text>
            </View>
            <View style={styles.unitSelector}>
              <WvPill
                label="Metric"
                selected={units === 'metric'}
                onPress={() => setUnits('metric')}
              />
              <WvPill
                label="Imperial"
                selected={units === 'imperial'}
                onPress={() => setUnits('imperial')}
              />
            </View>
          </View>
        </WvCard>

        <TouchableOpacity activeOpacity={0.8}>
          <WvCard style={styles.dangerCard}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${theme.colors.red}15` },
                ]}
              >
                <Trash2 size={20} color={theme.colors.red} />
              </View>
              <Text style={[styles.label, { color: theme.colors.red }]}>
                Delete account
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.red} />
          </WvCard>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
});
