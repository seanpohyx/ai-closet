import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import ModalHeader from "../components/common/ModalHeader";
import OutfitThumbnail from "../components/outfit/OutfitThumbnail";
import { OutfitContext } from "../contexts/OutfitContext";
import { Outfit } from "../types/Outfit";
import { RootStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

type Props = RootStackScreenProps<"SelectOutfitModal">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const GRID_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
const ITEM_HEIGHT = (ITEM_WIDTH * 4) / 3;

const SelectOutfitScreen = ({ navigation, route }: Props) => {
  const { onSelect } = route.params;
  const context = useContext(OutfitContext);

  if (!context) {
    return null;
  }

  const { outfits } = context;

  const handleSelect = (outfit: Outfit) => {
    onSelect(outfit.imageUri);
    navigation.goBack();
  };

  const renderItem = ({ item, index }: { item: Outfit; index: number }) => {
    const isFirstInRow = index % 2 === 0;
    const style = isFirstInRow
      ? { marginRight: GRID_SPACING / 2, marginBottom: GRID_SPACING }
      : { marginLeft: GRID_SPACING / 2, marginBottom: GRID_SPACING };

    return (
      <OutfitThumbnail
        outfit={item}
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        style={style}
        onPress={() => handleSelect(item)}
      />
    );
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right", "bottom"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ModalHeader title="Choose Outfit" onClose={() => navigation.goBack()} />

      {outfits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No outfits yet. Create one in the Outfits tab first.</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.gridContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  gridContent: {
    padding: GRID_PADDING,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.text_gray,
    textAlign: "center",
  },
});

export default SelectOutfitScreen;
