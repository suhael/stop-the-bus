// apps/mobile/app/_layout.tsx
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { GameProvider, useGame } from "@/src/context/GameContext";
import { ENV, ENV_ERRORS } from "@/src/config/env";
import EnvErrorScreen from "@/src/screens/EnvErrorScreen";
import DatabaseErrorScreen from "@/src/screens/DatabaseErrorScreen";
import { Colors } from "@/src/theme";
import { initDatabase } from "@/src/db/dictionary";
import GameHUD, { HUD_HEIGHT } from "@/src/components/GameHUD";

// ─── Screens that show the HUD ────────────────────────────────────────────────
const HUD_SCREENS = new Set(['HOME', 'LOBBY', 'GAMEPLAY', 'SCRAMBLE', 'RESULTS']);

/**
 * AppShell sits inside GameProvider so it can read game state.
 *
 * When the HUD is visible it:
 *  1. Renders <GameHUD /> in normal flow (above the Stack).
 *  2. Overrides SafeAreaInsetsContext for all Stack children so their
 *     SafeAreaView automatically adds HUD_HEIGHT to the top inset —
 *     no changes needed in individual screen files.
 *
 * GameHUD itself renders *before* the override provider and therefore
 * consumes the real insets from the root SafeAreaProvider.
 */
function AppShell({ children }: { children: ReactNode }) {
  const { state } = useGame();
  const insets = useSafeAreaInsets(); // real insets — must read before context override
  const showHUD = HUD_SCREENS.has(state.screen);
  // On HOME the HUD floats transparently over the splash image (edge-to-edge)
  const isTransparentHUD = state.screen === 'HOME';

  return (
    <View style={{ flex: 1 }}>
      {/* Solid HUD for non-home screens — rendered in normal flow so it takes up space */}
      {showHUD && !isTransparentHUD && <GameHUD topInset={insets.top} />}

      {/*
       * Override top inset for all screen children so their SafeAreaView
       * automatically accounts for the HUD height.
       * We apply the override even in transparent-HUD mode so HomeScreen
       * content is still pushed below the HUD.
       */}
      <SafeAreaInsetsContext.Provider
        value={showHUD ? { ...insets, top: insets.top + HUD_HEIGHT } : insets}
      >
        <View style={{ flex: 1 }}>
          {children}
          {/* Transparent HUD is an absolute overlay — rendered after children so it paints on top */}
          {showHUD && isTransparentHUD && (
            <GameHUD transparent topInset={insets.top} />
          )}
        </View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

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
          <AppShell>
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
              <Stack.Screen
                name="how-to-play"
                options={{ presentation: 'modal', headerShown: false }}
              />
            </Stack>
          </AppShell>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}