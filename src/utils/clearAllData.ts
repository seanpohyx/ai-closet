import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = [
  "@clothing_items",
  "@outfits",
  "@carousel_state_v3",
  "@try_on_history",
  "@fitting_room_user_photo",
  "@settings_v1",
];

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove(KEYS);
};
