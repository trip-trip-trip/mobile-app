export type PlaceType = "COUNTRY" | "REGION" | "CITY" | "SPOT";

export interface PlaceRes {
  id: number;
  name: string;
  type: PlaceType;
  parentId: number | null;
}

export interface TripCreateReq {
  title: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  placeIds: number[] | null;
}

export interface TripRes {
  id: number;
  ownerId: number;
  title: string;
  visibility: "PRIVATE" | "FRIENDS";
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  startDate: string;
  endDate: string;
  places: string[];
  participantNames: string[] | null;
  participantAvatarUrls: string[] | null;
}

export interface ActiveTripCheckRes {}
