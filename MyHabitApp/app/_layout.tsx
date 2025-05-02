import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// @ts-ignore
import { initializeDatabase, resetDatabaseForDev } from '../src/services/database';
// @ts-ignore
import { validateConfigurationSetup } from '../src/utils/configTester.js';
// @ts-ignore
import { ConfigTest } from '../src/components/ConfigTest.js';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [configValid, setConfigValid] = useState<boolean | null>(null);

  // Initialize the database and validate configuration once on mount
  useEffect(() => {
    // Immediately-invoked async function
    (async () => {
      await initializeDatabase();
      await resetDatabaseForDev(); // This will recreate all tables with the latest schema COMMENT THIS OUT WHEN NOT IN DEV MODE
      const isValid = validateConfigurationSetup();
      setConfigValid(isValid);
    })();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (configValid === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>
          Configuration Error. Check console for details.
        </Text>
        <ConfigTest />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      {__DEV__ && <ConfigTest />}
    </ThemeProvider>
  );
}
