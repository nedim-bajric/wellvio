import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  SplashScreen,
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '../screens/auth/index';
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
  GoalsTargetsScreen,
  AppSettingsScreen,
  ChangePasswordScreen,
  PlanSettingsScreen,
} from '../screens/main/index';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['wellvio://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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
        <Stack.Screen name="GoalsTargets" component={GoalsTargetsScreen} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="PlanSettings" component={PlanSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
