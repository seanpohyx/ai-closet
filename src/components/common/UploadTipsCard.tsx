import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableFade from "./PressableFade";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  visible: boolean;
  onContinue: () => void;
  onDismiss: () => void;
};

const TIPS: { icon: keyof typeof MaterialIcons.glyphMap; text: string }[] = [
  { icon: "wb-sunny", text: "Use bright, even lighting." },
  { icon: "format-align-center", text: "Lay flat or hang the garment straight." },
  { icon: "filter-none", text: "Shoot against a plain background." },
  { icon: "crop-portrait", text: "Frame the full item — no cropping." },
];

const UploadTipsCard = ({ visible, onContinue, onDismiss }: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Quick Photo Tips</Text>
          <Text style={styles.subtitle}>For best results in the Carousel preview:</Text>

          <View style={styles.tipsList}>
            {TIPS.map((tip) => (
              <View key={tip.text} style={styles.tipRow}>
                <MaterialIcons name={tip.icon} size={22} color={colors.primary_yellow} />
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>

          <PressableFade onPress={onContinue} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Got it, continue</Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.screen_background,
    borderRadius: 16,
    padding: 20,
  },
  title: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary, marginBottom: 4 },
  subtitle: { fontFamily: typography.regular, fontSize: 14, color: colors.text_gray, marginBottom: 16 },
  tipsList: { gap: 12, marginBottom: 20 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipText: { flex: 1, fontFamily: typography.regular, fontSize: 14, color: colors.text_primary },
  primaryBtn: {
    backgroundColor: colors.primary_yellow,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { fontFamily: typography.bold, fontSize: 15, color: colors.text_inverse },
});

export default UploadTipsCard;
