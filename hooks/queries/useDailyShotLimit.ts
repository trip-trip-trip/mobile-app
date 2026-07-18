import { useMemo } from "react";

import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";

const DAILY_LIMIT = 4;

// 촬영 쿼터 — 키는 오직 현재 롤 인덱스 (날짜 문자열 매칭 금지, travel-day-roll-spec.md)
// 서버가 업로드 시점에 최종 검증하므로 이 값은 UI 표시·선제 차단용이다.
export const useDailyShotLimit = (tripId: number) => {
  const { data, isLoading, isFetching, refetch } = useTripAlbumQuery(tripId);

  const todayPhotoCount = useMemo(() => {
    const result = data?.result;
    if (!result?.currentRoll) return 0;
    const currentRoll = result.rolls?.find((r) => r.index === result.currentRoll);
    return currentRoll?.photos?.length ?? 0;
  }, [data?.result]);

  const remaining = Math.max(0, DAILY_LIMIT - todayPhotoCount);
  const isLimitReached = todayPhotoCount >= DAILY_LIMIT;

  return {
    todayPhotoCount,
    remaining,
    isLimitReached,
    isLoading,
    isFetching,
    refetch,
  };
};
