import type { TripRoll } from "@/types/gallery";

// 롤 표시 상태 — 판정은 전부 서버가 내려준 플래그 사용 (클라이언트 날짜 비교 금지)
// - visible: 현상 완료, 사진 표시
// - developable: 봉인됨 + 현상 가능 시각 도달 → 잠금 그래픽 자리에 "현상하기" 버튼
// - locked: 진행 중이거나 현상 가능 시각 미도달 → 잠금 그래픽
export type RollVisibility = "visible" | "developable" | "locked";

export const getRollVisibility = (roll: TripRoll): RollVisibility => {
  if (roll.developed) return "visible";
  if (roll.developable) return "developable";
  return "locked";
};

// 롤의 표시용 날짜 라벨 — 한 롤에 두 현지 날짜가 공존할 수 있음 (예: "7/18 → 7/17")
export const rollDateLabel = (roll: TripRoll): string => {
  const dates = roll.civilDates ?? [];
  if (dates.length === 0) return "";
  if (dates.length === 1) return dates[0];
  return `${dates[0]} → ${dates[dates.length - 1]}`;
};
