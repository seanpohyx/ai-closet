import "react-native-get-random-values";
import { useFonts } from "expo-font";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

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
                <AppNavigator />
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
