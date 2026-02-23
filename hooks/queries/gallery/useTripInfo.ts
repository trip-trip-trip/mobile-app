import { useQuery } from "@tanstack/react-query";

import { getTripInfo } from "@/api/gallery";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";
import type { TripInfo } from "@/types/gallery";

export const useTripInfoQuery = (tripId: number) => {
  return useQuery<TripInfo, Error>({
    queryKey: tripKeys.detail(tripId),
    queryFn: () => getTripInfo(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};
