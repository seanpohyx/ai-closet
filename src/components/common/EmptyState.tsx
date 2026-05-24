import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "./PressableFade";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Action = { label: string; onPress: () => void };

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  hint?: string;
  action?: Action;
};

const EmptyState = ({ icon, title, hint, action }: Props) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={32} color={colors.text_tertiary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {hint && <Text style={styles.hint}>{hint}</Text>}
    {action && (
      <PressableFade onPress={action.onPress} containerStyle={styles.ctaContainer} style={styles.cta}>
        <Text style={styles.ctaText}>{action.label}</Text>
      </PressableFade>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface_raised,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.semiBold,
    fontSize: 16,
    color: colors.text_primary,
    textAlign: "center",
    marginBottom: 6,
  },
  hint: {
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_secondary,
    textAlign: "center",
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: 20,
  },
  cta: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.accent_primary,
    borderRadius: 14,
  },
  ctaText: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: colors.text_inverse,
  },
});

export default EmptyState;
