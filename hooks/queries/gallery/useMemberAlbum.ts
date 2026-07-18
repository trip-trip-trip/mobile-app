import { useQuery } from "@tanstack/react-query";

import { getMemberTripAlbumDetail } from "@/api/album";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";
import type { TripDetailResponse } from "@/types/gallery";

// 같은 여행 참여자(친구)의 앨범 조회
export const useMemberAlbumQuery = (tripId: number, memberId: number) => {
  return useQuery<TripDetailResponse, Error>({
    queryKey: albumKeys.memberDetail(tripId, memberId),
    queryFn: () => getMemberTripAlbumDetail(tripId, memberId),
    enabled:
      Number.isFinite(tripId) &&
      tripId > 0 &&
      Number.isFinite(memberId) &&
      memberId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    select: (data) => ({
      ...data,
      result: {
        ...data.result,
        rolls: [...(data.result.rolls ?? [])].sort((a, b) => a.index - b.index),
      },
    }),
  });
};
