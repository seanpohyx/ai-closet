import React, { useState } from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Outfit } from "../../types/Outfit";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

type Props = {
  outfit: Outfit;
  width: number;
  height: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  style?: ViewStyle;
};

const OutfitThumbnail = ({ outfit, width, height, onPress, onLongPress, isSelectable, isSelected, style }: Props) => {
  const thumbnailStyle = { width, height };
  // Track image load failures so we can show a placeholder even when
  // outfit.imageUri is non-empty but stale (file removed, OS cleaned tmp dir,
  // Expo Go sandbox path changed between sessions, etc.)
  const [loadFailed, setLoadFailed] = useState(false);

  const hasImage = !!outfit.imageUri && !loadFailed;

  return (
    <PressableFade style={[style]} onPress={onPress} onLongPress={onLongPress}>
      <View style={[styles.card, thumbnailStyle, isSelected && styles.cardSelected]}>
        {hasImage ? (
          <Image
            source={{ uri: outfit.imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setLoadFailed(true)}
          />
        ) : (
          <View style={styles.brokenBox}>
            <MaterialIcons name="broken-image" size={32} color={colors.text_tertiary} />
            <Text style={styles.brokenText}>Image missing</Text>
            <Text style={styles.brokenHint}>Tap to re-edit</Text>
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
  card: {
    backgroundColor: colors.surface_base,
    borderRadius: 14,
    overflow: "hidden",
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
  brokenBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  brokenText: {
    marginTop: 6,
    fontFamily: typography.medium,
    fontSize: 13,
    color: colors.text_primary,
  },
  brokenHint: {
    marginTop: 2,
    fontFamily: typography.regular,
    fontSize: 11,
    color: colors.text_secondary,
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
    backgroundColor: colors.surface_raised,
    borderWidth: 2,
    borderColor: colors.accent_primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.accent_primary,
  },
});

export default OutfitThumbnail;
