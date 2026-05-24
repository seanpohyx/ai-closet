import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  title: string;
  count: number;
};

const SectionHeader = ({ title, count }: Props) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.countChip}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: colors.surface_base,
  },
  title: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: colors.text_primary,
    marginRight: 8,
  },
  countChip: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.surface_raised,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.text_tertiary,
  },
});

export default SectionHeader;
