import axiosInstance from "@/api/axios";
import type { TripDay, TripDetailResponse } from "@/types/gallery";

export const getTripAlbumDays = async (tripId: number): Promise<TripDay[]> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  console.log("ALBUM API RAW:", data);
  return data.result.days;
};
