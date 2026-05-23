import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, Alert, LayoutChangeEvent } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import PressableFade from "../components/common/PressableFade";
import SilhouetteOverlay, { SilhouetteRegion } from "../components/carousel/SilhouetteOverlay";
import { CarouselContext, Transform, IDENTITY_TRANSFORM } from "../contexts/CarouselContext";
import { ClothingContext } from "../contexts/ClothingContext";
import { RootStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

type Props = RootStackScreenProps<"AlignToSilhouetteModal">;

const AlignToSilhouetteScreen = ({ navigation, route }: Props) => {
  const { mode, clothingItemId } = route.params;
  const carousel = useContext(CarouselContext);
  const clothing = useContext(ClothingContext);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const [pendingTransform, setPendingTransform] = useState<Transform | null>(null);

  // Compute the largest 3:4 rectangle that fits inside the wrapper.
  // Same aspect ratio as the carousel stage, so transforms (stored as
  // ratios) translate perfectly between the two.
  const stageSize = (() => {
    if (wrapperSize.width === 0 || wrapperSize.height === 0) return { width: 0, height: 0 };
    const widthLimited = wrapperSize.width;
    const heightFromWidth = widthLimited * (4 / 3);
    if (heightFromWidth <= wrapperSize.height) {
      return { width: widthLimited, height: heightFromWidth };
    }
    const heightLimited = wrapperSize.height;
    return { width: heightLimited * (3 / 4), height: heightLimited };
  })();

  if (!carousel || !clothing) return null;

  // Resolve image + initial transform + silhouette region based on mode
  let imageUri: string | null = null;
  let initial: Transform = IDENTITY_TRANSFORM;
  let title = "";
  let hint = "";
  let region: SilhouetteRegion = "full";

  if (mode === "userPhoto") {
    imageUri = carousel.userPhotoUri;
    initial = carousel.userPhotoTransform ?? IDENTITY_TRANSFORM;
    title = "Align Yourself";
    hint = "Pinch and drag your photo so your shoulders, hips, knees, and ankles sit on the matching guide lines.";
    region = "full";
  } else {
    const item = clothingItemId ? clothing.getClothingItem(clothingItemId) : undefined;
    if (item) {
      imageUri = item.backgroundRemovedImageUri || item.imageUri;
      initial = item.carouselTransform ?? IDENTITY_TRANSFORM;
      title = "Align to Silhouette";
      if (item.category === "Tops") {
        hint = "Align the shoulders of the garment to the Shoulders line, and the hem to the Waist or Hips line.";
        region = "top";
      } else if (item.category === "Bottoms") {
        hint = "Align the waistband to the Hips line and the cuffs to the Knees or Ankles line.";
        region = "bottom";
      } else if (item.category === "Dresses") {
        hint = "Align the shoulders to the Shoulders line and the hem to your preferred length.";
        region = "full";
      } else {
        hint = "Align this item to the silhouette.";
        region = "full";
      }
    }
  }

  const onWrapperLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setWrapperSize({ width, height });
  };

  const handleSave = () => {
    const t = pendingTransform ?? initial;
    if (mode === "userPhoto") {
      carousel.setUserPhotoTransform(t);
    } else if (clothingItemId) {
      const item = clothing.getClothingItem(clothingItemId);
      if (item) {
        clothing.updateClothingItem({ ...item, carouselTransform: t });
      }
    }
    navigation.goBack();
  };

  const handleReset = () => {
    Alert.alert("Reset alignment?", "This will clear the saved alignment for this item.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          if (mode === "userPhoto") {
            carousel.setUserPhotoTransform(null);
          } else if (clothingItemId) {
            const item = clothing.getClothingItem(clothingItemId);
            if (item) {
              const { carouselTransform: _omit, ...rest } = item;
              clothing.updateClothingItem(rest);
            }
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const hasSavedAlignment =
    mode === "userPhoto"
      ? carousel.userPhotoTransform != null
      : clothingItemId
      ? !!clothing.getClothingItem(clothingItemId)?.carouselTransform
      : false;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"] as Edge[]}>
      <View style={styles.header}>
        <PressableFade onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="close" size={24} color={colors.icon_stroke} />
        </PressableFade>
        <Text style={styles.title}>{title}</Text>
        <PressableFade onPress={handleSave} style={styles.iconBtn}>
          <Text style={styles.saveText}>Save</Text>
        </PressableFade>
      </View>

      <Text style={styles.hint}>{hint}</Text>

      <View style={styles.stageWrapper} onLayout={onWrapperLayout}>
        <View style={[styles.stage, { width: stageSize.width, height: stageSize.height }]}>
          {imageUri && stageSize.width > 0 ? (
            <AlignableImage
              uri={imageUri}
              initial={initial}
              stage={stageSize}
              onChange={(t) => setPendingTransform(t)}
            />
          ) : (
            <View style={styles.center}>
              <Text style={styles.placeholderText}>
                {mode === "userPhoto" ? "No user photo set" : "Item not found"}
              </Text>
            </View>
          )}
          <SilhouetteOverlay showOutline region={region} />
        </View>
      </View>

      {hasSavedAlignment && (
        <PressableFade onPress={handleReset} containerStyle={styles.resetContainer} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset alignment</Text>
        </PressableFade>
      )}
    </SafeAreaView>
  );
};

type AlignableProps = {
  uri: string;
  initial: Transform;
  stage: { width: number; height: number };
  onChange: (t: Transform) => void;
};

const AlignableImage = ({ uri, initial, stage, onChange }: AlignableProps) => {
  const translateX = useSharedValue(initial.xRatio * stage.width);
  const translateY = useSharedValue(initial.yRatio * stage.height);
  const scale = useSharedValue(initial.scale);

  const offsetX = useSharedValue(translateX.value);
  const offsetY = useSharedValue(translateY.value);
  const offsetScale = useSharedValue(initial.scale);

  const emit = (xPx: number, yPx: number, s: number) => {
    onChange({
      scale: s,
      xRatio: stage.width > 0 ? xPx / stage.width : 0,
      yRatio: stage.height > 0 ? yPx / stage.height : 0,
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = offsetX.value + e.translationX;
      translateY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      runOnJS(emit)(translateX.value, translateY.value, scale.value);
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.1, Math.min(3, offsetScale.value * e.scale));
    })
    .onEnd(() => {
      offsetScale.value = scale.value;
      runOnJS(emit)(translateX.value, translateY.value, scale.value);
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[StyleSheet.absoluteFillObject, animStyle]}>
        <Image source={{ uri }} style={styles.alignImage} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider_light,
  },
  iconBtn: { padding: 8, minWidth: 56, alignItems: "center" },
  title: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },
  saveText: { fontFamily: typography.semiBold, fontSize: 16, color: colors.primary_yellow },
  hint: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: "center",
  },
  stageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stage: {
    backgroundColor: colors.thumbnail_background,
    borderRadius: 16,
    overflow: "hidden",
  },
  alignImage: { width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  placeholderText: { fontFamily: typography.regular, color: colors.text_gray, textAlign: "center" },
  resetContainer: { paddingHorizontal: 24, paddingBottom: 12 },
  resetBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.thumbnail_background,
    alignItems: "center",
  },
  resetText: { fontFamily: typography.medium, color: colors.text_primary },
});

export default AlignToSilhouetteScreen;
