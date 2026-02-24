import axiosInstance from "@/api/axios";
import type {
  ActiveTripResponse,
  TripItem,
  TripsResponse,
} from "@/types/gallery";

export type GetTripsParams = Record<string, never>;

// GET : 전체 여행 조회
export const getTrips = async (
  _params?: GetTripsParams
): Promise<TripItem[]> => {
  const { data } = await axiosInstance.get<TripsResponse>("/trips");
  return (data.result ?? []) as TripItem[];
};

// GET : 활성 여행 유무 조회
export const getActiveTripStatus = async (): Promise<boolean> => {
  const { data } = await axiosInstance.get<ActiveTripResponse>(
    "/trips/isActiveTrips"
  );
  return Boolean(data.result?.isOngoing);
};
