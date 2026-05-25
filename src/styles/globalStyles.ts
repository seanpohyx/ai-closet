import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const typography = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
};

export const displayStyles = StyleSheet.create({
  display: {
    fontFamily: typography.bold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: colors.text_primary,
  },
});

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  titleText: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_gray,
  },
  bodyText: {
    fontFamily: typography.regular,
    fontSize: 16,
    color: colors.text_primary,
  },
});
