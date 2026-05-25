import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View, Easing } from "react-native";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

// Mirrors the native splash (same hanger PNG, same white background, same
// centered layout) so the transition from OS-level splash → JS cover is
// seamless. Then animates the wordmark in below the hanger, holds briefly,
// and fades the whole cover out, revealing the home screen underneath.
type Props = {
  onFinish: () => void;
};

const WORDMARK = "CLOSET";

// Timings (ms)
const HOLD_BEFORE_WORDMARK = 200;
const WORDMARK_FADE_IN = 450;
const HOLD_AFTER_WORDMARK = 650;
const COVER_FADE_OUT = 400;

const SplashCover = ({ onFinish }: Props) => {
  const coverOpacity = useRef(new Animated.Value(1)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(HOLD_BEFORE_WORDMARK),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: WORDMARK_FADE_IN,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslate, {
          toValue: 0,
          duration: WORDMARK_FADE_IN,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(HOLD_AFTER_WORDMARK),
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: COVER_FADE_OUT,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    sequence.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => sequence.stop();
  }, [coverOpacity, wordmarkOpacity, wordmarkTranslate, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: coverOpacity }]} pointerEvents="none">
      <Image
        // Same asset as the native splash (app.json → splash.image) — keeps
        // the hanger in exactly the same position across the handoff.
        source={require("../../../assets/splash.png")}
        style={styles.hanger}
        resizeMode="contain"
      />
      <Animated.Text
        style={[
          styles.wordmark,
          { opacity: wordmarkOpacity, transform: [{ translateY: wordmarkTranslate }] },
        ]}
      >
        {WORDMARK}
      </Animated.Text>
      <View style={styles.bottomSpacer} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface_base,
    alignItems: "center",
    justifyContent: "center",
  },
  hanger: {
    // Full-screen image with the hanger artwork already centered by the asset.
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  wordmark: {
    position: "absolute",
    // Sits just below the optical centre where the hanger is drawn.
    top: "60%",
    fontFamily: typography.bold,
    fontSize: 28,
    letterSpacing: 6,
    color: colors.text_primary,
  },
  bottomSpacer: {
    height: 1,
  },
});

export default SplashCover;
