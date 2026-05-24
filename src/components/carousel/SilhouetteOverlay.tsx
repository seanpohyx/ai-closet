import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Anchor ratios (vertical position as fraction of stage height).
// These define the canonical "silhouette space" used everywhere in the carousel.
export const SILHOUETTE_ANCHORS = {
  HEAD: 0.04,
  SHOULDERS: 0.18,
  WAIST: 0.42,
  HIPS: 0.52,
  KNEES: 0.78,
  ANKLES: 0.96,
} as const;

export type SilhouetteRegion = "full" | "top" | "bottom";

type Props = {
  showOutline?: boolean;
  region?: SilhouetteRegion;
};

const SilhouetteOverlay = ({ showOutline = true, region = "full" }: Props) => {
  const showShoulders = region === "full" || region === "top";
  const showWaist = region === "full" || region === "top";
  const showHips = region !== "top" ? true : true; // visible in all regions
  // For region === "top", we still show Hips line so user can align hem of long shirts
  const showKnees = region === "full" || region === "bottom";
  const showAnkles = region === "full" || region === "bottom";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {showOutline && <BodyOutline region={region} />}
      {showShoulders && <GuideLine y={SILHOUETTE_ANCHORS.SHOULDERS} label="Shoulders" inset="20%" />}
      {showWaist && <GuideLine y={SILHOUETTE_ANCHORS.WAIST} label="Waist" inset="25%" />}
      {showHips && <GuideLine y={SILHOUETTE_ANCHORS.HIPS} label="Hips" inset="22%" />}
      {showKnees && <GuideLine y={SILHOUETTE_ANCHORS.KNEES} label="Knees" inset="32%" />}
      {showAnkles && <GuideLine y={SILHOUETTE_ANCHORS.ANKLES} label="Ankles" inset="35%" />}
    </View>
  );
};

type OutlineProps = { region: SilhouetteRegion };
const BodyOutline = ({ region }: OutlineProps) => {
  const showHead = region === "full" || region === "top";
  const showTorso = region === "full" || region === "top";
  const showLegs = region === "full" || region === "bottom";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {showHead && (
        <>
          <View style={[styles.head, { top: `${SILHOUETTE_ANCHORS.HEAD * 100}%` }]} />
          <View
            style={[
              styles.neck,
              { top: `${SILHOUETTE_ANCHORS.HEAD * 100 + 10}%` },
            ]}
          />
        </>
      )}
      {showTorso && (
        <View
          style={[
            styles.torso,
            {
              top: `${SILHOUETTE_ANCHORS.SHOULDERS * 100}%`,
              height: `${(SILHOUETTE_ANCHORS.HIPS - SILHOUETTE_ANCHORS.SHOULDERS) * 100}%`,
            },
          ]}
        />
      )}
      {showLegs && (
        <>
          <View
            style={[
              styles.leg,
              styles.legLeft,
              {
                top: `${SILHOUETTE_ANCHORS.HIPS * 100}%`,
                height: `${(SILHOUETTE_ANCHORS.ANKLES - SILHOUETTE_ANCHORS.HIPS) * 100}%`,
              },
            ]}
          />
          <View
            style={[
              styles.leg,
              styles.legRight,
              {
                top: `${SILHOUETTE_ANCHORS.HIPS * 100}%`,
                height: `${(SILHOUETTE_ANCHORS.ANKLES - SILHOUETTE_ANCHORS.HIPS) * 100}%`,
              },
            ]}
          />
        </>
      )}
    </View>
  );
};

type GuideLineProps = { y: number; label: string; inset: string };
const GuideLine = ({ y, label, inset }: GuideLineProps) => (
  <>
    <View
      style={[
        styles.guideLine,
        {
          top: `${y * 100}%`,
          left: inset as any,
          right: inset as any,
        },
      ]}
    />
    <Text
      style={[
        styles.guideLabel,
        { top: `${y * 100}%` },
      ]}
    >
      {label}
    </Text>
  </>
);

const OUTLINE_COLOR = "rgba(82, 82, 91, 0.35)"; // text_secondary @ 35%
const GUIDE_COLOR = "rgba(45, 95, 74, 0.75)"; // accent_primary @ 75%

const styles = StyleSheet.create({
  head: {
    position: "absolute",
    left: "44%",
    width: "12%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: OUTLINE_COLOR,
    backgroundColor: "transparent",
  },
  neck: {
    position: "absolute",
    left: "48%",
    width: "4%",
    height: "2%",
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: OUTLINE_COLOR,
  },
  torso: {
    position: "absolute",
    left: "30%",
    right: "30%",
    borderWidth: 1.5,
    borderColor: OUTLINE_COLOR,
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  leg: {
    position: "absolute",
    width: "12%",
    borderWidth: 1.5,
    borderColor: OUTLINE_COLOR,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  legLeft: { left: "36%" },
  legRight: { right: "36%" },
  guideLine: {
    position: "absolute",
    height: 1,
    backgroundColor: GUIDE_COLOR,
  },
  guideLabel: {
    position: "absolute",
    left: 6,
    fontSize: 10,
    color: GUIDE_COLOR,
    fontWeight: "600",
    marginTop: -7,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingHorizontal: 3,
    borderRadius: 3,
  },
});

export default SilhouetteOverlay;
