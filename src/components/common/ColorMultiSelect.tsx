import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors as themeColors } from "../../styles/colors";

const COLOR_SWATCHES: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#9E9E9E",
  Blue: "#2196F3",
  Pink: "#FF80AB",
  Beige: "#E8D8B5",
  Brown: "#795548",
  Orange: "#FB8C00",
  Red: "#E53935",
  Yellow: "#FDD835",
  Purple: "#8E24AA",
  Green: "#43A047",
};

const LIGHT_COLORS = new Set(["White", "Yellow", "Beige"]);

type Props = {
  options: string[];
  selectedValues: string[];
  onValueChange: (selected: string[]) => void;
  disabled?: boolean;
  maxSelections?: number;
};

const ColorMultiSelect = ({ options, selectedValues, onValueChange, disabled = false, maxSelections }: Props) => {
  const toggle = (value: string) => {
    if (disabled) return;
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
      return;
    }
    if (maxSelections !== undefined && selectedValues.length >= maxSelections) return;
    onValueChange([...selectedValues, value]);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map((color) => {
        const isSelected = selectedValues.includes(color);
        const swatch = COLOR_SWATCHES[color] || "#CCCCCC";
        const isLight = LIGHT_COLORS.has(color);
        const checkColor = isLight ? "#000000" : "#FFFFFF";

        return (
          <Pressable
            key={color}
            onPress={() => toggle(color)}
            disabled={disabled}
            style={[
              styles.swatchWrapper,
              isSelected && styles.swatchWrapperSelected,
              disabled && styles.swatchWrapperDisabled,
            ]}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                isLight && styles.swatchLightBorder,
              ]}
            >
              {isSelected && <MaterialIcons name="check" size={18} color={checkColor} />}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  swatchWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    padding: 2,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  swatchWrapperSelected: {
    borderColor: themeColors.text_primary,
  },
  swatchWrapperDisabled: {
    opacity: 0.5,
  },
  swatch: {
    flex: 1,
    width: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  swatchLightBorder: {
    borderWidth: 1,
    borderColor: themeColors.border_gray,
  },
});

export default ColorMultiSelect;
