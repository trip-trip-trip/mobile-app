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
  id: number;
  placeName: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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
