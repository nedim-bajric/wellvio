import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from './src/screens/DashboardScreen.js';
import { LogEntryScreen } from './src/screens/LogEntryScreen.js';
import { FoodCatalogScreen } from './src/screens/FoodCatalogScreen.js';

export type RootTabParamList = {
  Dashboard: undefined;
  Log: undefined;
  Foods: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Log" component={LogEntryScreen} />
        <Tab.Screen name="Foods" component={FoodCatalogScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
