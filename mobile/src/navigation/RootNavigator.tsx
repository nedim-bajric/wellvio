import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  SplashScreen,
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
} from '../screens/auth/index.js';
import {
  AddFoodScreen,
  FoodDetailScreen,
  QuickAddScreen,
  WeightLogScreen,
  LogWorkoutScreen,
  SleepDetailScreen,
  HydrationScreen,
  BodyMeasurementsScreen,
  EditProfileScreen,
} from '../screens/main/index.js';
import { OnboardingNavigator } from './OnboardingNavigator.js';
import { MainNavigator } from './MainNavigator.js';
import type { RootStackParamList } from './types.js';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="AddFood" component={AddFoodScreen} />
        <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
        <Stack.Screen name="QuickAdd" component={QuickAddScreen} />
        <Stack.Screen name="WeightLog" component={WeightLogScreen} />
        <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} />
        <Stack.Screen name="SleepDetail" component={SleepDetailScreen} />
        <Stack.Screen name="Hydration" component={HydrationScreen} />
        <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
