// apps/mobile/app/_layout.tsx
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GameProvider } from "@/src/context/GameContext";
import { ENV, ENV_ERRORS } from "@/src/config/env";
import EnvErrorScreen from "@/src/screens/EnvErrorScreen";
import DatabaseErrorScreen from "@/src/screens/DatabaseErrorScreen";
import { Colors } from "@/src/theme";
import { initDatabase } from "@/src/db/dictionary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // 1. Run async startup work while the native splash screen is visible.
  useEffect(() => {
    async function prepare() {
      try {
        // Only attempt to load the DB if env vars are valid.
        if (ENV) {
          await initDatabase();
        }
      } catch (e) {
        console.warn("Database init failed:", e);
        setDbError((e as Error).message);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // 2. Hide the splash screen exactly once, after all async work is done.
  //    Calling hideAsync() in the render body is unsafe — React can invoke
  //    render multiple times (Strict Mode, concurrent features). Effects run
  //    only after a committed paint, which is the correct moment to hide.
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // --- TRAP 1: Still Loading ---
  if (!appIsReady) {
    return null; // Keep showing the native splash screen
  }

  // --- TRAP 2: Environment Variable Error ---
  if (ENV_ERRORS) {
    return (
      <SafeAreaProvider>
        <EnvErrorScreen errors={ENV_ERRORS} />
      </SafeAreaProvider>
    );
  }

  // --- TRAP 3: Database Copy Error ---
  if (dbError) {
    return (
      <SafeAreaProvider>
        <DatabaseErrorScreen error={dbError} />
      </SafeAreaProvider>
    );
  }

  // --- SUCCESS ---
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <GameProvider>
          <StatusBar style="dark" backgroundColor={Colors.background} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="nickname"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="join"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}