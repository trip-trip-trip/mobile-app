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
      {/* /gallery/developing */}
      <Stack.Screen name="developing" />
      {/* /gallery/members — 여행 참여자 목록 */}
      <Stack.Screen name="members" />
      {/* /gallery/member-album — 친구 앨범 */}
      <Stack.Screen name="member-album" />
    </Stack>
  );
}
