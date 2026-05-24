import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet } from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import ClothingManagementScreen from "../screens/ClothingManagementScreen";
import ClothingDetailScreen from "../screens/ClothingDetailScreen";
import OutfitManagementScreen from "../screens/OutfitManagementScreen";
import OutfitCanvasScreen from "../screens/OutfitCanvasScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";
import VirtualTryOnScreen from "../screens/VirtualTryOnScreen";
import SelectClothingScreen from "../screens/SelectClothingScreen";
import SelectOutfitScreen from "../screens/SelectOutfitScreen";
import CarouselScreen from "../screens/CarouselScreen";
import CarouselSetupScreen from "../screens/CarouselSetupScreen";
import AlignToSilhouetteScreen from "../screens/AlignToSilhouetteScreen";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import {
  RootStackParamList,
  MainTabParamList,
  ClosetStackParamList,
  OutfitStackParamList,
  TryOnStackParamList,
  CarouselStackParamList,
} from "../types/navigation";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ClosetStack = createNativeStackNavigator<ClosetStackParamList>();
const OutfitStack = createNativeStackNavigator<OutfitStackParamList>();
const TryOnStack = createNativeStackNavigator<TryOnStackParamList>();
const CarouselStack = createNativeStackNavigator<CarouselStackParamList>();

// Stack Navigators
const ClosetStackNavigator = () => (
  <ClosetStack.Navigator screenOptions={{ headerShown: false }}>
    <ClosetStack.Screen name="ClothingManagement" component={ClothingManagementScreen} />
    <ClosetStack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
  </ClosetStack.Navigator>
);

const OutfitStackNavigator = () => (
  <OutfitStack.Navigator screenOptions={{ headerShown: false }}>
    <OutfitStack.Screen name="OutfitManagement" component={OutfitManagementScreen} />
    <OutfitStack.Screen name="OutfitCanvas" component={OutfitCanvasScreen} />
    <OutfitStack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
  </OutfitStack.Navigator>
);

const TryOnStackNavigator = () => (
  <TryOnStack.Navigator screenOptions={{ headerShown: false }}>
    <TryOnStack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
  </TryOnStack.Navigator>
);

const CarouselStackNavigator = () => (
  <CarouselStack.Navigator screenOptions={{ headerShown: false }}>
    <CarouselStack.Screen name="CarouselHome" component={CarouselScreen} />
    <CarouselStack.Screen name="CarouselSetup" component={CarouselSetupScreen} />
  </CarouselStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.text_primary,
      tabBarInactiveTintColor: colors.text_gray,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarIconStyle: styles.tabBarIcon,
    }}
  >
    <Tab.Screen
      name="Closet"
      component={ClosetStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="wardrobe" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Outfits"
      component={OutfitStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <MaterialIcons name="style" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="TryOn"
      component={TryOnStackNavigator}
      options={{
        tabBarLabel: "AI Mirror",
        tabBarIcon: ({ color, size }) => <FontAwesome6 name="wand-magic-sparkles" size={20} color={color} />,
      }}
    />
    <Tab.Screen
      name="Carousel"
      component={CarouselStackNavigator}
      options={{
        tabBarLabel: "Mix & Match",
        tabBarIcon: ({ color, size }) => <MaterialIcons name="view-carousel" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        <RootStack.Group screenOptions={{ presentation: "modal" }}>
          <RootStack.Screen name="ClothingDetailModal" component={ClothingDetailScreen} />
          <RootStack.Screen name="OutfitDetailModal" component={OutfitDetailScreen} />
          <RootStack.Screen name="SelectClothingModal" component={SelectClothingScreen} />
          <RootStack.Screen name="SelectOutfitModal" component={SelectOutfitScreen} />
          <RootStack.Screen name="AlignToSilhouetteModal" component={AlignToSilhouetteScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 58,
    paddingBottom: Platform.OS === "ios" ? 30 : 8,
    paddingTop: 8,
    backgroundColor: colors.surface_base,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    elevation: 0,
  },
  tabBarLabel: {
    fontFamily: typography.medium,
    fontSize: 11,
    marginTop: 2,
  },
  tabBarIcon: {
    marginTop: 2,
  },
});

export default AppNavigator;
