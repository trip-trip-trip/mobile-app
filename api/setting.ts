import axiosInstance from "./axios";
import type {
  NotificationSettingRes,
  NotificationSettingReq,
  PreferredSlotsReq,
  DeviceTokenReq,
} from "@/types/setting";
import type { AuthUser } from "@/types/auth";

// GET /users/me — 내 프로필 조회
async function getMyProfile(): Promise<AuthUser> {
  const { data } = await axiosInstance.get("/users/me");
  return data.result as AuthUser;
}

// PATCH /users/me — 프로필 수정 (multipart/form-data)
// imageFile: 선택 변경 시에만 전달, userId: 변경 시에만 전달
async function updateMyProfile(params: {
  imageFile?: { uri: string; name: string; type: string } | null;
  userId?: string;
}): Promise<AuthUser> {
  const formData = new FormData();

  if (params.imageFile) {
    formData.append("image", {
      uri: params.imageFile.uri,
      name: params.imageFile.name,
      type: params.imageFile.type,
    } as any);
  }

  if (params.userId !== undefined) {
    formData.append("userId", params.userId);
  }

  const { data } = await axiosInstance.patch("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.result as AuthUser;
}

// GET /notifications/settings — 알림 설정 조회
async function getNotificationSettings(): Promise<NotificationSettingRes> {
  const { data } = await axiosInstance.get("/notifications/settings");
  return data.result as NotificationSettingRes;
}

// PATCH /notifications/settings — 알림 ON/OFF 변경
async function updateNotificationSetting(
  req: NotificationSettingReq,
): Promise<void> {
  await axiosInstance.patch("/notifications/settings", req);
}

// PUT /notifications/slots — 알림 슬롯 교체
async function updateNotificationSlots(req: PreferredSlotsReq): Promise<void> {
  await axiosInstance.put("/notifications/slots", req);
}

// POST /notifications/devices — 디바이스 토큰 등록
async function registerDevice(req: DeviceTokenReq): Promise<void> {
  await axiosInstance.post("/notifications/devices", req);
}

export {
  getMyProfile,
  updateMyProfile,
  getNotificationSettings,
  updateNotificationSetting,
  updateNotificationSlots,
  registerDevice,
};
