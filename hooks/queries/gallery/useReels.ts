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
    [endDate],
  );

  const canRun = enabled && ready && tripId > 0;

  const [reelId, setReelId] = useState<number | null>(initialReelId);
  const [checkedExisting, setCheckedExisting] = useState(false);

  useEffect(() => {
    setReelId(initialReelId);
    setCheckedExisting(false);
  }, [tripId, initialReelId]);

  /*
  1단계: 마운트 시 GET으로 기존 릴스 확인
  */

  const existingReelQuery = useQuery({
    queryKey: ["reel-check", tripId],
    queryFn: () => getReel(tripId),
    enabled: canRun && !checkedExisting,
    staleTime: 0,
    retry: false,
  });

  // 기존 릴스가 있으면 reelId 세팅, POST 스킵
  useEffect(() => {
    if (!canRun || checkedExisting) return;
    if (existingReelQuery.isLoading) return;

    if (existingReelQuery.data) {
      const { status, reelId: existingId } = existingReelQuery.data;
      if (status !== "none" && existingId != null) {
        setReelId(existingId);
      }
    }
    setCheckedExisting(true);
  }, [canRun, checkedExisting, existingReelQuery.isLoading, existingReelQuery.data]);

  /*
  2단계: POST — 기존 릴스 확인 후 없을 때만 생성
  */

  const createMutation = useMutation({
    mutationFn: postCreateReel,
    onSuccess: (result: ReelResult) => {
      setReelId(result.reelId);
    },
    onError: (error) => {
      console.error("[Reel create error]", error);
    },
  });

  useEffect(() => {
    if (!canRun) return;
    if (!checkedExisting) return; // 기존 릴스 확인 전에는 POST 하지 않음
    if (reelId != null) return;
    if (createMutation.isPending) return;
    if (createMutation.isError) return;

    createMutation.mutate(tripId);
  }, [canRun, checkedExisting, reelId, tripId, createMutation.isPending, createMutation.isError, createMutation.mutate]);

  /*
  3단계: GET 폴링 — reelId가 있으면 상태 추적
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
    checkedExisting,

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
