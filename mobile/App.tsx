import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from './src/screens/DashboardScreen.js';
import { LogEntryScreen } from './src/screens/LogEntryScreen.js';
import { FoodCatalogScreen } from './src/screens/FoodCatalogScreen.js';
import { WeightScreen } from './src/screens/WeightScreen.js';
import { OnboardingScreen } from './src/screens/OnboardingScreen.js';
import { onboardingApi } from './src/api/onboardingApi.js';
import type { Profile, Plan } from './src/types/onboarding.js';

export type RootTabParamList = {
  Dashboard: undefined;
  Log: undefined;
  Foods: undefined;
  Weight: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const [existingProfile, existingPlan] = await Promise.all([
        onboardingApi.getProfile(),
        onboardingApi.getActivePlan(),
      ]);
      setProfile(existingProfile);
      setActivePlan(existingPlan);
    } catch {
      // If the status check fails, fall through to onboarding so the user can
      // retry by submitting their profile.
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const handleOnboardingComplete = useCallback(() => {
    void checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const isOnboardingComplete = profile !== null && activePlan !== null;

  if (!isOnboardingComplete) {
    return <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />;
  }

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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
