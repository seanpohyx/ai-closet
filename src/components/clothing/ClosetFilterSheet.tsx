import React, { useState, useEffect } from "react";
import { Modal, Pressable, View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "../common/PressableFade";
import ColorMultiSelect from "../common/ColorMultiSelect";
import { colors as colorOptions } from "../../data/options";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

export type ClosetFilterValue = {
  colors: string[];
  printsOnly: boolean;
};

export const emptyFilter: ClosetFilterValue = {
  colors: [],
  printsOnly: false,
};

export const countActiveFilters = (f: ClosetFilterValue): number =>
  f.colors.length + (f.printsOnly ? 1 : 0);

type Props = {
  visible: boolean;
  onClose: () => void;
  initial: ClosetFilterValue;
  onApply: (filter: ClosetFilterValue) => void;
};

const ClosetFilterSheet = ({ visible, onClose, initial, onApply }: Props) => {
  const [draft, setDraft] = useState<ClosetFilterValue>(initial);

  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => {
    setDraft(emptyFilter);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <PressableFade onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear</Text>
            </PressableFade>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Colour */}
            <Text style={styles.sectionLabel}>Colour</Text>
            <ColorMultiSelect
              options={colorOptions}
              selectedValues={draft.colors}
              onValueChange={(next) => setDraft((p) => ({ ...p, colors: next }))}
            />

            {/* Prints */}
            <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Prints</Text>
            <PressableFade
              onPress={() => setDraft((p) => ({ ...p, printsOnly: !p.printsOnly }))}
              style={styles.toggleRow}
            >
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Only show prints</Text>
                <Text style={styles.toggleHint}>Items marked as patterns / not solid colour</Text>
              </View>
              <View style={[styles.checkbox, draft.printsOnly && styles.checkboxChecked]}>
                {draft.printsOnly && (
                  <MaterialIcons name="check" size={18} color={colors.text_inverse} />
                )}
              </View>
            </PressableFade>
          </ScrollView>

          <PressableFade onPress={handleApply} containerStyle={styles.applyContainer} style={styles.applyBtn}>
            <Text style={styles.applyText}>Apply</Text>
          </PressableFade>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.surface_overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface_base,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border_subtle,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },
  clearBtn: { padding: 6 },
  clearText: { fontFamily: typography.medium, fontSize: 14, color: colors.text_secondary },
  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: colors.text_primary,
    marginBottom: 10,
  },
  sectionLabelGap: { marginTop: 22 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  toggleTextCol: { flex: 1, marginRight: 12 },
  toggleTitle: { fontFamily: typography.medium, fontSize: 15, color: colors.text_primary },
  toggleHint: { fontFamily: typography.regular, fontSize: 12, color: colors.text_secondary, marginTop: 2 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border_subtle,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.accent_primary,
    borderColor: colors.accent_primary,
  },
  applyContainer: { paddingHorizontal: 20, paddingTop: 12 },
  applyBtn: {
    backgroundColor: colors.accent_primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  applyText: { fontFamily: typography.semiBold, fontSize: 15, color: colors.text_inverse },
});

export default ClosetFilterSheet;
