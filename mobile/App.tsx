import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FoodCatalogScreen } from './src/screens/FoodCatalogScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="FoodCatalog" component={FoodCatalogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
