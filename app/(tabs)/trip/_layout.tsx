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
      {/* trips/index.tsx 화면에 대한 설정 */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
