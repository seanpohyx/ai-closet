import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import PressableFade from "../components/common/PressableFade";
import ModalHeader from "../components/common/ModalHeader";
import { CarouselContext } from "../contexts/CarouselContext";
import { removeBackground } from "../services/BackgroundRemoval";
import { CarouselStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

type Props = CarouselStackScreenProps<"CarouselSetup">;

const CarouselSetupScreen = ({ navigation }: Props) => {
  const ctx = useContext(CarouselContext);
  const [busy, setBusy] = useState(false);

  if (!ctx) return null;
  const { userPhotoUri, setUserPhotoUri, userPhotoTransform } = ctx;
  const isAligned = userPhotoTransform != null;

  const runUpload = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please grant access to continue.");
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 1, aspect: [3, 4] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (result.canceled || !result.assets?.[0]) return;

    setBusy(true);
    try {
      const jpeg = await ImageManipulator.manipulateAsync(result.assets[0].uri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const cleanedUri = await removeBackground(jpeg.uri);
      setUserPhotoUri(cleanedUri);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not process the photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const promptChangePhoto = () => {
    Alert.alert(
      "Change photo?",
      "Uploading a new photo will run background removal again (uses API credits). Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => runUpload(true) },
        { text: "Gallery", onPress: () => runUpload(false) },
      ]
    );
  };

  const handleContinue = () => {
    if (!userPhotoUri) {
      Alert.alert("Photo Required", "Please upload a photo first.");
      return;
    }
    if (isAligned) {
      navigation.replace("CarouselHome");
    } else {
      navigation
        .getParent()
        ?.navigate("AlignToSilhouetteModal", { mode: "userPhoto" });
    }
  };

  const handleRealign = () => {
    navigation
      .getParent()
      ?.navigate("AlignToSilhouetteModal", { mode: "userPhoto" });
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right", "bottom"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ModalHeader title="Your Carousel Photo" onClose={() => navigation.goBack()} />

      <View style={styles.body}>
        {userPhotoUri ? (
          // Existing photo state
          <>
            <Text style={styles.subtitle}>Your saved photo</Text>
            <Text style={styles.hint}>
              Reused everywhere in the carousel. Background removal already done — no extra API cost
              unless you change it.
            </Text>
            <View style={styles.previewBox}>
              {busy ? (
                <View style={styles.previewCenter}>
                  <ActivityIndicator size="large" color={colors.primary_yellow} />
                  <Text style={styles.busyText}>Removing background…</Text>
                </View>
              ) : (
                <Image source={{ uri: userPhotoUri }} style={styles.preview} resizeMode="contain" />
              )}
            </View>
            <PressableFade
              onPress={promptChangePhoto}
              containerStyle={styles.secondaryBtnContainer}
              style={styles.secondaryBtn}
              disabled={busy}
            >
              <MaterialIcons name="refresh" size={18} color={colors.text_primary} />
              <Text style={styles.secondaryBtnText}>Change Photo</Text>
            </PressableFade>
            {isAligned && (
              <PressableFade
                onPress={handleRealign}
                containerStyle={styles.secondaryBtnContainer}
                style={styles.secondaryBtn}
                disabled={busy}
              >
                <MaterialIcons name="tune" size={18} color={colors.text_primary} />
                <Text style={styles.secondaryBtnText}>Re-align to Silhouette</Text>
              </PressableFade>
            )}
            <PressableFade
              onPress={handleContinue}
              containerStyle={styles.primaryBtnContainer}
              style={[styles.primaryBtn, busy && styles.btnDisabled]}
              disabled={busy}
            >
              <Text style={styles.primaryBtnText}>
                {isAligned ? "Back to Carousel" : "Continue to Alignment"}
              </Text>
            </PressableFade>
          </>
        ) : (
          // No photo yet — first time
          <>
            <Text style={styles.subtitle}>Upload a full-body photo</Text>
            <Text style={styles.hint}>Stand straight, plain background, arms relaxed at your sides.</Text>
            <View style={styles.previewBox}>
              {busy ? (
                <View style={styles.previewCenter}>
                  <ActivityIndicator size="large" color={colors.primary_yellow} />
                  <Text style={styles.busyText}>Removing background…</Text>
                </View>
              ) : (
                <View style={styles.previewCenter}>
                  <MaterialIcons name="person" size={64} color={colors.text_gray} />
                  <Text style={styles.placeholderText}>No photo yet</Text>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              <PressableFade
                onPress={() => runUpload(true)}
                containerStyle={styles.secondaryBtnContainer}
                style={styles.secondaryBtn}
                disabled={busy}
              >
                <MaterialIcons name="camera-alt" size={20} color={colors.text_primary} />
                <Text style={styles.secondaryBtnText}>Camera</Text>
              </PressableFade>
              <PressableFade
                onPress={() => runUpload(false)}
                containerStyle={styles.secondaryBtnContainer}
                style={styles.secondaryBtn}
                disabled={busy}
              >
                <MaterialIcons name="photo-library" size={20} color={colors.text_primary} />
                <Text style={styles.secondaryBtnText}>Gallery</Text>
              </PressableFade>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface_base },
  body: { flex: 1, padding: 24 },
  subtitle: { fontFamily: typography.semiBold, fontSize: 18, color: colors.text_primary, marginBottom: 4 },
  hint: { fontFamily: typography.regular, fontSize: 14, color: colors.text_gray, marginBottom: 16 },
  previewBox: {
    flex: 1,
    backgroundColor: colors.thumbnail_background,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  previewCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { marginTop: 12, color: colors.text_gray, fontFamily: typography.regular },
  busyText: { marginTop: 12, color: colors.text_primary, fontFamily: typography.medium },
  preview: { width: "100%", height: "100%" },
  actions: { flexDirection: "row", gap: 12, marginBottom: 12 },
  secondaryBtnContainer: { flex: 1, marginBottom: 12 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.thumbnail_background,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtnText: { fontFamily: typography.medium, fontSize: 15, color: colors.text_primary },
  primaryBtnContainer: { width: "100%" },
  primaryBtn: {
    backgroundColor: colors.primary_yellow,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { fontFamily: typography.bold, fontSize: 16, color: colors.text_inverse },
  btnDisabled: { opacity: 0.5 },
});

export default CarouselSetupScreen;
