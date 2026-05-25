import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { OutfitContext } from "../../contexts/OutfitContext";
import OutfitThumbnail from "../outfit/OutfitThumbnail";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  clothingItemId: string;
  onOutfitPress: (outfitId: string) => void;
};

const RelevantOutfits = ({ clothingItemId, onOutfitPress }: Props) => {
  const outfitContext = useContext(OutfitContext);
  const { width } = useWindowDimensions();

  // Compact 3-per-screen cards so the section stays a constant vertical
  // footprint regardless of how many outfits reference this item.
  const thumbnailWidth = (width - 32 - 16) / 3;
  const thumbnailHeight = (thumbnailWidth * 4) / 3; // 3:4 aspect ratio

  const relevantOutfits = useMemo(() => {
    if (!outfitContext) return [];
    return outfitContext.outfits.filter((outfit) => outfit.clothingItems.some((item) => item.id === clothingItemId));
  }, [outfitContext, clothingItemId]);

  if (relevantOutfits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>In {relevantOutfits.length} outfit{relevantOutfits.length === 1 ? "" : "s"}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {relevantOutfits.map((outfit) => (
          <View key={outfit.id} style={styles.thumbnailContainer}>
            <OutfitThumbnail
              outfit={outfit}
              width={thumbnailWidth}
              height={thumbnailHeight}
              onPress={() => onOutfitPress(outfit.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.text_secondary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    marginRight: 8,
  },
});

export default RelevantOutfits;
