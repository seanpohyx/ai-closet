import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableFade from "./PressableFade";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
};

const SettingsRow = ({ label, hint, right, onPress, destructive }: Props) => {
  const body = (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {right ? <View style={styles.rightSlot}>{right}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableFade onPress={onPress} containerStyle={styles.container}>
        {body}
      </PressableFade>
    );
  }
  return <View style={styles.container}>{body}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface_base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 56,
    paddingVertical: 10,
  },
  textCol: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontFamily: typography.medium,
    fontSize: 15,
    color: colors.text_primary,
  },
  labelDestructive: {
    color: colors.accent_danger,
  },
  hint: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_secondary,
    marginTop: 2,
  },
  rightSlot: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default SettingsRow;
