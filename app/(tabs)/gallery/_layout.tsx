import { colors } from "@/constants/colors";
import { Stack } from "expo-router";

export default function SettingScreen() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.CLOUD,
        },
      }}
    >
      {/* /gallery */}
      <Stack.Screen name="index" />
      {/* /gallery/[tripId] */}
      <Stack.Screen name="[tripId]" />
    </Stack>
  );
}
