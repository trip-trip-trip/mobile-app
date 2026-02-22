import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { colors } from "@/constants/colors";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMyProfile } from "@/api/auth";
import { setHeader } from "@/utils/header";

// OAuth 콜백: tripshot://auth/home?level=access&token=...
// Android에서 openAuthSessionAsync가 custom scheme을 인터셉트하지 못할 때
// Expo Router가 이 화면으로 라우팅함
const AuthHome = () => {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { setAccessToken, isAuthenticated } = useAuthContext();
  const processed = useRef(false);

  useEffect(() => {
    if (!token || processed.current) return;
    processed.current = true;

    const handleToken = async () => {
      setHeader("Authorization", `Bearer ${token}`);
      const profile = await getMyProfile();
      await setAccessToken(token, profile);
      // isAuthenticated가 true가 되면 AuthGuard가 /(tabs)/gallery로 이동시킴
    };

    handleToken();
  }, [token]);

  if (!token) return <Redirect href="/auth" />;

  // 토큰 처리 완료 후 AuthGuard가 redirect 담당
  if (isAuthenticated) return <Redirect href="/(tabs)/gallery" />;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.NAVY} />
    </View>
  );
};

export default AuthHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.CLOUD,
  },
});
