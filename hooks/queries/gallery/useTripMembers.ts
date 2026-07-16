import { useQuery } from "@tanstack/react-query";

import { getTripMembers } from "@/api/album";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";
import type { TripMember } from "@/types/gallery";

// 여행 참여자 목록 조회
export const useTripMembersQuery = (tripId: number) => {
  return useQuery<TripMember[], Error>({
    queryKey: albumKeys.members(tripId),
    queryFn: () => getTripMembers(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};
