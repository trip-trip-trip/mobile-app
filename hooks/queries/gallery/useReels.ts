import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getReel, postCreateReel } from "@/api/album";
import type { ReelResult } from "@/types/gallery";
import { getTodayYmd, isCompletedTrip } from "@/utils/date";

type ClientReelStatus =
  | "collecting"
  | "queued"
  | "done"
  | "failed"
  | "none"
  | "rendering";

type Params = {
  tripId: number;
  endDate: string;
  initialReelId?: number | null;
  enabled?: boolean;
};

export const useReels = ({
  tripId,
  endDate,
  initialReelId = null,
  enabled = true,
}: Params) => {
  const ready = useMemo(
    () => isCompletedTrip(endDate, getTodayYmd()),
    [endDate]
  );

  const canRun = enabled && ready && tripId > 0;

  const [reelId, setReelId] = useState<number | null>(initialReelId);

  useEffect(() => {
    setReelId(initialReelId);
  }, [tripId, initialReelId]);

  /*
  POST
  */

  const createMutation = useMutation({
    mutationFn: postCreateReel,
    onSuccess: (result: ReelResult) => {
      setReelId(result.reelId);
    },
  });

  /*
  여행 완료 && reelId 없음 -> 생성
  */

  useEffect(() => {
    if (!canRun) return;
    if (reelId != null) return;
    if (createMutation.isPending) return;

    createMutation.mutate(tripId);
  }, [canRun, reelId, tripId, createMutation]);

  /*
  GET
  */

  const reelQuery = useQuery({
    queryKey: ["reel", tripId],
    queryFn: () => getReel(tripId),
    enabled: canRun && reelId != null,

    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!status) return 3000;

      if (status === "done" || status === "failed" || status === "none")
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
    if (createMutation.isError) return "failed";

    const server = reelQuery.data?.status;

    if (server === "done") return "done";
    if (server === "failed") return "failed";
    if (server === "rendering") return "rendering";
    if (server === "queued") return "queued";
    if (server === "none") return "none";

    if (!server) return createMutation.isPending ? "queued" : "none";

    return "none";
  })();

  const outputUrl =
    status === "done" ? (reelQuery.data?.outputUrl ?? null) : null;

  return {
    canRun,
    ready,

    reelId,
    status,
    outputUrl,

    reel: reelQuery.data,

    isCreating: createMutation.isPending,
    isPolling: reelQuery.isFetching,

    refetch: reelQuery.refetch,
    error: createMutation.error ?? reelQuery.error,

    retryCreate: () => {
      if (!canRun) return;
      createMutation.mutate(tripId);
    },
  };
};
