import { getTripAlbumDays } from "@/api/album";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";
import type { TripDetailResponse } from "@/types/gallery";
import { useQuery } from "@tanstack/react-query";

export const useTripAlbumQuery = (tripId: number) => {
  return useQuery<TripDetailResponse, Error>({
    queryKey: albumKeys.detail(tripId),
    queryFn: () => getTripAlbumDays(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    select: (data) => ({
      ...data,
      result: {
        ...data.result,
        days: [...data.result.days].sort((a, b) => a.dayNumber - b.dayNumber),
      },
    }),
  });
};
