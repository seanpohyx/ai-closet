import "react-native-get-random-values";
import React, { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import AppNavigator from "./src/navigation";
import { ClothingProvider } from "./src/contexts/ClothingContext";
import { VirtualTryOnProvider } from "./src/contexts/VirtualTryOnContext";
import { OutfitProvider } from "./src/contexts/OutfitContext";
import { CarouselProvider } from "./src/contexts/CarouselContext";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import SplashCover from "./src/components/common/SplashCover";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";

// Keep the native splash up until JS has mounted our SplashCover; that way
// the OS-level splash and the JS cover hand off without a white flash.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — native splash already hidden in some edge cases */
});

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  const [splashDone, setSplashDone] = useState(false);

  // Once fonts are ready, hide the native splash — SplashCover (with the same
  // hanger artwork) is mounted above and takes over the visuals.
  const onAppReady = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      onAppReady();
    }
  }, [fontsLoaded, onAppReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ClothingProvider>
        <OutfitProvider>
          <VirtualTryOnProvider>
            <CarouselProvider>
              <SettingsProvider>
                <View style={styles.container}>
                  <AppNavigator />
                  {!splashDone && <SplashCover onFinish={() => setSplashDone(true)} />}
                </View>
              </SettingsProvider>
            </CarouselProvider>
          </VirtualTryOnProvider>
        </OutfitProvider>
      </ClothingProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
