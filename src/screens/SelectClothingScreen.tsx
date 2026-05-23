import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "../components/common/PressableFade";
import ClothingItemThumbnail from "../components/clothing/ClothingItemThumbnail";
import { ClothingContext } from "../contexts/ClothingContext";
import { ClothingItem } from "../types/ClothingItem";
import { RootStackScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

type Props = RootStackScreenProps<"SelectClothingModal">;

const SelectClothingScreen = ({ navigation, route }: Props) => {
  const { onSelect } = route.params;
  const context = useContext(ClothingContext);

  if (!context) {
    return null;
  }

  const { clothingItems } = context;

  const handleSelect = (item: ClothingItem) => {
    onSelect(item.backgroundRemovedImageUri || item.imageUri);
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <ClothingItemThumbnail item={item} onPress={() => handleSelect(item)} />
  );

  const safeAreaEdges: Edge[] = ["top", "left", "right", "bottom"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Item</Text>
        <PressableFade onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={colors.icon_stroke} />
        </PressableFade>
      </View>

      {clothingItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clothing items yet. Add some in the Closet tab first.</Text>
        </View>
      ) : (
        <FlatList
          data={clothingItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider_light,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
  closeButton: {
    padding: 4,
  },
  gridContent: {
    padding: 10,
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

export default SelectClothingScreen;
