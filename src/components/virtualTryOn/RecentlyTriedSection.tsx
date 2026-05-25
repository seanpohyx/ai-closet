import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import { VirtualTryOnItem } from "../../types/VirtualTryOn";
import PressableFade from "../common/PressableFade";

type Props = {
  items: VirtualTryOnItem[];
  onItemPress: (item: VirtualTryOnItem) => void;
  onItemLongPress?: (item: VirtualTryOnItem) => void;
  isSelectionMode?: boolean;
  selectedItems?: Set<string>;
};

type TriedThumbnailProps = {
  item: VirtualTryOnItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
};

const TriedThumbnail = ({ item, onPress, onLongPress, isSelectionMode, isSelected }: TriedThumbnailProps) => {
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <PressableFade style={styles.itemContainer} onPress={onPress} onLongPress={onLongPress}>
      <View style={[styles.imageWrapper, isSelectionMode && isSelected && styles.imageWrapperSelected]}>
        {loadFailed ? (
          <View style={styles.fallback}>
            <MaterialIcons name="broken-image" size={28} color={colors.text_tertiary} />
            <Text style={styles.fallbackText}>Image unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.resultImageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setLoadFailed(true)}
          />
        )}
        <View style={styles.tryOnTypeTag}>
          <MaterialIcons
            name={item.tryOnType === "discover" ? "photo-library" : "checkroom"}
            size={12}
            color={colors.text_primary}
          />
          <Text style={styles.tryOnTypeText}>{item.tryOnType === "discover" ? "Discover" : "Closet Item"}</Text>
        </View>
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <MaterialIcons name="check" size={16} color={colors.screen_background} />}
            </View>
          </View>
        )}
      </View>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </PressableFade>
  );
};

const RecentlyTriedSection = ({ items, onItemPress, onItemLongPress, isSelectionMode, selectedItems }: Props) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Considering</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => (
          <TriedThumbnail
            key={item.id}
            item={item}
            onPress={() => onItemPress(item)}
            onLongPress={onItemLongPress ? () => onItemLongPress(item) : undefined}
            isSelectionMode={isSelectionMode}
            isSelected={selectedItems?.has(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.medium,
    color: colors.text_primary,
    marginBottom: 12,
  },
  itemContainer: {
    marginRight: 12,
    marginLeft: 4,
    width: 150,
  },
  imageWrapper: {
    width: 150,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.thumbnail_background,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: colors.border_gray_light,
  },
  imageWrapperSelected: {
    borderColor: colors.primary_yellow,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  fallbackText: {
    fontFamily: typography.regular,
    fontSize: 11,
    color: colors.text_tertiary,
  },
  tryOnTypeTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: colors.primary_yellow,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tryOnTypeText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.text_inverse,
  },
  date: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.text_gray,
    textAlign: "center",
  },
  checkboxContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.thumbnail_background,
    borderWidth: 2,
    borderColor: colors.primary_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary_yellow,
  },
});

export default RecentlyTriedSection;
