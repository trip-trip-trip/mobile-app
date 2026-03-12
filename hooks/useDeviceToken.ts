import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect } from "react";
import { Platform } from "react-native";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function useDeviceToken() {
  useEffect(() => {
    if (isExpoGo) return;

    (async () => {
      // expo-notifications를 런타임에만 로드 (Expo Go 크래시 방지)
      const Notifications =
        require("expo-notifications") as typeof import("expo-notifications");

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[FCM] 알림 권한 거부됨");
        return;
      }

      const token = await Notifications.getDevicePushTokenAsync();
      console.log(`[FCM] 디바이스 토큰 (${Platform.OS}):`, token.data);
    })();
  }, []);
}
