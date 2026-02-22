import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export default function useDeviceToken() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[FCM] 알림 권한 거부됨");
        return;
      }

      const token = await Notifications.getDevicePushTokenAsync();
      // Android: FCM 등록 토큰 / iOS: APNs 디바이스 토큰
      console.log(`[FCM] 디바이스 토큰 (${Platform.OS}):`, token.data);
    })();
  }, []);
}
