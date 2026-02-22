import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "@/api/trip";

// GET /trips/places — 장소 목록 (인증 불필요, 변경 빈도 낮아 30분 캐시)
export function useGetPlaces() {
  return useQuery({
    queryKey: ["trips", "places"],
    queryFn: getPlaces,
    staleTime: 1000 * 60 * 30,
  });
}
