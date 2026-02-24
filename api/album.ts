import axiosInstance from "@/api/axios";
import type { TripDetailResponse } from "@/types/gallery";

// GET : 여행 상세정보 조회(미디어)
export const getTripAlbumDays = async (
  tripId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  console.log("앨범 상세 API RAW:", data);
  return data;
};
