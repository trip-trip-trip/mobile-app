// 여행 상태 — 판정은 서버 status만 사용한다 (날짜 비교 금지, travel-day-roll-spec.md)
export type TripStatus = "ACTIVE" | "ENDED";

export type TripInfo = {
  id: number;
  placeName: string;
  title: string;
  startDate: string; // 표시 라벨 전용
  endDate: string; // 표시 라벨 전용
  places: string[];
  members: string[];
  photoCount: number;
  videoCount: number;
  photos: string[];
  coverImage: string | null;
  status: TripStatus;
  totalDays: number | null;
  currentRoll: number | null;
};

export type TripRaw = {
  tripId: number;
  title: string;
  startDate: string;
  endDate: string;
  places: string[];
  participantAvatarUrls: string[];
  photoCount: number;
  videoCount: number;
  myPhotoUrls: string[];
  status: TripStatus;
  totalDays: number | null;
  currentRoll: number | null;
};

export type TripItem = {
  trip: TripRaw;
  contents?: unknown;
};

export type TripsResponse = {
  result?: TripItem[];
};

export type ActiveTripResponse = {
  result: {
    isOngoing: boolean;
  };
};

export type MediaKind = "PHOTO" | "VIDEO";

export type RollMedia = {
  id: number;
  tripId: number;
  mediaKind: MediaKind;
  captureType: string;
  comment: string | null;
  url: string;
  uploaderId: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  rollIndex: number | null;
  capturedAt: string; // UTC instant (판정·정렬 기준)
  captureTz: string | null; // 표시 전용 — 찍은 곳의 시각으로 변환할 때 사용
  developedAt: string | null;
  lat: number | null;
  lng: number | null;
};

// 롤 단위 미디어 그룹 (기존 TripDay 대체)
export type TripRoll = {
  index: number;
  sealed: boolean;
  developed: boolean;
  developable: boolean; // 현상 버튼 노출 조건 (서버 판정)
  openedAt: string;
  sealedAt: string | null;
  developsAt: string | null;
  civilDates: string[]; // 표시 라벨 전용 — 한 롤에 두 날짜가 공존할 수 있음
  photos: RollMedia[];
  videos: RollMedia[];
};

export type TripDetail = {
  tripId: number;
  title: string;
  status: TripStatus;
  totalDays: number | null;
  currentRoll: number | null;
  startDate: string;
  endDate: string | null;
  memberProfileUrls: string[];
  rolls: TripRoll[];
};

export type TripDetailResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: TripDetail;
};

export type ReelResult = {
  status: string;
  reelId: number;
  outputUrl: string | null;
};

export type ReelsResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
};

export type DetailMediaItem = {
  id: number;
  mediaKind: "PHOTO" | "VIDEO";
  url: string;
  comment?: string | null;
  date: string;
  dayLabel: string;
  lat?: number | null;
  lng?: number | null;
};

// 여행 참여자 (GET /trips/{tripId}/members)
export type TripMember = {
  id: number;
  userId: string;
  avatarUrl: string | null;
  role: string;
};
