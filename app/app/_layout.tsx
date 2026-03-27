import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { HabitProvider } from '@/context/habit-context';
import { ThemeProvider as CustomThemeProvider } from '@/context/theme-context';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { ErrorBoundary } from '@/components/error-boundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    // Delay initialization to ensure UI renders first
    const timer = setTimeout(() => {
      try {
        registerForPushNotificationsAsync();
      } catch (e) {
        console.error('Notification setup failed:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <RootLayoutNav />
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <HabitProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'New Habit' }} />
          <Stack.Screen name="reminders" options={{ presentation: 'modal', title: 'Reminders' }} />
          <Stack.Screen name="appearance" options={{ presentation: 'modal', title: 'Appearance' }} />
          <Stack.Screen name="backup" options={{ presentation: 'modal', title: 'Backup & Sync' }} />
          <Stack.Screen name="about" options={{ presentation: 'modal', title: 'About' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </HabitProvider>
  );
}
