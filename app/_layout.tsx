import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/api/queryClient";
import useDeviceToken from "@/hooks/useDeviceToken";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

// 인증 상태에 따라 auth ↔ (tabs) 간 라우팅 가드
function AuthGuard() {
  const { isLoading, isAuthenticated } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/gallery");
    }
  }, [isLoading, isAuthenticated, segments]);

  return null;
}

export default function RootLayout() {
  useDeviceToken();
  const [fontsLoaded, fontError] = useFonts({
    "MonoplexKR-Thin": require("../assets/fonts/MonoplexKR-Thin.ttf"),
    "MonoplexKR-ThinItalic": require("../assets/fonts/MonoplexKR-ThinItalic.ttf"),
    "MonoplexKR-ExtraLight": require("../assets/fonts/MonoplexKR-ExtraLight.ttf"),
    "MonoplexKR-ExtraLightItalic": require("../assets/fonts/MonoplexKR-ExtraLightItalic.ttf"),
    "MonoplexKR-Light": require("../assets/fonts/MonoplexKR-Light.ttf"),
    "MonoplexKR-LightItalic": require("../assets/fonts/MonoplexKR-LightItalic.ttf"),
    "MonoplexKR-Regular": require("../assets/fonts/MonoplexKR-Regular.ttf"),
    "MonoplexKR-Italic": require("../assets/fonts/MonoplexKR-Italic.ttf"),
    "MonoplexKR-Text": require("../assets/fonts/MonoplexKR-Text.ttf"),
    "MonoplexKR-TextItalic": require("../assets/fonts/MonoplexKR-TextItalic.ttf"),
    "MonoplexKR-Medium": require("../assets/fonts/MonoplexKR-Medium.ttf"),
    "MonoplexKR-MediumItalic": require("../assets/fonts/MonoplexKR-MediumItalic.ttf"),
    "MonoplexKR-SemiBold": require("../assets/fonts/MonoplexKR-SemiBold.ttf"),
    "MonoplexKR-SemiBoldItalic": require("../assets/fonts/MonoplexKR-SemiBoldItalic.ttf"),
    "MonoplexKR-Bold": require("../assets/fonts/MonoplexKR-Bold.ttf"),
    "MonoplexKR-BoldItalic": require("../assets/fonts/MonoplexKR-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard />
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, navigationBarHidden: true }}
          />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
