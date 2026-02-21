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
      <Stack.Screen
        name="index"
        options={{
          title: "setting",
          headerShown: false,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
