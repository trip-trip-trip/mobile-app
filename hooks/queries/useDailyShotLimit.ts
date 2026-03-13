import { useMemo } from "react";

import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";
import { getTodayYmd } from "@/utils/date";

const DAILY_LIMIT = 4;

export const useDailyShotLimit = (tripId: number) => {
  const { data, isLoading, isFetching, refetch } = useTripAlbumQuery(tripId);

  const todayYmd = useMemo(() => getTodayYmd(), []);

  const todayPhotoCount = useMemo(() => {
    const days = data?.result?.days ?? [];
    const today = days.find((d) => d.date === todayYmd);
    return today?.photos?.length ?? 0;
  }, [data?.result?.days, todayYmd]);

  const remaining = Math.max(0, DAILY_LIMIT - todayPhotoCount);
  const isLimitReached = todayPhotoCount >= DAILY_LIMIT;

  // console.log("오늘 촬영 횟수", todayPhotoCount);
  // console.log("tripID", tripId);

  return {
    todayPhotoCount,
    remaining,
    isLimitReached,
    isLoading,
    isFetching,
    refetch,
  };
};
