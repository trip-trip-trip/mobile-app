export type NotificationSettingRes = {
  momentEnabled: boolean;
  slots: SlotCode[];
};

// 서버 슬롯 코드
export type SlotCode =
  | "DAWN"
  | "MORNING"
  | "LUNCH"
  | "AFTERNOON"
  | "EVENING"
  | "NIGHT";

export type NotificationSettingReq = {
  momentEnabled: boolean;
};

export type PreferredSlotsReq = {
  slots: SlotCode[];
};

export type DeviceTokenReq = {
  platform: string;
  deviceToken: string;
};

// 화면에 표시할 한국어 ↔ 슬롯 코드 매핑
export const SLOT_LABEL_MAP: Record<string, SlotCode> = {
  오전: "MORNING",
  오후: "AFTERNOON",
  저녁: "EVENING",
  새벽: "DAWN",
  점심: "LUNCH",
  밤: "NIGHT",
};

export const SLOT_CODE_TO_LABEL: Record<SlotCode, string> = {
  MORNING: "오전",
  AFTERNOON: "오후",
  EVENING: "저녁",
  DAWN: "새벽",
  LUNCH: "점심",
  NIGHT: "밤",
};

// 화면 표시 순서
export const SLOT_DISPLAY_ORDER: string[] = [
  "오전",
  "오후",
  "저녁",
  "새벽",
  "점심",
  "밤",
];
