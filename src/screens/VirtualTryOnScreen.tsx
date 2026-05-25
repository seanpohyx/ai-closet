import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import PressableFade from "../components/common/PressableFade";
import TryOnOptionSheet from "../components/virtualTryOn/TryOnOptionSheet";
import ContentSelectionBox from "../components/virtualTryOn/ContentSelectionBox";
import PhotoTipsSection from "../components/virtualTryOn/PhotoTipsSection";
import TryOnProgress from "../components/virtualTryOn/TryOnProgress";
import RecentlyTriedSection from "../components/virtualTryOn/RecentlyTriedSection";
import { virtualTryOn } from "../services/VirtualTryOn";
import { VirtualTryOnContext } from "../contexts/VirtualTryOnContext";
import { ClothingContext } from "../contexts/ClothingContext";
import { VirtualTryOnItem } from "../types/VirtualTryOn";
import { TryOnStackScreenProps } from "../types/navigation";
import DeleteModeHeader from "../components/common/DeleteModeHeader";

type Props = TryOnStackScreenProps<"VirtualTryOn">;

const VirtualTryOnScreen = ({ navigation }: Props) => {
  const [isOptionSheetVisible, setOptionSheetVisible] = useState(false);
  const [selectedOutfitUri, setSelectedOutfitUri] = useState<string>();
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImageUri, setResultImageUri] = useState<string>();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const tryOnContext = useContext(VirtualTryOnContext);
  const clothingContext = useContext(ClothingContext);
  if (!tryOnContext) {
    return null;
  }
  const { recentTryOns, addTryOn, deleteHistoryItems, userPhotoUri, setUserPhotoUri } = tryOnContext;

  // Hydrate the local photo picker from persisted context once on mount.
  useEffect(() => {
    if (userPhotoUri && !selectedPhotoUri) {
      setSelectedPhotoUri(userPhotoUri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhotoUri]);

  // Progress timer effect
  useEffect(() => {
    if (isProcessing) {
      const startTime = Date.now();
      const targetTime = startTime + 30000; // 30 seconds

      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const percentage = Math.min((elapsed / 30000) * 95, 95); // Max 95% until API returns

        if (currentTime >= targetTime) {
          clearInterval(intervalId);
        } else {
          setProgress(percentage);
        }
      }, 100); // Update every 100ms for smooth animation

      return () => clearInterval(intervalId);
    }
  }, [isProcessing]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [3, 4],
      quality: 1,
    });

    return !result.canceled ? result.assets[0].uri : null;
  };

  const handleOptionSelect = async (optionId: string) => {
    setOptionSheetVisible(false);

    // Add slight delay before showing picker to ensure smooth animation
    setTimeout(async () => {
      if (optionId === "discover") {
        const uri = await pickImage();
        if (uri) {
          setSelectedOutfitUri(uri);
          setResultImageUri(undefined);
        }
      } else if (optionId === "single") {
        navigation.navigate("SelectClothingModal", {
          onSelect: (uri: string) => {
            setSelectedOutfitUri(uri);
            setResultImageUri(undefined);
          },
        });
      } else if (optionId === "outfit") {
        navigation.navigate("SelectOutfitModal", {
          onSelect: (uri: string) => {
            setSelectedOutfitUri(uri);
            setResultImageUri(undefined);
          },
        });
      }
    }, 300);
  };

  const handlePhotoSelect = async () => {
    const uri = await pickImage();
    if (!uri) return;
    try {
      // Normalize to JPEG and persist into documents directory so the photo
      // survives across app launches (the picker's URI is a temp path).
      const jpeg = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const destUri = `${FileSystem.documentDirectory}fitting-user-photo-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: jpeg.uri, to: destUri });
      setSelectedPhotoUri(destUri);
      setUserPhotoUri(destUri);
      setResultImageUri(undefined);
    } catch (e) {
      console.error("Failed to persist user photo:", e);
      // Fallback: at least set the picker URI so the user can still try-on now
      setSelectedPhotoUri(uri);
      setResultImageUri(undefined);
    }
  };

  // Handle try-on process
  const handleTryOn = useCallback(async () => {
    if (!selectedOutfitUri || !selectedPhotoUri) {
      Alert.alert("Missing Content", "Please select both an outfit and a photo to continue.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await virtualTryOn({
        outfitImageUri: selectedOutfitUri,
        userPhotoUri: selectedPhotoUri,
      });

      setResultImageUri(response.resultImageUri);
      setProgress(100);

      // Save to try-on history
      await addTryOn({
        tryOnType: "discover",
        newClothingImageUri: selectedOutfitUri,
        userPhotoUri: selectedPhotoUri,
        resultImageUri: response.resultImageUri,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to process virtual try-on. Please try again.");
      console.error("Virtual try-on error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedOutfitUri, selectedPhotoUri, addTryOn]);

  const handleRecentItemPress = (item: VirtualTryOnItem) => {
    setSelectedOutfitUri(item.newClothingImageUri);
    setSelectedPhotoUri(item.userPhotoUri);
    setResultImageUri(item.resultImageUri);
  };

  const handleLongPress = useCallback((item: VirtualTryOnItem) => {
    setIsSelectionMode(true);
    setSelectedItems(new Set([item.id]));
  }, []);

  const handleItemPress = useCallback(
    (item: VirtualTryOnItem) => {
      if (isSelectionMode) {
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(item.id)) {
            newSet.delete(item.id);
            // If no items are selected, exit selection mode
            if (newSet.size === 0) {
              setIsSelectionMode(false);
            }
          } else {
            newSet.add(item.id);
          }
          return newSet;
        });
      } else {
        // Normal item press handler
        setSelectedOutfitUri(item.newClothingImageUri);
        setSelectedPhotoUri(item.userPhotoUri);
        setResultImageUri(item.resultImageUri);
      }
    },
    [isSelectionMode]
  );

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const exitSelection = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const handlePass = useCallback(() => {
    Alert.alert(
      "Remove from Considering",
      `Remove ${selectedItems.size} item${selectedItems.size > 1 ? "s" : ""} from your wishlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHistoryItems(selectedItems);
              exitSelection();
            } catch {
              Alert.alert("Error", "Failed to remove items. Please try again.");
            }
          },
        },
      ]
    );
  }, [selectedItems, deleteHistoryItems]);

  const handleBoughtIt = useCallback(() => {
    if (!clothingContext) {
      Alert.alert("Error", "Closet isn't loaded yet — try again in a moment.");
      return;
    }
    const ids = Array.from(selectedItems);
    const itemsToPromote = recentTryOns.filter((t) => selectedItems.has(t.id));
    Alert.alert(
      "I bought it",
      `Move ${ids.length} item${ids.length > 1 ? "s" : ""} into your closet?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add to closet",
          onPress: async () => {
            try {
              const withImage = itemsToPromote.filter(
                (it): it is typeof it & { newClothingImageUri: string } => !!it.newClothingImageUri
              );
              await Promise.all(
                withImage.map((it) => clothingContext.addClothingItemFromImage(it.newClothingImageUri))
              );
              await deleteHistoryItems(selectedItems);
              exitSelection();
              Alert.alert("Added", `Added ${withImage.length} item${withImage.length === 1 ? "" : "s"} to your closet.`);
            } catch (error) {
              console.error("Bought-it promotion failed:", error);
              Alert.alert("Error", "Couldn't add to closet. Please try again.");
            }
          },
        },
      ]
    );
  }, [selectedItems, recentTryOns, clothingContext, deleteHistoryItems]);

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      {/* Header */}
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>Fitting Room</Text>
        </View>
      )}

      <ScrollView style={[styles.content, isSelectionMode && styles.contentWithDelete]}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Try clothes on before you buy. Drop in a clothing photo from any store, then your photo — see the fit.
        </Text>

        {/* Photo Tips Section */}
        <PhotoTipsSection />

        {/* Content Selection Area */}
        <View style={styles.selectionContainer}>
          <ContentSelectionBox
            title="Clothing image"
            iconName="checkroom"
            onPress={() => setOptionSheetVisible(true)}
            selectedImageUri={selectedOutfitUri}
            onClear={() => {
              setSelectedOutfitUri(undefined);
              setResultImageUri(undefined);
            }}
          />
          <ContentSelectionBox
            title="Your photo"
            iconName="add-a-photo"
            onPress={handlePhotoSelect}
            selectedImageUri={selectedPhotoUri}
            onClear={() => {
              setSelectedPhotoUri(undefined);
              setUserPhotoUri(null);
              setResultImageUri(undefined);
            }}
          />
        </View>

        {/* Try-On Progress or Button */}
        {isProcessing ? (
          <TryOnProgress progress={progress} />
        ) : (
          !resultImageUri && (
            <PressableFade
              containerStyle={styles.tryOnButtonContainer}
              style={[styles.tryOnButton, (!selectedOutfitUri || !selectedPhotoUri) && styles.tryOnButtonDisabled]}
              onPress={handleTryOn}
              disabled={!selectedOutfitUri || !selectedPhotoUri}
            >
              <Text style={styles.tryOnButtonText}>Try it on</Text>
            </PressableFade>
          )
        )}

        {/* Result Display */}
        {resultImageUri && (
          <View style={styles.resultContainer}>
            <Text style={styles.subtitle}>Here's the fit</Text>
            <Image source={{ uri: resultImageUri }} style={styles.resultImage} resizeMode="contain" />
            <PressableFade
              containerStyle={styles.regenerateButtonContainer}
              style={styles.regenerateButton}
              onPress={() => {
                setResultImageUri(undefined);
                handleTryOn();
              }}
            >
              <Text style={styles.regenerateButtonText}>Try again</Text>
            </PressableFade>
          </View>
        )}

        {/* Recently Tried Section */}
        {recentTryOns.length > 0 && (
          <RecentlyTriedSection
            items={recentTryOns}
            onItemPress={handleItemPress}
            onItemLongPress={handleLongPress}
            isSelectionMode={isSelectionMode}
            selectedItems={selectedItems}
          />
        )}
      </ScrollView>

      {/* Wishlist action bar */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <PressableFade
            containerStyle={styles.actionBtnContainer}
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={handleBoughtIt}
          >
            <Text style={styles.actionBtnPrimaryText}>I bought it</Text>
          </PressableFade>
          <PressableFade
            containerStyle={styles.actionBtnContainer}
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={handlePass}
          >
            <Text style={styles.actionBtnSecondaryText}>Pass</Text>
          </PressableFade>
        </View>
      )}

      <TryOnOptionSheet
        isVisible={isOptionSheetVisible}
        onClose={() => setOptionSheetVisible(false)}
        onSelect={handleOptionSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider_light,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 16,
    fontFamily: typography.regular,
    color: colors.text_gray,
    marginBottom: 16,
  },
  selectionContainer: {
    flexDirection: "row",
    marginHorizontal: -6,
    marginBottom: 24,
  },
  tryOnButtonContainer: {
    marginBottom: 24,
  },
  tryOnButton: {
    backgroundColor: colors.primary_yellow,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  tryOnButtonDisabled: {
    opacity: 0.5,
  },
  tryOnButtonText: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: colors.text_inverse,
  },
  resultContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: typography.medium,
    color: colors.text_primary,
    marginBottom: 12,
  },
  resultImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.thumbnail_background,
  },
  regenerateButtonContainer: {
    width: "100%",
  },
  regenerateButton: {
    backgroundColor: colors.thumbnail_background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  regenerateButtonText: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_primary,
  },
  contentWithDelete: {
    paddingBottom: 96,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    padding: 12,
    gap: 10,
    backgroundColor: colors.surface_base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionBtnContainer: {
    flex: 1,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  actionBtnPrimary: {
    backgroundColor: colors.accent_primary,
  },
  actionBtnPrimaryText: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.text_inverse,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface_raised,
    borderWidth: 1,
    borderColor: colors.border_subtle,
  },
  actionBtnSecondaryText: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.text_primary,
  },
});

export default VirtualTryOnScreen;
