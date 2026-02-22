import { colors } from "@/constants/colors";
import { Stack } from "expo-router";

export default function AuthScreen() {
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
          title: "auth",
          headerShown: false,
          navigationBarHidden: true,
        }}
      />
      <Stack.Screen
        name="home"
        options={{ headerShown: false, navigationBarHidden: true }}
      />
    </Stack>
  );
}
