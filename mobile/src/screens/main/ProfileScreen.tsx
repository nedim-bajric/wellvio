import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronRight,
  Target,
  Apple,
  Utensils,
  Settings,
  Smartphone,
  HelpCircle,
  LogOut,
  Lock,
  Trash2,
} from 'lucide-react-native';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen, useTabBarPadding } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { computeAge } from '../../utils/date';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

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

function formatMemberSince(timestamp: string | undefined): string {
  if (!timestamp) return 'Member since --';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Member since --';
  return `Member since ${date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })}`;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  color?: string;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
  const tabBarPadding = useTabBarPadding();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const displayName = (user?.user_metadata?.display_name as string | undefined) ?? '';
  const email = user?.email ?? '';

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Logout failed', error.message);
      return;
    }
    navigation.getParent()?.navigate('Welcome');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: handleLogout },
      ],
      { cancelable: true },
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Target size={20} color={theme.colors.orange} />,
      label: 'Goals & targets',
      onPress: () => navigation.navigate('GoalsTargets'),
    },
    {
      icon: <Apple size={20} color={theme.colors.purple} />,
      label: 'Plan settings',
      onPress: () => navigation.navigate('PlanSettings'),
    },
    {
      icon: <Utensils size={20} color={theme.colors.activityGreen} />,
      label: 'My foods',
      onPress: () => navigation.navigate('FoodCatalog'),
    },
    {
      icon: <Settings size={20} color={theme.colors.blue} />,
      label: 'App settings',
      onPress: () => navigation.navigate('AppSettings'),
    },
    {
      icon: <Lock size={20} color={theme.colors.indigo} />,
      label: 'Change password',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: <Smartphone size={20} color={theme.colors.activityGreen} />,
      label: 'Connected devices',
    },
    {
      icon: <HelpCircle size={20} color={theme.colors.textSecondary} />,
      label: 'Help & support',
    },
  ];

  const dangerItems: MenuItem[] = [
    {
      icon: <LogOut size={20} color={theme.colors.red} />,
      label: 'Log out',
      color: theme.colors.red,
      onPress: confirmLogout,
    },
    {
      icon: <Trash2 size={20} color={theme.colors.red} />,
      label: 'Delete account',
      color: theme.colors.red,
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  const age = profile?.date_of_birth ? computeAge(profile.date_of_birth) : null;
  const genderLabel = profile?.gender
    ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
    : '--';
  const stats = [
    { label: 'Weight', value: profile?.weight_kg ? `${profile.weight_kg} kg` : '--' },
    { label: 'Height', value: profile?.height_cm ? `${profile.height_cm} cm` : '--' },
    { label: 'Age', value: age !== null ? String(age) : '--' },
    { label: 'Gender', value: genderLabel },
  ];

  return (
    <SafeScreen hasTabBar>
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarPadding },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <WvCard style={styles.profileCard}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[styles.name, { color: theme.colors.textPrimary }]}
              >
                {displayName || 'User'}
              </Text>
              <Text
                style={[styles.email, { color: theme.colors.textTertiary }]}
              >
                {email || '--'}
              </Text>
              <Text
                style={[styles.memberSince, { color: theme.colors.textSecondary }]}
              >
                {formatMemberSince(user?.created_at)}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </WvCard>
        </TouchableOpacity>

        <WvCard style={styles.statsCard}>
          {stats.map((stat) => (
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

        <View style={[styles.menuSection, styles.dangerSection]}>
          {dangerItems.map((item) => (
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
                      { backgroundColor: theme.colors.errorBackground },
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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
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
  dangerSection: {
    marginTop: 16,
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
