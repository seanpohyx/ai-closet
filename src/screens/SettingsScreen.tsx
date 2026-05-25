import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import ModalHeader from "../components/common/ModalHeader";
import SettingsRow from "../components/common/SettingsRow";
import { SettingsContext } from "../contexts/SettingsContext";
import { CarouselContext } from "../contexts/CarouselContext";
import { VirtualTryOnContext } from "../contexts/VirtualTryOnContext";
import { clearAllData } from "../utils/clearAllData";
import { RootStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import appJson from "../../app.json";

type Props = RootStackScreenProps<"SettingsModal">;

const APP_VERSION = (appJson as { expo?: { version?: string } }).expo?.version ?? "1.0.0";

const SettingsScreen = ({ navigation }: Props) => {
  const settings = useContext(SettingsContext);
  const carousel = useContext(CarouselContext);
  const tryOn = useContext(VirtualTryOnContext);

  if (!settings || !carousel || !tryOn) {
    return null;
  }

  const handleResetTips = () => {
    carousel.setHasSeenUploadTips(false);
    Alert.alert("Tips reset", "Photo upload tips will appear the next time you upload.");
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear try-on history",
      "This will remove every saved try-on result. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await tryOn.clearHistory();
            Alert.alert("Cleared", "Your try-on history has been cleared.");
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear all app data",
      "This will remove your closet, outfits, try-on history, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert(
              "Cleared",
              "All app data has been removed. Please restart the app to apply.",
              [{ text: "OK", onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ModalHeader title="Settings" onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionLabel}>Features</Text>
        <SettingsRow
          label="Fitting Room"
          hint="Try clothes on before you buy"
          right={
            <Switch
              value={settings.showFittingRoom}
              onValueChange={settings.setShowFittingRoom}
              trackColor={{ false: colors.divider, true: colors.accent_primary }}
              thumbColor={colors.surface_base}
              ios_backgroundColor={colors.divider}
            />
          }
        />

        <Text style={styles.sectionLabel}>Onboarding</Text>
        <SettingsRow
          label="Reset upload tips"
          hint="Show the photo upload tips card again"
          onPress={handleResetTips}
        />

        <Text style={styles.sectionLabel}>Data</Text>
        <SettingsRow
          label="Clear try-on history"
          hint="Remove every saved try-on result"
          onPress={handleClearHistory}
          destructive
        />
        <SettingsRow
          label="Clear all app data"
          hint="Wipe closet, outfits, history, and settings"
          onPress={handleClearAll}
          destructive
        />

        <Text style={styles.sectionLabel}>About</Text>
        <SettingsRow label="Version" right={<Text style={styles.versionText}>{APP_VERSION}</Text>} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface_base,
  },
  body: {
    paddingBottom: 32,
  },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: 12,
    color: colors.text_tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 6,
  },
  versionText: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_secondary,
  },
});

export default SettingsScreen;
