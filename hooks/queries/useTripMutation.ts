import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import queryClient from "@/api/queryClient";
import { createTrip, deleteTrip, updateTrip } from "@/api/trip";
import type { TripUpdateReq } from "@/types/trip";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";

// POST /trips — 여행 생성, 성공 시 gallery로 이동
export function useCreateTrip() {
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      router.replace("/(tabs)/gallery");
    },
  });
}

// PATCH /trips/{id} — 여행 수정
export function useUpdateTrip(tripId: number) {
  return useMutation({
    mutationFn: (req: TripUpdateReq) => updateTrip(tripId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(tripId) });
    },
  });
}

// DELETE /trips/{id} — 여행 삭제
export function useDeleteTrip() {
  return useMutation({
    mutationFn: (tripId: number) => deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      router.replace("/(tabs)/gallery");
    },
  });
}
