import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "../components/common/PressableFade";
import { CarouselContext, Transform, IDENTITY_TRANSFORM } from "../contexts/CarouselContext";
import { ClothingContext } from "../contexts/ClothingContext";
import { ClothingItem } from "../types/ClothingItem";
import { CarouselStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

type Props = CarouselStackScreenProps<"CarouselHome">;

const DRESS_NONE: ClothingItem = {
  id: "__none__",
  imageUri: "",
  backgroundRemovedImageUri: "",
  createdAt: "",
  updatedAt: "",
  category: "Dresses",
  subcategory: "",
  tags: [],
  color: [],
  season: [],
  occasion: [],
  brand: "",
  purchaseDate: "",
  price: 0,
  processingStatus: { backgroundRemoval: "completed", categorization: "completed" },
};

const CarouselScreen = ({ navigation }: Props) => {
  const carousel = useContext(CarouselContext);
  const clothing = useContext(ClothingContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  if (!carousel || !clothing) return null;

  const { userPhotoUri, userPhotoTransform, isHydrated } = carousel;
  const { clothingItems } = clothing;

  useEffect(() => {
    if (!isHydrated) return;
    if (!userPhotoUri) {
      navigation.replace("CarouselSetup");
    }
  }, [isHydrated, userPhotoUri]);

  const itemsByCategory = useMemo(() => {
    const filter = (cat: "Tops" | "Bottoms" | "Dresses") =>
      clothingItems.filter((i) => i.category === cat && i.backgroundRemovedImageUri);
    return {
      Tops: filter("Tops"),
      Bottoms: filter("Bottoms"),
      Dresses: [DRESS_NONE, ...filter("Dresses")],
    };
  }, [clothingItems]);

  const [topIdx, setTopIdx] = useState(0);
  const [botIdx, setBotIdx] = useState(0);
  const [dressIdx, setDressIdx] = useState(0);
  const [showUserPhoto, setShowUserPhoto] = useState(true);

  const selectedTop = itemsByCategory.Tops[topIdx];
  const selectedBottom = itemsByCategory.Bottoms[botIdx];
  const selectedDress = itemsByCategory.Dresses[dressIdx];
  const isWearingDress = selectedDress && selectedDress.id !== "__none__";

  const onStageLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setStageSize({ width: w, height: h });
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right", "bottom"];

  if (!isHydrated || !userPhotoUri) {
    return <SafeAreaView style={styles.container} edges={safeAreaEdges} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <View style={styles.header}>
        <Text style={styles.title}>Carousel</Text>
        <View style={styles.headerActions}>
          <PressableFade
            onPress={() => setShowUserPhoto((v) => !v)}
            style={styles.iconBtn}
          >
            <MaterialIcons
              name={showUserPhoto ? "visibility" : "visibility-off"}
              size={22}
              color={showUserPhoto ? colors.icon_stroke : colors.text_gray}
            />
          </PressableFade>
          <PressableFade
            onPress={() => navigation.navigate("CarouselSetup")}
            style={styles.iconBtn}
          >
            <MaterialIcons name="person" size={22} color={colors.icon_stroke} />
          </PressableFade>
        </View>
      </View>

      <View style={[styles.body, isLandscape ? styles.bodyLandscape : styles.bodyPortrait]}>
        <View style={styles.photoStage} onLayout={onStageLayout}>
          {/* User photo, in silhouette space — toggleable */}
          {showUserPhoto && stageSize.width > 0 && (
            <TransformedImage
              uri={userPhotoUri}
              transform={userPhotoTransform ?? IDENTITY_TRANSFORM}
              stage={stageSize}
            />
          )}
          {/* Garments — layer order: bottoms → tops → dress */}
          {!isWearingDress && selectedBottom && stageSize.width > 0 && (
            <TransformedImage
              uri={selectedBottom.backgroundRemovedImageUri}
              transform={selectedBottom.carouselTransform ?? IDENTITY_TRANSFORM}
              stage={stageSize}
            />
          )}
          {!isWearingDress && selectedTop && stageSize.width > 0 && (
            <TransformedImage
              uri={selectedTop.backgroundRemovedImageUri}
              transform={selectedTop.carouselTransform ?? IDENTITY_TRANSFORM}
              stage={stageSize}
            />
          )}
          {isWearingDress && stageSize.width > 0 && (
            <TransformedImage
              uri={selectedDress.backgroundRemovedImageUri}
              transform={selectedDress.carouselTransform ?? IDENTITY_TRANSFORM}
              stage={stageSize}
            />
          )}
        </View>

        <View style={styles.lanesContainer}>
          <CategoryLane
            label="Top"
            items={itemsByCategory.Tops}
            activeIndex={topIdx}
            onChange={setTopIdx}
            disabled={!!isWearingDress}
          />
          <CategoryLane
            label="Bottom"
            items={itemsByCategory.Bottoms}
            activeIndex={botIdx}
            onChange={setBotIdx}
            disabled={!!isWearingDress}
          />
          <CategoryLane
            label="Dress"
            items={itemsByCategory.Dresses}
            activeIndex={dressIdx}
            onChange={setDressIdx}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

type TransformedImageProps = { uri: string; transform: Transform; stage: { width: number; height: number } };
const TransformedImage = ({ uri, transform, stage }: TransformedImageProps) => (
  <View
    pointerEvents="none"
    style={[
      StyleSheet.absoluteFillObject,
      {
        transform: [
          { translateX: transform.xRatio * stage.width },
          { translateY: transform.yRatio * stage.height },
          { scale: transform.scale },
        ],
      },
    ]}
  >
    <Image source={{ uri }} style={styles.overlayImg} resizeMode="contain" />
  </View>
);

type LaneProps = {
  label: string;
  items: ClothingItem[];
  activeIndex: number;
  onChange: (idx: number) => void;
  disabled?: boolean;
};

const CategoryLane = ({ label, items, activeIndex, onChange, disabled }: LaneProps) => {
  if (items.length === 0) {
    return (
      <View style={[laneStyles.lane, disabled && laneStyles.laneDisabled]}>
        <Text style={laneStyles.laneLabel}>{label}</Text>
        <View style={laneStyles.emptyHint}>
          <Text style={laneStyles.emptyHintText}>No {label.toLowerCase()}s in your closet yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[laneStyles.lane, disabled && laneStyles.laneDisabled]}>
      <Text style={laneStyles.laneLabel}>{label}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={laneStyles.laneScroll}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          const isNone = item.id === "__none__";
          const isAligned = !!item.carouselTransform || isNone;
          return (
            <PressableFade
              onPress={() => !disabled && onChange(index)}
              style={[laneStyles.thumb, isActive && laneStyles.thumbActive]}
              disabled={disabled}
            >
              {isNone ? (
                <View style={laneStyles.noneBox}>
                  <MaterialIcons name="block" size={20} color={colors.text_gray} />
                  <Text style={laneStyles.noneText}>None</Text>
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: item.backgroundRemovedImageUri }}
                    style={laneStyles.thumbImg}
                    resizeMode="contain"
                  />
                  {!isAligned && (
                    <View style={laneStyles.warnBadge}>
                      <MaterialIcons name="warning" size={12} color="#FFA500" />
                    </View>
                  )}
                </>
              )}
            </PressableFade>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider_light,
  },
  title: { fontFamily: typography.bold, fontSize: 22, color: colors.text_primary },
  headerActions: { flexDirection: "row" },
  iconBtn: { padding: 8, marginLeft: 4 },
  body: { flex: 1 },
  bodyPortrait: { flexDirection: "column" },
  bodyLandscape: { flexDirection: "row" },
  photoStage: {
    flex: 1,
    margin: 8,
    aspectRatio: 3 / 4,
    alignSelf: "center",
    width: "96%",
    backgroundColor: colors.thumbnail_background,
    borderRadius: 16,
    overflow: "hidden",
  },
  overlayImg: { width: "100%", height: "100%" },
  lanesContainer: { padding: 8, gap: 8 },
});

const laneStyles = StyleSheet.create({
  lane: {
    backgroundColor: colors.thumbnail_background,
    borderRadius: 12,
    padding: 8,
  },
  laneDisabled: { opacity: 0.4 },
  laneLabel: {
    fontFamily: typography.semiBold,
    fontSize: 13,
    color: colors.text_primary,
    marginBottom: 6,
    marginLeft: 4,
  },
  laneScroll: { gap: 8, paddingHorizontal: 4 },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: colors.screen_background,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbActive: { borderColor: colors.primary_yellow },
  thumbImg: { width: "100%", height: "100%" },
  warnBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 1,
  },
  noneBox: { justifyContent: "center", alignItems: "center" },
  noneText: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.text_gray,
    marginTop: 2,
  },
  emptyHint: { padding: 16, alignItems: "center" },
  emptyHintText: { fontFamily: typography.regular, fontSize: 12, color: colors.text_gray },
});

export default CarouselScreen;
