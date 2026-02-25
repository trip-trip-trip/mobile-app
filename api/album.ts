import axiosInstance from "@/api/axios";
import type { TripDay, TripDetailResponse } from "@/types/gallery";

// GET : 여행 상세정보 조회(미디어)
export const getTripAlbumDetail = async (
  tripId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  console.log("앨범 상세 API RAW:", data);
  return data;
};

export const getTripAlbumDays = async (tripId: number): Promise<TripDay[]> => {
  const result = await getTripAlbumDetail(tripId);
  return result.result.days;
};
