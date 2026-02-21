import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import PhotoFrame from "@/assets/splash-screen/photo_frame.svg";
import Airplane from "@/assets/splash-screen/airplane.svg";
import Ticket from "@/assets/splash-screen/ticket.svg";

const ITEMS = [
  { Component: PhotoFrame, delay: 0 },
  { Component: Ticket, delay: 300 },
  { Component: Airplane, delay: 600 },
] as const;

const ANIMATION_DURATION = 600;
const TRANSLATE_OFFSET = -50;
const OVERLAP = -70;

type AnimatedItemProps = {
  delay: number;
  isFirst: boolean;
  children: React.ReactNode;
};

const AnimatedItem = ({ delay, isFirst, children }: AnimatedItemProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(TRANSLATE_OFFSET);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: ANIMATION_DURATION }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: ANIMATION_DURATION }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, !isFirst && { marginTop: OVERLAP }]}>
      {children}
    </Animated.View>
  );
};

const SplashGraphics = () => {
  return (
    <View style={styles.container}>
      {ITEMS.map(({ Component, delay }, index) => (
        <AnimatedItem key={index} delay={delay} isFirst={index === 0}>
          <Component />
        </AnimatedItem>
      ))}
    </View>
  );
};

export default SplashGraphics;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 0, // overlap is handled by negative marginTop on items
  },
});
