import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronRight,
  User,
  Target,
  Apple,
  Settings,
  Smartphone,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { WvCard } from '../../components/ui/WvCard.js';
import { useTheme } from '../../theme/index.js';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types.js';

type ProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileNavigationProp;
}

function getInitials(name = 'User'): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  color?: string;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();

  const menuItems: MenuItem[] = [
    {
      icon: <User size={20} color={theme.colors.primary} />,
      label: 'Edit profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: <Target size={20} color={theme.colors.orange} />,
      label: 'Goals & targets',
    },
    {
      icon: <Apple size={20} color={theme.colors.purple} />,
      label: 'Plan settings',
    },
    {
      icon: <Settings size={20} color={theme.colors.blue} />,
      label: 'App settings',
    },
    {
      icon: <Smartphone size={20} color={theme.colors.activityGreen} />,
      label: 'Connected devices',
    },
    {
      icon: <HelpCircle size={20} color={theme.colors.textSecondary} />,
      label: 'Help & support',
    },
    {
      icon: <LogOut size={20} color={theme.colors.red} />,
      label: 'Log out',
      color: theme.colors.red,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <WvCard style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>{getInitials('Alex Morgan')}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text
              style={[styles.name, { color: theme.colors.textPrimary }]}
            >
              Alex Morgan
            </Text>
            <Text
              style={[styles.email, { color: theme.colors.textTertiary }]}
            >
              alex.morgan@example.com
            </Text>
            <Text
              style={[styles.memberSince, { color: theme.colors.textSecondary }]}
            >
              Member since Jan 2024
            </Text>
          </View>
          <ChevronRight size={18} color={theme.colors.textTertiary} />
        </WvCard>

        <WvCard style={styles.activePlanCard}>
          <View
            style={[
              styles.planIcon,
              { backgroundColor: `${theme.colors.purple}15` },
            ]}
          >
            <Apple size={22} color={theme.colors.purple} />
          </View>
          <View style={styles.planInfo}>
            <Text
              style={[styles.planLabel, { color: theme.colors.textTertiary }]}
            >
              Active plan
            </Text>
            <Text
              style={[styles.planName, { color: theme.colors.textPrimary }]}
            >
              Balanced · 2,200 kcal
            </Text>
          </View>
        </WvCard>

        <WvCard style={styles.statsCard}>
          {[
            { label: 'Weight', value: '70.2 kg' },
            { label: 'Height', value: '178 cm' },
            { label: 'Age', value: '29' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </WvCard>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <WvCard style={styles.menuCard}>
                <View style={styles.menuLeft}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: theme.colors.input },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      { color: item.color ?? theme.colors.textPrimary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={item.color ?? theme.colors.textTertiary}
                />
              </WvCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
  },
  activePlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuSection: {
    marginTop: 8,
    gap: 10,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
