import React from "react";
import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  imageUri: string;
  processedImageUri?: string;
  isLoading?: boolean;
  loadingText?: string;
  style?: any;
};

const LoadingImageView = ({ imageUri, processedImageUri, isLoading = false, loadingText, style }: Props) => {
  const displayImageUri = processedImageUri || imageUri;

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: displayImageUri }} style={styles.image} resizeMode={isLoading ? "cover" : "contain"} />

      {isLoading && (
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <BlurView intensity={60} style={styles.blurContainer}>
            <View style={styles.pill}>
              <ActivityIndicator size="small" color={colors.text_inverse} />
              {loadingText && (
                <Animated.Text entering={FadeIn.delay(300)} style={styles.pillText}>
                  {loadingText}
                </Animated.Text>
              )}
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.thumbnail_background,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(24, 24, 27, 0.88)",
    gap: 10,
  },
  pillText: {
    fontFamily: typography.medium,
    fontSize: 14,
    color: colors.text_inverse,
    letterSpacing: 0.2,
  },
});

export default LoadingImageView;
