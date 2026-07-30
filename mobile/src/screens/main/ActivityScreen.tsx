import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/index.js';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types.js';

interface ActivityScreenProps {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Activity'>;
}

export function ActivityScreen({ navigation }: ActivityScreenProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.textPrimary }}>Activity</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
