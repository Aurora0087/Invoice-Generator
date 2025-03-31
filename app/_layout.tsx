import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import "../global.css";

import { ThemeProvider } from '@/context/theme.context';
import { SQLiteProvider } from 'expo-sqlite';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // This function will run when the app initializes the database
  async function initializeDatabase(db: any) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY NOT NULL,
          key TEXT NOT NULL UNIQUE,
          value TEXT
        );
      `);
    console.log('Database initialized successfully');
  }

  return (
    <ThemeProvider>
      <SQLiteProvider databaseName="invoiceApp.db" onInit={initializeDatabase}>
        <Stack screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "transparentModal",
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
