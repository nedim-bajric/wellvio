import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from './src/screens/DashboardScreen.js';
import { LogEntryScreen } from './src/screens/LogEntryScreen.js';
import { FoodCatalogScreen } from './src/screens/FoodCatalogScreen.js';
import { WeightScreen } from './src/screens/WeightScreen.js';

export type RootTabParamList = {
  Dashboard: undefined;
  Log: undefined;
  Foods: undefined;
  Weight: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Log" component={LogEntryScreen} />
        <Tab.Screen name="Foods" component={FoodCatalogScreen} />
        <Tab.Screen name="Weight" component={WeightScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
