import { useMutation } from "@tanstack/react-query";
import queryClient from "@/api/queryClient";
import {
  updateMyProfile,
  updateNotificationSetting,
  updateNotificationSlots,
} from "@/api/setting";

// PATCH /users/me
export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
}

// PATCH /notifications/settings (ON/OFF)
export function useUpdateNotificationSetting() {
  return useMutation({
    mutationFn: updateNotificationSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "settings"] });
    },
  });
}

// PUT /notifications/slots
export function useUpdateNotificationSlots() {
  return useMutation({
    mutationFn: updateNotificationSlots,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "settings"] });
    },
  });
}
