import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "./PressableFade";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type RightAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type Props = {
  title: string;
  onClose: () => void;
  rightAction?: RightAction;
};

const ModalHeader = ({ title, onClose, rightAction }: Props) => (
  <View style={styles.container}>
    <PressableFade onPress={onClose} containerStyle={styles.iconSlot} style={styles.iconBtn}>
      <MaterialIcons name="close" size={24} color={colors.text_primary} />
    </PressableFade>
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    {rightAction ? (
      <PressableFade
        onPress={rightAction.onPress}
        disabled={rightAction.disabled}
        containerStyle={styles.iconSlot}
        style={[styles.actionBtn, rightAction.disabled && styles.actionBtnDisabled]}
      >
        <Text style={[styles.actionText, rightAction.disabled && styles.actionTextDisabled]}>
          {rightAction.label}
        </Text>
      </PressableFade>
    ) : (
      <View style={styles.iconSlot} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface_base,
  },
  iconSlot: {
    minWidth: 60,
    alignItems: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontFamily: typography.bold,
    fontSize: 17,
    color: colors.text_primary,
    textAlign: "center",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionText: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.accent_primary,
  },
  actionTextDisabled: {
    color: colors.text_tertiary,
  },
});

export default ModalHeader;
