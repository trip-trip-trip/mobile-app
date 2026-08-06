import { getSecureStore, saveSecureStore } from "@/utils/secureStore";

// 튜토리얼(코치마크) 1회 노출 플래그 — 기기별 저장
export type TutorialKey =
  | "tutorial_album" // Album 홈 (여행 없음): 새 여행 / 설정 / 지난 기록
  | "tutorial_ticket" // Album 홈 (진행 중 여행): 촬영하기 / 티켓
  | "tutorial_trip_detail"; // 여행 세부페이지: 친구 초대 / 멤버 보기

const storageKey = (key: TutorialKey) => `tutorial_seen_${key}`;

export const isTutorialSeen = async (key: TutorialKey): Promise<boolean> => {
  try {
    return (await getSecureStore(storageKey(key))) === "true";
  } catch {
    // 저장소 오류 시에는 본 것으로 간주 — 오버레이가 매번 뜨는 것보다 안전
    return true;
  }
};

export const markTutorialSeen = async (key: TutorialKey): Promise<void> => {
  try {
    await saveSecureStore(storageKey(key), "true");
  } catch {
    // 실패해도 앱 동작에는 영향 없음 (다음 진입 시 한 번 더 보일 수 있음)
  }
};
