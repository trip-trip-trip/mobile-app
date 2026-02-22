import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import queryClient from "@/api/queryClient";
import { createTrip } from "@/api/trip";

// POST /trips — 여행 생성, 성공 시 gallery로 이동
export function useCreateTrip() {
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      router.replace("/(tabs)/gallery");
    },
  });
}
