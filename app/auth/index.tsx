import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";
import SplashGraphics from "@/components/auth/SplashGraphics";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMyProfile } from "@/api/auth";
import { setHeader } from "@/utils/header";

const BACKEND_URL = "https://backend-v2-production-789a.up.railway.app";
const SPLASH_TOTAL_DELAY = 900;

const AuthIndex = () => {
  const router = useRouter();
  const { setAccessToken, setSignupToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${BACKEND_URL}/login/start/GOOGLE`,
        "tripshot://",
      );

      if (result.type !== "success") {
        // 사용자가 브라우저를 닫은 경우
        return;
      }

      // deep link URL 파싱: tripshot://home?level=access&token=...
      //                     또는 tripshot://signup?level=signup&token=...
      const parsed = Linking.parse(result.url);
      const level = parsed.queryParams?.level as string | undefined;
      const token = parsed.queryParams?.token as string | undefined;

      if (!level || !token) {
        setError("로그인 처리 중 오류가 발생했습니다.");
        return;
      }

      if (level === "access") {
        // 기존 회원: access 토큰으로 프로필 조회 후 로그인 완료
        setHeader("Authorization", `Bearer ${token}`);
        const userProfile = await getMyProfile();
        await setAccessToken(token, userProfile);
        // isAuthenticated가 true가 되면 AuthGuard가 /(tabs)/gallery로 이동시킴
      } else if (level === "signup") {
        // 신규 회원: signup 토큰을 context에 저장 후 회원가입 화면으로 이동
        setSignupToken(token);
        router.push("/auth/signup");
      } else {
        setError("알 수 없는 응답입니다.");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SplashGraphics />
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>Tripshot</Text>
        <Text style={styles.subtitle}>여행을 기록하는 새로운 방식</Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <GoogleLoginButton
          onPress={handleGoogleLogin}
          disabled={isLoading}
        />
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
    gap: 12,
  },
  errorText: {
    color: colors.RED,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 13,
    textAlign: "center",
  },
});
