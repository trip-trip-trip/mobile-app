import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getReel } from "@/api/album";
import type { TripStatus } from "@/types/gallery";

type ClientReelStatus =
  | "collecting"
  | "queued"
  | "done"
  | "failed"
  | "none"
  | "rendering";

type Params = {
  tripId: number;
  tripStatus?: TripStatus;
  enabled?: boolean;
};

/**
 * 릴 상태를 GET + 폴링으로만 추적하는 훅.
 * POST(릴 생성)는 여행 종료 시점에만 호출해야 하므로 이 훅에서는 하지 않는다.
 */
export const useReels = ({
  tripId,
  tripStatus,
  enabled = true,
}: Params) => {
  // 릴은 여행 종료(ENDED) 후에만 조회 — 날짜 비교 금지, 판정은 서버 status만
  const ready = useMemo(() => tripStatus === "ENDED", [tripStatus]);

  const canRun = enabled && ready && tripId > 0;

  /*
  GET 폴링 — 릴 상태 추적 (queued/rendering 중일 때 3초 간격)
  */

  const reelQuery = useQuery({
    queryKey: ["reel", tripId],
    queryFn: () => getReel(tripId),
    enabled: canRun,

    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!status) return 3000;

      if (status === "done" || status === "failed" || status === "none" || status === "collecting")
        return false;

      return 3000;
    },

    staleTime: 0,
  });

  /*
  상태 정규화
  */

  const status: ClientReelStatus = (() => {
    if (!canRun) return "collecting";

    const server = reelQuery.data?.status;

    if (server === "done") return "done";
    if (server === "failed") return "failed";
    if (server === "rendering") return "rendering";
    if (server === "queued") return "queued";
    if (server === "collecting") return "collecting";
    if (server === "none") return "none";

    return "none";
  })();

  const outputUrl =
    status === "done" ? (reelQuery.data?.outputUrl ?? null) : null;

  return {
    canRun,
    ready,

    reelId: reelQuery.data?.reelId ?? null,
    status,
    outputUrl,

    reel: reelQuery.data,

    isPolling: reelQuery.isFetching,

    refetch: reelQuery.refetch,
    error: reelQuery.error,
  };
};
