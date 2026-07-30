import {
  View,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Flame, Heart, User } from 'lucide-react-native';
import {
  HomeScreen,
  DiaryScreen,
  ActivityScreen,
  HealthScreen,
  ProfileScreen,
} from '../screens/main/index.js';
import { useTheme } from '../theme/index.js';
import type { MainTabParamList } from './types.js';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconName = 'Home' | 'Diary' | 'Activity' | 'Health' | 'Profile';

const icons: Record<TabIconName, React.FC<{ size: number; color: string }>> = {
  Home: Home,
  Diary: BookOpen,
  Activity: Flame,
  Health: Heart,
  Profile: User,
};

function TabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: TabIconName;
  focused: boolean;
  color: string;
  size: number;
}) {
  const theme = useTheme();
  const Icon = icons[name];

  return (
    <View
      style={[
        styles.iconPill,
        focused && {
          backgroundColor: theme.colors.primaryLight,
        },
      ]}
    >
      <Icon size={size - 2} color={focused ? theme.colors.primary : color} />
    </View>
  );
}

export function MainNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animationEnabled: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            name={route.name as TabIconName}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + 8,
          height: 72,
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          borderRadius: 24,
          paddingHorizontal: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
