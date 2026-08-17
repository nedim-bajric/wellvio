import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Moon,
  Trash2,
  ChevronRight,
  Lock,
} from 'lucide-react-native';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { WvToggle } from '../../components/ui/WvToggle';
import { WvSectionHeader } from '../../components/ui/WvSectionHeader';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme, useThemeMode } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface AppSettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppSettings'>;
}

export function AppSettingsScreen({ navigation }: AppSettingsScreenProps) {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const { signOut } = useAuth();
  const { resetForm } = useOnboarding();

  return (
    <SafeScreen>
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
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.input },
                ]}
              >
                <Moon size={20} color={theme.colors.purple} />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Dark mode
              </Text>
            </View>
            <WvToggle
              value={mode === 'dark'}
              onValueChange={(value) => setMode(value ? 'dark' : 'light')}
            />
          </View>
        </WvCard>

        <WvSectionHeader title="Account" />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <WvCard style={styles.navCard}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.input },
                ]}
              >
                <Lock size={20} color={theme.colors.textPrimary} />
              </View>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Change password
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </WvCard>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Delete account',
              'This will sign you out and clear local data on this device. Full account deletion is available from your profile. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                    resetForm();
                    navigation.navigate('Welcome');
                  },
                },
              ],
            );
          }}
        >
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
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
});
