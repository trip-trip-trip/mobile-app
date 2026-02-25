import { useQuery } from "@tanstack/react-query";

import { getTrips } from "@/api/gallery";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";
import type { TripInfo, TripRaw } from "@/types/gallery";
import { getTodayYmd, isCompletedTrip } from "@/utils/date";

type GalleryTrips = {
  activeTrip: TripInfo | null;
  completedTrips: TripInfo[];
};

const mapTripToTripInfo = (trip: TripRaw): TripInfo => {
  return {
    id: trip.tripId,
    placeName: trip.places[0] || "",
    title: trip.title,
    startDate: trip.startDate,
    endDate: trip.endDate,
    places: trip.places,
    members: trip.participantAvatarUrls,
    photoCount: trip.photoCount,
    videoCount: trip.videoCount,
    photos: trip.myPhotoUrls,
    coverImage: trip.myPhotoUrls.length > 0 ? trip.myPhotoUrls[0] : null,
  };
};

const normalizeTripsForGallery = (items: TripRaw[]): GalleryTrips => {
  const today = getTodayYmd();

  const completed: TripInfo[] = [];
  const active: TripInfo[] = [];

  items.forEach((trip) => {
    const info = mapTripToTripInfo(trip);

    if (isCompletedTrip(info.endDate, today)) completed.push(info);
    else active.push(info);
  });

  active.sort((a, b) => b.startDate.localeCompare(a.startDate));
  completed.sort((a, b) => b.startDate.localeCompare(a.startDate));

  return {
    activeTrip: active.length > 0 ? active[0] : null,
    completedTrips: completed,
  };
};

export const useGalleryTripsQuery = () => {
  return useQuery({
    queryKey: tripKeys.list(),
    queryFn: getTrips,
    select: (items: TripRaw[]) => normalizeTripsForGallery(items),
  });
};
