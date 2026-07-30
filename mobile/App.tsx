import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from './src/contexts/OnboardingContext.js';
import { RootNavigator } from './src/navigation/RootNavigator.js';

export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
