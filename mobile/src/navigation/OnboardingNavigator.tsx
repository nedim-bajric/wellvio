import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CarouselScreen,
  PersonalProfileScreen,
  ActivityGoalsScreen,
  DisclaimerScreen,
  PlanSelectionScreen,
  SuccessScreen,
} from '../screens/onboarding/index';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Carousel" component={CarouselScreen} />
      <Stack.Screen name="PersonalProfile" component={PersonalProfileScreen} />
      <Stack.Screen name="ActivityGoals" component={ActivityGoalsScreen} />
      <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}
