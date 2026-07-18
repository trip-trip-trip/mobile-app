export type PlaceType = "COUNTRY" | "REGION" | "CITY" | "SPOT";

export interface PlaceRes {
  id: number;
  name: string;
  type: PlaceType;
  parentId: number | null;
}

// 시작은 버튼을 누른 순간 — 날짜가 아니라 총 일수만 보낸다 (travel-day-roll-spec.md 4.1)
export interface TripCreateReq {
  title: string;
  totalDays: number;
  placeIds: number[] | null;
}

export interface TripRes {
  id: number;
  ownerId: number;
  title: string;
  visibility: "PRIVATE" | "FRIENDS";
  status: "ACTIVE" | "ENDED";
  startDate: string; // 표시 라벨 전용
  endDate: string | null; // 표시 라벨 전용
  places: string[];
  participantNames: string[] | null;
  participantAvatarUrls: string[] | null;
  totalDays: number | null;
  currentRoll: number | null;
}

export interface ActiveTripCheckRes {
  isOngoing: boolean;
  trip: TripRes[] | null;
}

export type TripUpdateReq = {
  title?: string;
  placeIds?: number[];
};
