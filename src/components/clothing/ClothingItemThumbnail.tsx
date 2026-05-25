import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ClothingItem } from "../../types/ClothingItem";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

type Props = {
  item: ClothingItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  usageCount?: number;
};

const LAYERED = new Set(["Tops", "Bottoms", "Dresses"]);

const ClothingItemThumbnail = ({ item, onPress, onLongPress, isSelectable, isSelected, usageCount }: Props) => {
  const needsCategory = !item.category;
  const needsAlignment = LAYERED.has(item.category) && !item.carouselTransform;
  const needsSetup = !isSelectable && (needsCategory || needsAlignment);
  const showUsage = !isSelectable && typeof usageCount === "number" && usageCount > 0;

  return (
    <PressableFade
      containerStyle={styles.container}
      style={styles.pressableContent}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        <Image
          source={{ uri: item.backgroundRemovedImageUri || item.imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
        {needsSetup && (
          <View style={styles.setupBadge}>
            <View style={styles.setupDot} />
          </View>
        )}
        {showUsage && (
          <View style={styles.usagePill}>
            <Text style={styles.usagePillText}>{usageCount} uses</Text>
          </View>
        )}
        {isSelectable && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <MaterialIcons name="check" size={16} color={colors.text_inverse} />}
            </View>
          </View>
        )}
      </View>
    </PressableFade>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 6,
  },
  pressableContent: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface_base,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#18181B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.accent_primary,
  },
  image: {
    width: "100%",
    height: "100%",
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
  setupBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface_base,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  setupDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent_warning,
  },
  usagePill: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accent_primary,
  },
  usagePillText: {
    fontFamily: typography.semiBold,
    fontSize: 10,
    color: colors.text_inverse,
    letterSpacing: 0.2,
  },
});

export default ClothingItemThumbnail;
