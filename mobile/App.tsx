import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
