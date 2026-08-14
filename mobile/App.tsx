import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/theme/index';

function AppContent() {
  const theme = useTheme();

  return (
    <>
      <RootNavigator />
      <Toaster
        theme={theme.mode}
        visibleToasts={3}
        position="top-center"
        styles={{
          toast: {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: 1,
          },
          title: {
            color: theme.colors.textPrimary,
          },
          description: {
            color: theme.colors.textSecondary,
          },
        }}
        toastOptions={{
          success: {
            borderLeftColor: theme.colors.success,
            borderLeftWidth: 4,
          },
          error: {
            borderLeftColor: theme.colors.error,
            borderLeftWidth: 4,
          },
          warning: {
            borderLeftColor: theme.colors.warning,
            borderLeftWidth: 4,
          },
          info: {
            borderLeftColor: theme.colors.blue,
            borderLeftWidth: 4,
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
