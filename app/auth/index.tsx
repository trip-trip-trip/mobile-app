import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { useRouter } from "expo-router";

import { colors } from "@/constants/colors";
import SplashGraphics from "@/components/auth/SplashGraphics";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

const SPLASH_TOTAL_DELAY = 900;

const AuthIndex = () => {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(
      SPLASH_TOTAL_DELAY,
      withTiming(1, { duration: 500 }),
    );
    buttonOpacity.value = withDelay(
      SPLASH_TOTAL_DELAY + 400,
      withTiming(1, { duration: 500 }),
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <SplashGraphics />
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>Tripshot</Text>
        <Text style={styles.subtitle}>여행을 기록하는 새로운 방식</Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <GoogleLoginButton onPress={() => router.push("/auth/signup")} />
      </Animated.View>
    </View>
  );
};

export default AuthIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 142,
    paddingHorizontal: 24,
    flexDirection: "column",
    alignItems: "center",
    gap: 86,
  },
  titleContainer: {
    alignItems: "center",
    gap: 19,
  },
  title: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-SemiBold",
    fontSize: 40,
  },
  subtitle: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 18,
    letterSpacing: -1.8,
  },
  buttonContainer: {
    alignSelf: "stretch",
  },
});
