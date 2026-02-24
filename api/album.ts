import axiosInstance from "@/api/axios";
import type { TripDay, TripDetail, TripDetailResponse } from "@/types/gallery";

export const getTripAlbumDetail = async (tripId: number): Promise<TripDetail> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  console.log("ALBUM API RAW:", data);
  return data.result;
};

export const getTripAlbumDays = async (tripId: number): Promise<TripDay[]> => {
  const result = await getTripAlbumDetail(tripId);
  return result.days;
};
