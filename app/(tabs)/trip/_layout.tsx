import { colors } from "@/constants";
import { Stack } from "expo-router";

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.CLOUD,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}
