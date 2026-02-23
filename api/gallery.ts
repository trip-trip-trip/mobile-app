import axiosInstance from "@/api/axios";
import type {
  ActiveTripResponse,
  TripItem,
  TripsResponse,
} from "@/types/gallery";

export type GetTripsParams = Record<string, never>;

export const getTrips = async (
  _params?: GetTripsParams
): Promise<TripItem[]> => {
  const { data } = await axiosInstance.get<TripsResponse>("/trips");
  return (data.result ?? []) as TripItem[];
};

export const getActiveTripStatus = async (): Promise<boolean> => {
  const { data } = await axiosInstance.get<ActiveTripResponse>(
    "/trips/isActiveTrips"
  );
  return Boolean(data.result?.isOngoing);
};
