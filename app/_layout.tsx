import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import "../global.css";

import { ThemeProvider } from '@/context/theme.context';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  async function initializeDatabase(db: SQLiteDatabase) {

    // Create table for settings
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        key TEXT NOT NULL UNIQUE,
        value TEXT
      );
    `);
    await db.withTransactionAsync(
      async () => {

        // Invoices table
        await db.execAsync(`
              CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNumber TEXT NOT NULL UNIQUE,
        orderId TEXT,
        date TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        logoImg TEXT,
        signImg TEXT,
        currency TEXT,
        discountAmount REAL DEFAULT 0,
        taxPercentage REAL DEFAULT 0,
        shipping REAL DEFAULT 0,
        payed REAL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
              `);

        // Sender info table
        await db.execAsync(`
  CREATE TABLE IF NOT EXISTS sender_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        taxId TEXT,
        email TEXT,
        phone TEXT,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      );
              `);

        // Recipient info table
        await db.execAsync(`
              CREATE TABLE IF NOT EXISTS recipient_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      );
              `);

        // Invoice items table
        await db.execAsync(`
              CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      );
              `);
      }
    );
    console.log('Database initialized successfully');
  }

  return (
    <ThemeProvider>
      <SQLiteProvider databaseName="invoiceApp.db" onInit={initializeDatabase}>
        <SafeAreaProvider>
          <Stack screenOptions={{
            headerShown: true,
            animation: "slide_from_right",
            presentation: "transparentModal",
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="generate" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>

      </SQLiteProvider>
    </ThemeProvider>
  );
}
