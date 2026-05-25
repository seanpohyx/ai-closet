import React, { useCallback, useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { ClothingContext } from "../contexts/ClothingContext";
import { CarouselContext } from "../contexts/CarouselContext";
import UploadTipsCard from "../components/common/UploadTipsCard";
import EmptyState from "../components/common/EmptyState";
import SectionHeader from "../components/common/SectionHeader";
import ClosetFilterSheet, { ClosetFilterValue, countActiveFilters } from "../components/clothing/ClosetFilterSheet";
import { ClothingItem } from "../types/ClothingItem";
import { ClosetStackScreenProps } from "../types/navigation";
import ClothingItemThumbnail from "../components/clothing/ClothingItemThumbnail";
import AnimatedAddButton from "../components/common/AnimatedAddButton";
import TagFilterSection from "../components/common/TagFilterSection";
import DeleteModeHeader from "../components/common/DeleteModeHeader";
import DeleteButton from "../components/common/DeleteButton";
import { categories } from "../data/categories";
import { groupClothingForSectionList } from "../utils/sectionList";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

const CLOSET_COLUMNS = 3;

type Props = ClosetStackScreenProps<"ClothingManagement">;

interface CategoryTabProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  count: number;
}

// CategoryTab Subcomponent
const CategoryTab = ({ name, isSelected, onPress, count }: CategoryTabProps) => (
  <Pressable style={[styles.categoryTab, isSelected && styles.categoryTabSelected]} onPress={onPress}>
    <Text
      style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}
      numberOfLines={1}
    >
      {name}
    </Text>
    <Text
      style={[styles.categoryCount, isSelected && styles.categoryCountSelected]}
      numberOfLines={1}
    >
      {count}
    </Text>
  </Pressable>
);

// Main Component
const ClothingManagementScreen = ({ navigation }: Props) => {
  const context = useContext(ClothingContext);
  const carouselCtx = useContext(CarouselContext);

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [tipsVisible, setTipsVisible] = useState(false);
  const [pendingPickType, setPendingPickType] = useState<"camera" | "gallery" | null>(null);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  if (!context) {
    return <Text>Loading...</Text>;
  }

  const {
    categoryData,
    tagData,
    filteredItems,
    activeFilters,
    setFilter,
    addClothingItemFromImage,
    deleteClothingItem,
  } = context;

  // Selection handlers
  const handleLongPress = useCallback((itemId: string) => {
    setIsSelectionMode(true);
    setSelectedItems(new Set([itemId]));
  }, []);

  const handleItemPress = useCallback(
    (itemId: string) => {
      if (isSelectionMode) {
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
            // If no items are selected, exit selection mode
            if (newSet.size === 0) {
              setIsSelectionMode(false);
            }
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      } else {
        navigation.navigate("ClothingDetail", { id: itemId });
      }
    },
    [isSelectionMode, navigation]
  );

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Items",
      `Are you sure you want to delete ${selectedItems.size} item${selectedItems.size > 1 ? "s" : ""}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedItems.forEach((id) => {
              deleteClothingItem(id);
            });
            setIsSelectionMode(false);
            setSelectedItems(new Set());
          },
        },
      ]
    );
  }, [selectedItems, deleteClothingItem]);

  const handleAddClothingItem = async (imageUri: string) => {
    try {
      // Normalize to JPEG so all APIs receive a supported format
      const manipResult = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const newItemId = await addClothingItemFromImage(manipResult.uri);

      // Navigate to the detail screen right away; signal that alignment should
      // auto-launch once BG removal completes.
      navigation.navigate("ClothingDetail", { id: newItemId, autoLaunchAlignment: true });
    } catch (error) {
      console.error("Error adding clothing item:", error);
      Alert.alert("Error", "Failed to add clothing item. Please try again.");
    }
  };

  const launchGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      handleAddClothingItem(result.assets[0].uri);
    }
  };

  const launchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      handleAddClothingItem(result.assets[0].uri);
    }
  };

  const showTipsOrPick = (type: "camera" | "gallery") => {
    if (carouselCtx && !carouselCtx.hasSeenUploadTips) {
      setPendingPickType(type);
      setTipsVisible(true);
    } else if (type === "camera") {
      launchCamera();
    } else {
      launchGallery();
    }
  };

  const handleChoosePhoto = () => showTipsOrPick("gallery");
  const handleTakePhoto = () => showTipsOrPick("camera");

  const handleTipsContinue = () => {
    carouselCtx?.setHasSeenUploadTips(true);
    setTipsVisible(false);
    const type = pendingPickType;
    setPendingPickType(null);
    if (type === "camera") launchCamera();
    else if (type === "gallery") launchGallery();
  };

  const handleTagPress = (tag: string) => {
    const currentTags = activeFilters.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    setFilter("tags", newTags);
  };

  const sections = useMemo(
    () => groupClothingForSectionList(filteredItems, activeFilters.category || "All", CLOSET_COLUMNS),
    [filteredItems, activeFilters.category]
  );

  const renderRow = ({ item: row }: { item: ClothingItem[] }) => (
    <View style={styles.row}>
      {row.map((clothingItem) => (
        <ClothingItemThumbnail
          key={clothingItem.id}
          item={clothingItem}
          onPress={() => handleItemPress(clothingItem.id)}
          onLongPress={() => handleLongPress(clothingItem.id)}
          isSelectable={isSelectionMode}
          isSelected={selectedItems.has(clothingItem.id)}
        />
      ))}
      {row.length < CLOSET_COLUMNS &&
        Array.from({ length: CLOSET_COLUMNS - row.length }).map((_, i) => (
          <View key={`spacer-${i}`} style={styles.spacer} />
        ))}
    </View>
  );

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      {/* Header */}
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>My Closet</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("SettingsModal")}
              style={styles.headerIconBtn}
              hitSlop={8}
            >
              <MaterialIcons name="settings" size={22} color={colors.icon_stroke} />
            </Pressable>
            <Pressable onPress={() => setFilterSheetVisible(true)} style={styles.headerIconBtn} hitSlop={8}>
              <MaterialIcons name="tune" size={22} color={colors.icon_stroke} />
              {(() => {
                const count = countActiveFilters({
                  colors: activeFilters.colors || [],
                  printsOnly: !!activeFilters.printsOnly,
                });
                return count > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{count}</Text>
                  </View>
                ) : null;
              })()}
            </Pressable>
          </View>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabsContainer}
        contentContainerStyle={styles.categoryTabsContent}
      >
        <CategoryTab
          name="All"
          isSelected={activeFilters.category === "All"}
          onPress={() => setFilter("category", "All")}
          count={categoryData.All}
        />
        {Object.keys(categories).map((category) => (
          <CategoryTab
            key={category}
            name={category}
            isSelected={activeFilters.category === category}
            onPress={() => setFilter("category", category)}
            count={categoryData[category]}
          />
        ))}
      </ScrollView>

      {/* Tag Filter Section — hidden when no tags exist */}
      {tagData.length > 0 && (
        <TagFilterSection tagData={tagData} selectedTags={activeFilters.tags || []} onTagPress={handleTagPress} />
      )}

      {/* Clothing Grid (or empty state) */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="checkroom"
          title="Your closet is empty"
          hint="Add clothing items from your camera or gallery to start building your closet."
          action={{ label: "Add your first item", onPress: handleChoosePhoto }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row, index) => row.map((it) => it.id).join("-") + "-" + index}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} count={section.count} />}
          stickySectionHeadersEnabled
          contentContainerStyle={[styles.gridContent, isSelectionMode && styles.gridContentWithDelete]}
        />
      )}

      {/* Add Button or Delete Button */}
      {isSelectionMode ? (
        <DeleteButton onDelete={handleDelete} selectedCount={selectedItems.size} />
      ) : (
        <AnimatedAddButton onChoosePhoto={handleChoosePhoto} onTakePhoto={handleTakePhoto} />
      )}

      <UploadTipsCard
        visible={tipsVisible}
        onContinue={handleTipsContinue}
        onDismiss={() => {
          setTipsVisible(false);
          setPendingPickType(null);
        }}
      />

      <ClosetFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        initial={{
          colors: activeFilters.colors || [],
          printsOnly: !!activeFilters.printsOnly,
        }}
        onApply={(next: ClosetFilterValue) => {
          setFilter("colors", next.colors);
          setFilter("printsOnly", next.printsOnly);
        }}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.accent_primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontFamily: typography.bold,
    fontSize: 10,
    color: colors.text_inverse,
  },
  categoryTabsContainer: {
    flexGrow: 0,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 14,
    backgroundColor: colors.thumbnail_background,
    flexShrink: 0,
    minHeight: 36,
  },
  categoryTabSelected: {
    backgroundColor: colors.primary_yellow,
  },
  categoryTabText: {
    fontFamily: typography.medium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.text_gray,
    marginRight: 4,
  },
  categoryTabTextSelected: {
    color: colors.text_inverse,
  },
  categoryCount: {
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text_gray,
  },
  categoryCountSelected: {
    color: colors.text_inverse,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  gridContentWithDelete: {
    paddingBottom: 80,
  },
  row: {
    flexDirection: "row",
  },
  spacer: {
    flex: 1 / CLOSET_COLUMNS,
    aspectRatio: 1,
  },
});

export default ClothingManagementScreen;
