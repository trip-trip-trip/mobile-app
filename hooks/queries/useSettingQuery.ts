import { useQuery } from "@tanstack/react-query";
import { getNotificationSettings } from "@/api/setting";

// GET /notifications/settings
export function useGetNotificationSettings() {
  return useQuery({
    queryKey: ["notifications", "settings"],
    queryFn: getNotificationSettings,
  });
}
