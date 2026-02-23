export type TripInfo = {
  id: number;
  placeName: string;
  title: string;
  startDate: string;
  endDate: string;
  places: string[];
  members: string[];
  photoCount: number;
  videoCount: number;
  photos: string[];
  coverImage: string | null;
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

// types/album.ts
export type MediaKind = "PHOTO" | "VIDEO";

export type DayMedia = {
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
  takenAt: string;
  lat: number | null;
  lng: number | null;
};

export type TripDay = {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  photos: DayMedia[];
  videos: DayMedia[];
};

export type TripDetailResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: { tripId: number; days: TripDay[] };
};
