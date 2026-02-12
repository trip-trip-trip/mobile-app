import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, navigationBarHidden: true }}
      />
    </Stack>
  );
}
